import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with server-side env vars
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""
  
  if (!url || !key) {
    return null
  }
  
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Erro de configuracao do servidor", logs: [] },
        { status: 500 }
      )
    }
    
    const { data, error } = await supabase
      .from("logs_webhook")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(100)
    
    if (error) {
      console.error("Error fetching webhook logs:", error)
      return NextResponse.json(
        { error: "Erro ao buscar logs", logs: [] },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ logs: data || [] })
    
  } catch (error) {
    console.error("Webhook logs error:", error)
    return NextResponse.json(
      { error: "Erro interno", logs: [] },
      { status: 500 }
    )
  }
}
