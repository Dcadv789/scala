import { NextResponse } from "next/server"

export async function POST() {
  try {
    const clientId = process.env.EFI_CLIENT_ID
    const clientSecret = process.env.EFI_CLIENT_SECRET
    const pixKey = process.env.EFI_PIX_KEY
    const sandbox = process.env.EFI_SANDBOX === "true"

    console.log("[EFI Test] Checking configuration...")
    console.log("[EFI Test] Client ID:", clientId ? "✓ Set" : "✗ Missing")
    console.log("[EFI Test] Client Secret:", clientSecret ? "✓ Set" : "✗ Missing")
    console.log("[EFI Test] PIX Key:", pixKey ? "✓ Set" : "✗ Missing")
    console.log("[EFI Test] Sandbox mode:", sandbox)

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: "EFI credentials not configured. Add EFI_CLIENT_ID and EFI_CLIENT_SECRET to environment variables.",
        config: {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
          pixKey: !!pixKey,
          sandbox,
        },
      })
    }

    // Try to get access token
    const apiUrl = sandbox ? "https://sandbox.gerencianet.com.br/v1" : "https://api.gerencianet.com.br/v1"

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    console.log("[EFI Test] Attempting to authenticate...")

    const response = await fetch(`${apiUrl}/authorize`, {
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
      console.error("[EFI Test] Auth failed:", errorText)
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${response.statusText}`,
        details: errorText,
        config: {
          clientId: !!clientId,
          clientSecret: !!clientSecret,
          pixKey: !!pixKey,
          sandbox,
        },
      })
    }

    const data = await response.json()
    console.log("[EFI Test] Authentication successful!")

    return NextResponse.json({
      success: true,
      message: "EFI connection successful",
      config: {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        pixKey: !!pixKey,
        sandbox,
      },
      token: {
        type: data.token_type,
        expiresIn: data.expires_in,
      },
    })
  } catch (error: any) {
    console.error("[EFI Test] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        clientId: !!process.env.EFI_CLIENT_ID,
        clientSecret: !!process.env.EFI_CLIENT_SECRET,
        pixKey: !!process.env.EFI_PIX_KEY,
        sandbox: process.env.EFI_SANDBOX === "true",
      },
    })
  }
}
