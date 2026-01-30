import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Buscar conexão
    const { data: connection, error: connError } = await supabase
      .from("conexoes")
      .select("*")
      .eq("status", "connected")
      .single()

    if (connError || !connection) {
      return NextResponse.json({ 
        success: false, 
        error: "Nenhuma conexão encontrada",
        details: connError?.message 
      })
    }

    // Testar token chamando a API do Facebook
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${connection.phone_number_id}?fields=verified_name,display_phone_number,quality_rating`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({
        success: false,
        error: "Token inválido ou expirado",
        facebook_error: data.error,
        connection_id: connection.id
      })
    }

    // Verificar webhooks recebidos
    const { count: webhookCount } = await supabase
      .from("logs_webhook_whatsapp")
      .select("*", { count: "exact", head: true })

    // Verificar mensagens
    const { count: messageCount } = await supabase
      .from("mensagens_webhook")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        name: connection.name,
        phone_number_id: connection.phone_number_id,
        phone: connection.phone,
        status: connection.status
      },
      facebook_data: data,
      stats: {
        webhooks_recebidos: webhookCount || 0,
        mensagens_no_chat: messageCount || 0
      },
      webhook_url: "https://scalazap.com/api/whatsapp/webhook",
      verify_token: "scalazap_verify_token_2024"
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
