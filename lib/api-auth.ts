import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
}

/**
 * Obtém o usuário autenticado de várias fontes:
 * 1. Supabase Auth cookies
 * 2. Header Authorization Bearer token
 * 3. Header X-User-Id (para sessão do localStorage)
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // 1. Tentar Supabase Auth via cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value ||
      cookieStore.get("supabase-auth-token")?.value
    
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken)
      if (user) {
        return {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name,
          role: user.user_metadata?.role || "user"
        }
      }
    }
    
    // 2. Tentar header Authorization Bearer
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7))
      if (user) {
        return {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name,
          role: user.user_metadata?.role || "user"
        }
      }
    }
    
    // 3. Tentar header X-User-Id (sessão localStorage)
    const userId = request.headers.get("x-user-id")
    const userEmail = request.headers.get("x-user-email")
    
    if (userId) {
      // Verificar se o usuário existe na tabela usuarios
      const { data: dbUser, error } = await supabase
        .from("usuarios")
        .select("id, email, nome, perfil")
        .eq("id", userId)
        .single()
      
      if (dbUser && !error) {
        return {
          id: dbUser.id,
          email: dbUser.email || userEmail || "",
          name: dbUser.nome,
          role: dbUser.perfil || "user"
        }
      }
    }
    
    return null
  } catch (error) {
    console.error("[API Auth] Error getting user:", error)
    return null
  }
}
