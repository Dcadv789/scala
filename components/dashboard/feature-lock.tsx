"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Lock, Zap, CreditCard, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { kirvanoCheckoutLinks } from "@/components/landing/signup-section"

interface FeatureLockProps {
  children: React.ReactNode
  featureName?: string
  showOverlay?: boolean
}

export function FeatureLock({ children, featureName = "esta funcionalidade", showOverlay = true }: FeatureLockProps) {
  const [isPending, setIsPending] = useState(false)
  const [plan, setPlan] = useState("starter")
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      // First check localStorage for user email
      const userData = localStorage.getItem("scalazap_user")
      if (!userData) {
        setIsPending(true)
        setLoading(false)
        return
      }

      const user = JSON.parse(userData)
      const email = user.email

      if (!email) {
        setIsPending(true)
        setLoading(false)
        return
      }

      // Call API to check user status in Supabase
      const response = await fetch("/api/auth/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success && data.isActive) {
        setIsPending(false)
        setPlan(data.plan || "starter")
        
        // Update localStorage with fresh data from database
        if (data.user) {
          localStorage.setItem("scalazap_user", JSON.stringify(data.user))
        }
      } else {
        // User not active or not found
        setIsPending(true)
        setPlan(user.plan || "starter")
      }
    } catch (e) {
      console.error("Error checking user status:", e)
      // On error, check localStorage as fallback
      const userData = localStorage.getItem("scalazap_user")
      if (userData) {
        const user = JSON.parse(userData)
        setIsPending(user.planStatus !== "active")
        setPlan(user.plan || "starter")
      } else {
        setIsPending(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading) return <>{children}</>

  // If user has active subscription, show content normally
  if (!isPending) {
    return <>{children}</>
  }

  const handlePayment = () => {
    const pendingPlan = localStorage.getItem("scalazap_pending_plan") || plan
    const checkoutLink = kirvanoCheckoutLinks[pendingPlan as keyof typeof kirvanoCheckoutLinks]
    if (checkoutLink) {
      window.open(checkoutLink, "_blank")
    }
  }

  const getPromoPrice = () => {
    const pendingPlan = localStorage.getItem("scalazap_pending_plan") || plan
    switch (pendingPlan) {
      case "starter": return "R$ 29,90"
      case "professional": return "R$ 39,90"
      case "unlimited": return "R$ 49,90"
      default: return "R$ 29,90"
    }
  }

  if (!showOverlay) {
    return (
      <div className="pointer-events-none opacity-50">
        {children}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Blurred/disabled content */}
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <Card className="mx-4 max-w-md border-yellow-500/30 bg-card/95 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
              <Lock className="h-8 w-8 text-yellow-500" />
            </div>
            
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Funcionalidade Bloqueada
            </h3>
            
            <p className="mb-4 text-sm text-muted-foreground">
              Ative seu plano para desbloquear {featureName} e aproveitar todos os recursos do ScalaZAP.
            </p>
            
            <div className="mb-4 rounded-lg bg-green-500/10 p-3">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Oferta especial: primeira mensalidade por apenas {getPromoPrice()}</span>
              </div>
            </div>
            
            <Button
              onClick={handlePayment}
              className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <CreditCard className="h-4 w-4" />
              Ativar Plano Agora
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            <p className="mt-3 text-xs text-muted-foreground">
              Pagamento seguro via PIX ou cartão
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Simple hook to check if features should be locked
export function useFeatureLock() {
  const [isPending, setIsPending] = useState(false) // Start unlocked
  const [plan, setPlan] = useState("starter")
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Check localStorage immediately first (synchronous)
    const userData = localStorage.getItem("scalazap_user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.planStatus === "active") {
          setIsPending(false)
          setPlan(user.plan || "starter")
          setLoading(false)
          return // User is active, no need to call API
        }
      } catch { /* ignore */ }
    }
    
    // Only call API if user might not be active
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const userData = localStorage.getItem("scalazap_user")
      if (!userData) {
        setIsPending(true)
        setLoading(false)
        return
      }

      const user = JSON.parse(userData)
      const email = user.email

      if (!email) {
        setIsPending(true)
        setLoading(false)
        return
      }

      // Call API to check user status in Supabase
      const response = await fetch("/api/auth/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success && data.isActive) {
        setIsPending(false)
        setPlan(data.plan || "starter")
        
        // Update localStorage with fresh data from database
        if (data.user) {
          localStorage.setItem("scalazap_user", JSON.stringify(data.user))
        }
      } else {
        // User not active or not found - check localStorage as fallback
        setIsPending(user.planStatus !== "active")
        setPlan(user.plan || "starter")
      }
    } catch (e) {
      console.error("Error checking user status:", e)
      // On error, check localStorage as fallback
      const userData = localStorage.getItem("scalazap_user")
      if (userData) {
        const user = JSON.parse(userData)
        setIsPending(user.planStatus !== "active")
        setPlan(user.plan || "starter")
      } else {
        setIsPending(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    isLocked: isPending, // Simplified - just use isPending directly
    plan,
    mounted,
    loading
  }
}
