import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const phoneNumberId = formData.get("phoneNumberId") as string
    const accessToken = formData.get("accessToken") as string

    if (!file || !phoneNumberId || !accessToken) {
      return NextResponse.json({
        success: false,
        error: "file, phoneNumberId e accessToken são obrigatórios"
      }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Meta
    const uploadFormData = new FormData()
    uploadFormData.append("file", new Blob([buffer], { type: file.type }), file.name)
    uploadFormData.append("messaging_product", "whatsapp")
    uploadFormData.append("type", file.type)

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/media`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: uploadFormData,
      }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({
        success: false,
        error: data.error.message || "Erro ao fazer upload"
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      mediaId: data.id,
      mediaHandle: data.id, // Meta uses ID as handle for templates
    })
  } catch (error: any) {
    console.error("[WhatsApp Upload] Error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Erro interno ao fazer upload"
    }, { status: 500 })
  }
}
