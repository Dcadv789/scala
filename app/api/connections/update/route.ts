import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID obrigatório" }, { status: 400 })
    }

    // Mapear campos em inglês para português (compatibilidade)
    const mappedUpdates: any = {}
    
    // Mapear campos conhecidos
    if ('name' in updates) {
      mappedUpdates.nome = updates.name
    }
    if ('phone' in updates) {
      mappedUpdates.telefone = updates.phone
    }
    if ('status' in updates) {
      mappedUpdates.status = updates.status
    }
    
    // Copiar outros campos que já estão em português
    Object.keys(updates).forEach(key => {
      if (!['name', 'phone'].includes(key)) {
        mappedUpdates[key] = updates[key]
      }
    })

    console.log("[Connections Update] Atualizando conexão:", {
      id,
      updates_originais: updates,
      updates_mapeados: mappedUpdates
    })

    const { data, error } = await supabase
      .from("conexoes")
      .update(mappedUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[Connections Update] Erro:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[Connections Update] ✅ Conexão atualizada com sucesso")
    return NextResponse.json({ success: true, connection: data })
  } catch (error: any) {
    console.error("[Connections Update] Erro inesperado:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
