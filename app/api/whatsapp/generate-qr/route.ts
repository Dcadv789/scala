import { NextResponse } from "next/server"

// This is a simplified version - in production, you would use Baileys or similar
export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json()

    console.log("[v0] Generating QR Code for WhatsApp Common:", { name, phone })

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In production, this would initialize a Baileys session and return the real QR
    const sessionId = Math.random().toString(36).substr(2, 16)
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=scalazap-session-${sessionId}`

    // Return QR code data
    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        qrCode,
        status: "qr_pending",
        message: "Escaneie o QR Code com seu WhatsApp para conectar",
      },
    })
  } catch (error: any) {
    console.error("[v0] QR generation error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
