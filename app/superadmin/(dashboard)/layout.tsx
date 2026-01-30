"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Shield,
  LayoutDashboard,
  Users,
  DollarSign,
  Layers,
  Webhook,
  Link2,
  ShoppingCart,
  Settings,
  LogOut,
  Phone,
  BarChart3,
  Code,
  Bell,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/superadmin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/superadmin/empresas", icon: Building2, label: "Empresas" },
  { href: "/superadmin/planos", icon: Layers, label: "Planos" },
  { href: "/superadmin/revenue", icon: DollarSign, label: "Faturamento" },
  { href: "/superadmin/connections", icon: Phone, label: "Conexoes" },
  { href: "/superadmin/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/superadmin/pixels", icon: Code, label: "Pixels" },
  { href: "/superadmin/carts", icon: ShoppingCart, label: "Carrinhos" },
  { href: "/superadmin/integrations", icon: Link2, label: "Integracoes" },
  { href: "/superadmin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/superadmin/notifications", icon: Bell, label: "Notificacoes" },
  { href: "/superadmin/settings", icon: Settings, label: "Configuracoes" },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const auth = localStorage.getItem("superadmin_authenticated")
    if (auth === "true") {
      setIsAuthenticated(true)
    } else {
      router.push("/superadmin/login")
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("superadmin_authenticated")
    localStorage.removeItem("superadmin_login_time")
    router.push("/superadmin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col border-r border-red-500/20 bg-card/50 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-red-500/20 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="font-bold text-lg">SuperAdmin</span>
            </div>
          )}
          {collapsed && <Shield className="h-6 w-6 text-red-500 mx-auto" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-red-500/10 text-red-500 hover:bg-red-500/20",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Logout */}
        <div className="border-t border-red-500/20 p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-red-500 hover:bg-red-500/10",
              collapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
