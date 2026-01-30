import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

/**
 * Verifica se o token está perto de expirar e o renova se necessário
 * @returns Token renovado ou o token atual se ainda válido
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  try {
    // Obter sessão do localStorage
    const sessionStr = localStorage.getItem("scalazap_auth_session")
    if (!sessionStr) {
      console.log("[Auth Refresh] Nenhuma sessão encontrada")
      return null
    }

    const session = JSON.parse(sessionStr)
    if (!session.access_token || !session.refresh_token) {
      console.log("[Auth Refresh] Sessão inválida (sem tokens)")
      return null
    }

    // Verificar se o token expira em menos de 10 minutos
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000

    if (expiresAt - now > tenMinutes) {
      // Token ainda válido por mais de 10 minutos
      console.log("[Auth Refresh] Token ainda válido")
      return session.access_token
    }

    console.log("[Auth Refresh] Token expirando em breve, renovando...")

    // Renovar token usando Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: session.refresh_token
    })

    if (error) {
      console.error("[Auth Refresh] Erro ao renovar token:", error.message)
      return null
    }

    if (data.session) {
      // Salvar nova sessão
      localStorage.setItem("scalazap_auth_session", JSON.stringify(data.session))
      console.log("[Auth Refresh] ✅ Token renovado com sucesso")
      return data.session.access_token
    }

    return null
  } catch (error) {
    console.error("[Auth Refresh] Erro ao processar refresh:", error)
    return null
  }
}

/**
 * Configura renovação automática do token a cada 5 minutos
 */
export function setupAutoTokenRefresh(): () => void {
  console.log("[Auth Refresh] Configurando renovação automática...")
  
  const intervalId = setInterval(async () => {
    await refreshTokenIfNeeded()
  }, 5 * 60 * 1000) // A cada 5 minutos

  // Retorna função de cleanup
  return () => {
    clearInterval(intervalId)
    console.log("[Auth Refresh] Renovação automática desativada")
  }
}


