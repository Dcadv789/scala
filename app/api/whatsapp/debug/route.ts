import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Ver logs de webhook e mensagens
export async function GET() {
  try {
    // Buscar logs de webhook do WhatsApp
    const { data: logs, error: logsError } = await supabase
      .from("logs_webhook_whatsapp")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(20)

    // Buscar mensagens
    const { data: messages, error: messagesError } = await supabase
      .from("mensagens_webhook")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(20)

    // Contar totais
    const { count: totalLogs } = await supabase
      .from("logs_webhook_whatsapp")
      .select("*", { count: "exact", head: true })

    const { count: totalMessages } = await supabase
      .from("mensagens_webhook")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      totalLogs: totalLogs || 0,
      totalMessages: totalMessages || 0,
      recentLogs: logs || [],
      recentMessages: messages || [],
      errors: {
        logs: logsError?.message,
        messages: messagesError?.message
      },
      environment: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
