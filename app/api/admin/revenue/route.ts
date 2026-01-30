import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let assinaturasQuery = supabase
      .from("assinaturas")
      .select("*")

    if (startDate) {
      assinaturasQuery = assinaturasQuery.gte("criado_em", startDate)
    }
    if (endDate) {
      assinaturasQuery = assinaturasQuery.lte("criado_em", endDate)
    }

    const { data: assinaturas, error: assinaturasError } = await assinaturasQuery.order("criado_em", { ascending: false })

    if (assinaturasError) {
      console.error("Error fetching assinaturas:", assinaturasError)
      return NextResponse.json({ error: assinaturasError.message }, { status: 500 })
    }

    // Buscar todos os planos de uma vez para fazer match
    const { data: planos } = await supabase
      .from("planos")
      .select("id, nome, slug")

    const planosMap = new Map()
    planos?.forEach((plano: any) => {
      planosMap.set(plano.id, plano)
    })

    let totalRevenue = 0
    let totalPending = 0
    let totalRefunded = 0
    const payments: any[] = []

    if (assinaturas) {
      for (const assinatura of assinaturas) {
        const valor = parseFloat(assinatura.valor?.toString() || "0")

        const status = assinatura.cancelado_em 
          ? "cancelled" 
          : assinatura.status === "pending" || assinatura.status === "pendente"
          ? "pending"
          : "paid"

        // Buscar nome do plano usando plano_id
        const plano = assinatura.plano_id ? planosMap.get(assinatura.plano_id) : null
        const nomePlano = plano?.nome || assinatura.plano || "N/A"

        if (status === "paid" || status === "pago") {
          totalRevenue += valor
        } else if (status === "pending" || status === "pendente") {
          totalPending += valor
        } else if (status === "cancelled" || status === "cancelado") {
          totalRefunded += valor
        }

        payments.push({
          id: assinatura.id,
          assinatura_id: assinatura.id,
          email_usuario: assinatura.email_usuario || "N/A",
          plano: nomePlano,
          plano_id: assinatura.plano_id,
          valor: valor,
          status: status,
          metodo_pagamento: "Assinatura",
          criado_em: assinatura.criado_em || assinatura.data_inicio || new Date().toISOString()
        })
      }
    }

    const assinaturasAtivas = assinaturas?.filter((a: any) => !a.cancelado_em) || []
    
    let mrr = 0
    for (const a of assinaturasAtivas) {
      const valor = parseFloat(a.valor?.toString() || "0")
      mrr += valor
    }

    const activeSubscriptions = assinaturasAtivas.length
    const cancelledSubscriptions = assinaturas?.filter((a: any) => a.cancelado_em).length || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        pendingRevenue: totalPending,
        refundedAmount: totalRefunded,
        mrr,
        activeSubscriptions,
        cancelledSubscriptions,
        totalSubscriptions: assinaturas?.length || 0
      },
      payments: payments.sort((a, b) => 
        new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
      ),
      assinaturas: assinaturas || []
    })
  } catch (error: any) {
    console.error("Error in GET /api/admin/revenue:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
