import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase" // Declare the supabase variable here

// GET endpoint para testar se a rota está funcionando
export async function GET(request: NextRequest) {
  const supabaseClient = getSupabaseClient()
  
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint ativo",
    timestamp: new Date().toISOString(),
    supabase_configured: !!supabaseClient,
    env_check: {
      has_supabase_url: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      has_service_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY),
    }
  })
}

// Create Supabase client with service role for webhooks
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  
  if (!url || !key) {
    console.error("[Webhook Kirvano] Supabase URL ou KEY não configurados")
    return null
  }
  
  return createClient(url, key)
}

// Tipos dos eventos da Kirvano
interface KirvanoCustomer {
  name: string
  document: string
  email: string
  phone_number: string
}

interface KirvanoPayment {
  method: string
  brand?: string
  installments?: number
  finished_at?: string
  link?: string
  qrcode?: string
  qrcode_image?: string
  expires_at?: string
  digitable_line?: string
  barcode?: string
}

interface KirvanoPlan {
  name: string
  charge_frequency: string
  next_charge_date: string
}

interface KirvanoProduct {
  id: string
  name: string
  offer_id: string
  offer_name: string
  description: string
  price: string
  photo: string
  is_order_bump: boolean
}

interface KirvanoUTM {
  src?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

interface KirvanoWebhookPayload {
  event: string
  event_description: string
  checkout_id: string
  checkout_url?: string
  sale_id: string
  payment_method: string
  total_price: string
  type: "ONE_TIME" | "RECURRING"
  status: string
  created_at: string
  customer: KirvanoCustomer
  payment: KirvanoPayment
  plan?: KirvanoPlan
  products: KirvanoProduct[]
  utm?: KirvanoUTM
}

// Eventos suportados
const EVENTS = {
  SALE_APPROVED: "SALE_APPROVED",
  SALE_REFUSED: "SALE_REFUSED",
  SALE_REFUNDED: "SALE_REFUNDED",
  SALE_CHARGEBACK: "SALE_CHARGEBACK",
  SUBSCRIPTION_CANCELED: "SUBSCRIPTION_CANCELED",
  SUBSCRIPTION_RENEWED: "SUBSCRIPTION_RENEWED",
  PIX_GENERATED: "PIX_GENERATED",
  PIX_EXPIRED: "PIX_EXPIRED",
  BANK_SLIP_GENERATED: "BANK_SLIP_GENERATED",
  BANK_SLIP_EXPIRED: "BANK_SLIP_EXPIRED",
}

export async function POST(request: NextRequest) {
  console.log("[Webhook Kirvano] ========== INICIO ==========")
  console.log("[Webhook Kirvano] Requisicao recebida em:", new Date().toISOString())
  
  // Capturar o body cru primeiro
  let rawBody = ""
  let payload: KirvanoWebhookPayload | null = null
  
  try {
    rawBody = await request.text()
    console.log("[Webhook Kirvano] Body cru recebido:", rawBody.substring(0, 500))
    
    // Tentar fazer parse do JSON
    payload = JSON.parse(rawBody)
    console.log("[Webhook Kirvano] Evento:", payload?.event)
    console.log("[Webhook Kirvano] Cliente:", payload?.customer?.email)
  } catch (parseError) {
    console.error("[Webhook Kirvano] Erro ao parsear JSON:", parseError)
  }
  
  // Salvar log imediatamente no Supabase (mesmo se houver erro depois)
  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("logs_webhook").insert({
        origem: "kirvano",
        tipo_evento: payload?.event || "PARSE_ERROR",
        email_cliente: payload?.customer?.email || null,
        nome_cliente: payload?.customer?.name || null,
        nome_produto: payload?.products?.[0]?.name || "Desconhecido",
        dados: payload || { raw: rawBody.substring(0, 1000) },
        status: "received",
      }).select()
      
      console.log("[Webhook Kirvano] Log salvo no Supabase:", data)
      if (error) {
        console.error("[Webhook Kirvano] Erro ao salvar log:", error)
      }
    } catch (dbError) {
      console.error("[Webhook Kirvano] Erro de conexao com Supabase:", dbError)
    }
  } else {
    console.error("[Webhook Kirvano] Supabase client nao disponivel")
  }
  
  // Se nao conseguiu parsear o payload, retorna erro
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid JSON payload", received: rawBody.substring(0, 200) },
      { status: 400 }
    )
  }

  try {
    // Verificar token de autenticacao (opcional, configurado na Kirvano)
    const authToken = request.headers.get("x-webhook-token") || request.headers.get("authorization")
    const expectedToken = process.env.KIRVANO_WEBHOOK_TOKEN
    
    // Apenas verificar token se estiver configurado
    if (expectedToken && expectedToken.length > 0) {
      if (authToken !== expectedToken && authToken !== `Bearer ${expectedToken}`) {
        console.log("[Webhook Kirvano] Token invalido - esperado:", expectedToken, "recebido:", authToken)
        // Nao bloquear por token por enquanto, apenas logar
      }
    }

    console.log("[Webhook Kirvano] Processando evento:", payload.event)

    // Processar evento
    switch (payload.event) {
      case EVENTS.SALE_APPROVED:
        await handleSaleApproved(payload)
        break

      case EVENTS.SALE_REFUSED:
        await handleSaleRefused(payload)
        break

      case EVENTS.SALE_REFUNDED:
        await handleSaleRefunded(payload)
        break

      case EVENTS.SALE_CHARGEBACK:
        await handleChargeback(payload)
        break

      case EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(payload)
        break

      case EVENTS.SUBSCRIPTION_RENEWED:
        await handleSubscriptionRenewed(payload)
        break

      case EVENTS.PIX_GENERATED:
        await handlePixGenerated(payload)
        break

      case EVENTS.PIX_EXPIRED:
        await handlePixExpired(payload)
        break

      case EVENTS.BANK_SLIP_GENERATED:
        await handleBankSlipGenerated(payload)
        break

      case EVENTS.BANK_SLIP_EXPIRED:
        await handleBankSlipExpired(payload)
        break

      default:
        console.log("[Webhook Kirvano] Evento nao tratado:", payload.event)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
      event: payload.event,
    })

  } catch (error) {
    console.error("[Webhook Kirvano] Erro ao processar webhook:", error)
    return NextResponse.json(
      { error: "Erro interno ao processar webhook" },
      { status: 500 }
    )
  }
}

// Handlers de eventos

async function handleSaleApproved(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Venda aprovada para:", payload.customer.email)

  // Determinar o plano baseado no produto/preco
  const planType = detectPlanFromPayload(payload)

  // Criar/atualizar usuario no Supabase
  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    // Upsert user
    const { data, error } = await supabaseClient
      .from("usuarios")
      .upsert({
        email: payload.customer.email.toLowerCase().trim(),
        nome: payload.customer.name,
        telefone: payload.customer.phone_number,
        plano: planType,
        status_plano: "active",
        atualizado_em: new Date().toISOString(),
      }, {
        onConflict: "email",
      })
      .select()

    if (error) {
      console.error("[Webhook Kirvano] Erro ao atualizar usuario no Supabase:", error)
    } else {
      console.log("[Webhook Kirvano] Usuario atualizado no Supabase:", data)
    }
    
    // Also save payment record
    await supabaseClient.from("pagamentos").insert({
      email_usuario: payload.customer.email.toLowerCase().trim(),
      id_venda: payload.sale_id,
      id_checkout: payload.checkout_id,
      metodo_pagamento: payload.payment_method,
      valor: payload.total_price,
      status: "approved",
      nome_produto: payload.products?.[0]?.name || "ScalaZAP",
      tipo: planType,
      dados_kirvano: payload,
    })
    
    // Save subscription if recurring
    if (payload.type === "RECURRING" && payload.plan) {
      await supabaseClient.from("assinaturas").upsert({
        email_usuario: payload.customer.email.toLowerCase().trim(),
        plano: payload.plan.name || planType,
        status: "active",
        data_renovacao: payload.plan.next_charge_date,
        id_assinatura_kirvano: payload.sale_id,
      }, {
        onConflict: "email_usuario",
      })
    }
  } else {
    console.error("[Webhook Kirvano] Supabase client nao disponivel em handleSaleApproved")
  }

  console.log("[Webhook Kirvano] Assinatura ativada para:", payload.customer.email, "Plano:", planType)
}

async function handleSaleRefused(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Venda recusada para:", payload.customer.email)
  // Nao precisamos fazer nada, usuario continua com status pending
}

async function handleSaleRefunded(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Reembolso para:", payload.customer.email)

  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("usuarios")
      .update({
        status_plano: "refunded",
        atualizado_em: new Date().toISOString(),
      })
      .ilike("email", payload.customer.email)

    if (error) {
      console.error("[Webhook Kirvano] Erro ao atualizar status:", error)
    }
  }

  console.log("[Webhook Kirvano] Acesso revogado por reembolso")
}

async function handleChargeback(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Chargeback para:", payload.customer.email)

  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("usuarios")
      .update({
        status_plano: "chargeback",
        atualizado_em: new Date().toISOString(),
      })
      .ilike("email", payload.customer.email)

    if (error) {
      console.error("[Webhook Kirvano] Erro ao atualizar status:", error)
    }
  }

  console.log("[Webhook Kirvano] Usuario marcado como chargeback")
}

async function handleSubscriptionCanceled(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Assinatura cancelada para:", payload.customer.email)

  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("usuarios")
      .update({
        status_plano: "cancelled",
        atualizado_em: new Date().toISOString(),
      })
      .ilike("email", payload.customer.email)

    if (error) {
      console.error("[Webhook Kirvano] Erro ao atualizar status:", error)
    }
    
    // Update subscription
    await supabaseClient.from("assinaturas")
      .update({ status: "cancelled" })
      .ilike("email_usuario", payload.customer.email)
  }

  console.log("[Webhook Kirvano] Assinatura cancelada")
}

async function handleSubscriptionRenewed(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Assinatura renovada para:", payload.customer.email)
  
  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("usuarios")
      .update({
        status_plano: "active",
        atualizado_em: new Date().toISOString(),
      })
      .ilike("email", payload.customer.email)
    
    if (error) {
      console.error("[Webhook Kirvano] Erro ao atualizar status:", error)
    }
    
    // Update subscription
    if (payload.plan) {
      await supabaseClient.from("assinaturas")
        .update({
          status: "active",
          next_charge_date: payload.plan.next_charge_date,
        })
        .ilike("email_usuario", payload.customer.email)
    }
  }
  
  console.log("[Webhook Kirvano] Assinatura renovada")
}

async function handlePixGenerated(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] PIX gerado para:", payload.customer.email)

  const planType = detectPlanFromPayload(payload)
  const supabaseClient = getSupabaseClient()
  
  if (supabaseClient) {
    // Check if user already exists
    const { data: existing } = await supabaseClient
      .from("usuarios")
      .select("id, plan_status")
      .ilike("email", payload.customer.email)
      .maybeSingle()
    
    // Only create if doesn't exist or update if status is not active
    if (!existing) {
      const { error } = await supabaseClient
        .from("usuarios")
        .insert({
          email: payload.customer.email.toLowerCase().trim(),
          name: payload.customer.name,
          phone: payload.customer.phone_number,
          plan: planType,
          plan_status: "pending",
        })

      if (error) {
        console.error("[Webhook Kirvano] Erro ao criar usuario pendente:", error)
      }
    }
    
    // Save to abandoned_carts for recovery
    await supabaseClient.from("carrinhos_abandonados").upsert({
      email: payload.customer.email.toLowerCase().trim(),
      name: payload.customer.name,
      phone: payload.customer.phone_number,
      checkout_url: payload.checkout_url,
      payment_method: "pix",
      product_name: payload.products?.[0]?.name,
      amount: payload.total_price,
      status: "pix_generated",
    }, { onConflict: "email" })
  }

  console.log("[Webhook Kirvano] PIX registrado")
}

async function handlePixExpired(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] PIX expirado para:", payload.customer.email)
  
  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    await supabaseClient.from("carrinhos_abandonados")
      .update({ status: "pix_expired" })
      .ilike("email", payload.customer.email)
  }
}

async function handleBankSlipGenerated(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Boleto gerado para:", payload.customer.email)

  const planType = detectPlanFromPayload(payload)
  const supabaseClient = getSupabaseClient()
  
  if (supabaseClient) {
    const { data: existing } = await supabaseClient
      .from("usuarios")
      .select("id, plan_status")
      .ilike("email", payload.customer.email)
      .maybeSingle()
    
    if (!existing) {
      const { error } = await supabaseClient
        .from("usuarios")
        .insert({
          email: payload.customer.email.toLowerCase().trim(),
          name: payload.customer.name,
          phone: payload.customer.phone_number,
          plan: planType,
          plan_status: "pending",
        })

      if (error) {
        console.error("[Webhook Kirvano] Erro ao criar usuario pendente:", error)
      }
    }
    
    await supabaseClient.from("carrinhos_abandonados").upsert({
      email: payload.customer.email.toLowerCase().trim(),
      name: payload.customer.name,
      phone: payload.customer.phone_number,
      payment_method: "bank_slip",
      product_name: payload.products?.[0]?.name,
      amount: payload.total_price,
      status: "slip_generated",
    }, { onConflict: "email" })
  }

  console.log("[Webhook Kirvano] Boleto registrado")
}

async function handleBankSlipExpired(payload: KirvanoWebhookPayload) {
  console.log("[Webhook Kirvano] Boleto expirado para:", payload.customer.email)
  // Manter status pending
}

// Funcoes auxiliares

function detectPlanFromPayload(payload: KirvanoWebhookPayload): string {
  // Detectar plano baseado no preco ou nome do produto
  const priceStr = payload.total_price.replace("R$ ", "").replace(".", "").replace(",", ".")
  const price = parseFloat(priceStr)
  
  // Verificar nome do produto primeiro
  const productName = payload.products?.[0]?.name?.toLowerCase() || ""
  const offerName = payload.products?.[0]?.offer_name?.toLowerCase() || ""
  
  if (productName.includes("ilimitado") || offerName.includes("ilimitado")) return "unlimited"
  if (productName.includes("professional") || offerName.includes("professional")) return "professional"
  if (productName.includes("starter") || offerName.includes("starter")) return "starter"
  
  // Mapear precos para planos (precos promocionais)
  if (price <= 35) return "starter" // R$ 29,90
  if (price <= 45) return "professional" // R$ 39,90
  if (price <= 55) return "unlimited" // R$ 49,90
  
  // Mapear por preco normal
  if (price <= 100) return "starter" // R$ 97,90
  if (price <= 150) return "professional" // R$ 127,90
  return "unlimited" // R$ 197,90
}

// Endpoint para verificar status de assinatura (usado pelo frontend)
export async function getStatus(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  
  if (!email) {
    return NextResponse.json(
      { error: "Email é obrigatorio" },
      { status: 400 }
    )
  }

  const supabaseClient = getSupabaseClient()
  if (supabaseClient) {
    const { data: user, error } = await supabaseClient
      .from("usuarios")
      .select("*")
      .ilike("email", email)
      .maybeSingle()
    
    if (error || !user) {
      return NextResponse.json({
        found: false,
        status: "not_found",
        message: "Nenhuma assinatura encontrada para este email",
      })
    }

    return NextResponse.json({
      found: true,
      status: user.plan_status,
      plan: user.plan,
      plan_name: user.plan,
      activated_at: user.updated_at,
    })
  }

  return NextResponse.json({
    error: "Supabase client not initialized",
  }, { status: 500 })
}
