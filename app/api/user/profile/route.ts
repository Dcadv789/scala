import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar perfil do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    console.log("[GET Profile] === INICIANDO REQUISIÇÃO ===")
    console.log("[GET Profile] URL:", request.url)
    console.log("[GET Profile] Headers recebidos:", Object.fromEntries(request.headers.entries()))
    
    // Tentar pegar ID do header primeiro
    let userId = request.headers.get("x-user-id")
    
    // Se não tiver no header, tentar query param
    if (!userId) {
      const url = new URL(request.url)
      userId = url.searchParams.get("userId")
      console.log("[GET Profile] UserId do query param:", userId)
    }
    
    if (!userId) {
      console.error("[GET Profile] ❌ UserId não encontrado nem no header nem no query")
      return NextResponse.json({ 
        error: "Usuário não autenticado",
        debug: {
          headers: Object.fromEntries(request.headers.entries()),
          url: request.url
        }
      }, { status: 401 })
    }

    console.log("[GET Profile] ✅ UserId encontrado:", userId)

    // 1. Buscar perfil
    const { data: perfil, error: perfilError } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", userId)
      .single()

    if (perfilError) {
      console.error("[GET Profile] Erro ao buscar perfil:", perfilError)
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
    }

    console.log("[GET Profile] Perfil encontrado:", perfil.id, "-", perfil.nome_completo)

    // 2. Buscar membro usando id_perfil (relaciona com perfis.id)
    console.log("[GET Profile] Buscando membros com id_perfil =", perfil.id)
    const { data: membros, error: membrosError } = await supabase
      .from("membros")
      .select("*")
      .eq("id_perfil", perfil.id)
      .eq("ativo", "TRUE")

    if (membrosError) {
      console.error("[GET Profile] Erro ao buscar membros:", membrosError)
      return NextResponse.json({ error: "Erro ao buscar membro", details: membrosError.message }, { status: 500 })
    }

    if (!membros || membros.length === 0) {
      console.error("[GET Profile] Nenhum membro encontrado para id_perfil:", perfil.id)
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
    }

    const membro = membros[0]
    console.log("[GET Profile] Membro encontrado:", membro.id, "- Cargo:", membro.cargo, "- id_empresa:", membro.id_empresa)

    // 3. Buscar empresa usando id_empresa do membro
    if (!membro.id_empresa) {
      console.error("[GET Profile] Membro não tem id_empresa")
      return NextResponse.json({ error: "Membro não está vinculado a uma empresa" }, { status: 404 })
    }

    console.log("[GET Profile] Buscando empresa com id =", membro.id_empresa)
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("id, nome, id_plano, status_assinatura")
      .eq("id", membro.id_empresa)
      .single()

    if (empresaError || !empresa) {
      console.error("[GET Profile] Erro ao buscar empresa:", empresaError)
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    console.log("[GET Profile] Empresa encontrada:", empresa.nome, "- id_plano:", empresa.id_plano)

    // 4. Buscar plano usando id_plano da empresa
    let plano = null
    if (empresa.id_plano) {
      console.log("[GET Profile] Buscando plano com id =", empresa.id_plano)
      const { data: planoData, error: planoError } = await supabase
        .from("planos")
        .select("id, nome, slug")
        .eq("id", empresa.id_plano)
        .single()

      if (planoError) {
        console.error("[GET Profile] Erro ao buscar plano:", planoError)
        // Não falhar se o plano não existir, apenas logar
      } else {
        plano = planoData
        console.log("[GET Profile] Plano encontrado:", plano.nome)
      }
    } else {
      console.log("[GET Profile] Empresa não tem id_plano definido")
    }

    console.log("[GET Profile] ✅ Todos os dados encontrados com sucesso!")

    return NextResponse.json({
      // Dados pessoais
      id: perfil.id,
      nome: perfil.nome_completo,
      email: perfil.email,
      telefone: perfil.telefone || "",
      
      // Dados do membro
      cargo: membro.cargo,
      ehSuperAdmin: membro.eh_superadmin || false,
      
      // Dados da empresa
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      empresaStatus: empresa.status_assinatura,
      
      // Dados do plano (vem da tabela planos)
      empresaPlano: plano?.nome || plano?.slug || "N/A",
      empresaPlanoId: plano?.id || null
    })

  } catch (error: any) {
    console.error("[GET Profile] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar perfil
export async function PUT(request: NextRequest) {
  try {
    console.log("[PUT Profile] === INICIANDO ATUALIZAÇÃO ===")
    
    // Tentar pegar ID do header primeiro
    let userId = request.headers.get("x-user-id")
    
    // Se não tiver no header, tentar query param
    if (!userId) {
      const url = new URL(request.url)
      userId = url.searchParams.get("userId")
      console.log("[PUT Profile] UserId do query param:", userId)
    }
    
    if (!userId) {
      console.error("[PUT Profile] ❌ UserId não encontrado")
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }
    
    console.log("[PUT Profile] ✅ UserId:", userId)

    const body = await request.json()
    const { nome, telefone } = body

    console.log("[PUT Profile] Atualizando perfil:", userId)
    console.log("[PUT Profile] Novos dados:", { nome, telefone })

    // Atualizar perfil
    const { data, error } = await supabase
      .from("perfis")
      .update({
        nome_completo: nome,
        telefone: telefone
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("[PUT Profile] Erro ao atualizar:", error)
      return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
    }

    console.log("[PUT Profile] ✅ Perfil atualizado com sucesso")

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        nome: data.nome_completo,
        email: data.email,
        telefone: data.telefone
      }
    })

  } catch (error: any) {
    console.error("[PUT Profile] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

