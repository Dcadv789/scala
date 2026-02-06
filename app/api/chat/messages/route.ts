import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar mensagens de um contato específico
export async function GET(request: NextRequest) {
  try {
    console.log("[Chat Messages] ====== INICIANDO GET /api/chat/messages ======")
    console.log("[Chat Messages] Headers recebidos:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa"),
      xSelectedConnection: request.headers.get("x-selected-connection")
    })
    
    // Tentar obter empresaId diretamente do header como fallback
    let empresaId: string | null = null
    let isSuperAdmin = false
    const idConexao = request.headers.get("x-selected-connection") || new URL(request.url).searchParams.get("id_conexao")
    
    console.log("[Chat Messages] ID Conexão recebido:", idConexao)
    
    const authContext = await getAuthContext(request)
    
    if (authContext) {
      empresaId = authContext.empresaId
      isSuperAdmin = authContext.isSuperAdmin
      console.log("[Chat Messages] ✅ AuthContext encontrado - Empresa ID:", empresaId, "SuperAdmin:", isSuperAdmin)
    } else {
      console.error("[Chat Messages] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Chat Messages] ✅ Usando empresa do header (fallback):", empresaId)
      } else {
        console.error("[Chat Messages] ❌ Nenhuma empresa encontrada")
        return NextResponse.json(
          { success: false, error: "Não autenticado - empresa não identificada" },
          { status: 401 }
        )
      }
    }
    
    if (!empresaId) {
      console.error("[Chat Messages] ❌ empresaId não encontrado")
      return NextResponse.json(
        { success: false, error: "Empresa não identificada" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const idContato = searchParams.get("id_contato")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!idContato) {
      return NextResponse.json(
        { success: false, error: "id_contato é obrigatório" },
        { status: 400 }
      )
    }

    // 1. Verificar se o contato existe e pertence à empresa do usuário
    console.log("[Chat Messages] 🔍 Buscando contato:", idContato)
    const { data: contato, error: contatoError } = await supabase
      .from("contatos")
      .select("id, id_empresa, nome, telefone")
      .eq("id", idContato)
      .single()

    if (contatoError || !contato) {
      console.error("[Chat Messages] ❌ Contato não encontrado:", contatoError?.message)
      return NextResponse.json(
        { success: false, error: "Contato não encontrado" },
        { status: 404 }
      )
    }

    console.log("[Chat Messages] ✅ Contato encontrado:", {
      id: contato.id,
      nome: contato.nome,
      telefone: contato.telefone,
      id_empresa: contato.id_empresa
    })

    // Verificar permissão
    if (!isSuperAdmin && contato.id_empresa !== empresaId) {
      console.error("[Chat Messages] ❌ Sem permissão - contato pertence a outra empresa")
      console.error("[Chat Messages] 📋 Empresa do contato:", contato.id_empresa, "vs Empresa do usuário:", empresaId)
      return NextResponse.json(
        { success: false, error: "Sem permissão para acessar este contato" },
        { status: 403 }
      )
    }

    // 2. Buscar mensagens do contato
    console.log("[Chat Messages] 🔍 Construindo query para buscar mensagens...")
    console.log("[Chat Messages] 📋 Filtros a aplicar:", {
      id_contato: idContato,
      id_empresa: !isSuperAdmin ? empresaId : "TODAS (SuperAdmin)",
      id_conexao: idConexao || "NENHUMA",
      limit: limit,
      offset: offset
    })
    
    let query = supabase
      .from("mensagens")
      .select(`
        id,
        id_contato,
        id_empresa,
        id_conexao,
        direcao,
        status,
        tipo_midia,
        conteudo,
        url_midia,
        mensagem_erro,
        criado_em
      `)
      .eq("id_contato", idContato)
      .order("criado_em", { ascending: true })
      .range(offset, offset + limit - 1)

    // Aplicar filtro de empresa (superadmin vê tudo)
    if (!isSuperAdmin) {
      query = query.eq("id_empresa", empresaId)
      console.log("[Chat Messages] ✅ Filtro aplicado: id_empresa =", empresaId)
    } else {
      console.log("[Chat Messages] 🔑 SuperAdmin: sem filtro de empresa")
    }
    
    // Se tiver id_conexao, filtrar mensagens por conexão
    if (idConexao) {
      query = query.eq("id_conexao", idConexao)
      console.log("[Chat Messages] ✅ Filtro aplicado: id_conexao =", idConexao)
    } else {
      console.log("[Chat Messages] ⚠️ Nenhum id_conexao fornecido - retornando mensagens de todas as conexões do contato")
    }

    console.log("[Chat Messages] 🚀 Executando query...")
    const { data: mensagens, error: mensagensError } = await query

    if (mensagensError) {
      console.error("[Chat Messages] ❌ Erro ao buscar mensagens:", mensagensError.message)
      console.error("[Chat Messages] 📋 Detalhes do erro:", mensagensError.details)
      console.error("[Chat Messages] 📋 Código do erro:", mensagensError.code)
      return NextResponse.json(
        { success: false, error: mensagensError.message },
        { status: 500 }
      )
    }
    
    console.log("[Chat Messages] ✅ Mensagens encontradas:", mensagens?.length || 0)
    if (mensagens && mensagens.length > 0) {
      console.log("[Chat Messages] 📋 Primeira mensagem:", {
        id: mensagens[0].id,
        direcao: mensagens[0].direcao,
        tipo_midia: mensagens[0].tipo_midia,
        id_conexao: mensagens[0].id_conexao,
        criado_em: mensagens[0].criado_em
      })
      console.log("[Chat Messages] 📋 Última mensagem:", {
        id: mensagens[mensagens.length - 1].id,
        direcao: mensagens[mensagens.length - 1].direcao,
        tipo_midia: mensagens[mensagens.length - 1].tipo_midia,
        id_conexao: mensagens[mensagens.length - 1].id_conexao,
        criado_em: mensagens[mensagens.length - 1].criado_em
      })
    }

    // 3. Marcar mensagens recebidas como lidas (opcional - pode ser feito em endpoint separado)
    // Por enquanto, apenas retornar as mensagens

    return NextResponse.json({
      success: true,
      mensagens: mensagens || [],
      total: mensagens?.length || 0
    })
  } catch (error: any) {
    console.error("[Chat Messages] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PUT - Marcar mensagens como lidas
export async function PUT(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id_contato } = body

    if (!id_contato) {
      return NextResponse.json(
        { success: false, error: "id_contato é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar permissão
    const { data: contato } = await supabase
      .from("contatos")
      .select("id_empresa")
      .eq("id", id_contato)
      .single()

    if (!contato) {
      return NextResponse.json(
        { success: false, error: "Contato não encontrado" },
        { status: 404 }
      )
    }

    if (!authContext.isSuperAdmin && contato.id_empresa !== authContext.empresaId) {
      return NextResponse.json(
        { success: false, error: "Sem permissão" },
        { status: 403 }
      )
    }

    // Atualizar status das mensagens recebidas para 'lido'
    let updateQuery = supabase
      .from("mensagens")
      .update({ status: "lido" })
      .eq("id_contato", id_contato)
      .eq("direcao", "entrada")
      .eq("status", "recebido")

    if (!authContext.isSuperAdmin) {
      updateQuery = updateQuery.eq("id_empresa", authContext.empresaId)
    }

    const { error: updateError } = await updateQuery

    if (updateError) {
      console.error("[Chat Messages] Erro ao marcar como lido:", updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Chat Messages] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

