"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { authFetch } from "@/lib/auth-fetch"
import { SubscribeModal } from "@/components/dashboard/subscribe-modal"

interface PlanGuardProps {
  children: React.ReactNode
}

// Páginas que NÃO devem ser bloqueadas (mesmo com plano gratuito)
const ALLOWED_PAGES = [
  "/dashboard",
  "/dashboard/download",
  "/dashboard/tutorials",
  "/dashboard/settings",
]

export function PlanGuard({ children }: PlanGuardProps) {
  const pathname = usePathname()
  const [isFreePlan, setIsFreePlan] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const lastCheckedPathRef = useRef<string | null>(null)
  const lastResultRef = useRef<boolean | null>(null)

  useEffect(() => {
    console.log("═══════════════════════════════════════════════════════════")
    console.log("[PlanGuard] ====== INICIANDO VERIFICAÇÃO ======")
    console.log("═══════════════════════════════════════════════════════════")
    console.log("[PlanGuard] 📅 Timestamp:", new Date().toISOString())
    console.log("[PlanGuard] 🔗 Página atual:", pathname)
    console.log("[PlanGuard] 📋 Páginas permitidas:", ALLOWED_PAGES)
    
    // Verificar se a página está na lista de exceções
    const isAllowedPage = ALLOWED_PAGES.some(page => {
      const matches = pathname === page || pathname.startsWith(page + "/")
      if (matches) {
        console.log("[PlanGuard] ✅ Página corresponde à exceção:", page)
      }
      return matches
    })
    
    if (isAllowedPage) {
      console.log("[PlanGuard] ✅ RESULTADO: Página PERMITIDA (não bloqueada)")
      console.log("[PlanGuard] 📊 isFreePlan será definido como: false")
      console.log("═══════════════════════════════════════════════════════════")
      setIsFreePlan(false) // Não é plano gratuito para efeitos de bloqueio
      setIsLoading(false)
      return
    }

    console.log("[PlanGuard] ⚠️ Página NÃO está na lista de exceções")
    console.log("[PlanGuard] 🔍 Verificando se já foi verificado para esta página...")
    console.log("[PlanGuard] 📊 Última página verificada:", lastCheckedPathRef.current)
    console.log("[PlanGuard] 📊 Último resultado:", lastResultRef.current)
    console.log("[PlanGuard] 📊 Página atual:", pathname)
    
    // Se já verificou para esta página específica, usar resultado em cache
    if (lastCheckedPathRef.current === pathname && lastResultRef.current !== null) {
      console.log("[PlanGuard] ⏸️ Já verificado para esta página, usando resultado em cache")
      console.log("[PlanGuard] 📊 Resultado em cache - isFreePlan:", lastResultRef.current)
      setIsFreePlan(lastResultRef.current)
      setIsLoading(false)
      return
    }
    
    console.log("[PlanGuard] 🔄 Nova página ou resultado não encontrado, verificando...")

    const checkPlan = async () => {
      try {
        console.log("[PlanGuard] 🔍 Fazendo requisição para /api/user/plan-check...")
        console.log("[PlanGuard] 📋 Headers que serão enviados:", {
          temAuthToken: typeof window !== "undefined" ? !!localStorage.getItem("scalazap_auth_token") : "N/A",
          temUser: typeof window !== "undefined" ? !!localStorage.getItem("scalazap_user") : "N/A"
        })
        
        const response = await authFetch("/api/user/plan-check")
        
        console.log("[PlanGuard] 📥 Resposta recebida:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[PlanGuard] ❌ ERRO HTTP ao verificar plano")
          console.error("[PlanGuard] 📋 Status:", response.status)
          console.error("[PlanGuard] 📋 Body:", errorText)
          
          // Tentar parsear o JSON do erro para ver se tem isFreePlan
          let errorData: any = null
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            // Ignorar erro de parse
          }
          
          // Se o erro retornar isFreePlan, usar esse valor
          // Caso contrário, por segurança, bloquear (isFreePlan = true)
          const shouldBlockOnError = errorData?.isFreePlan === true || response.status === 401
          
          console.log("[PlanGuard] ⚠️ Em caso de erro HTTP, decisão de bloqueio:")
          console.log("[PlanGuard] 📊 Status:", response.status)
          console.log("[PlanGuard] 📊 errorData.isFreePlan:", errorData?.isFreePlan)
          console.log("[PlanGuard] 📊 shouldBlockOnError:", shouldBlockOnError)
          console.log("[PlanGuard] 🚫 Deve Bloquear?", shouldBlockOnError ? "SIM ✅" : "NÃO ❌")
          
          setIsFreePlan(shouldBlockOnError)
          lastCheckedPathRef.current = pathname
          lastResultRef.current = shouldBlockOnError
          setIsLoading(false)
          return
        }

        const data = await response.json()
        console.log("[PlanGuard] 📊 Dados recebidos da API:", JSON.stringify(data, null, 2))
        console.log("[PlanGuard] 📊 data.isFreePlan:", data.isFreePlan)
        console.log("[PlanGuard] 📊 data.isFreePlan === true:", data.isFreePlan === true)
        console.log("[PlanGuard] 📊 Tipo de data.isFreePlan:", typeof data.isFreePlan)

        const shouldBlock = data.isFreePlan === true
        console.log("═══════════════════════════════════════════════════════════")
        console.log("[PlanGuard] 📊 RESULTADO DA VERIFICAÇÃO:")
        console.log("═══════════════════════════════════════════════════════════")
        console.log("[PlanGuard] 🔗 Página:", pathname)
        console.log("[PlanGuard] 📦 isFreePlan (da API):", data.isFreePlan)
        console.log("[PlanGuard] 🚫 Deve Bloquear?", shouldBlock ? "SIM ✅" : "NÃO ❌")
        console.log("[PlanGuard] 📝 Plano Slug:", data.planSlug || "N/A")
        console.log("[PlanGuard] 📝 Plano Nome:", data.planName || "N/A")
        if (data.debug) {
          console.log("[PlanGuard] 🐛 Debug Info:", data.debug)
        }
        console.log("═══════════════════════════════════════════════════════════")

        setIsFreePlan(shouldBlock)
        lastCheckedPathRef.current = pathname
        lastResultRef.current = shouldBlock
      } catch (error) {
        console.error("═══════════════════════════════════════════════════════════")
        console.error("[PlanGuard] ❌ ERRO ao verificar plano")
        console.error("═══════════════════════════════════════════════════════════")
        console.error("[PlanGuard] 📋 Erro:", error)
        if (error instanceof Error) {
          console.error("[PlanGuard] 📋 Mensagem:", error.message)
          console.error("[PlanGuard] 📋 Stack:", error.stack)
        }
        // Em caso de erro de rede/exceção, por segurança, bloquear
        // (melhor bloquear um usuário legítimo do que permitir acesso indevido)
        console.log("[PlanGuard] ⚠️ Em caso de erro de rede/exceção, BLOQUEANDO por segurança")
        console.log("[PlanGuard] 🚫 Deve Bloquear?", "SIM ✅ (erro - bloqueando por segurança)")
        setIsFreePlan(true)
        lastCheckedPathRef.current = pathname
        lastResultRef.current = true
      } finally {
        setIsLoading(false)
        console.log("[PlanGuard] ✅ Verificação finalizada, isLoading = false")
      }
    }

    checkPlan()
  }, [pathname])

  // Mostrar loading durante verificação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Verificando plano...</p>
        </div>
      </div>
    )
  }

  // Log do estado atual antes de renderizar
  console.log("[PlanGuard] 🎨 Renderizando componente:", {
    pathname,
    isLoading,
    isFreePlan,
    shouldBlock: isFreePlan === true,
    shouldShowModal: isFreePlan === true
  })

  // Se for plano gratuito E não estiver em página permitida, mostrar modal + overlay
  if (isFreePlan === true) {
    console.log("[PlanGuard] 🚫 BLOQUEANDO: Mostrando modal de assinatura")
    return (
      <div className="relative" style={{ minHeight: "100vh" }}>
        {/* Conteúdo desfocado por baixo - usuário deve ver parte pelas laterais */}
        <div 
          style={{
            opacity: 0.35,
            filter: "blur(3px)",
            userSelect: "none",
            pointerEvents: "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </div>
        
        {/* Modal de assinatura por cima - centralizado mas não fullscreen */}
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <SubscribeModal />
        </div>
      </div>
    )
  }

  // Se não for plano gratuito ou estiver em página permitida, mostrar conteúdo normalmente
  console.log("[PlanGuard] ✅ LIBERANDO: Mostrando conteúdo normalmente")
  return <>{children}</>
}

