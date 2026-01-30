import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Verificar conexoes
    const { data: connections } = await supabase
      .from("conexoes")
      .select("id, nome, id_numero_telefone, status, criado_em")
      .order("criado_em", { ascending: false })

    // Verificar mensagens
    const { data: messages } = await supabase
      .from("mensagens_webhook")
      .select("id, numero_remetente, nome_contato, texto_mensagem, data_hora")
      .order("data_hora", { ascending: false })
      .limit(10)

    // Verificar webhooks recebidos
    const { data: webhooks } = await supabase
      .from("logs_webhook_whatsapp")
      .select("id, criado_em, dados")
      .order("criado_em", { ascending: false })
      .limit(5)

    const webhookDetails = webhooks?.map(w => ({
      id: w.id,
      created_at: w.criado_em,
      phone_number_id: w.dados?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id || "N/A",
      from: w.dados?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "N/A",
      message: w.dados?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body?.substring(0, 50) || "N/A"
    }))

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      webhook_url: "https://scalazap.com/api/whatsapp/webhook",
      verify_token: "scalazap_verify_token_2024",
      database: {
        connections_count: connections?.length || 0,
        connections: connections,
        messages_count: messages?.length || 0,
        recent_messages: messages,
        webhooks_received: webhookDetails
      },
      instructions: {
        step1: "Configure o webhook no Facebook Developers",
        step2: "URL: https://scalazap.com/api/whatsapp/webhook",
        step3: "Token: scalazap_verify_token_2024",
        step4: "Selecione o campo 'messages' e clique em Subscribe",
        step5: "IMPORTANTE: Va em WhatsApp > Configuration > Webhook e clique em 'Subscribe' no seu numero de telefone"
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Endpoint para simular webhook e testar se está salvando
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simular uma mensagem de webhook
    const testMessage = {
      id: `test_${Date.now()}`,
      numero_remetente: body.from || "5541999999999",
      nome_contato: body.name || "Teste Manual",
      texto_mensagem: body.message || "Mensagem de teste",
      tipo_mensagem: "text",
      id_numero_telefone: body.phone_number_id || "996523640204246",
      data_hora: new Date().toISOString(),
      processado: false,
      respondido: false
    }

    const { data, error } = await supabase
      .from("mensagens_webhook")
      .insert(testMessage)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Mensagem de teste salva com sucesso!",
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
