import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { phoneNumberId, accessToken, phone } = await request.json()

    console.log("[v0] Testing Official WhatsApp API connection:", { phoneNumberId, phone })

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()

    console.log("[v0] Meta API Response:", data)

    if (!response.ok) {
      console.error("[v0] Meta API Error:", data)
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || "Failed to validate credentials",
          details: data.error,
        },
        { status: 400 },
      )
    }

    // If successful, return connection data
    return NextResponse.json({
      success: true,
      data: {
        phoneNumberId,
        phone: data.display_phone_number || phone,
        verified: data.verified_name || data.display_phone_number,
        status: "connected",
      },
    })
  } catch (error: any) {
    console.error("[v0] Connection test error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
