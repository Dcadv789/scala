import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Enviar mensagem via WhatsApp Business API
export async function POST(request: NextRequest) {
  try {
    console.log("[Chat Send] ====== INICIANDO POST /api/chat/send ======")
    console.log("[Chat Send] Headers recebidos:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa"),
      xSelectedConnection: request.headers.get("x-selected-connection")
    })
    
    // Tentar obter empresaId diretamente do header como fallback
    let empresaId: string | null = null
    let isSuperAdmin = false
    
    const authContext = await getAuthContext(request)
    
    if (authContext) {
      empresaId = authContext.empresaId
      isSuperAdmin = authContext.isSuperAdmin
      console.log("[Chat Send] ✅ AuthContext encontrado - Empresa ID:", empresaId, "SuperAdmin:", isSuperAdmin)
    } else {
      console.error("[Chat Send] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Chat Send] ✅ Usando empresa do header (fallback):", empresaId)
      } else {
        console.error("[Chat Send] ❌ Nenhuma empresa encontrada")
        return NextResponse.json(
          { success: false, error: "Não autenticado - empresa não identificada" },
          { status: 401 }
        )
      }
    }
    
    if (!empresaId) {
      console.error("[Chat Send] ❌ empresaId não encontrado")
      return NextResponse.json(
        { success: false, error: "Empresa não identificada" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { id_contato, conteudo, tipo_midia = "text", url_midia, id_conexao } = body

    if (!id_contato || !conteudo) {
      return NextResponse.json(
        { success: false, error: "id_contato e conteudo são obrigatórios" },
        { status: 400 }
      )
    }

    // 1. Buscar contato e verificar se pertence à empresa do usuário
    const { data: contato, error: contatoError } = await supabase
      .from("contatos")
      .select("id, telefone, id_empresa, nome")
      .eq("id", id_contato)
      .single()

    if (contatoError || !contato) {
      return NextResponse.json(
        { success: false, error: "Contato não encontrado" },
        { status: 404 }
      )
    }

    // Verificar permissão (superadmin pode ver tudo, membro só da sua empresa)
    if (!isSuperAdmin && contato.id_empresa !== empresaId) {
      console.error("[Chat Send] ❌ Sem permissão - contato pertence a outra empresa")
      return NextResponse.json(
        { success: false, error: "Sem permissão para acessar este contato" },
        { status: 403 }
      )
    }

    // 2. Buscar conexão ativa da empresa
    let conexaoId = id_conexao || request.headers.get("x-selected-connection")
    console.log("[Chat Send] ID Conexão recebido:", conexaoId)
    
    if (!conexaoId) {
      console.log("[Chat Send] Buscando conexão ativa para empresa:", contato.id_empresa)
      const { data: conexaoAtiva, error: conexaoAtivaError } = await supabase
        .from("conexoes")
        .select("id, id_numero_telefone, token_acesso")
        .eq("id_empresa", contato.id_empresa)
        .eq("status", "connected")
        .eq("tipo_conexao", "api_oficial")
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (conexaoAtivaError) {
        console.error("[Chat Send] Erro ao buscar conexão ativa:", conexaoAtivaError)
      }

      if (!conexaoAtiva) {
        console.error("[Chat Send] ❌ Nenhuma conexão WhatsApp ativa encontrada")
        return NextResponse.json(
          { success: false, error: "Nenhuma conexão WhatsApp ativa encontrada para esta empresa" },
          { status: 400 }
        )
      }

      conexaoId = conexaoAtiva.id
      console.log("[Chat Send] ✅ Conexão ativa encontrada:", conexaoId)
    }

    // 3. Buscar dados completos da conexão
    const { data: conexao, error: conexaoError } = await supabase
      .from("conexoes")
      .select("id_numero_telefone, token_acesso")
      .eq("id", conexaoId)
      .single()

    if (conexaoError || !conexao || !conexao.token_acesso || !conexao.id_numero_telefone) {
      return NextResponse.json(
        { success: false, error: "Conexão inválida ou sem token de acesso" },
        { status: 400 }
      )
    }

    // 4. Preparar payload para Graph API
    const phoneNumber = contato.telefone.replace(/\D/g, "")
    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
    }

    if (tipo_midia === "text") {
      payload.type = "text"
      payload.text = {
        preview_url: false,
        body: conteudo
      }
    } else if (["image", "video", "document", "audio"].includes(tipo_midia)) {
      payload.type = tipo_midia
      if (url_midia) {
        payload[tipo_midia] = {
          link: url_midia,
          ...(tipo_midia !== "audio" && tipo_midia !== "document" ? { caption: conteudo } : {})
        }
      } else {
        return NextResponse.json(
          { success: false, error: `url_midia é obrigatória para tipo ${tipo_midia}` },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Tipo de mídia não suportado" },
        { status: 400 }
      )
    }

    // 5. Enviar mensagem via Graph API
    const graphApiUrl = `https://graph.facebook.com/v18.0/${conexao.id_numero_telefone}/messages`
    const response = await fetch(graphApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${conexao.token_acesso}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      console.error("[Chat Send] Erro ao enviar mensagem:", data.error)
      
      // Salvar mensagem com status 'falha'
      const { error: insertError } = await supabase.from("mensagens").insert({
        id_empresa: contato.id_empresa,
        id_contato: id_contato,
        id_conexao: conexaoId,
        direcao: "saida",
        status: "falha",
        tipo_midia: tipo_midia,
        conteudo: conteudo,
        url_midia: url_midia || null,
        mensagem_erro: data.error?.message || "Erro desconhecido",
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })

      if (insertError) {
        console.error("[Chat Send] Erro ao salvar mensagem com falha:", insertError)
      }

      return NextResponse.json(
        { success: false, error: data.error?.message || "Falha ao enviar mensagem" },
        { status: 400 }
      )
    }

    const messageId = data.messages?.[0]?.id

    // 6. Salvar mensagem na tabela mensagens com status 'enviado'
    console.log("[Chat Send] Salvando mensagem no banco:", {
      id_empresa: contato.id_empresa,
      id_contato: id_contato,
      id_conexao: conexaoId,
      direcao: "saida",
      status: "enviado",
      tipo_midia: tipo_midia,
      conteudo: conteudo.substring(0, 50) + "...",
      messageId
    })

    const { data: mensagemSalva, error: mensagemError } = await supabase
      .from("mensagens")
      .insert({
        id_empresa: contato.id_empresa,
        id_contato: id_contato,
        id_conexao: conexaoId,
        direcao: "saida",
        status: "enviado",
        tipo_midia: tipo_midia,
        conteudo: conteudo,
        url_midia: url_midia || null,
        id_mensagem_whatsapp: messageId,
        criado_em: new Date().toISOString()
      })
      .select()
      .single()

    if (mensagemError) {
      console.error("[Chat Send] ❌ ERRO ao salvar mensagem:", mensagemError)
      console.error("[Chat Send] Detalhes do erro:", {
        message: mensagemError.message,
        code: mensagemError.code,
        details: mensagemError.details,
        hint: mensagemError.hint
      })
    } else {
      console.log("[Chat Send] ✅ Mensagem salva com sucesso:", mensagemSalva?.id)
    }

    // 7. Atualizar contato (atualizado_em)
    await supabase
      .from("contatos")
      .update({ atualizado_em: new Date().toISOString() })
      .eq("id", id_contato)

    return NextResponse.json({
      success: true,
      messageId,
      mensagem: mensagemSalva
    })
  } catch (error: any) {
    console.error("[Chat Send] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

