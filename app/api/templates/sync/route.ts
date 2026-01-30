import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

// POST - Sincronizar templates da Meta para o banco de dados
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    const id_empresa = authContext.empresaId

    // Chamar Edge Function do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json(
        { success: false, error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    // Extrair project ref da URL
    const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
    if (!projectRef) {
      return NextResponse.json(
        { success: false, error: "URL do Supabase inválida" },
        { status: 500 }
      )
    }

    const edgeFunctionUrl = `https://${projectRef}.supabase.co/functions/v1/templates-manager`
    
    console.log("[Templates Sync API] Chamando Edge Function:", edgeFunctionUrl)
    console.log("[Templates Sync API] ID Empresa:", id_empresa)

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: "sync",
        id_empresa: id_empresa
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      console.error("[Templates Sync API] Erro na Edge Function:", data)
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || "Erro ao sincronizar templates" 
        },
        { status: response.status || 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      total: data.total,
      criados: data.criados,
      atualizados: data.atualizados
    })

  } catch (error: any) {
    console.error("[Templates Sync API] Erro inesperado:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


