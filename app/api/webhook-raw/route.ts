import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Verificacao do webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Log da tentativa de verificacao
  await supabase.from("logs_webhook_whatsapp").insert({
    dados: { 
      type: "verification",
      mode, 
      token, 
      challenge,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    },
    origem: "raw-get",
    criado_em: new Date().toISOString()
  })

  // Aceitar qualquer token que comece com "scalazap"
  if (mode === "subscribe" && token?.startsWith("scalazap")) {
    return new Response(challenge, { status: 200 })
  }

  return new Response("OK", { status: 200 })
}

// POST - Receber QUALQUER coisa
export async function POST(request: NextRequest) {
  try {
    // Capturar o body raw primeiro
    const rawBody = await request.text()
    
    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = { raw: rawBody }
    }

    // Salvar TUDO - headers, url, body
    await supabase.from("logs_webhook_whatsapp").insert({
      dados: {
        type: "incoming_post",
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: payload,
        timestamp: new Date().toISOString()
      },
      origem: "raw-post",
      criado_em: new Date().toISOString()
    })

    // Retornar 200 imediatamente
    return new Response("EVENT_RECEIVED", { status: 200 })
  } catch (error: any) {
    // Mesmo com erro, retornar 200
    await supabase.from("logs_webhook_whatsapp").insert({
      dados: { 
        type: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      },
      origem: "raw-error",
      criado_em: new Date().toISOString()
    })
    
    return new Response("EVENT_RECEIVED", { status: 200 })
  }
}
