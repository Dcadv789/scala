import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar contatos com mensagens recentes, ordenados por última mensagem
export async function GET(request: NextRequest) {
  try {
    console.log("[Chat Contacts] ====== INICIANDO GET /api/chat/contacts ======")
    console.log("[Chat Contacts] Headers recebidos:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa")
    })
    
    // Tentar obter empresaId diretamente do header como fallback
    let empresaId: string | null = null
    let isSuperAdmin = false
    const idConexao = request.headers.get("x-selected-connection") || new URL(request.url).searchParams.get("id_conexao")
    
    console.log("[Chat Contacts] ID Conexão recebido:", idConexao)
    
    const authContext = await getAuthContext(request)
    
    if (authContext) {
      empresaId = authContext.empresaId
      isSuperAdmin = authContext.isSuperAdmin
      console.log("[Chat Contacts] ✅ AuthContext encontrado - Empresa ID:", empresaId, "SuperAdmin:", isSuperAdmin)
    } else {
      console.error("[Chat Contacts] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Chat Contacts] ✅ Usando empresa do header (fallback):", empresaId)
      } else {
        console.error("[Chat Contacts] ❌ Nenhuma empresa encontrada (nem no authContext nem no header)")
        return NextResponse.json(
          { success: false, error: "Não autenticado - empresa não identificada" },
          { status: 401 }
        )
      }
    }
    
    if (!empresaId) {
      console.error("[Chat Contacts] ❌ empresaId não encontrado")
      return NextResponse.json(
        { success: false, error: "Empresa não identificada" },
        { status: 400 }
      )
    }

    // Construir filtro por empresa
    let query = supabase
      .from("contatos")
      .select(`
        id,
        nome,
        telefone,
        email,
        id_empresa,
        status,
        url_foto_perfil,
        criado_em,
        atualizado_em
      `)

    // Aplicar filtro de empresa (superadmin vê tudo)
    if (!isSuperAdmin) {
      query = query.eq("id_empresa", empresaId)
      console.log("[Chat Contacts] Filtrando contatos por id_empresa:", empresaId)
    } else {
      console.log("[Chat Contacts] SuperAdmin - buscando todos os contatos")
    }
    
    // Se tiver id_conexao, filtrar contatos que têm mensagens com essa conexão
    if (idConexao) {
      console.log("[Chat Contacts] Filtrando contatos pela conexão:", idConexao)
      // Buscar IDs de contatos que têm mensagens com esta conexão
      const { data: contatosComMensagens, error: mensagensError } = await supabase
        .from("mensagens")
        .select("id_contato")
        .eq("id_conexao", idConexao)
        .eq("id_empresa", empresaId)
      
      if (mensagensError) {
        console.error("[Chat Contacts] Erro ao buscar contatos com mensagens:", mensagensError)
      } else {
        const idsContatos = [...new Set((contatosComMensagens || []).map((m: any) => m.id_contato))]
        console.log("[Chat Contacts] Contatos encontrados com mensagens nesta conexão:", idsContatos.length)
        if (idsContatos.length > 0) {
          query = query.in("id", idsContatos)
        } else {
          // Se não há mensagens com esta conexão, retornar vazio
          console.log("[Chat Contacts] Nenhum contato encontrado com mensagens nesta conexão")
          return NextResponse.json({
            success: true,
            contatos: [],
            total: 0
          })
        }
      }
    }

    const { data: contatos, error: contatosError } = await query
      .order("atualizado_em", { ascending: false })

    if (contatosError) {
      console.error("[Chat Contacts] ❌ Erro ao buscar contatos:", contatosError)
      return NextResponse.json(
        { success: false, error: contatosError.message },
        { status: 500 }
      )
    }
    
    console.log("[Chat Contacts] ✅ Contatos encontrados:", contatos?.length || 0)

    // Para cada contato, buscar a última mensagem e contagem
    const contatosComMensagens = await Promise.all(
      (contatos || []).map(async (contato) => {
        // Buscar última mensagem
        let mensagensQuery = supabase
          .from("mensagens")
          .select("id, conteudo, tipo_midia, direcao, status, criado_em")
          .eq("id_contato", contato.id)
          .order("criado_em", { ascending: false })
          .limit(1)

        if (!isSuperAdmin) {
          mensagensQuery = mensagensQuery.eq("id_empresa", empresaId)
        }
        
        // Se tiver id_conexao, filtrar mensagens por conexão
        if (idConexao) {
          mensagensQuery = mensagensQuery.eq("id_conexao", idConexao)
        }

        const { data: ultimaMensagem } = await mensagensQuery.single()

        // Contar mensagens não lidas (entrada com status 'recebido')
        let naoLidasQuery = supabase
          .from("mensagens")
          .select("id", { count: "exact", head: true })
          .eq("id_contato", contato.id)
          .eq("direcao", "entrada")
          .eq("status", "recebido")

        if (!isSuperAdmin) {
          naoLidasQuery = naoLidasQuery.eq("id_empresa", empresaId)
        }
        
        // Se tiver id_conexao, filtrar mensagens não lidas por conexão
        if (idConexao) {
          naoLidasQuery = naoLidasQuery.eq("id_conexao", idConexao)
        }

        const { count: naoLidas } = await naoLidasQuery

        return {
          ...contato,
          ultima_mensagem: ultimaMensagem ? {
            conteudo: ultimaMensagem.conteudo,
            tipo_midia: ultimaMensagem.tipo_midia,
            direcao: ultimaMensagem.direcao,
            criado_em: ultimaMensagem.criado_em
          } : null,
          ultima_mensagem_em: ultimaMensagem?.criado_em || contato.atualizado_em,
          mensagens_nao_lidas: naoLidas || 0
        }
      })
    )

    // Ordenar por última mensagem (mais recente primeiro)
    contatosComMensagens.sort((a, b) => {
      const dataA = new Date(a.ultima_mensagem_em || 0).getTime()
      const dataB = new Date(b.ultima_mensagem_em || 0).getTime()
      return dataB - dataA
    })

    return NextResponse.json({
      success: true,
      contatos: contatosComMensagens,
      total: contatosComMensagens.length
    })
  } catch (error: any) {
    console.error("[Chat Contacts] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

