import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// Esta API busca mensagens diretamente da API do WhatsApp Business
// Use como fallback se os webhooks não estiverem funcionando
export async function POST(request: NextRequest) {
  try {
    const { phoneNumberId, accessToken } = await request.json()

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: "phoneNumberId e accessToken são obrigatórios" 
      }, { status: 400 })
    }

    // Buscar conversas da API do WhatsApp Business
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/conversations?access_token=${accessToken}`,
      { method: "GET" }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ 
        success: false, 
        error: error.error?.message || "Erro ao buscar conversas",
        details: error
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      conversations: data.data || [],
      paging: data.paging
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// GET para verificar status do webhook e conexão
export async function GET() {
  try {
    // Buscar última conexão ativa
    const { data: connection } = await supabase
      .from("conexoes")
      .select("*")
      .eq("connection_type", "api_oficial")
      .eq("status", "connected")
      .order("criado_em", { ascending: false })
      .limit(1)
      .single()

    // Contar webhooks recebidos nas últimas 24h
    const { count: webhookCount } = await supabase
      .from("logs_webhook_whatsapp")
      .select("*", { count: "exact", head: true })
      .gte("criado_em", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // Contar mensagens nas últimas 24h
    const { count: messageCount } = await supabase
      .from("mensagens_webhook")
      .select("*", { count: "exact", head: true })
      .gte("data_hora", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      success: true,
      status: {
        hasConnection: !!connection,
        connectionName: connection?.name,
        phoneNumberId: connection?.id_numero_telefone,
        webhooksLast24h: webhookCount || 0,
        messagesLast24h: messageCount || 0,
        webhookUrl: "https://scalazap.com/api/whatsapp/webhook",
        verifyToken: "scalazap_verify_token_2024"
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
