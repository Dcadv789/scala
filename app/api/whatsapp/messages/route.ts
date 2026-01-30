import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar mensagens recebidas do Supabase
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const since = searchParams.get("since")
    const phoneNumberId = searchParams.get("phoneNumberId")

    let query = supabase
      .from("mensagens_webhook")
      .select("*")
      .order("data_hora", { ascending: false })
      .limit(100)

    if (since) {
      query = query.gt("data_hora", since)
    }

    if (phoneNumberId) {
      query = query.eq("id_numero_telefone", phoneNumberId)
    }

    const { data: messages, error } = await query

    console.log("[Messages API] Query result:", { count: messages?.length, error: error?.message })

    if (error) {
      console.error("[Messages API] Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transformar para o formato esperado pelo chat
    const formattedMessages = (messages || []).map(msg => ({
      id: msg.id,
      from: msg.numero_remetente,
      contactName: msg.nome_contato,
      text: msg.texto_mensagem,
      timestamp: msg.data_hora,
      type: msg.tipo_mensagem,
      mediaUrl: msg.url_midia,
      phoneNumberId: msg.id_numero_telefone,
      processed: msg.processado,
      replied: msg.respondido,
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length,
    })
  } catch (error: any) {
    console.error("[Messages API] Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Marcar mensagem como processada ou respondida
export async function POST(request: NextRequest) {
  try {
    const { messageId, action, fromNumber } = await request.json()

    if (action === "markProcessed") {
      const { error } = await supabase
        .from("mensagens_webhook")
        .update({ processado: true })
        .eq("id", messageId)

      if (error) throw error
    } else if (action === "markReplied") {
      // Marcar todas as mensagens deste contato como respondidas
      const { error } = await supabase
        .from("mensagens_webhook")
        .update({ respondido: true })
        .eq("numero_remetente", fromNumber)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Messages API] Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
