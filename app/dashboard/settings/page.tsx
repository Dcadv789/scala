"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCurrentUser, getTeamMembers, addTeamMember, updateTeamMember, removeTeamMember, getPlanLimits, getConnections } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { User, Bell, Shield, CreditCard, Building, Users, Trash2, Mail, UserPlus, Check, X, ExternalLink, AlertCircle, Zap } from "lucide-react"
import { kirvanoCheckoutLinks } from "@/components/landing/signup-section"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    campaigns: true,
    messages: true,
  })
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "manager" | "operator">("operator")
  const [planLimits, setPlanLimits] = useState({ maxConnections: 2, maxTeamMembers: 3 })
  const [connectionsCount, setConnectionsCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
      setPhone(currentUser.phone || "")
      setCompany(currentUser.company || "")
      setPlanLimits(getPlanLimits(currentUser.plan))
    }
    setTeamMembers(getTeamMembers())
    setConnectionsCount(getConnections().length)
  }, [])

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notificacoes atualizadas",
      description: "Suas preferencias de notificacao foram salvas.",
    })
  }

  const handleInviteMember = () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite o email do membro.",
        variant: "destructive",
      })
      return
    }

    if (teamMembers.length >= planLimits.maxTeamMembers) {
      toast({
        title: "Limite atingido",
        description: `Seu plano permite ate ${planLimits.maxTeamMembers} funcionarios. Faca upgrade para adicionar mais.`,
        variant: "destructive",
      })
      return
    }

    const existingMember = teamMembers.find(m => m.email === newMemberEmail)
    if (existingMember) {
      toast({
        title: "Erro",
        description: "Este email ja foi convidado.",
        variant: "destructive",
      })
      return
    }

    const newMember = addTeamMember({
      email: newMemberEmail,
      role: newMemberRole,
      status: "pending",
      invitedBy: user?.id || "",
      invitedAt: new Date().toISOString(),
      permissions: {
        campaigns: newMemberRole !== "operator",
        chat: true,
        contacts: true,
        templates: newMemberRole !== "operator",
        connections: newMemberRole === "admin",
        settings: newMemberRole === "admin",
      },
    })

    setTeamMembers([...teamMembers, newMember])
    setNewMemberEmail("")
    
    toast({
      title: "Convite enviado",
      description: `Convite enviado para ${newMemberEmail}.`,
    })
  }

  const handleRemoveMember = (memberId: string) => {
    removeTeamMember(memberId)
    setTeamMembers(teamMembers.filter(m => m.id !== memberId))
    toast({
      title: "Membro removido",
      description: "O membro foi removido da equipe.",
    })
  }

  const handleTogglePermission = (memberId: string, permission: string, value: boolean) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (member) {
      const updatedPermissions = { ...member.permissions, [permission]: value }
      updateTeamMember(memberId, { permissions: updatedPermissions })
      setTeamMembers(teamMembers.map(m => 
        m.id === memberId ? { ...m, permissions: updatedPermissions } : m
      ))
    }
  }

  return (
  <div className="flex h-screen w-full overflow-hidden bg-background">
  <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
  
  <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
  <DashboardHeader />
        <PaymentPendingBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                Configurações
              </h1>
              <p className="text-pretty mt-2 text-sm text-muted-foreground">
                Gerencie suas preferências e configurações da conta
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Assinatura
                </TabsTrigger>
                <TabsTrigger value="team" className="gap-2">
                  <Users className="h-4 w-4" />
                  Empresa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações de perfil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        placeholder="Nome da sua empresa"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificações</CardTitle>
                    <CardDescription>Escolha como deseja receber notificações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">Receba atualizações por email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Campanhas</Label>
                        <p className="text-sm text-muted-foreground">Alertas sobre status de campanhas</p>
                      </div>
                      <Switch
                        checked={notifications.campaigns}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, campaigns: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mensagens</Label>
                        <p className="text-sm text-muted-foreground">Notificações de novas mensagens</p>
                      </div>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                      />
                    </div>

                    <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Segurança da Conta</CardTitle>
                    <CardDescription>Gerencie a segurança da sua conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input id="current-password" type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input id="new-password" type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input id="confirm-password" type="password" />
                    </div>

                    <Button>Atualizar Senha</Button>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                    <CardDescription>Ações irreversíveis da conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-4">
                      <div>
                        <p className="font-medium text-foreground">Excluir Conta</p>
                        <p className="text-sm text-muted-foreground">
                          Exclua permanentemente sua conta e todos os dados
                        </p>
                      </div>
                      <Button variant="destructive">Excluir Conta</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                {(() => {
                  const pendingPlan = typeof window !== "undefined" ? localStorage.getItem("scalazap_pending_plan") : null
                  const isPending = pendingPlan && !user?.planStatus || user?.planStatus === "pending"
                  
                  const getPlanInfo = (planKey: string | null | undefined) => {
                    switch (planKey) {
                      case "starter": return { name: "Basico", price: "97,90", promoPrice: "29,90" }
                      case "professional": return { name: "Professional", price: "127,90", promoPrice: "39,90" }
                      case "unlimited": return { name: "Ilimitado", price: "197,90", promoPrice: "49,90" }
                      default: return { name: "Basico", price: "97,90", promoPrice: "29,90" }
                    }
                  }
                  
                  const currentPlan = pendingPlan || user?.plan || "starter"
                  const planInfo = getPlanInfo(currentPlan)
                  
                  return (
                    <>
                      {isPending && (
                        <Card className="border-yellow-500/50 bg-yellow-500/10">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-medium text-yellow-500">Assinatura pendente</h4>
                                <p className="text-sm text-foreground/70 mt-1">
                                  Complete o pagamento para ativar todos os recursos do seu plano {planInfo.name}.
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white gap-2"
                                    onClick={() => {
                                      const link = kirvanoCheckoutLinks[currentPlan as keyof typeof kirvanoCheckoutLinks]
                                      if (link) window.open(link, "_blank")
                                    }}
                                  >
                                    <Zap className="h-4 w-4" />
                                    Ativar por R$ {planInfo.promoPrice}
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs text-foreground/50 line-through">R$ {planInfo.price}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card>
                        <CardHeader>
                          <CardTitle>Plano Selecionado</CardTitle>
                          <CardDescription>Detalhes do seu plano</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-start justify-between rounded-lg border bg-card p-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-primary" />
                                <h3 className="text-xl font-semibold">{planInfo.name}</h3>
                                {isPending ? (
                                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pendente</Badge>
                                ) : (
                                  <Badge className="bg-green-500">Ativo</Badge>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-2xl font-bold text-primary">R$ {planInfo.promoPrice}</span>
                                <span className="text-sm text-foreground/50 line-through">R$ {planInfo.price}</span>
                                <span className="text-sm text-foreground/70">/mes</span>
                              </div>
                              <p className="text-xs text-green-400 mt-1">Primeira mensalidade com desconto</p>
                              <p className="text-sm text-muted-foreground mt-2">Apos a primeira mensalidade: R$ {planInfo.price}/mes</p>
                            </div>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                const link = kirvanoCheckoutLinks[currentPlan as keyof typeof kirvanoCheckoutLinks]
                                if (link) window.open(link, "_blank")
                              }}
                            >
                              {isPending ? "Ativar Plano" : "Alterar Plano"}
                            </Button>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium">Recursos do plano {planInfo.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {currentPlan === "starter" && (
                                <>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> 2 conexoes WhatsApp
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> 3 funcionarios
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Ate 5.000 mensagens/mes
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Chat ao vivo
                                  </div>
                                </>
                              )}
                              {currentPlan === "professional" && (
                                <>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> 5 conexoes WhatsApp
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> 5 funcionarios
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Ate 50.000 mensagens/mes
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> App Mobile e Desktop
                                  </div>
                                </>
                              )}
                              {currentPlan === "unlimited" && (
                                <>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Conexoes ilimitadas
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Funcionarios ilimitados
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Mensagens ilimitadas
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                                    <Check className="h-4 w-4 text-green-500" /> Gerente de conta dedicado
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium">Pagamento</h4>
                            <p className="text-sm text-muted-foreground">
                              Os pagamentos sao processados de forma segura atraves da Kirvano. 
                              Para gerenciar sua assinatura, alterar forma de pagamento ou cancelar, 
                              acesse sua area do cliente na Kirvano.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-2 bg-transparent"
                              onClick={() => window.open("https://app.kirvano.com", "_blank")}
                            >
                              Acessar Kirvano
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Comparar Planos</CardTitle>
                          <CardDescription>Veja o que cada plano oferece</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { key: "starter", name: "Basico", price: "29,90", regular: "97,90" },
                              { key: "professional", name: "Professional", price: "39,90", regular: "127,90" },
                              { key: "unlimited", name: "Ilimitado", price: "49,90", regular: "197,90" },
                            ].map((plan) => (
                              <div 
                                key={plan.key}
                                className={`p-4 rounded-lg border ${currentPlan === plan.key ? "border-primary bg-primary/10" : "border-foreground/10"}`}
                              >
                                <h4 className="font-semibold">{plan.name}</h4>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-lg font-bold text-primary">R$ {plan.price}</span>
                                  <span className="text-xs text-foreground/50 line-through">R$ {plan.regular}</span>
                                </div>
                                <p className="text-[10px] text-green-400">1a mensalidade</p>
                                {currentPlan !== plan.key && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full mt-3 bg-transparent"
                                    onClick={() => {
                                      const link = kirvanoCheckoutLinks[plan.key as keyof typeof kirvanoCheckoutLinks]
                                      if (link) window.open(link, "_blank")
                                    }}
                                  >
                                    Mudar para {plan.name}
                                  </Button>
                                )}
                                {currentPlan === plan.key && (
                                  <Badge className="w-full justify-center mt-3 bg-primary">Plano Atual</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )
                })()}
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Limites do Plano</CardTitle>
                    <CardDescription>Recursos disponiveis no seu plano atual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Conexoes API Oficial</p>
                          <p className="text-sm text-muted-foreground">
                            {connectionsCount} de {planLimits.maxConnections === 999 ? "Ilimitado" : planLimits.maxConnections}
                          </p>
                        </div>
                        <Badge variant={connectionsCount >= planLimits.maxConnections ? "destructive" : "default"}>
                          {planLimits.maxConnections === 999 ? "Ilimitado" : `${connectionsCount}/${planLimits.maxConnections}`}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Funcionarios</p>
                          <p className="text-sm text-muted-foreground">
                            {teamMembers.length} de {planLimits.maxTeamMembers === 999 ? "Ilimitado" : planLimits.maxTeamMembers}
                          </p>
                        </div>
                        <Badge variant={teamMembers.length >= planLimits.maxTeamMembers ? "destructive" : "default"}>
                          {planLimits.maxTeamMembers === 999 ? "Ilimitado" : `${teamMembers.length}/${planLimits.maxTeamMembers}`}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Convidar Membro</CardTitle>
                    <CardDescription>Adicione funcionarios a sua equipe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="member-email">Email do funcionario</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="member-email"
                            type="email"
                            placeholder="email@empresa.com"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-48">
                        <Label>Funcao</Label>
                        <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="operator">Operador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleInviteMember} disabled={teamMembers.length >= planLimits.maxTeamMembers}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Convidar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Administrador:</strong> Acesso total a todas as funcionalidades.<br />
                        <strong>Gerente:</strong> Gerencia campanhas, templates, contatos e chat.<br />
                        <strong>Operador:</strong> Acesso apenas ao chat e contatos.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Membros da Equipe</CardTitle>
                    <CardDescription>Gerencie os funcionarios da sua empresa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum membro na equipe ainda.</p>
                        <p className="text-sm">Convide funcionarios usando o formulario acima.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Funcao</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Permissoes</TableHead>
                            <TableHead className="text-right">Acoes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  {member.email}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {member.role === "admin" ? "Administrador" : member.role === "manager" ? "Gerente" : "Operador"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={member.status === "active" ? "default" : "secondary"}>
                                  {member.status === "active" ? "Ativo" : member.status === "pending" ? "Pendente" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {member.permissions.campaigns && <Badge variant="outline" className="text-xs">Campanhas</Badge>}
                                  {member.permissions.chat && <Badge variant="outline" className="text-xs">Chat</Badge>}
                                  {member.permissions.contacts && <Badge variant="outline" className="text-xs">Contatos</Badge>}
                                  {member.permissions.templates && <Badge variant="outline" className="text-xs">Templates</Badge>}
                                  {member.permissions.connections && <Badge variant="outline" className="text-xs">Conexoes</Badge>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
</main>
  </div>
      <MobileNav />
      <WhatsAppSupportButton />
  </div>
  )
}
