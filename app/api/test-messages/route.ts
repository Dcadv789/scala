import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
)

export async function GET() {
  try {
    // Buscar mensagens
    const { data: messages, error: msgError } = await supabase
      .from("mensagens_webhook")
      .select("*")
      .order("data_hora", { ascending: false })
      .limit(10)

    // Buscar conexoes
    const { data: connections, error: connError } = await supabase
      .from("conexoes")
      .select("*")
      .limit(10)

    // Buscar logs
    const { data: logs, error: logsError } = await supabase
      .from("logs_webhook_whatsapp")
      .select("id, criado_em")
      .order("criado_em", { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      messages: messages || [],
      messagesError: msgError?.message,
      connections: connections || [],
      connectionsError: connError?.message,
      logs: logs || [],
      logsError: logsError?.message,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
