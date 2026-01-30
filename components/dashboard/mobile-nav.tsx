"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Send, MessageCircle, Users, Download, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/campaigns", icon: Send, label: "Campanhas" },
  { href: "/dashboard/chat", icon: MessageCircle, label: "Chat" },
  { href: "/dashboard/contacts", icon: Users, label: "Contatos" },
  { href: "/dashboard/download", icon: Download, label: "App" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#111b21] border-t border-[#2a3942] pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                isActive ? "text-primary" : "text-[#8696a0]"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
