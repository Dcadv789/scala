import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log("[Dashboard Stats] ====== INICIANDO GET /api/dashboard/stats ======")
    console.log("[Dashboard Stats] Headers recebidos:", {
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
      console.log("[Dashboard Stats] ✅ AuthContext encontrado - Empresa ID:", empresaId, "SuperAdmin:", isSuperAdmin)
    } else {
      console.error("[Dashboard Stats] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Dashboard Stats] ✅ Usando empresa do header (fallback):", empresaId)
      } else {
        console.error("[Dashboard Stats] ❌ Nenhuma empresa encontrada (nem no authContext nem no header)")
        return NextResponse.json(
          { success: false, error: "Não autenticado - empresa não identificada" },
          { status: 401 }
        )
      }
    }

    if (!empresaId) {
      console.error("[Dashboard Stats] ❌ empresaId não encontrado")
      return NextResponse.json(
        { success: false, error: "Empresa não identificada" },
        { status: 400 }
      )
    }

    // Obter filtro de data da query string
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("[Dashboard Stats] Buscando estatísticas para empresa:", empresaId)

    // 1. Total de Mensagens (mensagens) - FILTRAR POR id_empresa
    const { count: totalMessages, error: totalMessagesError } = await supabase
      .from("mensagens")
      .select("*", { count: "exact", head: true })
      .eq("id_empresa", empresaId)

    if (totalMessagesError) {
      console.error("[Dashboard Stats] Erro ao buscar total de mensagens:", totalMessagesError)
    } else {
      console.log("[Dashboard Stats] Total de mensagens:", totalMessages)
    }

    // 2. Mensagens Enviadas (direcao = 'saida') - FILTRAR POR id_empresa
    const { count: messagesSent, error: messagesSentError } = await supabase
      .from("mensagens")
      .select("*", { count: "exact", head: true })
      .eq("id_empresa", empresaId)
      .eq("direcao", "saida")

    if (messagesSentError) {
      console.error("[Dashboard Stats] Erro ao buscar mensagens enviadas:", messagesSentError)
    } else {
      console.log("[Dashboard Stats] Mensagens enviadas:", messagesSent)
    }

    // 3. Mensagens Recebidas (direcao = 'entrada') - FILTRAR POR id_empresa
    const { count: messagesReceived, error: messagesReceivedError } = await supabase
      .from("mensagens")
      .select("*", { count: "exact", head: true })
      .eq("id_empresa", empresaId)
      .eq("direcao", "entrada")

    if (messagesReceivedError) {
      console.error("[Dashboard Stats] Erro ao buscar mensagens recebidas:", messagesReceivedError)
    } else {
      console.log("[Dashboard Stats] Mensagens recebidas:", messagesReceived)
    }

    // 4. Conversas Ativas (contatos com mensagens recentes)
    // Contatos que têm mensagens nos últimos 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: activeContacts } = await supabase
      .from("contatos")
      .select("id")
      .eq("id_empresa", empresaId)
      .gte("atualizado_em", sevenDaysAgo.toISOString())

    const activeConversations = activeContacts?.length || 0

    // 5. Campanhas (campanhas)
    const { count: totalCampaigns } = await supabase
      .from("campanhas")
      .select("*", { count: "exact", head: true })
      .eq("id_empresa", empresaId)

    // 6. Contatos Totais
    const { count: totalContacts } = await supabase
      .from("contatos")
      .select("*", { count: "exact", head: true })
      .eq("id_empresa", empresaId)

    // Aplicar filtro de data nas mensagens se fornecido
    let messagesSentFiltered = messagesSent || 0
    let messagesReceivedFiltered = messagesReceived || 0
    let totalMessagesFiltered = totalMessages || 0

    if (startDate || endDate) {
      // Total de mensagens com filtro de data
      let totalQuery = supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true })
        .eq("id_empresa", empresaId)

      if (startDate) {
        totalQuery = totalQuery.gte("criado_em", startDate)
      }
      if (endDate) {
        totalQuery = totalQuery.lte("criado_em", `${endDate} 23:59:59`)
      }

      const { count: totalFiltered } = await totalQuery

      // Mensagens enviadas com filtro de data
      let sentQuery = supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true })
        .eq("id_empresa", empresaId)
        .eq("direcao", "saida")

      if (startDate) {
        sentQuery = sentQuery.gte("criado_em", startDate)
      }
      if (endDate) {
        sentQuery = sentQuery.lte("criado_em", `${endDate} 23:59:59`)
      }

      const { count: sentFiltered } = await sentQuery

      // Mensagens recebidas com filtro de data
      let receivedQuery = supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true })
        .eq("id_empresa", empresaId)
        .eq("direcao", "entrada")

      if (startDate) {
        receivedQuery = receivedQuery.gte("criado_em", startDate)
      }
      if (endDate) {
        receivedQuery = receivedQuery.lte("criado_em", `${endDate} 23:59:59`)
      }

      const { count: receivedFiltered } = await receivedQuery

      totalMessagesFiltered = totalFiltered || 0
      messagesSentFiltered = sentFiltered || 0
      messagesReceivedFiltered = receivedFiltered || 0
    }

    const statsData = {
      totalChatMessages: totalMessagesFiltered,
      chatMessagesSent: messagesSentFiltered,
      chatMessagesReceived: messagesReceivedFiltered,
      activeConversations,
      totalCampaigns: totalCampaigns || 0,
      totalContacts: totalContacts || 0,
    }
    
    console.log("[Dashboard Stats] ✅ Estatísticas calculadas:", statsData)
    
    return NextResponse.json({
      success: true,
      stats: statsData,
    })
  } catch (error: any) {
    console.error("[Dashboard Stats API] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao buscar estatísticas" },
      { status: 500 }
    )
  }
}

