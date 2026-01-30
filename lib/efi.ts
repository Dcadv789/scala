// EFI Bank (antiga Gerencianet) API Integration - SERVER SIDE ONLY
// Documentation: https://dev.efipay.com.br
// This file should only be imported in server components, API routes, or server actions

const EFI_API_URL =
  process.env.EFI_SANDBOX === "true" ? "https://sandbox.gerencianet.com.br/v1" : "https://api.gerencianet.com.br/v1"

const EFI_PIX_API_URL =
  process.env.EFI_SANDBOX === "true" ? "https://pix-h.api.efipay.com.br/v2" : "https://pix.api.efipay.com.br/v2"

type EfiConfig = {
  clientId: string
  clientSecret: string
  sandbox: boolean
}

const PRODUCTION_CONFIG = {
  clientId: "Client_Id_58b40e0d61ba8d8f60faf1be73e15d5e5b7d5042",
  clientSecret: "Client_Secret_c8c9c9f0d9e25cd2ff5afada9c4caa6c9fb87a30",
  sandbox: false,
}

const config: EfiConfig = {
  clientId: process.env.EFI_CLIENT_ID || PRODUCTION_CONFIG.clientId,
  clientSecret: process.env.EFI_CLIENT_SECRET || PRODUCTION_CONFIG.clientSecret,
  sandbox: process.env.EFI_SANDBOX === "true" || PRODUCTION_CONFIG.sandbox,
}

// Get OAuth access token
async function getAccessToken(): Promise<string> {
  console.log("[EFI] Getting access token...")
  console.log("[EFI] Client ID:", config.clientId ? "Set" : "Missing")
  console.log("[EFI] Sandbox mode:", config.sandbox)

  if (!config.clientId || !config.clientSecret) {
    throw new Error("EFI credentials not configured. Please set EFI_CLIENT_ID and EFI_CLIENT_SECRET")
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")

  const response = await fetch(`${EFI_API_URL}/authorize`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[EFI] Auth error response:", errorText)
    throw new Error(`EFI Auth error: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log("[EFI] Access token obtained successfully")
  return data.access_token
}

export type CreatePlanParams = {
  name: string
  interval: "monthly" | "bimonthly" | "quarterly" | "semiannually" | "yearly"
  repeats: number | null // null = ilimitado
  value: number // em centavos
}

export type CreateSubscriptionParams = {
  planId: string
  customerId: string
  paymentMethod: "credit_card" | "banking_billet"
  items: Array<{
    name: string
    amount: number
    value: number
  }>
}

export type CreateCustomerParams = {
  name: string
  email: string
  cpf: string
  phone: string
  birth: string // YYYY-MM-DD
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
  }
}

export type CreatePixChargeParams = {
  txid?: string
  valor: number
  devedor: {
    cpf?: string
    cnpj?: string
    nome: string
  }
  solicitacaoPagador?: string
  expiracao?: number
}

export type CreatePixRecurrentParams = {
  valor: number
  devedor: {
    cpf?: string
    cnpj?: string
    nome: string
  }
  recorrencia: {
    tipo: "diaria" | "semanal" | "mensal"
    dataInicio: string
    quantidade: number
  }
}

// Create a plan in EFI
export async function createPlan(params: CreatePlanParams) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${EFI_API_URL}/plan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: params.name,
        interval: params.interval === "monthly" ? 1 : params.interval === "quarterly" ? 3 : 12,
        repeats: params.repeats,
        value: params.value,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI API error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating plan:", error)
    throw error
  }
}

// Create a subscription in EFI
export async function createSubscription(params: CreateSubscriptionParams) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${EFI_API_URL}/subscription`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: params.planId,
        items: params.items,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI API error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating subscription:", error)
    throw error
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${EFI_API_URL}/subscription/${subscriptionId}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI API error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error canceling subscription:", error)
    throw error
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${EFI_API_URL}/subscription/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI API error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching subscription:", error)
    throw error
  }
}

// Create payment for a subscription (Two Steps)
export async function createSubscriptionPayment(
  subscriptionId: string,
  paymentData: {
    payment: {
      credit_card?: {
        installments: number
        billing_address: {
          street: string
          number: string
          neighborhood: string
          zipcode: string
          city: string
          state: string
        }
        payment_token: string
        customer: {
          name: string
          email: string
          cpf: string
          birth: string
          phone_number: string
        }
      }
      banking_billet?: {
        customer: {
          name: string
          email: string
          cpf: string
          birth: string
          phone_number: string
        }
      }
    }
  },
) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${EFI_API_URL}/subscription/${subscriptionId}/pay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI API error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating payment:", error)
    throw error
  }
}

// Webhook handler to process EFI events
export function handleWebhook(notification: any) {
  console.log("[EFI] Webhook received:", notification)

  // EFI sends notification with type parameter
  const type = notification.type || notification.event

  switch (type) {
    case "subscription":
      console.log("[EFI] Subscription notification:", notification.data)
      // Handle subscription status changes
      break
    case "charge":
      console.log("[EFI] Charge notification:", notification.data)
      // Handle charge status changes
      break
    case "pix":
      console.log("[EFI] PIX notification:", notification.data)
      // Handle PIX payments
      break
    default:
      console.log("[EFI] Unknown notification type:", type)
  }

  return { received: true }
}

// Helper function to get plan prices and IDs
export function getPlanConfig(plan: "starter" | "pro" | "enterprise") {
  const plans = {
    starter: {
      name: "Plano Básico",
      value: 7990, // R$ 79,90 em centavos
      interval: "monthly" as const,
      repeats: null, // ilimitado
    },
    pro: {
      name: "Plano Professional",
      value: 12790, // R$ 127,90 em centavos
      interval: "monthly" as const,
      repeats: null,
    },
    enterprise: {
      name: "Plano Ilimitado",
      value: 19790, // R$ 197,90 em centavos
      interval: "monthly" as const,
      repeats: null,
    },
  }
  return plans[plan]
}

// Helper function to format currency for Brazil
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100) // Convert centavos to reais
}

// Create PIX immediate charge (Pix Cob)
export async function createPixCharge(params: CreatePixChargeParams) {
  try {
    console.log("[EFI] Creating PIX charge with params:", params)

    const token = await getAccessToken()
    console.log("[EFI] Token obtained, creating charge...")

    const body = {
      calendario: {
        expiracao: params.expiracao || 3600,
      },
      devedor: params.devedor,
      valor: {
        original: (params.valor / 100).toFixed(2),
      },
      chave: process.env.EFI_PIX_KEY || "",
      solicitacaoPagador: params.solicitacaoPagador || "Pagamento ScalaZap",
    }

    console.log("[EFI] Request body:", JSON.stringify(body, null, 2))

    const url = params.txid ? `${EFI_PIX_API_URL}/cob/${params.txid}` : `${EFI_PIX_API_URL}/cob`
    console.log("[EFI] Request URL:", url)

    const response = await fetch(url, {
      method: params.txid ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[EFI] Response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error("[EFI] PIX error response:", error)
      throw new Error(`EFI PIX error: ${JSON.stringify(error)}`)
    }

    const result = await response.json()
    console.log("[EFI] PIX charge created successfully:", result)

    return {
      txid: result.txid,
      location: result.location,
      pixCopiaECola: result.pixCopiaECola,
      qrcode: result.qrcode?.imagemQrcode || null,
      status: result.status,
    }
  } catch (error) {
    console.error("[EFI] Error creating PIX charge:", error)
    throw error
  }
}

// Get PIX charge details
export async function getPixCharge(txid: string) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${EFI_PIX_API_URL}/cob/${txid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI PIX error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching PIX charge:", error)
    throw error
  }
}

// Create recurring PIX payment (via Open Finance)
export async function createPixRecurrent(params: CreatePixRecurrentParams) {
  try {
    const token = await getAccessToken()

    const body = {
      pagador: {
        cpf: params.devedor.cpf,
        cnpj: params.devedor.cnpj,
      },
      favorecido: {
        contaBanco: {
          nome: process.env.EFI_ACCOUNT_NAME || "",
          documento: process.env.EFI_ACCOUNT_DOCUMENT || "",
          codigoBanco: "364",
          agencia: process.env.EFI_ACCOUNT_AGENCY || "",
          conta: process.env.EFI_ACCOUNT_NUMBER || "",
          tipoConta: "CACC",
        },
      },
      pagamento: {
        valor: (params.valor / 100).toFixed(2),
        recorrencia: {
          tipo: params.recorrencia.tipo,
          dataInicio: params.recorrencia.dataInicio,
          quantidade: params.recorrencia.quantidade,
        },
      },
    }

    const response = await fetch(`${EFI_PIX_API_URL.replace("/v2", "/v1")}/pagamentos-recorrentes/pix`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`EFI PIX Recurrent error: ${JSON.stringify(error)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating recurrent PIX:", error)
    throw error
  }
}
