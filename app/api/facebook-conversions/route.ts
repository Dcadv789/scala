import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventName, eventData } = body

    const pixelId = "4145042732473994"
    const accessToken =
      "EAAL0j7l35gsBQFZCTw41ApUPQwnibyzHMWLnOh6t6lYj8lE4imHNrwVJot093pkjHKyJZCZBm2pZAPsGHqHQtfae1yH0SikZCfrWok8j7i3ZCgMkQM8Pci6GJfvqcjkUSKkcrIhHgrCkm1blc5EEp9KXPJC3uAPyNeeZA33Rne6pFAGITBDtypeFqbpQPlZATgZDZD"

    const fbData = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: {
            em: eventData.email ? [await hashSHA256(eventData.email)] : undefined,
            ph: eventData.phone ? [await hashSHA256(eventData.phone)] : undefined,
            fn: eventData.firstName ? [await hashSHA256(eventData.firstName)] : undefined,
            client_ip_address: request.headers.get("x-forwarded-for") || undefined,
            client_user_agent: request.headers.get("user-agent") || undefined,
          },
          custom_data: eventData.customData || {},
        },
      ],
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fbData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[v0] Facebook Conversions API error:", result)
      return NextResponse.json({ success: false, error: result }, { status: 500 })
    }

    console.log("[v0] Facebook Conversions API success:", result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[v0] Facebook Conversions API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}
