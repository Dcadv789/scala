"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, CreditCard, ExternalLink, CheckCircle } from "lucide-react"
import { kirvanoCheckoutLinks } from "@/components/landing/signup-section"

export function PaymentPendingBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Usar dados já salvos no localStorage do login (não fazer query desnecessária)
    checkPaymentStatusFromLocalStorage()
  }, [])

  const checkPaymentStatusFromLocalStorage = () => {
    const user = localStorage.getItem("scalazap_user")
    if (!user) {
      setChecking(false)
      return
    }
    
    try {
      const userData = JSON.parse(user)
      
      // Usar dados já salvos no login (já identificamos a empresa)
      if (userData.planStatus === "pending" || userData.planStatus === "suspended") {
        setIsVisible(true)
        setPendingPlan(userData.plan || localStorage.getItem("scalazap_pending_plan"))
        localStorage.setItem("scalazap_pending_plan", userData.plan || "")
      } else if (userData.planStatus === "active") {
        setIsVisible(false)
        localStorage.removeItem("scalazap_pending_plan")
      }
    } catch (e) {
      console.error("[PaymentBanner] Erro ao verificar status do localStorage:", e)
    }
    
    setChecking(false)
  }

  const checkPaymentStatus = async () => {
    const user = localStorage.getItem("scalazap_user")
    if (!user) {
      setChecking(false)
      return
    }
    
    try {
      const userData = JSON.parse(user)
      
      // Verificar se temos id_empresa no userData
      if (!userData.id_empresa) {
        console.warn("[PaymentBanner] id_empresa não encontrado no userData")
        setChecking(false)
        return
      }

      // Validar UUID antes de fazer a query
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userData.id_empresa)) {
        console.error("[PaymentBanner] id_empresa inválido:", userData.id_empresa)
        setChecking(false)
        return
      }
      
      // Usar API route ao invés de query direta (evita problemas de RLS)
      const response = await fetch(`/api/auth/check-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_empresa: userData.id_empresa
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.empresa) {
          // Update local storage with latest status from database
          userData.planStatus = data.empresa.status_assinatura
          userData.plan = data.empresa.plano_atual
          localStorage.setItem("scalazap_user", JSON.stringify(userData))
          
          if (data.empresa.status_assinatura === "active") {
            // Payment confirmed!
            localStorage.removeItem("scalazap_pending_plan")
            setIsVisible(false)
          } else if (data.empresa.status_assinatura === "pending" || data.empresa.status_assinatura === "suspended") {
            setIsVisible(true)
            setPendingPlan(data.empresa.plano_atual)
            localStorage.setItem("scalazap_pending_plan", data.empresa.plano_atual)
          }
        }
      } else {
        // Fallback to localStorage
        const pending = localStorage.getItem("scalazap_pending_plan")
        if (userData.planStatus === "pending" && pending) {
          setIsVisible(true)
          setPendingPlan(pending)
        }
      }
    } catch (e) {
      console.error("[PaymentBanner] Erro ao verificar status:", e)
      // Fallback to localStorage
      const pending = localStorage.getItem("scalazap_pending_plan")
      const userData = JSON.parse(user)
      if (userData.planStatus === "pending" && pending) {
        setIsVisible(true)
        setPendingPlan(pending)
      }
    }
    
    setChecking(false)
  }

  const handlePayment = () => {
    if (pendingPlan) {
      const checkoutLink = kirvanoCheckoutLinks[pendingPlan as keyof typeof kirvanoCheckoutLinks]
      if (checkoutLink) {
        window.open(checkoutLink, "_blank")
      }
    }
  }

  const handleRefreshStatus = async () => {
    setRefreshing(true)
    // Só fazer query quando o usuário clicar em "Já paguei"
    await checkPaymentStatus()
    setRefreshing(false)
    if (!isVisible) {
      // Se o pagamento foi confirmado, recarregar a pagina
      window.location.reload()
    }
  }

  const getPlanName = () => {
    switch (pendingPlan) {
      case "starter": return "Basico"
      case "professional": return "Professional"
      case "unlimited": return "Ilimitado"
      default: return "Selecionado"
    }
  }

  const getPromoPrice = () => {
    switch (pendingPlan) {
      case "starter": return "R$ 29,90"
      case "professional": return "R$ 39,90"
      case "unlimited": return "R$ 49,90"
      default: return ""
    }
  }

  const getRegularPrice = () => {
    switch (pendingPlan) {
      case "starter": return "R$ 97,90"
      case "professional": return "R$ 127,90"
      case "unlimited": return "R$ 197,90"
      default: return ""
    }
  }

  if (checking || !isVisible) return null

  return (
    <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-orange-500/20 border-b border-yellow-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Ative seu plano {getPlanName()} com desconto!
              </p>
              <p className="text-xs text-foreground/70">
                Primeira mensalidade por apenas <span className="text-green-400 font-semibold">{getPromoPrice()}</span> <span className="line-through text-foreground/50">{getRegularPrice()}</span> - Desbloqueie todos os recursos agora.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="gap-2 bg-transparent border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
            >
              <CheckCircle className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Verificando..." : "Ja paguei"}
            </Button>
            <Button
              size="sm"
              onClick={handlePayment}
              className="bg-green-500 hover:bg-green-600 text-white gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Ativar por {getPromoPrice()}
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="text-foreground/60 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook para verificar se o usuario tem pagamento pendente
export function usePaymentStatus() {
  const [isPending, setIsPending] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const user = localStorage.getItem("scalazap_user")
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      const userData = JSON.parse(user)
      
      // Usar dados já salvos no login (não fazer query desnecessária)
      if (userData.planStatus === "pending" || userData.planStatus === "suspended") {
        setIsPending(true)
        setPlan(userData.plan || localStorage.getItem("scalazap_pending_plan"))
      } else if (userData.planStatus === "active") {
        setIsPending(false)
        localStorage.removeItem("scalazap_pending_plan")
      } else {
        // Fallback to localStorage
        const pending = localStorage.getItem("scalazap_pending_plan")
        if (userData.planStatus === "pending" && pending) {
          setIsPending(true)
          setPlan(pending)
        }
      }
    } catch (e) {
      // Fallback to localStorage
      const pending = localStorage.getItem("scalazap_pending_plan")
      const userData = JSON.parse(user)
      if (userData.planStatus === "pending" && pending) {
        setIsPending(true)
        setPlan(pending)
      }
    }
    
    setLoading(false)
  }

  const activatePlan = async () => {
    const user = localStorage.getItem("scalazap_user")
    if (user) {
      const userData = JSON.parse(user)
      
      // Usar API route ao invés de query direta
      if (userData.id_empresa) {
        try {
          const response = await fetch(`/api/auth/check-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_empresa: userData.id_empresa,
              update_status: "active"
            })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              // Update localStorage
              userData.planStatus = "active"
              localStorage.setItem("scalazap_user", JSON.stringify(userData))
              localStorage.removeItem("scalazap_pending_plan")
              setIsPending(false)
            }
          }
        } catch (e) {
          console.error("[PaymentBanner] Erro ao ativar plano:", e)
        }
      }
    }
  }

  return { isPending, plan, activatePlan, loading }
}

// Componente de bloqueio para features que requerem pagamento
export function PaymentRequiredOverlay({ 
  children,
  feature = "este recurso"
}: { 
  children: React.ReactNode
  feature?: string 
}) {
  const { isPending, plan } = usePaymentStatus()

  if (!isPending) return <>{children}</>

  const handlePayment = () => {
    if (plan) {
      const checkoutLink = kirvanoCheckoutLinks[plan as keyof typeof kirvanoCheckoutLinks]
      if (checkoutLink) {
        window.open(checkoutLink, "_blank")
      }
    }
  }

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Pagamento pendente</h3>
          <p className="text-sm text-foreground/70 mb-4">
            Complete o pagamento do seu plano para acessar {feature}.
          </p>
          <Button onClick={handlePayment} className="bg-yellow-500 hover:bg-yellow-600 text-black gap-2">
            <CreditCard className="h-4 w-4" />
            Pagar agora
          </Button>
        </div>
      </div>
    </div>
  )
}
