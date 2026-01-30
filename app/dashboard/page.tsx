"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { ActiveChats } from "@/components/dashboard/active-chats"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }


  useEffect(() => {
    // Small delay to ensure localStorage is accessible after page load
    const checkAuth = () => {
      console.log("[Dashboard] Verificando autenticação...")
      
      // Check both new and old auth systems
      const newUser = localStorage.getItem("scalazap_user")
      const authSession = localStorage.getItem("scalazap_auth_session")
      const oldData = localStorage.getItem("scalazap_data")
      
      let authenticated = false
      
      if (newUser) {
        try {
          const userData = JSON.parse(newUser)
          console.log("[Dashboard] Dados do usuário encontrados:", {
            id: userData.id,
            email: userData.email,
            id_empresa: userData.id_empresa,
            name: userData.name
          })
          
          // Verificar se tem dados mínimos necessários
          if (userData && (userData.id || userData.email || userData.id_empresa)) {
            authenticated = true
            console.log("[Dashboard] ✅ Usuário autenticado")
          } else {
            console.log("[Dashboard] ❌ Dados do usuário incompletos")
          }
        } catch (error) {
          console.error("[Dashboard] Erro ao parsear dados do usuário:", error)
        }
      }
      
      // Verificar também a sessão do Supabase Auth
      if (!authenticated && authSession) {
        try {
          const session = JSON.parse(authSession)
          if (session && session.access_token && session.user) {
            authenticated = true
            console.log("[Dashboard] ✅ Autenticado via sessão do Supabase Auth")
          }
        } catch (error) {
          console.error("[Dashboard] Erro ao parsear sessão:", error)
        }
      }
      
      // Fallback para sistema antigo
      if (!authenticated && oldData) {
        try {
          const data = JSON.parse(oldData)
          if (data.user && data.user.email) {
            authenticated = true
            console.log("[Dashboard] ✅ Autenticado via sistema antigo")
          }
        } catch { /* ignore */ }
      }
      
      if (!authenticated) {
        console.log("[Dashboard] ❌ Não autenticado, redirecionando para login")
        router.push("/login")
      } else {
        console.log("[Dashboard] ✅ Autenticação confirmada, carregando dashboard")
        setIsLoading(false)
      }
    }
    
    // Run check after a small delay
    setTimeout(checkAuth, 100)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <DashboardHeader onRefresh={handleRefresh} />
        <PaymentPendingBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-pretty mt-2 text-sm text-muted-foreground">
                Visão geral das suas campanhas e conversas
              </p>
            </div>

            <StatsCards refreshTrigger={refreshTrigger} />

            <div className="grid gap-6 lg:grid-cols-2">
              <RecentCampaigns refreshTrigger={refreshTrigger} />
              <ActiveChats refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
      <WhatsAppSupportButton />
    </div>
  )
}
