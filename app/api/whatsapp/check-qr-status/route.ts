import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    console.log("[v0] Checking QR status for session:", sessionId)

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing session ID" }, { status: 400 })
    }

    // Simulate connection after 10 seconds for demo
    const mockConnected = Math.random() > 0.5

    if (mockConnected) {
      return NextResponse.json({
        success: true,
        status: "connected",
        data: {
          phone: "+55 11 99999-9999",
          name: "WhatsApp Conectado",
        },
      })
    }

    return NextResponse.json({
      success: true,
      status: "qr_pending",
      message: "Aguardando leitura do QR Code...",
    })
  } catch (error: any) {
    console.error("[v0] Status check error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
