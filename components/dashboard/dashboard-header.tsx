"use client"

import { useState, useEffect } from "react"
import { Bell, Search, LogOut, Shield, Headphones, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { logout, getCurrentUser, isAdmin, type User } from "@/lib/store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  onRefresh?: () => void
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Carregar dados do usuário apenas no cliente para evitar erro de hidratação
  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
    setUserIsAdmin(isAdmin())
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Buscar campanhas, contatos..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh || (() => {})}
          className="gap-2"
          disabled={!onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>

        {userIsAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#25D366] hover:text-[#20BD5A] hover:bg-[#25D366]/10"
          onClick={() => {
            const url = "https://wa.me/5511952130474?text=" + encodeURIComponent("Ola! Preciso de ajuda com o ScalaZap.")
            window.open(url, "_blank")
          }}
          title="Suporte via WhatsApp"
        >
          <Headphones className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {mounted && user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{mounted && user?.name ? user.name : "Usuário"}</p>
                <p className="text-xs leading-none text-muted-foreground">{mounted && user?.email ? user.email : ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
