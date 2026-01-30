import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET
    const redirectUri = `${request.nextUrl.origin}/dashboard/connections`

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `code=${code}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
    )

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error("[Facebook Token Exchange] Error:", tokenData.error)
      return NextResponse.json({ error: tokenData.error.message }, { status: 400 })
    }

    // Get debug token info to extract WABA and Phone Number ID
    const debugResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?` +
        `input_token=${tokenData.access_token}&` +
        `access_token=${appId}|${appSecret}`,
    )

    const debugData = await debugResponse.json()

    console.log("[Facebook Token Exchange] Debug data:", debugData)

    // Return credentials
    return NextResponse.json({
      access_token: tokenData.access_token,
      phone_number_id: debugData.data?.granular_scopes?.[0]?.target_ids?.[0] || "",
      waba_id: debugData.data?.granular_scopes?.[1]?.target_ids?.[0] || "",
    })
  } catch (error: any) {
    console.error("[Facebook Token Exchange] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
