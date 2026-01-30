import { NextRequest, NextResponse } from "next/server"

// Endpoint para verificar e atualizar status da assinatura
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email e obrigatorio" },
        { status: 400 }
      )
    }

    // Verificar no webhook da Kirvano se tem assinatura ativa
    const webhookResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/webhooks/kirvano?email=${encodeURIComponent(email)}`,
      { method: "GET" }
    )

    if (webhookResponse.ok) {
      const data = await webhookResponse.json()

      if (data.found && data.status === "active") {
        return NextResponse.json({
          isActive: true,
          status: "active",
          plan: data.plan,
          plan_name: data.plan_name,
          next_charge_date: data.next_charge_date,
          activated_at: data.activated_at,
        })
      }
    }

    return NextResponse.json({
      isActive: false,
      status: "pending",
      message: "Assinatura pendente ou nao encontrada",
    })

  } catch (error) {
    console.error("[Subscription Status] Erro:", error)
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 }
    )
  }
}
