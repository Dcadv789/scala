import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, connectionId, phoneNumberId, accessToken } = body

    if (!to || !message) {
      return NextResponse.json({ error: "Destinatario e mensagem sao obrigatorios" }, { status: 400 })
    }

    // Limpar numero de telefone
    const cleanPhone = to.replace(/\D/g, "")
    
    // Buscar conexao se nao foram fornecidas credenciais
    let finalPhoneNumberId = phoneNumberId
    let finalAccessToken = accessToken
    
    if (!finalPhoneNumberId || !finalAccessToken) {
      if (connectionId) {
        const { data: connection } = await supabase
          .from("conexoes")
          .select("id_numero_telefone, token_acesso")
          .eq("id", connectionId)
          .single()
        
        if (connection) {
          finalPhoneNumberId = connection.id_numero_telefone
          finalAccessToken = connection.token_acesso
        }
      } else {
        // Buscar primeira conexao ativa
        const { data: connection } = await supabase
          .from("conexoes")
          .select("id_numero_telefone, token_acesso")
          .eq("status", "connected")
          .limit(1)
          .single()
        
        if (connection) {
          finalPhoneNumberId = connection.id_numero_telefone
          finalAccessToken = connection.token_acesso
        }
      }
    }

    if (!finalPhoneNumberId || !finalAccessToken) {
      return NextResponse.json({ error: "Nenhuma conexao disponivel" }, { status: 400 })
    }

    // Enviar mensagem via WhatsApp API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${finalPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${finalAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: { body: message },
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error("[Send] Erro WhatsApp API:", result)
      return NextResponse.json({ 
        error: result.error?.message || "Erro ao enviar mensagem",
        details: result 
      }, { status: 400 })
    }

    const messageId = result.messages?.[0]?.id || `sent_${Date.now()}`

    // Salvar mensagem ENVIADA no banco (e_de_mim = true)
    const { error: saveError } = await supabase.from("mensagens_webhook").insert({
      id: messageId,
      numero_remetente: finalPhoneNumberId, // De: nosso numero
      numero_destinatario: cleanPhone, // Para: cliente
      nome_contato: cleanPhone,
      texto_mensagem: message,
      tipo_mensagem: "text",
      id_numero_telefone: finalPhoneNumberId,
      e_de_mim: true, // IMPORTANTE: mensagem enviada por nos
      data_hora: new Date().toISOString(),
      processado: true,
      respondido: true,
    })

    if (saveError) {
      console.error("[Send] Erro ao salvar mensagem:", saveError)
    }

    return NextResponse.json({
      success: true,
      messageId,
      message: "Mensagem enviada com sucesso"
    })

  } catch (error: any) {
    console.error("[Send] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
