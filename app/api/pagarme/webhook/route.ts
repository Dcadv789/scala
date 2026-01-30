import { type NextRequest, NextResponse } from "next/server"
import { handleWebhook } from "@/lib/pagarme"
import { updateUserSubscription, addPayment, getAllUsers } from "@/lib/store"

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    console.log("Pagar.me webhook received:", event.type)

    // Handle different webhook events
    handleWebhook(event)

    // Update user subscription status based on events
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
        // Update user subscription in database
        if (event.data.customer_id) {
          const users = getAllUsers()
          const user = users.find((u) => u.email === event.data.customer?.email)
          if (user) {
            updateUserSubscription(user.id, {
              subscriptionStatus: "active",
              subscriptionId: event.data.id,
              nextPaymentDate: event.data.next_billing_at,
            })
          }
        }
        break

      case "subscription.canceled":
        if (event.data.customer_id) {
          const users = getAllUsers()
          const user = users.find((u) => u.email === event.data.customer?.email)
          if (user) {
            updateUserSubscription(user.id, {
              subscriptionStatus: "canceled",
            })
          }
        }
        break

      case "charge.paid":
        // Record payment
        if (event.data.customer_id) {
          const users = getAllUsers()
          const user = users.find((u) => u.email === event.data.customer?.email)
          if (user) {
            addPayment({
              userId: user.id,
              amount: event.data.amount / 100, // Convert from cents
              status: "paid",
              plan: user.plan,
              pagarmeTransactionId: event.data.id,
              paidAt: event.data.paid_at,
            })

            updateUserSubscription(user.id, {
              lastPaymentDate: event.data.paid_at,
            })
          }
        }
        break

      case "charge.refunded":
        // Handle refund
        console.log("Processing refund for charge:", event.data.id)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
