import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { AuthContext, MembroComEmpresa } from "@/lib/types/multi-tenant"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[Multi-Tenant Auth] ⚠️ Variáveis de ambiente do Supabase não configuradas!")
  console.error("[Multi-Tenant Auth] SUPABASE_URL:", supabaseUrl ? "Configurado" : "NÃO CONFIGURADO")
  console.error("[Multi-Tenant Auth] SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "Configurado" : "NÃO CONFIGURADO")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
}

/**
 * Obtém o membro autenticado com dados da empresa (Multi-Tenant)
 * Retorna null se não encontrar ou se o membro estiver inativo
 */
export async function getAuthMembro(request: NextRequest): Promise<MembroComEmpresa | null> {
  try {
    console.log("[Multi-Tenant Auth] ====== INICIANDO getAuthMembro ======")
    console.log("[Multi-Tenant Auth] Headers:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa")
    })
    
    // 1. Obter ID do usuário autenticado (Supabase Auth ID)
    const authUser = await getAuthUserBasic(request)
    if (!authUser || !authUser.id) {
      console.log("[Multi-Tenant Auth] ❌ getAuthUserBasic retornou null ou sem ID")
      return null
    }

    console.log("[Multi-Tenant Auth] ✅ getAuthUserBasic retornou:", {
      id: authUser.id,
      email: authUser.email
    })
    console.log("[Multi-Tenant Auth] Buscando membro para user ID:", authUser.id)

    // 2. Buscar perfil na tabela perfis usando o ID do auth.users
    const { data: perfilData, error: perfilError } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle()

    if (perfilError) {
      console.error("[Multi-Tenant Auth] Erro ao buscar perfil:", perfilError)
      return null
    }

    if (!perfilData) {
      console.log("[Multi-Tenant Auth] Perfil não encontrado para user ID:", authUser.id)
      return null
    }

    console.log("[Multi-Tenant Auth] Perfil encontrado:", perfilData.id)

    // 3. Buscar membro na tabela membros usando id_perfil
    // Buscar TODOS os membros deste perfil (pode ter múltiplas empresas)
    const { data: membrosData, error: membrosError } = await supabase
      .from("membros")
      .select(`
        *,
        empresas!fk_membros_empresa (
          *
        )
      `)
      .eq("id_perfil", perfilData.id)
      .eq("ativo", true)

    if (membrosError) {
      console.error("[Multi-Tenant Auth] Erro ao buscar membros:", membrosError)
      return null
    }

    if (!membrosData || membrosData.length === 0) {
      console.log("[Multi-Tenant Auth] Nenhum membro encontrado para perfil:", perfilData.id)
      return null
    }

    // 4. Se tiver múltiplos membros, usar o id_empresa do header X-Selected-Empresa ou primeiro membro
    let membroSelecionado = membrosData[0]
    const selectedEmpresaId = request.headers.get("x-selected-empresa")
    
    console.log("[Multi-Tenant Auth] Empresa selecionada no header:", selectedEmpresaId)
    console.log("[Multi-Tenant Auth] Total de membros encontrados:", membrosData.length)
    console.log("[Multi-Tenant Auth] IDs das empresas dos membros:", membrosData.map((m: any) => m.id_empresa))
    
    // Sempre tentar usar a empresa selecionada se fornecida
    if (selectedEmpresaId) {
      const membroComEmpresa = membrosData.find((m: any) => m.id_empresa === selectedEmpresaId)
      if (membroComEmpresa) {
        membroSelecionado = membroComEmpresa
        console.log("[Multi-Tenant Auth] ✅ Usando empresa selecionada:", selectedEmpresaId)
      } else {
        console.log("[Multi-Tenant Auth] ⚠️ Empresa selecionada não encontrada nos membros, usando primeiro membro")
        console.log("[Multi-Tenant Auth] Empresa do primeiro membro:", membrosData[0].id_empresa)
      }
    } else {
      console.log("[Multi-Tenant Auth] Nenhuma empresa selecionada no header, usando primeiro membro")
    }
    
    const membro = membroSelecionado
    const empresa = Array.isArray(membro.empresas) ? membro.empresas[0] : membro.empresas

    if (!empresa) {
      console.error("[Multi-Tenant Auth] ❌ Empresa não encontrada no membro")
      return null
    }
    
    if (empresa.status_assinatura === 'suspended') {
      console.error("[Multi-Tenant Auth] ❌ Empresa suspensa:", empresa.nome)
      return null
    }

    console.log("[Multi-Tenant Auth] ✅ Membro encontrado:", membro.id, "Empresa:", empresa.nome, "ID Empresa:", empresa.id)

    return {
      ...membro,
      empresa: empresa
    } as MembroComEmpresa
  } catch (error) {
    console.error("[Multi-Tenant Auth] Error getting membro:", error)
    return null
  }
}

/**
 * Obtém o contexto de autenticação Multi-Tenant completo
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  console.log("[getAuthContext] ====== INICIANDO getAuthContext ======")
  
  const membro = await getAuthMembro(request)
  
  if (!membro) {
    console.error("[getAuthContext] ❌ getAuthMembro retornou null")
    return null
  }

  console.log("[getAuthContext] ✅ Membro encontrado:", {
    membroId: membro.id,
    empresaId: membro.id_empresa,
    ehSuperAdmin: membro.eh_superadmin,
    nome: membro.nome
  })

  const context = {
    membro,
    isSuperAdmin: membro.eh_superadmin === true,
    canViewAll: membro.eh_superadmin === true,
    empresaId: membro.id_empresa
  }

  console.log("[getAuthContext] ✅ Contexto criado:", {
    empresaId: context.empresaId,
    isSuperAdmin: context.isSuperAdmin
  })

  return context
}

/**
 * Função auxiliar para obter usuário básico (compatibilidade)
 */
async function getAuthUserBasic(request: NextRequest): Promise<AuthUser | null> {
  try {
    console.log("[getAuthUserBasic] ====== INICIANDO getAuthUserBasic ======")
    
    // 1. Tentar Supabase Auth via cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value ||
      cookieStore.get("supabase-auth-token")?.value
    
    console.log("[getAuthUserBasic] Token de cookie:", accessToken ? "Presente" : "Ausente")
    
    if (accessToken) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
      if (user && !userError) {
        console.log("[getAuthUserBasic] ✅ Usuário encontrado via cookies:", user.id)
        return {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name,
          role: user.user_metadata?.role || "user"
        }
      } else {
        console.log("[getAuthUserBasic] ❌ Erro ao buscar usuário via cookies:", userError)
      }
    }
    
    // 2. Tentar header Authorization Bearer (token do Supabase Auth)
    const authHeader = request.headers.get("authorization")
    console.log("[getAuthUserBasic] Authorization header:", authHeader ? "Presente" : "Ausente")
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      console.log("[getAuthUserBasic] Token Bearer extraído, tamanho:", token.length)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser(token)
      
      if (user && !userError) {
        console.log("[getAuthUserBasic] ✅ Usuário encontrado via Bearer token:", user.id, user.email)
        // Buscar perfil usando id_usuario (ID do Supabase Auth)
        const { data: perfil, error: perfilError } = await supabase
          .from("perfis")
          .select("id, nome_completo, email")
          .eq("id", user.id)
          .maybeSingle()
        
        console.log("[getAuthUserBasic] Busca de perfil:", perfil ? "Encontrado" : "Não encontrado", perfilError ? `Erro: ${perfilError.message}` : "")
        
        if (perfil && !perfilError) {
          return {
            id: user.id, // ID do Supabase Auth
            email: perfil.email || user.email || "",
            name: perfil.nome_completo,
            role: "user"
          }
        }
        
        // Fallback: retornar dados do Supabase Auth se não encontrar perfil
        console.log("[getAuthUserBasic] Usando fallback: dados do Supabase Auth")
        return {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name,
          role: user.user_metadata?.role || "user"
        }
      } else {
        console.log("[getAuthUserBasic] ❌ Erro ao buscar usuário via Bearer token:", userError?.message)
      }
    }
    
    // 3. Tentar header X-User-Id e X-User-Email (sessão localStorage)
    const userEmail = request.headers.get("x-user-email")
    const userId = request.headers.get("x-user-id")
    
    console.log("[getAuthUserBasic] Headers X-User-Id:", userId || "Ausente")
    console.log("[getAuthUserBasic] Headers X-User-Email:", userEmail || "Ausente")
    
    if (userId) {
      console.log("[getAuthUserBasic] Tentando buscar usuário via X-User-Id:", userId)
      
      // userId agora é o ID do Supabase Auth (auth.users.id)
      // Buscar perfil primeiro
      const { data: perfil, error: perfilError } = await supabase
        .from("perfis")
        .select("id, nome_completo, email")
        .eq("id", userId)
        .maybeSingle()
      
      console.log("[getAuthUserBasic] Resultado busca perfil:", {
        encontrado: !!perfil,
        erro: perfilError?.message || null,
        perfilId: perfil?.id || null
      })
      
      if (perfil && !perfilError) {
        console.log("[getAuthUserBasic] ✅ Perfil encontrado via X-User-Id:", perfil.id)
        return {
          id: userId, // ID do Supabase Auth
          email: perfil.email || userEmail || "",
          name: perfil.nome_completo,
          role: "user"
        }
      }
    }
    
    console.log("[getAuthUserBasic] ❌ Nenhum método de autenticação funcionou")
    return null
  } catch (error) {
    console.error("[API Auth] Error getting user:", error)
    return null
  }
}

/**
 * Obtém filtro de empresa para queries (Multi-Tenant)
 * Retorna {} se for superadmin (sem filtro) ou { id_empresa: string } se for membro
 */
export async function getEmpresaFilter(request: NextRequest): Promise<{ id_empresa?: string } | {}> {
  const context = await getAuthContext(request)
  if (!context) {
    return {} // Se não autenticado, retorna vazio (não deve acontecer em produção)
  }

  // Superadmin não tem filtro (vê tudo)
  if (context.isSuperAdmin) {
    return {}
  }

  // Membro só vê dados da sua empresa
  return { id_empresa: context.empresaId }
}

/**
 * Verifica se o usuário pode acessar dados de uma empresa específica
 */
export async function canAccessEmpresa(
  request: NextRequest,
  empresaId: string
): Promise<boolean> {
  const context = await getAuthContext(request)
  if (!context) {
    return false
  }

  // Superadmin pode acessar qualquer empresa
  if (context.isSuperAdmin) {
    return true
  }

  // Membro só pode acessar sua própria empresa
  return context.empresaId === empresaId
}

/**
 * Função de compatibilidade - mantém getAuthUser para código legado
 * Mas agora retorna dados do membro quando disponível
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const membro = await getAuthMembro(request)
  if (membro) {
    return {
      id: membro.id,
      email: membro.email,
      name: membro.nome,
      role: membro.cargo
    }
  }

  // Fallback para método antigo
  return await getAuthUserBasic(request)
}
