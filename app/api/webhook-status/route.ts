import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function GET() {
  try {
    // Verificar ultimos webhooks
    const { data: webhooks, error: webhookError } = await supabase
      .from("logs_webhook_whatsapp")
      .select("id, criado_em, dados")
      .order("criado_em", { ascending: false })
      .limit(5)

    // Verificar mensagens salvas
    const { data: messages, error: msgError } = await supabase
      .from("mensagens_webhook")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(10)

    // Verificar conexoes
    const { data: connections, error: connError } = await supabase
      .from("conexoes")
      .select("id, nome, status, telefone, id_numero_telefone, criado_em")
      .order("criado_em", { ascending: false })
      .limit(5)

    const webhookSummary = (webhooks || []).map((w: any) => ({
      id: w.id,
      created_at: w.criado_em,
      from: w.dados?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "N/A",
      text: w.dados?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "N/A",
      type: w.dados?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type || "N/A",
    }))

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      webhook_url: "https://scalazap.com/api/whatsapp/webhook",
      verify_token: "scalazap_verify_token_2024",
      stats: {
        total_webhooks: webhooks?.length || 0,
        total_messages: messages?.length || 0,
        total_connections: connections?.length || 0,
      },
      recent_webhooks: webhookSummary,
      recent_messages: messages?.map((m: any) => ({
        id: m.id,
        from: m.numero_remetente,
        text: m.texto_mensagem,
        timestamp: m.data_hora,
      })),
      connections: connections?.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        phone: c.phone,
        phone_number_id: c.id_numero_telefone,
      })),
      instrucoes: {
        pt: "Se os webhooks mostram apenas numero 16315551181, as mensagens reais NAO estao chegando. Verifique no Facebook Developers se o campo 'messages' esta selecionado no webhook.",
        passos: [
          "1. Acesse developers.facebook.com",
          "2. Selecione seu App",
          "3. Va em WhatsApp > Configuracao",
          "4. Na secao Webhook, clique em 'Gerenciar'",
          "5. Marque o campo 'messages' se nao estiver marcado",
          "6. Envie uma mensagem de teste para seu numero WhatsApp Business"
        ]
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
