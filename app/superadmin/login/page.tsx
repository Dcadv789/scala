"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Lock, AlertCircle } from "lucide-react"

export default function SuperAdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Modo desenvolvimento - aceita qualquer usuário e senha
    console.log("[DEV] Login simplificado - aceitando qualquer entrada")
    
    // Simular delay de autenticacao
    await new Promise(resolve => setTimeout(resolve, 500))

    // Sempre permitir login (modo desenvolvimento)
    localStorage.setItem("superadmin_authenticated", "true")
    localStorage.setItem("superadmin_login_time", new Date().toISOString())
    localStorage.setItem("superadmin_username", credentials.username || "dev_user")
    router.push("/superadmin")

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
      
      <Card className="w-full max-w-md relative border-red-500/30 bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/10 w-fit">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Super Admin</CardTitle>
          <CardDescription>
            Area restrita - Acesso apenas para administradores do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuario"
                  className="pl-10"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={loading}>
              {loading ? "Autenticando..." : "Acessar Painel"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Este painel e protegido e todas as acoes sao registradas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
