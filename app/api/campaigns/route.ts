import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar campanhas (Multi-Tenant: filtrado por empresa)
export async function GET(request: NextRequest) {
  try {
    console.log("[Campaigns API] ====== INICIANDO GET /api/campaigns ======")
    console.log("[Campaigns API] Headers recebidos:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa")
    })
    
    // Tentar obter empresaId diretamente do header como fallback
    let empresaId: string | null = null
    let isSuperAdmin = false
    
    const authContext = await getAuthContext(request)
    
    if (authContext) {
      empresaId = authContext.empresaId
      isSuperAdmin = authContext.isSuperAdmin
      console.log("[Campaigns API] ✅ AuthContext encontrado - Empresa ID:", empresaId, "SuperAdmin:", isSuperAdmin)
    } else {
      console.error("[Campaigns API] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Campaigns API] ✅ Usando empresa do header (fallback):", empresaId)
      } else {
        console.error("[Campaigns API] ❌ Nenhuma empresa encontrada (nem no authContext nem no header)")
        return NextResponse.json({ success: true, campaigns: [] })
      }
    }
    
    if (!empresaId) {
      console.error("[Campaigns API] ❌ empresaId não encontrado")
      return NextResponse.json({ success: true, campaigns: [] })
    }
    
    // Construir query com filtro Multi-Tenant
    let query = supabase
      .from("campanhas")
      .select(`
        *,
        conexoes (nome, telefone, numero_exibicao)
      `)
      .order("criado_em", { ascending: false })
    
    // Filtrar por empresa (superadmin vê todas, membro vê só da sua empresa)
    if (!isSuperAdmin) {
      query = query.eq("id_empresa", empresaId)
      console.log("[Campaigns API] Filtrando campanhas por id_empresa:", empresaId)
    } else {
      console.log("[Campaigns API] SuperAdmin - buscando todas as campanhas")
    }
    
    console.log("[Campaigns API] Buscando campanhas para:", {
      empresaId: empresaId,
      isSuperAdmin: isSuperAdmin
    })
    
    const { data: campaigns, error } = await query

    if (error) {
      console.error("[Campaigns API] ❌ Erro ao buscar campanhas:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[Campaigns API] ✅ Campanhas encontradas:", campaigns?.length || 0)
    if (campaigns && campaigns.length > 0) {
      console.log("[Campaigns API] Primeira campanha:", {
        id: campaigns[0].id,
        nome: campaigns[0].nome,
        status: campaigns[0].status,
        id_empresa: campaigns[0].id_empresa
      })
      
      // Verificar se todas as campanhas pertencem à empresa correta
      const campanhasForaEmpresa = campaigns.filter((c: any) => c.id_empresa !== empresaId)
      if (campanhasForaEmpresa.length > 0) {
        console.warn("[Campaigns API] ⚠️ ATENÇÃO: Encontradas campanhas de outras empresas:", campanhasForaEmpresa.length)
      }
    } else {
      console.log("[Campaigns API] Nenhuma campanha encontrada para empresa:", empresaId)
    }

    // Mapear campos para o formato esperado pelo frontend
    const mappedCampaigns = (campaigns || []).map((c: any) => ({
      id: c.id,
      name: c.nome,
      status: c.status || "draft", // Garantir que sempre tenha um status
      recipients: c.total_destinatarios || 0,
      sent: c.enviados || 0,
      delivered: c.entregues || 0,
      read_count: c.lidos || 0,
      failed: c.qtd_falhas || 0,
      template_name: c.modelo_mensagem,
      created_at: c.criado_em,
      started_at: c.iniciado_em,
      completed_at: c.concluido_em,
      connections: c.conexoes ? {
        name: c.conexoes.nome,
        phone: c.conexoes.telefone,
        display_phone_number: c.conexoes.numero_exibicao
      } : null
    }))

    console.log("[Campaigns API] Campanhas mapeadas:", mappedCampaigns.length)

    return NextResponse.json({ success: true, campaigns: mappedCampaigns })
  } catch (error: any) {
    console.error("[Campaigns API] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar campanha (Multi-Tenant)
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Você precisa estar logado para criar campanhas. Faça login novamente." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, connectionId, templateName, templateId, recipients, status } = body

    console.log("[Campaigns API] Criando campanha:", {
      name,
      connectionId,
      templateName,
      templateId,
      recipientsCount: recipients?.length || 0,
      empresaId: authContext.empresaId,
      membroId: authContext.membro.id
    })

    if (!name || !connectionId) {
      return NextResponse.json(
        { success: false, error: "Nome e conexão são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se a conexão pertence à empresa do usuário
    const { data: connection, error: connectionError } = await supabase
      .from("conexoes")
      .select("id, id_empresa")
      .eq("id", connectionId)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json(
        { success: false, error: "Conexão não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se o membro tem acesso à conexão (superadmin ou mesma empresa)
    if (!authContext.isSuperAdmin && connection.id_empresa !== authContext.empresaId) {
      return NextResponse.json(
        { success: false, error: "Você não tem permissão para usar esta conexão" },
        { status: 403 }
      )
    }

    // Criar campanha (usando campos corretos da tabela)
    // Nota: id_usuario referencia auth.users.id (Supabase Auth), não tem foreign key
    const campaignData: any = {
      nome: name,
      id_conexao: connectionId,
      modelo_mensagem: templateName,
      total_destinatarios: recipients?.length || 0,
      enviados: 0,
      entregues: 0,
      lidos: 0,
      qtd_falhas: 0,
      status: status || "draft",
      tipo: "template",
      id_usuario: authContext.membro.id_usuario || null, // ID do Supabase Auth (pode ser null)
      email_usuario: authContext.membro.email,
      id_empresa: authContext.empresaId,
      configuracoes: { templateId, templateName }
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campanhas")
      .insert(campaignData)
      .select()
      .single()

    if (campaignError) {
      console.error("[Campaigns API] Erro ao criar campanha:", campaignError)
      return NextResponse.json({ 
        success: false, 
        error: campaignError.message 
      }, { status: 500 })
    }

    console.log("[Campaigns API] Campanha criada com sucesso:", campaign.id)

    // Inserir destinatários se houver
    if (recipients && recipients.length > 0) {
      const recipientRows = recipients.map((r: any) => ({
        id_campanha: campaign.id,
        telefone: r.phone || r.telefone || r.numero,
        nome: r.name || r.nome || r.phone,
        id_usuario: authContext.membro.id_usuario,
        id_empresa: authContext.empresaId
      }))

      const { error: recipientsError } = await supabase
        .from("destinatarios_campanha")
        .insert(recipientRows)

      if (recipientsError) {
        console.error("[Campaigns API] Erro ao inserir destinatários:", recipientsError)
        // Não falhar a criação da campanha se houver erro nos destinatários
      } else {
        console.log("[Campaigns API] Destinatários inseridos:", recipientRows.length)
      }
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error("[Campaigns API] Erro ao criar campanha:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}

// DELETE - Excluir campanha (Multi-Tenant)
export async function DELETE(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Você precisa estar logado para excluir campanhas." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: "ID é obrigatório" 
      }, { status: 400 })
    }

    // Verificar se a campanha pertence à empresa do usuário
    let query = supabase
      .from("campanhas")
      .select("id, id_empresa")
      .eq("id", id)
      .single()
    
    const { data: campaign, error: fetchError } = await query

    if (fetchError || !campaign) {
      return NextResponse.json({ 
        success: false,
        error: "Campanha não encontrada" 
      }, { status: 404 })
    }

    // Verificar permissão (superadmin ou mesma empresa)
    if (!authContext.isSuperAdmin && campaign.id_empresa !== authContext.empresaId) {
      return NextResponse.json({ 
        success: false,
        error: "Você não tem permissão para excluir esta campanha" 
      }, { status: 403 })
    }

    // Excluir campanha
    const { error } = await supabase
      .from("campanhas")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}
