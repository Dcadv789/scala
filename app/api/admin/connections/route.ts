import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar todas as conexões com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const id_empresa = searchParams.get("id_empresa")

    // Buscar conexões
    let conexoesQuery = supabase
      .from("conexoes")
      .select("*")

    // Aplicar filtros
    if (status && status !== "all") {
      conexoesQuery = conexoesQuery.eq("status", status)
    }
    if (id_empresa && id_empresa !== "all") {
      conexoesQuery = conexoesQuery.eq("id_empresa", id_empresa)
    }

    const { data: conexoes, error } = await conexoesQuery.order("criado_em", { ascending: false })

    if (error) {
      console.error("Error fetching conexoes:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Buscar todas as empresas para o filtro e fazer match
    const { data: empresas } = await supabase
      .from("empresas")
      .select("id, nome")
      .order("nome")

    const empresasMap = new Map()
    empresas?.forEach((emp: any) => {
      empresasMap.set(emp.id, emp)
    })

    // Adicionar dados da empresa a cada conexão
    const conexoesComEmpresa = conexoes?.map((conn: any) => ({
      ...conn,
      empresas: conn.id_empresa ? empresasMap.get(conn.id_empresa) || null : null
    })) || []

    return NextResponse.json({
      success: true,
      conexoes: conexoesComEmpresa,
      empresas: empresas || []
    })
  } catch (error: any) {
    console.error("Error in GET /api/admin/connections:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
