// Pagar.me API Integration - SERVER SIDE ONLY
// Documentation: https://docs.pagar.me
// This file should only be imported in server components, API routes, or server actions

const PAGARME_API_URL = "https://api.pagar.me/core/v5"

type PagarmeConfig = {
  apiKey: string
}

const config: PagarmeConfig = {
  apiKey: process.env.PAGARME_API_KEY || "",
}

export type CreateSubscriptionParams = {
  customerId: string
  planId: string
  paymentMethod: "credit_card" | "boleto" | "pix"
  cardToken?: string
}

export type CreateCustomerParams = {
  name: string
  email: string
  document: string
  phone: string
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

// Create a customer in Pagar.me
export async function createCustomer(params: CreateCustomerParams) {
  try {
    const response = await fetch(`${PAGARME_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        document: params.document,
        type: "individual",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: params.phone.substring(0, 2),
            number: params.phone.substring(2),
          },
        },
        address: {
          line_1: `${params.address.number}, ${params.address.street}, ${params.address.neighborhood}`,
          line_2: params.address.complement,
          zip_code: params.address.zipCode,
          city: params.address.city,
          state: params.address.state,
          country: "BR",
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Pagar.me API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

// Create a subscription in Pagar.me
export async function createSubscription(params: CreateSubscriptionParams) {
  try {
    const response = await fetch(`${PAGARME_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        customer_id: params.customerId,
        plan_id: params.planId,
        payment_method: params.paymentMethod,
        card_token: params.cardToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Pagar.me API error: ${response.statusText}`)
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
    const response = await fetch(`${PAGARME_API_URL}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Pagar.me API error: ${response.statusText}`)
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
    const response = await fetch(`${PAGARME_API_URL}/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Pagar.me API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching subscription:", error)
    throw error
  }
}

// Webhook handler to process Pagar.me events
export function handleWebhook(event: any) {
  console.log("Pagar.me webhook received:", event.type)

  switch (event.type) {
    case "subscription.created":
      console.log("Subscription created:", event.data)
      break
    case "subscription.updated":
      console.log("Subscription updated:", event.data)
      break
    case "subscription.canceled":
      console.log("Subscription canceled:", event.data)
      break
    case "charge.paid":
      console.log("Charge paid:", event.data)
      break
    case "charge.refunded":
      console.log("Charge refunded:", event.data)
      break
    default:
      console.log("Unknown event type:", event.type)
  }
}

// Helper function to get plan prices
export function getPlanPrice(plan: "starter" | "pro" | "enterprise"): number {
  const prices = {
    starter: 47,
    pro: 97,
    enterprise: 197,
  }
  return prices[plan]
}

// Helper function to format currency for Brazil
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount)
}
