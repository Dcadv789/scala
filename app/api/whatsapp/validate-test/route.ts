import { NextRequest, NextResponse } from "next/server"

// GET - Testar se a API está funcionando
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "API de validação está funcionando",
    timestamp: new Date().toISOString()
  })
}

// POST - Testar validação com dados de exemplo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("[ValidateTest] Received request:", {
      phoneNumberId: body.phoneNumberId,
      wabaId: body.wabaId,
      hasToken: !!body.accessToken,
      tokenLength: body.accessToken?.length || 0
    })

    if (!body.phoneNumberId || !body.accessToken) {
      return NextResponse.json({
        success: false,
        error: "phoneNumberId e accessToken são obrigatórios",
        received: {
          phoneNumberId: body.phoneNumberId || "MISSING",
          hasToken: !!body.accessToken
        }
      }, { status: 400 })
    }

    // Chamar API do Facebook
    const apiUrl = `https://graph.facebook.com/v21.0/${body.phoneNumberId}?access_token=${body.accessToken}`
    
    console.log("[ValidateTest] Calling Facebook API...")
    
    const fbResponse = await fetch(apiUrl)
    const fbText = await fbResponse.text()
    
    console.log("[ValidateTest] Facebook response status:", fbResponse.status)
    console.log("[ValidateTest] Facebook response:", fbText.substring(0, 500))

    let fbData
    try {
      fbData = JSON.parse(fbText)
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Resposta inválida do Facebook",
        rawResponse: fbText.substring(0, 200)
      }, { status: 500 })
    }

    if (fbData.error) {
      return NextResponse.json({
        success: false,
        error: fbData.error.message,
        errorCode: fbData.error.code,
        errorType: fbData.error.type,
        details: fbData.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Conexão validada com sucesso!",
      data: fbData
    })

  } catch (error: any) {
    console.error("[ValidateTest] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
