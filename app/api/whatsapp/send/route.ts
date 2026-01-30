import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { to, message, phoneNumberId } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: "Campos 'to' e 'message' são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar conexão ativa do banco
    const { data: connection, error: connError } = await supabase
      .from("conexoes")
      .select("phone_number_id, access_token")
      .eq("status", "connected")
      .eq("connection_type", "api_oficial")
      .single()

    if (connError || !connection) {
      return NextResponse.json(
        { error: "Nenhuma conexão WhatsApp ativa encontrada" },
        { status: 400 }
      )
    }

    const activePhoneNumberId = phoneNumberId || connection.phone_number_id
    const accessToken = connection.access_token

    // Limpar número de telefone (remover caracteres não numéricos)
    const cleanPhone = to.replace(/\D/g, "")

    // Enviar mensagem via API do Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${activePhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    const data = await response.json()

    console.log("[v0] WhatsApp API response:", JSON.stringify(data, null, 2))

    if (data.error) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error.message || "Erro ao enviar mensagem",
          details: data.error
        },
        { status: 400 }
      )
    }

    // Salvar mensagem enviada no banco para aparecer no chat
    const messageId = data.messages?.[0]?.id || `sent_${Date.now()}`
    await supabase.from("mensagens_webhook").insert({
      id: messageId,
      from_number: activePhoneNumberId,
      to_number: cleanPhone,
      contact_name: cleanPhone,
      message_text: message,
      message_type: "text",
      phone_number_id: activePhoneNumberId,
      timestamp: new Date().toISOString(),
      processed: true,
      replied: true,
      is_from_me: true,
    })

    return NextResponse.json({
      success: true,
      messageId: messageId,
      data
    })

  } catch (error: any) {
    console.error("[v0] Error sending WhatsApp message:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao enviar mensagem" 
      },
      { status: 500 }
    )
  }
}
