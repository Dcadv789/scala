import { refreshTokenIfNeeded } from "./auth-refresh"

/**
 * Fetch wrapper que adiciona automaticamente headers de autenticação
 * baseados na sessão do Supabase Auth e localStorage
 */
// Cache do token para evitar múltiplas chamadas de refresh
let cachedToken: string | null = null
let tokenCacheTime = 0
const TOKEN_CACHE_DURATION = 60000 // 1 minuto

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  
  // Tentar obter token do Supabase Auth e dados do usuário
  if (typeof window !== "undefined") {
    try {
      // 1. Verificar cache do token primeiro
      const now = Date.now()
      let authToken = cachedToken
      
      // Se cache expirou ou não existe, tentar renovar
      if (!authToken || (now - tokenCacheTime) > TOKEN_CACHE_DURATION) {
        // Renovar token se necessário (apenas se cache expirou)
        const freshToken = await refreshTokenIfNeeded()
        if (freshToken) {
          authToken = freshToken
          cachedToken = freshToken
          tokenCacheTime = now
        } else {
          // Se refresh falhou, tentar obter do localStorage
          authToken = localStorage.getItem("scalazap_auth_token")
          
          // Se não encontrou token direto, tentar obter da sessão completa
          if (!authToken) {
            const sessionJson = localStorage.getItem("scalazap_auth_session")
            if (sessionJson) {
              try {
                const session = JSON.parse(sessionJson)
                authToken = session.access_token
                if (authToken) {
                  cachedToken = authToken
                  tokenCacheTime = now
                }
              } catch (e) {
                // Ignorar erro silenciosamente
              }
            }
          } else {
            cachedToken = authToken
            tokenCacheTime = now
          }
        }
      }
      
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`)
      }
      
      // 2. Obter dados do usuário do localStorage
      const userJson = localStorage.getItem("scalazap_user")
      if (userJson) {
        try {
          const user = JSON.parse(userJson)
          // id agora é o ID do Supabase Auth (auth.users.id)
          if (user.id) {
            headers.set("X-User-Id", user.id)
          }
          if (user.email) {
            headers.set("X-User-Email", user.email)
          }
          // Adicionar empresa selecionada para APIs que precisam filtrar por empresa
          if (user.id_empresa) {
            headers.set("X-Selected-Empresa", user.id_empresa)
          }
          
          // Adicionar conexão selecionada se disponível no localStorage
          const selectedConnection = localStorage.getItem("scalazap_selected_connection")
          if (selectedConnection) {
            headers.set("X-Selected-Connection", selectedConnection)
          }
        } catch (e) {
          // Ignorar erro silenciosamente
        }
      }
    } catch (e) {
      // Ignorar erro silenciosamente
    }
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Helper para fazer requisições autenticadas com JSON
 */
export async function authFetchJson<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  
  const response = await authFetch(url, { ...options, headers })
  return response.json()
}
