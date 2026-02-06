import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Iniciar disparo de campanha
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json({ error: "ID da campanha é obrigatório" }, { status: 400 })
    }

    if (!authContext) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Buscar campanha com conexão (verificando que pertence à empresa)
    let query = supabase
      .from("campanhas")
      .select(`
        *,
        conexoes (id, id_numero_telefone, token_acesso, nome)
      `)
      .eq("id", campaignId)
    
    // Verificar que a campanha pertence à empresa do membro
    if (!authContext.isSuperAdmin) {
      query = query.eq("id_empresa", authContext.empresaId)
    }
    
    const { data: campaign, error: campaignError } = await query.single()

    if (campaignError || !campaign) {
      console.log("[Campaign Start] Campaign not found:", campaignId, campaignError)
      return NextResponse.json({ error: "Campanha não encontrada ou não pertence a você" }, { status: 404 })
    }

    console.log("[Campaign Start] Campaign found:", campaign.nome, "Connection:", campaign.conexoes?.nome)

    if (!campaign.conexoes?.token_acesso) {
      console.log("[Campaign Start] No access token for connection")
      return NextResponse.json({ error: "Conexão sem token de acesso configurado" }, { status: 400 })
    }
    
    if (!campaign.conexoes?.id_numero_telefone) {
      console.log("[Campaign Start] No phone_number_id for connection")
      return NextResponse.json({ error: "Conexão sem id_numero_telefone configurado" }, { status: 400 })
    }

    // Buscar destinatários pendentes
    const { data: recipients, error: recipientsError } = await supabase
      .from("destinatarios_campanha")
      .select("*")
      .eq("id_campanha", campaignId)
      .eq("status", "pending")

    if (recipientsError) {
      return NextResponse.json({ error: recipientsError.message }, { status: 500 })
    }

    if (!recipients || recipients.length === 0) {
      console.log("[Campaign Start] No pending recipients for campaign:", campaignId)
      return NextResponse.json({ error: "Nenhum destinatário pendente" }, { status: 400 })
    }
    
    console.log("[Campaign Start] Found", recipients.length, "pending recipients")

    // Atualizar status da campanha para "sending"
    await supabase
      .from("campanhas")
      .update({ status: "sending", iniciado_em: new Date().toISOString() })
      .eq("id", campaignId)

    // Iniciar disparo em background
    processDisparo(campaign, recipients)

    return NextResponse.json({ 
      success: true, 
      message: `Disparo iniciado para ${recipients.length} destinatários`,
      totalRecipients: recipients.length
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Função para processar disparo em background
async function processDisparo(campaign: any, recipients: any[]) {
  const phoneNumberId = campaign.conexoes.id_numero_telefone
  const accessToken = campaign.conexoes.token_acesso
  const templateName = campaign.modelo_mensagem || "hello_world"
  
  let sentCount = 0
  let failedCount = 0

  for (const recipient of recipients) {
    try {
      // Limpar número de telefone
      const cleanPhone = recipient.telefone.replace(/\D/g, "")
      
      // Enviar mensagem via API do WhatsApp
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "template",
            template: {
              name: templateName,
              language: { code: "pt_BR" }
            }
          }),
        }
      )

      const result = await response.json()

      if (result.messages?.[0]?.id) {
        sentCount++
        await supabase
          .from("destinatarios_campanha")
          .update({ 
            status: "sent", 
            enviado_em: new Date().toISOString(),
            id_mensagem: result.messages[0].id
          })
          .eq("id", recipient.id)
      } else {
        failedCount++
        await supabase
          .from("destinatarios_campanha")
          .update({ 
            status: "failed", 
            erro: result.error?.message || "Erro desconhecido"
          })
          .eq("id", recipient.id)
      }

      // Atualizar contadores da campanha (campos corretos da tabela)
      await supabase
        .from("campanhas")
        .update({ enviados: sentCount, falhados: failedCount })
        .eq("id", campaign.id)

      // Delay entre mensagens (para evitar rate limit)
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error: any) {
      failedCount++
      await supabase
        .from("destinatarios_campanha")
        .update({ status: "failed", erro: error.message })
        .eq("id", recipient.id)
    }
  }

  // Marcar campanha como concluída
  await supabase
    .from("campanhas")
    .update({ 
      status: "completed", 
      concluido_em: new Date().toISOString(),
      enviados: sentCount,
      falhados: failedCount
    })
    .eq("id", campaign.id)
}
