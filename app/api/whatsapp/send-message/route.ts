import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message, phoneNumberId, accessToken } = await request.json()

    if (!to || !message || !phoneNumberId || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Enviar mensagem via API Oficial do WhatsApp
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error.message || "Failed to send message" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
