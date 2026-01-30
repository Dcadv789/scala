"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Mail } from "lucide-react"
import { login } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const user = login(email, password)

    if (user && user.role === "admin") {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao painel administrativo!",
      })
      router.push("/admin/dashboard")
    } else {
      toast({
        title: "Acesso negado",
        description: "Credenciais inválidas ou você não tem permissão de administrador.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative h-16 w-32">
              <Image src="/zap-logo.png" alt="ScalaZap" fill className="object-contain" />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-red-500/10 p-3">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <CardDescription>Acesso restrito apenas para administradores do sistema</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Administrador</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Digite seu email ou usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Acessar Painel Admin"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Não é administrador?</p>
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
                Fazer login como usuário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
