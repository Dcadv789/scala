"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Singleton do cliente Supabase para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false, // Não persistir sessão automaticamente
          autoRefreshToken: false, // Desabilitar refresh automático
          detectSessionInUrl: false
        }
      }
    )
  }
  return supabaseInstance
}

const supabase = getSupabaseClient()

interface AuthGuardProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}

export function AuthGuard({ children, requireSuperAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    console.log('[AUTH GUARD] Iniciando autenticação...')
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    try {
      // 1. Verificar se tem sessão no Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('[AUTH GUARD] ❌ Sessão inválida, redirecionando...')
        handleUnauthorized()
        return
      }

      // 2. Verificar se tem dados do usuário no localStorage
      const userData = localStorage.getItem('scalazap_user')
      
      if (!userData) {
        console.log('[AUTH GUARD] ❌ Dados do usuário não encontrados')
        handleUnauthorized()
        return
      }

      // 3. Parsear dados do usuário
      let user
      try {
        user = JSON.parse(userData)
      } catch (parseError) {
        console.error('[AUTH GUARD] ❌ Erro ao parsear dados:', parseError)
        handleUnauthorized()
        return
      }

      // 4. Se requer SuperAdmin, verificar
      if (requireSuperAdmin && !user.ehSuperAdmin) {
        console.log('[AUTH GUARD] ❌ Acesso negado - Requer SuperAdmin')
        router.push('/dashboard')
        setIsLoading(false)
        return
      }

      console.log('[AUTH GUARD] ✅ Autenticação OK - User:', user.nome)
      
      setIsAuthenticated(true)
      setIsLoading(false)

    } catch (err) {
      console.error('[AUTH GUARD] ❌ Erro:', err)
      handleUnauthorized()
    }
  }

  const handleUnauthorized = () => {
    console.log('[AUTH GUARD] Redirecionando para login...')
    
    // Limpar dados locais
    localStorage.removeItem('scalazap_user')
    localStorage.removeItem('scalazap_auth_token')
    localStorage.removeItem('scalazap_auth_session')
    localStorage.removeItem('scalazap_selected_empresa')
    
    // Redirecionar para login apropriado
    const loginPath = requireSuperAdmin ? '/superadmin/login' : '/login'
    const redirectUrl = `${loginPath}?redirect_to=${encodeURIComponent(pathname)}`
    
    setIsLoading(false)
    router.push(redirectUrl)
  }

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não autenticado, não renderizar nada (vai redirecionar)
  if (!isAuthenticated) {
    return null
  }

  // Se tudo ok, renderizar children
  console.log('[AUTH GUARD] ✅ Acesso liberado - renderizando conteúdo')
  return <>{children}</>
}

