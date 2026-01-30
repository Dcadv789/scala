import { type NextRequest, NextResponse } from "next/server"

// GET - Buscar templates da Meta
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const wabaId = searchParams.get("wabaId")
  const accessToken = searchParams.get("accessToken")

  if (!wabaId || !accessToken) {
    return NextResponse.json({ 
      success: false, 
      error: "wabaId e accessToken sao obrigatorios" 
    }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${wabaId}/message_templates?limit=100&access_token=${accessToken}`,
      { method: "GET" }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ 
        success: false, 
        error: data.error.message 
      }, { status: 400 })
    }

    // Mapear templates para formato padronizado
    const templates = (data.data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      category: t.category,
      language: t.language,
      components: t.components || [],
      qualityScore: t.quality_score?.score || null,
      rejectedReason: t.rejected_reason || null,
    }))

    return NextResponse.json({ 
      success: true, 
      templates,
      paging: data.paging
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erro ao buscar templates" 
    }, { status: 500 })
  }
}

// POST - Criar novo template na Meta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wabaId, accessToken, name, category, language, components } = body

    if (!wabaId || !accessToken || !name || !category || !language || !components) {
      return NextResponse.json({ 
        success: false, 
        error: "Todos os campos sao obrigatorios" 
      }, { status: 400 })
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${wabaId}/message_templates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, "_"),
          category,
          language,
          components,
        }),
      }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ 
        success: false, 
        error: data.error.message,
        errorCode: data.error.code
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      templateId: data.id,
      status: data.status || "PENDING"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erro ao criar template" 
    }, { status: 500 })
  }
}

// DELETE - Deletar template da Meta
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const templateName = searchParams.get("name")
  const wabaId = searchParams.get("wabaId")
  const accessToken = searchParams.get("accessToken")

  if (!templateName || !wabaId || !accessToken) {
    return NextResponse.json({ 
      success: false, 
      error: "name, wabaId e accessToken sao obrigatorios" 
    }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${wabaId}/message_templates?name=${templateName}&access_token=${accessToken}`,
      { method: "DELETE" }
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ 
        success: false, 
        error: data.error.message 
      }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erro ao deletar template" 
    }, { status: 500 })
  }
}
