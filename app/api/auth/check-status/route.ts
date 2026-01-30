import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_empresa, update_status } = body
    
    if (!id_empresa) {
      return NextResponse.json({ error: "id_empresa obrigatório" }, { status: 400 })
    }

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id_empresa)) {
      return NextResponse.json({ error: "id_empresa inválido" }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Erro de servidor" }, { status: 500 })
    }
    
    // Se update_status foi fornecido, atualizar o status da empresa
    if (update_status) {
      const { data: empresaUpdated, error: updateError } = await supabase
        .from("empresas")
        .update({ status_assinatura: update_status })
        .eq("id", id_empresa)
        .select()
        .single()
      
      if (updateError) {
        console.error("[Check Status] Erro ao atualizar empresa:", updateError)
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        empresa: empresaUpdated
      })
    }
    
    // Buscar empresa pelo id_empresa (Multi-Tenant)
    const { data: empresa, error } = await supabase
      .from("empresas")
      .select("id, plano_atual, status_assinatura")
      .eq("id", id_empresa)
      .single()
    
    if (error) {
      console.error("[Check Status] Erro ao buscar empresa:", error)
      return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 })
    }
    
    if (!empresa) {
      return NextResponse.json({ 
        success: true,
        isActive: false,
        planStatus: "not_found"
      })
    }
    
    return NextResponse.json({
      success: true,
      isActive: empresa.status_assinatura === "active",
      planStatus: empresa.status_assinatura,
      plan: empresa.plano_atual,
      empresa: {
        id: empresa.id,
        plano_atual: empresa.plano_atual,
        status_assinatura: empresa.status_assinatura
      }
    })
    
  } catch (error: any) {
    console.error("[Check Status] Erro interno:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
