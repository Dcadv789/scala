import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Buscar conexão ativa
    const { data: connection, error: connError } = await supabase
      .from("conexoes")
      .select("*")
      .eq("status", "connected")
      .eq("connection_type", "api_oficial")
      .single()

    if (connError || !connection) {
      return NextResponse.json({
        success: false,
        error: "Nenhuma conexão encontrada",
        details: connError
      })
    }

    // Testar token com a API do Facebook
    const testResponse = await fetch(
      `https://graph.facebook.com/v18.0/${connection.id_numero_telefone}?fields=verified_name,display_phone_number,quality_rating`,
      {
        headers: {
          Authorization: `Bearer ${connection.token_acesso}`,
        },
      }
    )

    const testData = await testResponse.json()

    if (testData.error) {
      return NextResponse.json({
        success: false,
        connection: {
          id: connection.id,
          name: connection.name,
          phone_number_id: connection.id_numero_telefone,
        },
        error: "Token inválido ou expirado",
        facebook_error: testData.error
      })
    }

    // Verificar webhooks recebidos
    const { data: webhooks, error: webhookError } = await supabase
      .from("logs_webhook_whatsapp")
      .select("id, criado_em")
      .order("criado_em", { ascending: false })
      .limit(5)

    // Verificar mensagens
    const { data: messages } = await supabase
      .from("mensagens_webhook")
      .select("id, numero_remetente, nome_contato, criado_em")
      .order("data_hora", { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        name: connection.name,
        phone_number_id: connection.id_numero_telefone,
        phone: connection.numero_exibicao || connection.telefone,
        status: connection.status
      },
      facebook_data: testData,
      recent_webhooks: webhooks?.length || 0,
      recent_messages: messages?.length || 0,
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
