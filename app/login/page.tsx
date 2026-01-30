"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDescription } from "@/components/ui/alert"
import { Alert } from "@/components/ui/alert"
import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type React from "react"
import { createClient } from "@supabase/supabase-js"
import { EmpresaSelector } from "@/components/auth/empresa-selector"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false)
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<any[]>([])
  const [dadosUsuario, setDadosUsuario] = useState<any>(null)

  const handleSelectEmpresa = (empresaId: string) => {
    console.log("[LOGIN] Empresa selecionada:", empresaId)
    
    // Encontrar a empresa selecionada
    const empresaSelecionada = empresasDisponiveis.find((e: any) => e.id === empresaId)
    
    if (!empresaSelecionada) {
      console.error("[LOGIN] Empresa selecionada não encontrada")
      return
    }

    // Salvar dados completos e estruturados no localStorage
    const userData = {
      ...dadosUsuario,
      // Dados da empresa
      id_empresa: empresaId,
      empresaNome: empresaSelecionada.nome,
      empresaPlano: empresaSelecionada.plano_atual || "starter",
      empresaStatus: empresaSelecionada.status_assinatura || "active",
      
      // Mantém compatibilidade com código legado
      empresa: empresaSelecionada.nome,
      plan: empresaSelecionada.plano_atual || "starter",
      planStatus: empresaSelecionada.status_assinatura || "active",
    }
    
    console.log("[LOGIN] Salvando dados estruturados no localStorage:")
    console.log("[LOGIN] - Pessoa:", userData.nome, `(${userData.email})`)
    console.log("[LOGIN] - Empresa:", userData.empresaNome)
    console.log("[LOGIN] - Cargo:", userData.cargo)
    localStorage.setItem("scalazap_user", JSON.stringify(userData))
    localStorage.setItem("scalazap_selected_empresa", empresaId)
    
    // Verificar se foi salvo corretamente
    const saved = localStorage.getItem("scalazap_user")
    console.log("[LOGIN] Dados salvos verificados:", saved ? "✅ Sim" : "❌ Não")
    console.log("[LOGIN] ✅ Dados salvos com empresa selecionada")
    
    // Redirecionar para o dashboard com delay
    setTimeout(() => {
      console.log("[LOGIN] Executando redirecionamento...")
      router.push("/dashboard")
      // Forçar navegação também com window.location como fallback
      setTimeout(() => {
        if (window.location.pathname.includes("/login") || window.location.pathname === "/") {
          console.log("[LOGIN] Router.push não funcionou, usando window.location")
          window.location.href = "/dashboard"
        }
      }, 500)
    }, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("=".repeat(60))
      console.log("[LOGIN] Iniciando processo de login")
      console.log("[LOGIN] Email:", email)
      console.log("[LOGIN] Timestamp:", new Date().toISOString())
      
      // 1. Fazer login no Supabase Auth
      console.log("[LOGIN] Passo 1: Autenticando no Supabase Auth...")
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      })

      if (authError) {
        console.error("[LOGIN] ❌ Erro no Supabase Auth:", {
          message: authError.message,
          status: authError.status,
          name: authError.name
        })
        setError(authError.message || "Email ou senha incorretos. Verifique suas credenciais.")
        setLoading(false)
        return
      }

      if (!authData.user) {
        console.error("[LOGIN] ❌ Auth data sem usuário")
        setError("Erro ao fazer login. Tente novamente.")
        setLoading(false)
        return
      }

      console.log("[LOGIN] ✅ Login no Supabase Auth bem-sucedido")
      console.log("[LOGIN] User ID (Supabase Auth):", authData.user.id)
      console.log("[LOGIN] User Email:", authData.user.email)

      // 2. Buscar perfil na tabela perfis usando o ID do auth.users
      console.log("[LOGIN] Passo 2: Buscando perfil na tabela 'perfis'...")
      console.log("[LOGIN] Buscando perfil com id =", authData.user.id)
      
      const { data: perfilData, error: perfilError } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle()

      console.log("[LOGIN] Resultado da busca na tabela 'perfis':")
      console.log("[LOGIN] - Perfil encontrado:", !!perfilData)
      console.log("[LOGIN] - Erro:", perfilError)

      if (perfilError) {
        console.error("[LOGIN] ❌ Erro ao buscar perfil:", {
          message: perfilError.message,
          code: perfilError.code,
          details: perfilError.details,
          hint: perfilError.hint
        })
        setError("Erro ao buscar perfil do usuário. Entre em contato com o administrador.")
        setLoading(false)
        return
      }

      if (!perfilData) {
        console.error("[LOGIN] ❌ Perfil não encontrado na tabela 'perfis'")
        setError("Perfil não encontrado na base de dados. Entre em contato com o administrador.")
        setLoading(false)
        return
      }

      console.log("[LOGIN] ✅ Perfil encontrado:")
      console.log("[LOGIN] - Perfil ID:", perfilData.id)
      console.log("[LOGIN] - Nome:", perfilData.nome_completo)
      console.log("[LOGIN] - Email:", perfilData.email)

      // 3. Buscar TODOS os membros na tabela membros usando id_perfil
      console.log("[LOGIN] Passo 3: Buscando membros na tabela 'membros'...")
      console.log("[LOGIN] Buscando membros com id_perfil =", perfilData.id)
      
      const { data: membrosData, error: membrosError } = await supabase
        .from("membros")
        .select(`
          *,
          empresas!fk_membros_empresa (
            *
          )
        `)
        .eq("id_perfil", perfilData.id)
        .eq("ativo", true)

      console.log("[LOGIN] Resultado da busca na tabela 'membros':")
      console.log("[LOGIN] - Membros encontrados:", membrosData?.length || 0)
      console.log("[LOGIN] - Erro:", membrosError)

      if (membrosError) {
        console.error("[LOGIN] ❌ Erro ao buscar membros:", {
          message: membrosError.message,
          code: membrosError.code,
          details: membrosError.details,
          hint: membrosError.hint
        })
        setError("Erro ao buscar dados do membro. Entre em contato com o administrador.")
        setLoading(false)
        return
      }

      if (!membrosData || membrosData.length === 0) {
        console.error("[LOGIN] ❌ Nenhum membro encontrado na tabela 'membros'")
        setError("Membro não encontrado ou inativo. Entre em contato com o administrador.")
        setLoading(false)
        return
      }

      console.log("[LOGIN] ✅ Membros encontrados:", membrosData.length)
      membrosData.forEach((membro, index) => {
        const empresa = Array.isArray(membro.empresas) ? membro.empresas[0] : membro.empresas
        console.log(`[LOGIN] - Membro ${index + 1}:`, {
          id: membro.id,
          nome: membro.nome,
          id_empresa: membro.id_empresa,
          empresa: empresa?.nome
        })
      })

      // 4. Filtrar empresas ativas (não suspensas)
      // Nota: empresas pode vir como array ou objeto único dependendo da FK
      const empresasAtivas = membrosData
        .filter((membro: any) => {
          const empresa = Array.isArray(membro.empresas) ? membro.empresas[0] : membro.empresas
          return empresa && empresa.status_assinatura !== 'suspended'
        })
        .map((membro: any) => {
          const empresa = Array.isArray(membro.empresas) ? membro.empresas[0] : membro.empresas
          return {
            id: membro.id_empresa,
            nome: empresa.nome,
            plano_atual: empresa.plano_atual,
            status_assinatura: empresa.status_assinatura,
            membro_id: membro.id
          }
        })

      console.log("[LOGIN] Empresas ativas encontradas:", empresasAtivas.length)

      if (empresasAtivas.length === 0) {
        console.error("[LOGIN] ❌ Nenhuma empresa ativa encontrada")
        setError("Nenhuma empresa ativa encontrada. Entre em contato com o administrador.")
        setLoading(false)
        return
      }

      // 5. Preparar dados estruturados do usuário (perfil + membro)
      const primeiroMembro = membrosData[0]
      const dadosUsuarioTemp = {
        // Identificadores
        id: authData.user.id, // ID do Supabase Auth
        perfilId: perfilData.id, // ID do perfil
        membroId: primeiroMembro.id, // ID do membro
        
        // Dados pessoais (do perfil)
        nome: perfilData.nome_completo,
        email: perfilData.email || authData.user.email,
        
        // Dados do membro
        cargo: primeiroMembro.cargo,
        ehSuperAdmin: primeiroMembro.eh_superadmin,
      }

      setDadosUsuario(dadosUsuarioTemp)

      // 6. Salvar token e sessão
      if (authData.session?.access_token) {
        localStorage.setItem("scalazap_auth_token", authData.session.access_token)
        console.log("[LOGIN] ✅ Token do Supabase Auth salvo")
      }
      
      if (authData.session) {
        localStorage.setItem("scalazap_auth_session", JSON.stringify({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
          expires_in: authData.session.expires_in,
          token_type: authData.session.token_type,
          user: {
            id: authData.user.id,
            email: authData.user.email
          }
        }))
        console.log("[LOGIN] ✅ Sessão completa salva para Realtime")
      }

      // 7. Verificar quantas empresas o usuário tem acesso
      if (empresasAtivas.length === 1) {
        // Se for apenas uma empresa, entrar direto
        console.log("[LOGIN] ✅ Apenas uma empresa encontrada, entrando direto")
        const empresaUnica = empresasAtivas[0]
        
        const userData = {
          ...dadosUsuarioTemp,
          // Dados da empresa
          id_empresa: empresaUnica.id,
          empresaNome: empresaUnica.nome,
          empresaPlano: empresaUnica.plano_atual || "starter",
          empresaStatus: empresaUnica.status_assinatura || "active",
          
          // Mantém compatibilidade com código legado
          empresa: empresaUnica.nome,
          plan: empresaUnica.plano_atual || "starter",
          planStatus: empresaUnica.status_assinatura || "active",
        }
        
        console.log("[LOGIN] Salvando dados estruturados no localStorage:")
        console.log("[LOGIN] - Pessoa:", userData.nome, `(${userData.email})`)
        console.log("[LOGIN] - Empresa:", userData.empresaNome)
        console.log("[LOGIN] - Cargo:", userData.cargo)
        localStorage.setItem("scalazap_user", JSON.stringify(userData))
        localStorage.setItem("scalazap_selected_empresa", empresaUnica.id)
        
        // Verificar se foi salvo corretamente
        const saved = localStorage.getItem("scalazap_user")
        console.log("[LOGIN] Dados salvos verificados:", saved ? "✅ Sim" : "❌ Não")
        
        console.log("[LOGIN] ✅✅✅ LOGIN CONCLUÍDO COM SUCESSO!")
        console.log("[LOGIN] Redirecionando para dashboard em 200ms...")
        
        // Pequeno delay para garantir que o localStorage foi salvo
        setTimeout(() => {
          console.log("[LOGIN] Executando redirecionamento...")
          router.push("/dashboard")
          // Forçar navegação também com window.location como fallback
          setTimeout(() => {
            if (window.location.pathname === "/login") {
              console.log("[LOGIN] Router.push não funcionou, usando window.location")
              window.location.href = "/dashboard"
            }
          }, 500)
        }, 200)
      } else {
        // Se forem várias empresas, mostrar seletor
        console.log("[LOGIN] ✅ Múltiplas empresas encontradas, mostrando seletor")
        setEmpresasDisponiveis(empresasAtivas)
        setShowEmpresaSelector(true)
        setLoading(false)
      }
      
    } catch (err: any) {
      console.error("[LOGIN] ❌❌❌ ERRO INESPERADO:", err)
      console.error("[LOGIN] Stack:", err.stack)
      setError(err.message || "Erro ao fazer login. Tente novamente.")
      setLoading(false)
    }
  }

  // Se estiver mostrando o seletor de empresa, renderizar ele
  if (showEmpresaSelector) {
    return <EmpresaSelector empresas={empresasDisponiveis} onSelect={handleSelectEmpresa} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111c21] via-[#0d1a1f] to-[#00bf63] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <Image src="/zap-logo.png" alt="ScalaZap" width={180} height={80} className="h-12 w-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>Entre com sua conta para continuar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Nao tem uma conta?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
