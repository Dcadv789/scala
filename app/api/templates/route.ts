import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// GET - Listar templates do banco de dados
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Construir query com filtro Multi-Tenant
    let query = supabase
      .from("modelos")
      .select("*")
      .order("criado_em", { ascending: false })
    
    // Filtrar por empresa (superadmin vê todas, membro vê só da sua empresa)
    if (!authContext.isSuperAdmin) {
      query = query.eq("id_empresa", authContext.empresaId)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error("[Templates API] Erro ao buscar templates:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      templates: templates || []
    })

  } catch (error: any) {
    console.error("[Templates API] Erro inesperado:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Criar template localmente (antes de enviar à Meta)
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nome, categoria, idioma, componentes } = body

    if (!nome || !categoria || !idioma || !componentes) {
      return NextResponse.json(
        { success: false, error: "nome, categoria, idioma e componentes são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar formato do nome (apenas minúsculas, números e underscore)
    const nomeRegex = /^[a-z0-9_]+$/
    if (!nomeRegex.test(nome)) {
      return NextResponse.json(
        { success: false, error: "Nome do template deve conter apenas letras minúsculas, números e underscore" },
        { status: 400 }
      )
    }

    // Criar template localmente com status "NOT_SENT" (não enviado à Meta)
    const { data: template, error } = await supabase
      .from("modelos")
      .insert({
        id_empresa: authContext.empresaId,
        nome: nome,
        categoria: categoria.toUpperCase(),
        idioma: idioma,
        componentes: componentes,
        status: "NOT_SENT", // Status especial para templates locais não enviados
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("[Templates API] Erro ao criar template:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template: template
    })

  } catch (error: any) {
    console.error("[Templates API] Erro inesperado:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

