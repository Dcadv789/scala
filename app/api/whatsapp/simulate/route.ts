import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// POST - Simular recebimento de mensagem para teste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from_number, contact_name, message_text } = body

    if (!from_number || !message_text) {
      return NextResponse.json({ 
        success: false, 
        error: "from_number e message_text sao obrigatorios" 
      }, { status: 400 })
    }

    const messageId = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const { data, error } = await supabase.from("mensagens_webhook").insert({
      id: messageId,
      numero_remetente: from_number.replace(/\D/g, ''),
      nome_contato: contact_name || from_number,
      texto_mensagem: message_text,
      tipo_mensagem: "text",
      id_numero_telefone: "996523640204246",
      data_hora: new Date().toISOString(),
      processado: false,
      respondido: false,
    }).select().single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Mensagem simulada criada com sucesso",
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET - Status e instrucoes
export async function GET() {
  const { count: msgCount } = await supabase.from("mensagens_webhook").select("*", { count: "exact", head: true })
  const { count: logCount } = await supabase.from("logs_webhook_whatsapp").select("*", { count: "exact", head: true })
  const { data: lastWebhook } = await supabase.from("logs_webhook_whatsapp").select("criado_em").order("criado_em", { ascending: false }).limit(1).single()

  return NextResponse.json({
    status: "online",
    webhook_url: "https://scalazap.com/api/whatsapp/webhook",
    verify_token: "scalazap_verify_token_2024",
    estatisticas: {
      mensagens_no_chat: msgCount || 0,
      webhooks_recebidos: logCount || 0,
      ultimo_webhook: lastWebhook?.criado_em || "Nenhum"
    },
    teste: {
      endpoint: "POST /api/whatsapp/simulate",
      exemplo: {
        from_number: "5516999887766",
        contact_name: "Cliente Teste",
        message_text: "Ola, isso e um teste!"
      }
    }
  })
}
