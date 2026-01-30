import { NextRequest, NextResponse } from "next/server"

// Armazenamento em memoria para logs de webhooks (em producao usar banco de dados)
// Este arquivo serve como referencia para a estrutura dos dados
const webhookLogs: any[] = []
const subscriptions: Map<string, any> = new Map()

// Endpoint para listar logs de webhooks (uso do Superadmin)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticacao do admin
    const authHeader = request.headers.get("authorization")
    
    // Em producao, verificar token JWT ou sessao do admin
    // if (!isAdminAuthenticated(authHeader)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const event = searchParams.get("event")
    const email = searchParams.get("email")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Filtrar logs
    let filteredLogs = [...webhookLogs]

    if (event) {
      filteredLogs = filteredLogs.filter(log => log.event === event)
    }

    if (email) {
      filteredLogs = filteredLogs.filter(log => 
        log.customer_email?.toLowerCase().includes(email.toLowerCase())
      )
    }

    if (status) {
      filteredLogs = filteredLogs.filter(log => log.status === status)
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.received_at) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.received_at) <= new Date(endDate)
      )
    }

    // Ordenar por data decrescente
    filteredLogs.sort((a, b) => 
      new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    )

    // Paginacao
    const startIndex = (page - 1) * limit
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit)

    // Estatisticas
    const stats = {
      total: webhookLogs.length,
      approved: webhookLogs.filter(l => l.event === "SALE_APPROVED").length,
      refused: webhookLogs.filter(l => l.event === "SALE_REFUSED").length,
      refunded: webhookLogs.filter(l => l.event === "SALE_REFUNDED").length,
      chargebacks: webhookLogs.filter(l => l.event === "SALE_CHARGEBACK").length,
      pixGenerated: webhookLogs.filter(l => l.event === "PIX_GENERATED").length,
      pixExpired: webhookLogs.filter(l => l.event === "PIX_EXPIRED").length,
    }

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / limit),
      },
      stats,
    })

  } catch (error) {
    console.error("[Admin Webhooks] Erro:", error)
    return NextResponse.json(
      { error: "Erro ao buscar logs" },
      { status: 500 }
    )
  }
}

// Endpoint para listar todas as assinaturas
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "list_subscriptions") {
      const allSubscriptions = Array.from(subscriptions.values())

      // Estatisticas
      const stats = {
        total: allSubscriptions.length,
        active: allSubscriptions.filter(s => s.status === "active").length,
        canceled: allSubscriptions.filter(s => s.status === "canceled").length,
        refunded: allSubscriptions.filter(s => s.status === "refunded").length,
        chargeback: allSubscriptions.filter(s => s.status === "chargeback").length,
      }

      // Calcular MRR
      const mrr = allSubscriptions
        .filter(s => s.status === "active")
        .reduce((acc, s) => {
          const price = parseFloat(s.total_price?.replace("R$ ", "").replace(",", ".") || "0")
          return acc + price
        }, 0)

      return NextResponse.json({
        subscriptions: allSubscriptions,
        stats,
        mrr: mrr.toFixed(2),
      })
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 })

  } catch (error) {
    console.error("[Admin Webhooks] Erro:", error)
    return NextResponse.json(
      { error: "Erro ao processar acao" },
      { status: 500 }
    )
  }
}
