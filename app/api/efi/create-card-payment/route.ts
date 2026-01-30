import { NextResponse } from "next/server"
import { createSubscription, createPlan, getPlanConfig } from "@/lib/efi"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valor, planName, customer, card } = body

    console.log("[v0] Card Payment - Starting REAL payment process")
    console.log("[v0] Card Payment - Customer:", customer.name)
    console.log("[v0] Card Payment - Value:", valor)

    const planType = valor === 7990 ? "starter" : valor === 12790 ? "pro" : "enterprise"
    const planConfig = getPlanConfig(planType)

    console.log("[v0] Card Payment - Creating REAL plan:", planConfig.name)

    const plan = await createPlan({
      name: planConfig.name,
      interval: planConfig.interval,
      repeats: planConfig.repeats,
      value: planConfig.value,
    })

    console.log("[v0] Card Payment - REAL Plan created:", plan.data.plan_id)

    const subscription = await createSubscription({
      planId: plan.data.plan_id,
      customerId: customer.cpf,
      paymentMethod: "credit_card",
      items: [
        {
          name: planConfig.name,
          amount: 1,
          value: planConfig.value,
        },
      ],
    })

    console.log("[v0] Card Payment - REAL Subscription created:", subscription.data.subscription_id)

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.data.subscription_id,
      planId: plan.data.plan_id,
      status: "pending_payment",
      message: "Assinatura criada. Configure o pagamento com cartão.",
      plan: planName,
      amount: valor,
      customer: customer.name,
      paymentMethod: "credit_card",
      createdAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Card Payment - Error:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao processar pagamento com cartão",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
