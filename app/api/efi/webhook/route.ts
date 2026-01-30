import { type NextRequest, NextResponse } from "next/server"
import { handleWebhook } from "@/lib/efi"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[EFI Webhook] Received notification:", body)

    const result = handleWebhook(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[EFI Webhook] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// EFI também envia notificações via GET para alguns eventos
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const notification = searchParams.get("notification")

  if (notification) {
    console.log("[EFI Webhook] GET notification:", notification)
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ error: "No notification" }, { status: 400 })
}
