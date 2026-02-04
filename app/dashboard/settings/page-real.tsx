"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, Save, Edit, CheckCircle2 } from "lucide-react"

interface UserProfile {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  ehSuperAdmin: boolean
  empresaId: string
  empresaNome: string
  empresaPlano: string
  empresaStatus: string
}

export default function SettingsPageReal() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Campos editáveis
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  
  const { toast } = useToast()

  // Carregar perfil do backend
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log("[Settings] Carregando perfil do backend...")
      
      // Pegar ID do localStorage
      const userData = localStorage.getItem("scalazap_user")
      if (!userData) {
        throw new Error("Usuário não encontrado no localStorage")
      }
      
      const user = JSON.parse(userData)
      
      const response = await fetch("/api/user/profile", {
        headers: {
          "x-user-id": user.id
        }
      })
      
      if (!response.ok) {
        throw new Error("Erro ao carregar perfil")
      }
      
      const data = await response.json()
      console.log("[Settings] Perfil carregado:", data)
      
      setProfile(data)
      setNome(data.nome)
      setTelefone(data.telefone || "")
      
    } catch (error: any) {
      console.error("[Settings] Erro ao carregar perfil:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu perfil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log("[Settings] Salvando alterações...")
      
      const userData = localStorage.getItem("scalazap_user")
      if (!userData) {
        throw new Error("Usuário não encontrado")
      }
      
      const user = JSON.parse(userData)
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          nome,
          telefone
        })
      })
      
      if (!response.ok) {
        throw new Error("Erro ao salvar perfil")
      }
      
      const result = await response.json()
      console.log("[Settings] ✅ Perfil salvo:", result)
      
      // Atualizar localStorage com novos dados
      const updatedUser = {
        ...user,
        nome,
        telefone
      }
      localStorage.setItem("scalazap_user", JSON.stringify(updatedUser))
      
      // Recarregar perfil
      await loadProfile()
      
      setIsEditing(false)
      
      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas",
      })
      
    } catch (error: any) {
      console.error("[Settings] Erro ao salvar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Restaurar valores originais
    if (profile) {
      setNome(profile.nome)
      setTelefone(profile.telefone)
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="mt-2 text-muted-foreground">
                  Gerencie suas informações pessoais e preferências
                </p>
              </div>

              {/* Plano Atual */}
              {profile && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Plano Atual</CardTitle>
                      <Badge 
                        variant={profile.empresaStatus === "ativo" ? "default" : "secondary"}
                        className="text-sm"
                      >
                        {profile.empresaPlano === "starter" && "Starter"}
                        {profile.empresaPlano === "professional" && "Professional"}
                        {profile.empresaPlano === "unlimited" && "Ilimitado"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Status: <strong className="text-foreground">{profile.empresaStatus}</strong></span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                      </CardTitle>
                      <CardDescription>
                        Seus dados de perfil e informações de contato
                      </CardDescription>
                    </div>
                    
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  {/* Email (não editável) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      disabled={!isEditing}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>

                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={profile?.empresaNome || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Cargo */}
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={profile?.cargo || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Botões de ação */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
        <MobileNav />
        <WhatsAppSupportButton />
      </div>
    </AuthGuard>
  )
}

