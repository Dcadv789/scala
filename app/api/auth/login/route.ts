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

export async function POST(request: NextRequest) {
  console.log("[v0] Login API called - modo simplificado (sem banco de dados)")
  
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log("[v0] Login simplificado - aceitando qualquer entrada")
    
    // Login simplificado - aceita qualquer entrada sem verificar banco de dados
    // Retorna sucesso sempre
    return NextResponse.json({
      success: true,
      user: {
        id: Date.now().toString(),
        name: email.split("@")[0] || "Usuário",
        email: email || "usuario@exemplo.com",
        role: "user",
        plan: "starter",
        planStatus: "active",
      }
    })
    
  } catch (error) {
    console.error("Login error:", error)
    // Mesmo em caso de erro, retorna sucesso
    return NextResponse.json({
      success: true,
      user: {
        id: Date.now().toString(),
        name: "Usuário",
        email: "usuario@exemplo.com",
        role: "user",
        plan: "starter",
        planStatus: "active",
      }
    })
  }
}
