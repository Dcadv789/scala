import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar todas as empresas com seus membros
export async function GET(request: NextRequest) {
  try {
    console.log("[API Admin Empresas] 🔄 Iniciando busca de empresas...")
    
    // Buscar todas as empresas
    const { data: empresas, error: empresasError } = await supabase
      .from("empresas")
      .select("*")
      .order("criado_em", { ascending: false })

    if (empresasError) {
      console.error("[API Admin Empresas] ❌ Erro ao buscar empresas:", empresasError)
      return NextResponse.json({ error: empresasError.message }, { status: 500 })
    }

    console.log("[API Admin Empresas] ✅ Empresas encontradas:", empresas?.length || 0)
    if (empresas && empresas.length > 0) {
      empresas.forEach((emp, index) => {
        console.log(`[API Admin Empresas]   ${index + 1}. ${emp.nome} (${emp.id}) - Status: ${emp.status_assinatura}, Plano: ${emp.plano_atual}`)
      })
    }

    // Para cada empresa, buscar seus membros
    console.log("[API Admin Empresas] 🔄 Buscando membros para cada empresa...")
    const empresasComMembros = await Promise.all(
      (empresas || []).map(async (empresa) => {
        const { data: membros, error: membrosError } = await supabase
          .from("membros")
          .select("*")
          .eq("id_empresa", empresa.id)
          .order("criado_em", { ascending: false })

        if (membrosError) {
          console.error(`[API Admin Empresas] ❌ Erro ao buscar membros para empresa ${empresa.id}:`, membrosError)
        } else {
          console.log(`[API Admin Empresas] ✅ Empresa ${empresa.nome}: ${membros?.length || 0} membros encontrados`)
        }

        return {
          ...empresa,
          membros: membros || [],
          total_membros: membros?.length || 0,
          membros_ativos: membros?.filter((m: any) => m.ativo).length || 0
        }
      })
    )

    console.log("[API Admin Empresas] ✅ Processamento concluído:", {
      total: empresasComMembros.length,
      empresasComMembros: empresasComMembros.map(e => ({
        id: e.id,
        nome: e.nome,
        total_membros: e.total_membros
      }))
    })

    return NextResponse.json({
      success: true,
      empresas: empresasComMembros,
      total: empresasComMembros.length
    })
  } catch (error: any) {
    console.error("[API Admin Empresas] ❌ Erro inesperado:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, documento, plano_atual } = body

    if (!nome || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      )
    }

    const { data: empresa, error } = await supabase
      .from("empresas")
      .insert({
        nome,
        email,
        telefone: telefone || null,
        documento: documento || null,
        plano_atual: plano_atual || "starter",
        status_assinatura: "pending"
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating empresa:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      empresa
    })
  } catch (error: any) {
    console.error("Error in POST /api/admin/empresas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar empresa
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const { data: empresa, error } = await supabase
      .from("empresas")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating empresa:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      empresa
    })
  } catch (error: any) {
    console.error("Error in PUT /api/admin/empresas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deletar empresa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase
      .from("empresas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting empresa:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/empresas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


