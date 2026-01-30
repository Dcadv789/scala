"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Shield, Bell, CreditCard, Globe, Database, Lock, Save, RefreshCw, Key, Eye, EyeOff, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "ScalaZap",
    siteUrl: "https://scalazap.com",
    supportEmail: "suporte@scalazap.com",
    maintenanceMode: false,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: "24",
    maxLoginAttempts: "5",
    ipWhitelist: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    newUserAlert: true,
    paymentAlert: true,
    errorAlert: true,
  })

  const [apiKeys, setApiKeys] = useState({
    metaApiKey: "EAAG...............",
    kirvanoApiKey: "kv_live_xxxxxxxxxxxx",
    webhookSecret: "whsec_xxxxxxxxxxxx",
  })

  const handleSave = (section: string) => {
    toast({ title: "Configuracoes salvas", description: `As configuracoes de ${section} foram atualizadas.` })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copiado!", description: "Copiado para a area de transferencia." })
  }

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuracoes</h1>
        <p className="text-muted-foreground">Gerencie as configuracoes do sistema</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguranca</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuracoes Gerais</CardTitle>
              <CardDescription>Configuracoes basicas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Site</Label>
                  <Input 
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL do Site</Label>
                  <Input 
                    value={generalSettings.siteUrl}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email de Suporte</Label>
                  <Input 
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <div className="space-y-1">
                  <Label>Modo de Manutencao</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar para bloquear acesso de usuarios
                  </p>
                </div>
                <Switch 
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                />
              </div>

              <Button onClick={() => handleSave("Geral")} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Alteracoes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuracoes de Seguranca</CardTitle>
              <CardDescription>Proteja seu sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label>Autenticacao em Duas Etapas Obrigatoria</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir 2FA para todos os usuarios
                  </p>
                </div>
                <Switch 
                  checked={securitySettings.twoFactorRequired}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorRequired: checked })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Timeout de Sessao (horas)</Label>
                  <Select 
                    value={securitySettings.sessionTimeout}
                    onValueChange={(v) => setSecuritySettings({ ...securitySettings, sessionTimeout: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="8">8 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="168">7 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tentativas de Login Maximas</Label>
                  <Select 
                    value={securitySettings.maxLoginAttempts}
                    onValueChange={(v) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 tentativas</SelectItem>
                      <SelectItem value="5">5 tentativas</SelectItem>
                      <SelectItem value="10">10 tentativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>IP Whitelist</Label>
                <Textarea 
                  placeholder="Um IP por linha..."
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para permitir todos os IPs
                </p>
              </div>

              <Button onClick={() => handleSave("Seguranca")} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Alteracoes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuracoes de Alertas</CardTitle>
              <CardDescription>Configure notificacoes do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label>Notificacoes por Email</Label>
                    <p className="text-sm text-muted-foreground">Receber alertas por email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label>Notificacoes Slack</Label>
                    <p className="text-sm text-muted-foreground">Receber alertas no Slack</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.slackNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, slackNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label>Alerta de Novo Usuario</Label>
                    <p className="text-sm text-muted-foreground">Notificar quando um novo usuario se cadastrar</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newUserAlert}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newUserAlert: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label>Alerta de Pagamento</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre pagamentos recebidos</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.paymentAlert}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentAlert: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                  <div className="space-y-1">
                    <Label>Alerta de Erros</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre erros criticos do sistema</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.errorAlert}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, errorAlert: checked })}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave("Alertas")} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Alteracoes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API</CardTitle>
              <CardDescription>Gerencie suas chaves de integracao</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showSecrets["meta"] ? "text" : "password"}
                      value={apiKeys.metaApiKey}
                      onChange={(e) => setApiKeys({ ...apiKeys, metaApiKey: e.target.value })}
                      className="font-mono"
                    />
                    <Button variant="ghost" size="icon" onClick={() => toggleSecret("meta")}>
                      {showSecrets["meta"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKeys.metaApiKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kirvano API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showSecrets["kirvano"] ? "text" : "password"}
                      value={apiKeys.kirvanoApiKey}
                      onChange={(e) => setApiKeys({ ...apiKeys, kirvanoApiKey: e.target.value })}
                      className="font-mono"
                    />
                    <Button variant="ghost" size="icon" onClick={() => toggleSecret("kirvano")}>
                      {showSecrets["kirvano"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKeys.kirvanoApiKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showSecrets["webhook"] ? "text" : "password"}
                      value={apiKeys.webhookSecret}
                      onChange={(e) => setApiKeys({ ...apiKeys, webhookSecret: e.target.value })}
                      className="font-mono"
                    />
                    <Button variant="ghost" size="icon" onClick={() => toggleSecret("webhook")}>
                      {showSecrets["webhook"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKeys.webhookSecret)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleSave("API Keys")} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alteracoes
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <RefreshCw className="h-4 w-4" />
                  Regenerar Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database</CardTitle>
              <CardDescription>Informacoes e acoes do banco de dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-green-500">Conectado</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-lg font-semibold">1,234</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Ultimo Backup</p>
                  <p className="text-lg font-semibold">Hoje, 03:00</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Database className="h-4 w-4" />
                  Backup Manual
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <RefreshCw className="h-4 w-4" />
                  Limpar Cache
                </Button>
                <Button variant="destructive" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Reset Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
