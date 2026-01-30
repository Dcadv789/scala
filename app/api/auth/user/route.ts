import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

// GET - Retornar dados do usuário autenticado e empresaId
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      empresaId: authContext.empresaId,
      isSuperAdmin: authContext.isSuperAdmin,
      membro: {
        id: authContext.membro.id,
        nome: authContext.membro.nome,
        email: authContext.membro.email,
        cargo: authContext.membro.cargo,
        eh_superadmin: authContext.membro.eh_superadmin
      },
      empresa: authContext.membro.empresa ? {
        id: authContext.membro.empresa.id,
        nome: authContext.membro.empresa.nome,
        status_assinatura: authContext.membro.empresa.status_assinatura
      } : null
    })
  } catch (error: any) {
    console.error("[Auth User API] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
