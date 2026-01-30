"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

// Create Supabase client
const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get("plan") as "starter" | "professional" | "unlimited" | null

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [plan] = useState<"starter" | "professional" | "unlimited">(planFromUrl || "starter")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Check if membro already exists (Multi-Tenant)
      const { data: existingMembro } = await supabase
        .from("membros")
        .select("email")
        .eq("email", email)
        .eq("ativo", true)
        .single()
      
      if (existingMembro) {
        setError("Este email ja esta cadastrado. Faca login ou use outro email.")
        setLoading(false)
        return
      }
      
      // Sistema Multi-Tenant: registro deve ser feito através do sistema de empresas
      // Este formulário não deve criar empresas/membros diretamente
      // Redirecionar para página de registro apropriada ou mostrar erro
      setError("O registro deve ser feito através do sistema de empresas. Entre em contato com o administrador.")
      setLoading(false)
      return
      
    } catch (err) {
      console.error("Registration error:", err)
      setError("Erro ao verificar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Joao Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta e ir para pagamento"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Ja tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}
