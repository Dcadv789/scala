"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, Save, Edit, CheckCircle2, ArrowUpRight } from "lucide-react"

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
  empresaPlanoId: string | null
  empresaStatus: string
}

export default function SettingsPage() {
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
      
      const userData = localStorage.getItem("scalazap_user")
      if (!userData) {
        throw new Error("Usuário não encontrado no localStorage")
      }
      
      const user = JSON.parse(userData)
      
      const url = `/api/user/profile?userId=${encodeURIComponent(user.id)}`
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Erro ao carregar perfil: ${response.status} - ${errorData.error || "Desconhecido"}`)
      }
      
      const data = await response.json()
      console.log("[Settings] ✅ Perfil carregado:", data)
      console.log("[Settings] Plano:", data.empresaPlano)
      console.log("[Settings] Status:", data.empresaStatus)
      
      setProfile(data)
      setNome(data.nome || "")
      setTelefone(data.telefone || "")
      
    } catch (error: any) {
      console.error("[Settings] ❌ Erro ao carregar perfil:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar seu perfil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const userData = localStorage.getItem("scalazap_user")
      if (!userData) {
        throw new Error("Usuário não encontrado")
      }
      
      const user = JSON.parse(userData)
      
      const url = `/api/user/profile?userId=${encodeURIComponent(user.id)}`
      const response = await fetch(url, {
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
      
      // Atualizar localStorage
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Gerencie suas informações pessoais e preferências
                </p>
              </div>

              {/* Plano Atual */}
              {profile && (
                <Card className="border border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-semibold">Plano Atual</CardTitle>
                      <Badge 
                        variant={profile.empresaStatus === "ativo" ? "default" : "secondary"}
                        className="text-sm font-medium px-3 py-1"
                      >
                        {profile.empresaPlano && profile.empresaPlano !== "N/A" && profile.empresaPlano.trim() !== "" 
                          ? profile.empresaPlano 
                          : "Sem plano"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Plano:</span>
                        <strong className="text-foreground font-semibold text-base">
                          {profile.empresaPlano && profile.empresaPlano !== "N/A" ? profile.empresaPlano : "Sem plano definido"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Status: <strong className="text-foreground capitalize font-medium">{profile.empresaStatus || "N/A"}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          // Redirecionar para seção de planos na landing page
                          window.location.href = '/#planos'
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '40px',
                          padding: '0 20px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'white',
                          backgroundColor: 'hsl(var(--primary))',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <ArrowUpRight style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Fazer Upgrade do Plano
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações Pessoais */}
              <Card className="border border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold mb-1">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Seus dados de perfil e informações de contato
                      </CardDescription>
                    </div>
                    
                    {!isEditing && profile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '36px',
                          padding: '0 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'hsl(var(--foreground))',
                          backgroundColor: 'transparent',
                          border: '1px solid hsl(var(--input))',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
                          e.currentTarget.style.borderColor = 'hsl(var(--accent))'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = 'hsl(var(--input))'
                        }}
                      >
                        <Edit style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Editar
                      </button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-6" style={{ padding: '24px' }}>
                  {!profile ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Carregando informações...</p>
                    </div>
                  ) : (
                    <>
                      {/* Nome */}
                      <div className="space-y-2">
                        <label htmlFor="nome" className="block text-sm font-medium text-foreground mb-1.5">
                          Nome Completo
                        </label>
                        <input
                          id="nome"
                          name="nome"
                          type="text"
                          value={nome || ""}
                          onChange={(e) => setNome(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Seu nome completo"
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 14px',
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))',
                            backgroundColor: !isEditing ? 'hsl(var(--muted))' : 'hsl(var(--background))',
                            border: '1px solid hsl(var(--input))',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            cursor: !isEditing ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (isEditing) {
                              e.target.style.borderColor = 'hsl(var(--ring))'
                              e.target.style.boxShadow = '0 0 0 2px hsl(var(--ring) / 0.2)'
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'hsl(var(--input))'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email || ""}
                          disabled
                          readOnly
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 14px',
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))',
                            backgroundColor: 'hsl(var(--muted))',
                            border: '1px solid hsl(var(--input))',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'not-allowed',
                            opacity: 0.7
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          O email não pode ser alterado
                        </p>
                      </div>

                      {/* Telefone */}
                      <div className="space-y-2">
                        <label htmlFor="telefone" className="block text-sm font-medium text-foreground mb-1.5">
                          Telefone
                        </label>
                        <input
                          id="telefone"
                          name="telefone"
                          type="tel"
                          value={telefone || ""}
                          onChange={(e) => setTelefone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="+55 11 99999-9999"
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 14px',
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))',
                            backgroundColor: !isEditing ? 'hsl(var(--muted))' : 'hsl(var(--background))',
                            border: '1px solid hsl(var(--input))',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            cursor: !isEditing ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (isEditing) {
                              e.target.style.borderColor = 'hsl(var(--ring))'
                              e.target.style.boxShadow = '0 0 0 2px hsl(var(--ring) / 0.2)'
                            }
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'hsl(var(--input))'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                      </div>

                      {/* Empresa */}
                      <div className="space-y-2">
                        <label htmlFor="empresa" className="block text-sm font-medium text-foreground mb-1.5">
                          Empresa
                        </label>
                        <input
                          id="empresa"
                          name="empresa"
                          type="text"
                          value={profile.empresaNome || ""}
                          disabled
                          readOnly
                          placeholder="Nome da empresa"
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 14px',
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))',
                            backgroundColor: 'hsl(var(--muted))',
                            border: '1px solid hsl(var(--input))',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'not-allowed',
                            opacity: 0.7
                          }}
                        />
                      </div>

                      {/* Cargo */}
                      <div className="space-y-2">
                        <label htmlFor="cargo" className="block text-sm font-medium text-foreground mb-1.5">
                          Cargo
                        </label>
                        <input
                          id="cargo"
                          name="cargo"
                          type="text"
                          value={profile.cargo || ""}
                          disabled
                          readOnly
                          placeholder="Seu cargo na empresa"
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 14px',
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))',
                            backgroundColor: 'hsl(var(--muted))',
                            border: '1px solid hsl(var(--input))',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'not-allowed',
                            opacity: 0.7
                          }}
                        />
                      </div>

                      {/* Botões de ação */}
                      {isEditing && (
                        <div className="flex gap-3 pt-6 border-t border-border">
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '42px',
                              padding: '0 20px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: saving ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: saving ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!saving) {
                                e.currentTarget.style.opacity = '0.9'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!saving) {
                                e.currentTarget.style.opacity = '1'
                              }
                            }}
                          >
                            {saving ? (
                              <>⏳ Salvando...</>
                            ) : (
                              <>
                                <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                Salvar Alterações
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '42px',
                              padding: '0 20px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: 'hsl(var(--foreground))',
                              backgroundColor: 'transparent',
                              border: '1px solid hsl(var(--input))',
                              borderRadius: '8px',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: saving ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!saving) {
                                e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'
                                e.currentTarget.style.borderColor = 'hsl(var(--accent))'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!saving) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.borderColor = 'hsl(var(--input))'
                              }
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </>
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
