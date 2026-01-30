import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumberId, accessToken, wabaId } = await request.json()

    console.log("[Validate] Request received:", { phoneNumberId, wabaId, hasToken: !!accessToken })

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Phone Number ID e Access Token sao obrigatorios" },
        { status: 400 }
      )
    }

    // Usar versao mais recente da API do Facebook (v21.0)
    const apiUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}?access_token=${accessToken}`
    console.log("[Validate] Calling Facebook API...")

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[Validate] Facebook API response status:", response.status)
    console.log("[Validate] Facebook API response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("[Validate] Failed to parse response:", e)
      return NextResponse.json(
        { success: false, error: "Resposta invalida da API do Facebook" },
        { status: 500 }
      )
    }

    if (data.error) {
      console.error("[Validate] Facebook API error:", data.error)
      let errorMessage = data.error.message || "Credenciais invalidas"
      
      // Traduzir erros comuns
      if (data.error.code === 190) {
        errorMessage = "Token de acesso invalido ou expirado. Gere um novo token no Facebook Developers."
      } else if (data.error.code === 100) {
        errorMessage = "Phone Number ID invalido. Verifique o ID no WhatsApp Manager."
      } else if (data.error.code === 10) {
        errorMessage = "Permissao negada. O token nao tem acesso a este numero."
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: data.error
        },
        { status: 400 }
      )
    }

    console.log("[Validate] Connection validated successfully:", data)

    // Retornar dados da conexao validada
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        display_phone_number: data.display_phone_number,
        verified_name: data.verified_name,
        quality_rating: data.quality_rating,
        platform_type: data.platform_type,
        code_verification_status: data.code_verification_status,
      }
    })

  } catch (error: any) {
    console.error("[Validate] Unexpected error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao validar credenciais" 
      },
      { status: 500 }
    )
  }
}
