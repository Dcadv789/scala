import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Singleton do cliente Supabase para evitar múltiplas instâncias
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    // Server-side: criar nova instância
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  // Client-side: usar singleton
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Não persistir sessão automaticamente
        autoRefreshToken: false, // Desabilitar refresh automático
        detectSessionInUrl: false,
        storage: typeof window !== "undefined" ? window.localStorage : undefined
      }
    })
  }
  return supabaseClient
}

// Lock para evitar refresh simultâneos
let refreshInProgress = false
let refreshPromise: Promise<string | null> | null = null
let lastRefreshTime = 0
const REFRESH_COOLDOWN = 5000 // 5 segundos entre refreshes

/**
 * Verifica se o token está perto de expirar e o renova se necessário
 * @returns Token renovado ou o token atual se ainda válido
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  // Se já está em progresso, retornar a mesma promise
  if (refreshInProgress && refreshPromise) {
    return refreshPromise
  }

  // Se tentou refresh recentemente, evitar novo refresh
  const timeSinceLastRefresh = Date.now() - lastRefreshTime
  if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
    // Retornar token atual do localStorage
    try {
      const sessionStr = localStorage.getItem("scalazap_auth_session")
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        return session.access_token || null
      }
    } catch (e) {
      // Ignorar erro
    }
    return null
  }

  // Criar nova promise de refresh
  refreshPromise = (async () => {
    refreshInProgress = true
    lastRefreshTime = Date.now()

    try {
      // Obter sessão do localStorage
      const sessionStr = localStorage.getItem("scalazap_auth_session")
      if (!sessionStr) {
        return null
      }

      const session = JSON.parse(sessionStr)
      if (!session.access_token || !session.refresh_token) {
        return null
      }

      // Verificar se o token expira em menos de 10 minutos
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
      const now = Date.now()
      const tenMinutes = 10 * 60 * 1000

      if (expiresAt - now > tenMinutes) {
        // Token ainda válido por mais de 10 minutos
        return session.access_token
      }

      // Renovar token usando Supabase client singleton
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refresh_token
      })

      if (error) {
        // Se o erro for "Already Used", limpar sessão
        if (error.message.includes("Already Used") || error.message.includes("Invalid Refresh Token")) {
          console.warn("[Auth Refresh] Refresh token inválido, limpando sessão")
          localStorage.removeItem("scalazap_auth_session")
          localStorage.removeItem("scalazap_auth_token")
        }
        return null
      }

      if (data.session) {
        // Salvar nova sessão
        localStorage.setItem("scalazap_auth_session", JSON.stringify(data.session))
        if (data.session.access_token) {
          localStorage.setItem("scalazap_auth_token", data.session.access_token)
        }
        return data.session.access_token
      }

      return null
    } catch (error: any) {
      // Se o erro for "Already Used", limpar sessão
      if (error?.message?.includes("Already Used") || error?.message?.includes("Invalid Refresh Token")) {
        console.warn("[Auth Refresh] Refresh token inválido, limpando sessão")
        localStorage.removeItem("scalazap_auth_session")
        localStorage.removeItem("scalazap_auth_token")
      }
      return null
    } finally {
      refreshInProgress = false
      refreshPromise = null
    }
  })()

  return refreshPromise
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


