import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext, getEmpresaFilter } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar contatos (Multi-Tenant: filtrado por empresa)
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    // Se não autenticado, retornar vazio (segurança)
    if (!authContext) {
      return NextResponse.json({ success: true, contacts: [] })
    }
    
    // Obter filtro de empresa (vazio se superadmin, { id_empresa: string } se membro)
    const empresaFilter = await getEmpresaFilter(request)
    
    // Construir query com filtro Multi-Tenant
    let query = supabase
      .from("contatos")
      .select("*")
      .order("criado_em", { ascending: false })
    
    // Aplicar filtro de empresa (se não for superadmin)
    if ('id_empresa' in empresaFilter && empresaFilter.id_empresa) {
      query = query.eq("id_empresa", empresaFilter.id_empresa)
    }
    // Se for superadmin, não aplica filtro (vê todos os contatos)

    const { data: contacts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, contacts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar contato ou importar vários (Multi-Tenant)
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Suporte para importação em massa
    if (Array.isArray(body)) {
      const contactsWithEmpresa = body.map(contact => ({
        ...contact,
        id_empresa: authContext.empresaId
      }))
      
      const { data, error } = await supabase
        .from("contatos")
        .insert(contactsWithEmpresa)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, contacts: data, count: data?.length || 0 })
    }
    
    // Criação de contato único
    const { name, phone, email, notes, tags } = body

    if (!phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    }

    const { data: contact, error } = await supabase
      .from("contatos")
      .insert({
        nome: name || phone,
        telefone: phone,
        email,
        observacoes: notes,
        tags,
        id_empresa: authContext.empresaId
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, contact })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar contato (Multi-Tenant)
export async function PUT(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    const empresaFilter = await getEmpresaFilter(request)
    
    if (!authContext) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    let query = supabase
      .from("contatos")
      .update(updates)
      .eq("id", id)
    
    // Aplicar filtro de empresa (se não for superadmin)
    if ('id_empresa' in empresaFilter && empresaFilter.id_empresa) {
      query = query.eq("id_empresa", empresaFilter.id_empresa)
    }

    const { data, error } = await query.select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, contact: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Excluir contato (Multi-Tenant)
export async function DELETE(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    const empresaFilter = await getEmpresaFilter(request)
    
    if (!authContext) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    let query = supabase
      .from("contatos")
      .delete()
      .eq("id", id)
    
    // Aplicar filtro de empresa (se não for superadmin)
    if ('id_empresa' in empresaFilter && empresaFilter.id_empresa) {
      query = query.eq("id_empresa", empresaFilter.id_empresa)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
