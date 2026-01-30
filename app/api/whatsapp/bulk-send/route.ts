import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumberId, accessToken, messages, intervalMs = 3000 } = await request.json()

    if (!phoneNumberId || !accessToken || !messages || !Array.isArray(messages)) {
      return NextResponse.json({
        success: false,
        error: "phoneNumberId, accessToken e messages são obrigatórios"
      }, { status: 400 })
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Enviar mensagens com intervalo
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      
      try {
        // Aguardar intervalo entre mensagens (exceto na primeira)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, intervalMs))
        }

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
              to: msg.to,
              type: msg.type || "text",
              ...(msg.type === "template" ? {
                template: {
                  name: msg.templateName,
                  language: { code: msg.language || "pt_BR" },
                  components: msg.components || [],
                }
              } : {
                text: {
                  preview_url: false,
                  body: msg.message,
                },
              }),
            }),
          }
        )

        const data = await response.json()

        if (data.error) {
          results.failed++
          results.errors.push(`${msg.to}: ${data.error.message}`)
        } else {
          results.sent++
        }
      } catch (error: any) {
        results.failed++
        results.errors.push(`${msg.to}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error: any) {
    console.error("[Bulk Send] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Erro interno ao enviar mensagens"
    }, { status: 500 })
  }
}
