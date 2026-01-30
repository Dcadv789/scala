"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Send,
  MessageCircle,
  FileText,
  Users,
  Settings,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  Volume2,
  Download,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/store"
import { useEffect, useState } from "react"

interface DashboardNavProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/campaigns", icon: Send, label: "Campanhas" },
  { href: "/dashboard/chat", icon: MessageCircle, label: "Chat ao Vivo" },
  { href: "/dashboard/scalavoice", icon: Volume2, label: "ScalaVoice" },
  { href: "/dashboard/templates", icon: FileText, label: "Templates" },
  { href: "/dashboard/contacts", icon: Users, label: "Contatos" },
  { href: "/dashboard/connections", icon: Phone, label: "Conexoes" },
  { href: "/dashboard/download", icon: Download, label: "Baixar App" },
  { href: "/dashboard/tutorials", icon: GraduationCap, label: "Tutoriais" },
  { href: "/dashboard/settings", icon: Settings, label: "Configuracoes" },
]

export function DashboardNav({ isOpen, onToggle }: DashboardNavProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-card transition-all duration-300",
        "hidden md:flex",
        isOpen ? "w-64" : "w-20",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {isOpen && (
          <Link href="/dashboard" className="flex items-center">
            <Image src="/zap-logo.png" alt="ScalaZap" width={120} height={40} className="h-8 w-auto" />
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className={cn("shrink-0", !isOpen && "mx-auto")}>
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Shield className="h-5 w-5 shrink-0" />
            {isOpen && <span>Admin</span>}
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-4">
        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {isOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user?.name || "Usuário"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || "usuario@email.com"}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
