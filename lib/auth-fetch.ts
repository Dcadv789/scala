import { refreshTokenIfNeeded } from "./auth-refresh"

/**
 * Fetch wrapper que adiciona automaticamente headers de autenticação
 * baseados na sessão do Supabase Auth e localStorage
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  
  // Tentar obter token do Supabase Auth e dados do usuário
  if (typeof window !== "undefined") {
    try {
      // 1. Renovar token se necessário (antes de buscar)
      const freshToken = await refreshTokenIfNeeded()
      
      // 2. Tentar obter token do Supabase Auth (prioridade: freshToken > scalazap_auth_token > scalazap_auth_session)
      let authToken = freshToken || localStorage.getItem("scalazap_auth_token")
      
      // Se não encontrou token direto, tentar obter da sessão completa
      if (!authToken) {
        const sessionJson = localStorage.getItem("scalazap_auth_session")
        if (sessionJson) {
          try {
            const session = JSON.parse(sessionJson)
            authToken = session.access_token
            console.log("[authFetch] Token obtido da sessão completa")
          } catch (e) {
            console.error("[authFetch] Erro ao parsear sessão:", e)
          }
        }
      }
      
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`)
        console.log("[authFetch] Token adicionado ao header Authorization")
      } else {
        console.warn("[authFetch] Nenhum token encontrado no localStorage")
      }
      
      // 2. Obter dados do usuário do localStorage
      const userJson = localStorage.getItem("scalazap_user")
      if (userJson) {
        try {
          const user = JSON.parse(userJson)
          // id agora é o ID do Supabase Auth (auth.users.id)
          if (user.id) {
            headers.set("X-User-Id", user.id)
            console.log("[authFetch] X-User-Id adicionado:", user.id)
          }
          if (user.email) {
            headers.set("X-User-Email", user.email)
            console.log("[authFetch] X-User-Email adicionado:", user.email)
          }
          // Adicionar empresa selecionada para APIs que precisam filtrar por empresa
          if (user.id_empresa) {
            headers.set("X-Selected-Empresa", user.id_empresa)
            console.log("[authFetch] X-Selected-Empresa adicionado:", user.id_empresa)
          }
          
          // Adicionar conexão selecionada se disponível no localStorage
          const selectedConnection = localStorage.getItem("scalazap_selected_connection")
          if (selectedConnection) {
            headers.set("X-Selected-Connection", selectedConnection)
            console.log("[authFetch] X-Selected-Connection adicionado:", selectedConnection)
          }
        } catch (e) {
          console.error("[authFetch] Erro ao parsear userJson:", e)
        }
      } else {
        console.warn("[authFetch] Nenhum usuário encontrado no localStorage")
      }
    } catch (e) {
      console.error("[authFetch] Error reading auth data from localStorage:", e)
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
