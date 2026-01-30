import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with server-side env vars
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""
  
  if (!url || !key) {
    return null
  }
  
  return createClient(url, key)
}

// GET - List all users
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Erro de configuracao do servidor", users: [] },
        { status: 500 }
      )
    }
    
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("criado_em", { ascending: false })
    
    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        { error: "Erro ao buscar usuarios", users: [] },
        { status: 500 }
      )
    }
    
    // Format users for frontend
    const users = (data || []).map(user => ({
      id: user.id,
      name: user.nome,
      email: user.email,
      phone: user.telefone,
      plan: user.plano,
      planStatus: user.status_plano,
      role: user.perfil,
      connections: user.conexoes || 0,
      messagesSent: user.mensagens_enviadas || 0,
      createdAt: user.criado_em,
    }))
    
    return NextResponse.json({ users })
    
  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json(
      { error: "Erro interno", users: [] },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, plan, planStatus } = body
    
    if (!email) {
      return NextResponse.json(
        { error: "Email e obrigatorio" },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Erro de configuracao do servidor" },
        { status: 500 }
      )
    }
    
    const { data, error } = await supabase
      .from("usuarios")
      .upsert({
        email: email.toLowerCase().trim(),
        nome: name || "",
        telefone: phone || "",
        plano: plan || "starter",
        status_plano: planStatus || "pending",
        perfil: "user",
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json(
        { error: "Erro ao criar usuario" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, user: data })
    
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, planStatus, plan } = body
    
    if (!id && !email) {
      return NextResponse.json(
        { error: "ID ou email e obrigatorio" },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Erro de configuracao do servidor" },
        { status: 500 }
      )
    }
    
    const updateData: any = {}
    if (planStatus !== undefined) updateData.status_plano = planStatus
    if (plan !== undefined) updateData.plano = plan
    updateData.atualizado_em = new Date().toISOString()
    
    let query = supabase.from("usuarios").update(updateData)
    
    if (id) {
      query = query.eq("id", id)
    } else if (email) {
      query = query.ilike("email", email.toLowerCase().trim())
    }
    
    const { data, error } = await query.select().single()
    
    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json(
        { error: "Erro ao atualizar usuario" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, user: data })
    
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}
