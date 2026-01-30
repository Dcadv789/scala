import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { WEBHOOK_CONFIG } from "@/lib/webhook-config"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Verificar status do webhook e ultimas mensagens
export async function GET() {
  try {
    // Contar logs de webhook
    const { count: logsCount } = await supabase
      .from("logs_webhook_whatsapp")
      .select("*", { count: "exact", head: true })

    // Contar mensagens
    const { count: messagesCount } = await supabase
      .from("mensagens_webhook")
      .select("*", { count: "exact", head: true })

    // Ultimos 5 logs
    const { data: recentLogs } = await supabase
      .from("logs_webhook_whatsapp")
      .select("id, created_at, payload")
      .order("created_at", { ascending: false })
      .limit(5)

    // Ultimas 5 mensagens
    const { data: recentMessages } = await supabase
      .from("mensagens_webhook")
      .select("id, numero_remetente, nome_contato, texto_mensagem, data_hora, criado_em")
      .order("criado_em", { ascending: false })
      .limit(5)

    return NextResponse.json({
      status: "ok",
      webhook_url: WEBHOOK_CONFIG.url,
      verify_token: WEBHOOK_CONFIG.token,
      totalLogs: logsCount || 0,
      totalMessages: messagesCount || 0,
      recentLogs: recentLogs || [],
      recentMessages: recentMessages || [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: "error", 
      error: error.message 
    }, { status: 500 })
  }
}

// POST - Simular um webhook para teste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simular payload do Facebook se nao foi enviado
    const testPayload = body.test ? {
      object: "whatsapp_business_account",
      entry: [{
        id: "TEST_WABA_ID",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "5541999999999",
              phone_number_id: "TEST_PHONE_ID"
            },
            contacts: [{
              profile: { name: "Teste Manual" },
              wa_id: "5541988888888"
            }],
            messages: [{
              from: "5541988888888",
              id: `test_msg_${Date.now()}`,
              timestamp: String(Math.floor(Date.now() / 1000)),
              text: { body: body.message || "Mensagem de teste manual" },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    } : body

    // Salvar no log
    await supabase.from("logs_webhook_whatsapp").insert({
      dados: testPayload,
      origem: "manual_test",
      criado_em: new Date().toISOString()
    })

    // Processar mensagem se existir
    if (testPayload.entry?.[0]?.changes?.[0]?.value?.messages) {
      const value = testPayload.entry[0].changes[0].value
      const message = value.messages[0]
      const contact = value.contacts?.[0]

      await supabase.from("mensagens_webhook").insert({
        id: message.id,
        numero_remetente: message.from,
        nome_contato: contact?.profile?.name || message.from,
        texto_mensagem: message.text?.body || "[Teste]",
        tipo_mensagem: "text",
        id_numero_telefone: value.metadata?.phone_number_id || "test",
        data_hora: new Date(Number(message.timestamp) * 1000).toISOString(),
        processado: false,
        respondido: false,
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Webhook de teste processado com sucesso" 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
