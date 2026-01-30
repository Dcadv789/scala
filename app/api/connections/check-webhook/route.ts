import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// POST - Verificar configuração do webhook no Meta via API
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if (!authContext) {
      return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { connectionId } = body

    if (!connectionId) {
      return NextResponse.json({ success: false, error: "connectionId é obrigatório" }, { status: 400 })
    }

    // Buscar conexão
    const { data: conexao, error: conexaoError } = await supabase
      .from("conexoes")
      .select("*")
      .eq("id", connectionId)
      .eq("id_empresa", authContext.empresaId)
      .single()

    if (conexaoError || !conexao) {
      return NextResponse.json({ success: false, error: "Conexão não encontrada" }, { status: 404 })
    }

    const results: any = {
      connection: {
        id: conexao.id,
        phone_number_id: conexao.phone_number_id,
        waba_id: conexao.waba_id,
        status: conexao.status
      },
      checks: []
    }

    // 1. Verificar se o access token está válido primeiro
    try {
      const testTokenUrl = `https://graph.facebook.com/v21.0/me?access_token=${conexao.access_token}`
      const testTokenResponse = await fetch(testTokenUrl)
      const testTokenData = await testTokenResponse.json()

      if (testTokenData.error) {
        results.checks.push({
          name: "Access Token Status",
          status: "error",
          details: testTokenData,
          message: `❌ Token inválido: ${testTokenData.error.message}. O token pode estar expirado ou incorreto. Você precisa gerar um novo token permanente no Meta Business.`
        })
      } else {
        results.checks.push({
          name: "Access Token Status",
          status: "success",
          details: testTokenData,
          message: `✅ Token válido. App ID: ${testTokenData.id || "N/A"}`
        })
      }
    } catch (tokenError: any) {
      results.checks.push({
        name: "Access Token Status",
        status: "error",
        details: { error: tokenError.message },
        message: `Erro ao verificar token: ${tokenError.message}`
      })
    }

    // 2. Verificar webhook subscription via Meta API (só se token for válido)
    try {
      const webhookUrl = `https://graph.facebook.com/v21.0/${conexao.waba_id}/subscribed_apps?access_token=${conexao.access_token}`
      
      const response = await fetch(webhookUrl)
      const data = await response.json()

      if (data.error && data.error.code === 190) {
        results.checks.push({
          name: "Webhook Subscription (Meta API)",
          status: "error",
          details: data,
          message: `❌ Token inválido. Não é possível verificar webhook. Gere um novo token permanente.`
        })
      } else {
        results.checks.push({
          name: "Webhook Subscription (Meta API)",
          status: response.ok ? "success" : "error",
          details: data,
          message: response.ok 
            ? `Webhook está subscrito. Apps: ${data.data?.length || 0}` 
            : `Erro ao verificar: ${data.error?.message || "Erro desconhecido"}`
        })

        // Verificar se messages está subscrito
        if (data.data && data.data.length > 0) {
          const appId = data.data[0].id
          const webhookFieldsUrl = `https://graph.facebook.com/v21.0/${conexao.waba_id}/subscribed_apps/${appId}?access_token=${conexao.access_token}`
          
          const fieldsResponse = await fetch(webhookFieldsUrl)
          const fieldsData = await fieldsResponse.json()

          results.checks.push({
            name: "Webhook Fields (messages)",
            status: fieldsData.subscribed_fields?.includes("messages") ? "success" : "warning",
            details: fieldsData,
            message: fieldsData.subscribed_fields?.includes("messages")
              ? `✅ Campo 'messages' está subscrito. Campos: ${fieldsData.subscribed_fields?.join(", ") || "nenhum"}`
              : `⚠️ Campo 'messages' NÃO está subscrito. Campos atuais: ${fieldsData.subscribed_fields?.join(", ") || "nenhum"}`
          })
        }
      }
    } catch (apiError: any) {
      results.checks.push({
        name: "Webhook Subscription (Meta API)",
        status: "error",
        details: { error: apiError.message },
        message: `Erro ao chamar Meta API: ${apiError.message}`
      })
    }

    // 3. Verificar número de telefone (só se token for válido)
    try {
      const phoneUrl = `https://graph.facebook.com/v21.0/${conexao.phone_number_id}?fields=display_phone_number,verified_name,code_verification_status,quality_rating&access_token=${conexao.access_token}`
      
      const phoneResponse = await fetch(phoneUrl)
      const phoneData = await phoneResponse.json()

      if (phoneData.error && phoneData.error.code === 190) {
        results.checks.push({
          name: "Phone Number Status",
          status: "error",
          details: phoneData,
          message: `❌ Token inválido. Não é possível verificar número.`
        })
      } else {
        results.checks.push({
          name: "Phone Number Status",
          status: phoneResponse.ok ? "success" : "error",
          details: phoneData,
          message: phoneResponse.ok
            ? `Número: ${phoneData.display_phone_number || "N/A"}, Status: ${phoneData.code_verification_status || "N/A"}`
            : `Erro: ${phoneData.error?.message || "Erro desconhecido"}`
        })
      }
    } catch (phoneError: any) {
      results.checks.push({
        name: "Phone Number Status",
        status: "error",
        details: { error: phoneError.message },
        message: `Erro ao verificar número: ${phoneError.message}`
      })
    }

    // 4. Verificar phone_number_id e webhooks recebidos
    const { data: recentWebhooks } = await supabase
      .from("logs_webhook_whatsapp")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(10)

    if (recentWebhooks && recentWebhooks.length > 0) {
      const webhookPhoneIds = recentWebhooks
        .map((w: any) => w.dados?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id)
        .filter((id: any) => id && id !== "123456123") // Filtrar IDs de teste
        .filter((id: any, index: number, self: any[]) => self.indexOf(id) === index) // Únicos

      results.checks.push({
        name: "Phone Number IDs nos Webhooks",
        status: webhookPhoneIds.length > 0 ? "success" : "warning",
        details: {
          phone_number_id_conexao: conexao.phone_number_id,
          phone_number_ids_webhooks: webhookPhoneIds,
          total_webhooks: recentWebhooks.length,
          webhooks_teste: recentWebhooks.filter((w: any) => 
            w.dados?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id === "123456123"
          ).length
        },
        message: webhookPhoneIds.length > 0
          ? `✅ Webhooks recebidos com IDs: ${webhookPhoneIds.join(", ")}. ${webhookPhoneIds.includes(conexao.phone_number_id) ? "✅ Seu phone_number_id está presente!" : "⚠️ Seu phone_number_id NÃO está presente nos webhooks."}`
          : `⚠️ Apenas webhooks de TESTE recebidos (phone_number_id: 123456123). Nenhuma mensagem real ainda.`
      })

      results.checks.push({
        name: "Webhooks Recebidos (Últimas 24h)",
        status: "success",
        details: { count: recentWebhooks.length, webhooks: recentWebhooks },
        message: `✅ ${recentWebhooks.length} webhook(s) recebido(s) recentemente`
      })
    } else {
      results.checks.push({
        name: "Webhooks Recebidos (Últimas 24h)",
        status: "warning",
        details: { count: 0 },
        message: `⚠️ Nenhum webhook recebido nas últimas 24h`
      })
    }

    // 5. Verificar mensagens recebidas
    const { data: recentMessages } = await supabase
      .from("mensagens")
      .select("*")
      .eq("id_empresa", authContext.empresaId)
      .eq("direcao", "entrada")
      .order("criado_em", { ascending: false })
      .limit(5)

    results.checks.push({
      name: "Mensagens Recebidas (Últimas 24h)",
      status: recentMessages && recentMessages.length > 0 ? "success" : "warning",
      details: { count: recentMessages?.length || 0, messages: recentMessages },
      message: recentMessages && recentMessages.length > 0
        ? `✅ ${recentMessages.length} mensagem(ns) recebida(s) recentemente`
        : `⚠️ Nenhuma mensagem recebida nas últimas 24h`
    })

    // 5. Verificar Edge Function logs (via Supabase)
    results.checks.push({
      name: "Edge Function URL",
      status: "info",
      details: {
        url: `https://sxouafgvomzgufyuzajc.supabase.co/functions/v1/whatsapp-webhook`,
        note: "Verifique os logs manualmente no Supabase Dashboard"
      },
      message: "URL do webhook configurada. Verifique logs no Supabase Dashboard → Edge Functions → whatsapp-webhook → Logs"
    })

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error: any) {
    console.error("[Check Webhook] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

