import { type NextRequest, NextResponse } from "next/server"
import { createSubscription, getPlanConfig } from "@/lib/efi"

export async function POST(request: NextRequest) {
  try {
    const { plan, customerId } = await request.json()

    if (!plan || !customerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const planConfig = getPlanConfig(plan as "starter" | "pro" | "enterprise")

    const subscription = await createSubscription({
      planId: "", // You need to create plans first in EFI dashboard or via API
      customerId,
      paymentMethod: "credit_card",
      items: [
        {
          name: planConfig.name,
          amount: 1,
          value: planConfig.value,
        },
      ],
    })

    return NextResponse.json(subscription)
  } catch (error: any) {
    console.error("[EFI] Error creating subscription:", error)
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 })
  }
}
