// Utilitário para buscar conexões do Supabase
// Este arquivo substitui o uso de localStorage para conexões

import { authFetch } from "./auth-fetch"

let cachedConnections: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 segundos

export async function fetchConnections(): Promise<any[]> {
  // Retornar cache se ainda válido
  const now = Date.now()
  if (cachedConnections && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedConnections
  }

  try {
    console.log("[Connections] ====== Buscando conexões ======")
    const response = await authFetch("/api/connections")
    
    console.log("[Connections] Status da resposta:", response.status, response.statusText)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[Connections] ❌ Erro HTTP:", response.status, errorData)
      throw new Error(`Failed to fetch connections: ${errorData.error || response.statusText}`)
    }
    
    const data = await response.json()
    console.log("[Connections] Resposta da API:", {
      success: data.success,
      connectionsCount: data.connections?.length || 0,
      error: data.error
    })
    
    if (data.success && data.connections) {
      cachedConnections = data.connections
      cacheTimestamp = now
      console.log("[Connections] ✅ Conexões carregadas e em cache:", data.connections.length)
      return data.connections
    } else {
      console.warn("[Connections] ⚠️ Resposta sem conexões ou erro:", data)
      cachedConnections = []
      cacheTimestamp = now
      return []
    }
  } catch (error) {
    console.error("[Connections] ❌ Erro ao buscar conexões:", error)
    return cachedConnections || []
  }
}

export function invalidateConnectionsCache() {
  cachedConnections = null
  cacheTimestamp = 0
}

// Função síncrona para compatibilidade com código existente
// Retorna cache ou array vazio (use fetchConnections para dados atualizados)
export function getConnectionsSync(): any[] {
  return cachedConnections || []
}
