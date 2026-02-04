"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'hsl(var(--background))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid hsl(var(--primary))',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const sidebarWidth = collapsed ? 64 : 256

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'hsl(var(--background))',
        overflow: 'hidden'
      }}>
        {/* Sidebar - HTML PURO */}
        <aside
          style={{
            width: `${sidebarWidth}px`,
            minWidth: `${sidebarWidth}px`,
            height: '100vh',
            backgroundColor: 'hsl(var(--card))',
            borderRight: '1px solid hsl(var(--border))',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0
          }}
        >
          {/* Logo */}
          <div style={{
            height: '64px',
            minHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid hsl(var(--border))',
            backgroundColor: 'hsl(var(--card))'
          }}>
            {!collapsed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Shield style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'hsl(var(--foreground))'
                }}>
                  SuperAdmin
                </span>
              </div>
            )}
            {collapsed && (
              <Shield style={{ 
                width: '24px', 
                height: '24px', 
                color: '#ef4444',
                margin: '0 auto'
              }} />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'hsl(var(--foreground))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {collapsed ? (
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              ) : (
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    width: '100%'
                  }}
                >
                  <button
                    style={{
                      width: '100%',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: collapsed ? '0 8px' : '0 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      backgroundColor: isActive ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: isActive ? '#ef4444' : 'hsl(var(--foreground))',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Icon style={{ 
                      width: '16px', 
                      height: '16px',
                      flexShrink: 0
                    }} />
                    {!collapsed && (
                      <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                    )}
                  </button>
                </Link>
              )
            })}
          </div>

          {/* Logout */}
          <div style={{
            borderTop: '1px solid hsl(var(--border))',
            padding: '16px',
            display: 'flex'
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '0 8px' : '0 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <LogOut style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          minWidth: 0,
          backgroundColor: 'hsl(var(--background))'
        }}>
          {children}
        </main>
      </div>
    </>
  )
}
