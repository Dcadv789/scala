"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, CheckCircle, XCircle, Settings, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Integration {
  id: string
  name: string
  description: string
  category: "payment" | "crm" | "marketing" | "analytics"
  status: "active" | "inactive" | "error"
  icon: string
  color: string
  apiKey?: string
  webhookUrl?: string
}

export default function IntegrationsPage() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const integrations: Integration[] = [
    // Pagamentos
    { id: "kirvano", name: "Kirvano", description: "Gateway de pagamentos e checkout", category: "payment", status: "active", icon: "K", color: "purple", apiKey: "kv_live_xxxxxxxxxxxx", webhookUrl: "https://api.scalazap.com/webhooks/kirvano" },
    { id: "stripe", name: "Stripe", description: "Pagamentos internacionais", category: "payment", status: "inactive", icon: "S", color: "blue", apiKey: "", webhookUrl: "" },
    { id: "mercadopago", name: "Mercado Pago", description: "Pagamentos Brasil", category: "payment", status: "inactive", icon: "MP", color: "cyan", apiKey: "", webhookUrl: "" },
    
    // CRM
    { id: "hubspot", name: "HubSpot", description: "CRM e automacao de marketing", category: "crm", status: "inactive", icon: "H", color: "orange", apiKey: "" },
    { id: "pipedrive", name: "Pipedrive", description: "CRM de vendas", category: "crm", status: "inactive", icon: "P", color: "green", apiKey: "" },
    { id: "rdstation", name: "RD Station", description: "Marketing e CRM", category: "crm", status: "inactive", icon: "RD", color: "blue", apiKey: "" },
    
    // Marketing
    { id: "mailchimp", name: "Mailchimp", description: "Email marketing", category: "marketing", status: "inactive", icon: "M", color: "yellow", apiKey: "" },
    { id: "activecampaign", name: "ActiveCampaign", description: "Email e automacao", category: "marketing", status: "inactive", icon: "AC", color: "blue", apiKey: "" },
    
    // Analytics
    { id: "google-analytics", name: "Google Analytics", description: "Analytics e metricas", category: "analytics", status: "active", icon: "GA", color: "orange", apiKey: "UA-XXXXXXXXX-X" },
    { id: "hotjar", name: "Hotjar", description: "Mapas de calor e gravacoes", category: "analytics", status: "inactive", icon: "HJ", color: "red", apiKey: "" },
  ]

  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map(i => [i.id, i.status === "active"]))
  )

  const handleToggleIntegration = (id: string) => {
    setIntegrationStates(prev => ({ ...prev, [id]: !prev[id] }))
    toast({ 
      title: integrationStates[id] ? "Integracao desativada" : "Integracao ativada",
      description: `A integracao foi ${integrationStates[id] ? "desativada" : "ativada"} com sucesso.`
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copiado!", description: "Copiado para a area de transferencia." })
  }

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-500",
      blue: "bg-blue-500",
      cyan: "bg-cyan-500",
      orange: "bg-orange-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
    }
    return colors[color] || colors.blue
  }

  const renderIntegrationCard = (integration: Integration) => {
    const isActive = integrationStates[integration.id]
    
    return (
      <Card key={integration.id} className={isActive ? "border-green-500/30" : ""}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${getColorClasses(integration.color)} flex items-center justify-center text-white font-bold`}>
                {integration.icon}
              </div>
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <Switch 
              checked={isActive}
              onCheckedChange={() => handleToggleIntegration(integration.id)}
            />
          </div>

          {isActive && integration.apiKey && (
            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">API Key</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type={showSecrets[integration.id] ? "text" : "password"}
                    value={integration.apiKey}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button variant="ghost" size="icon" onClick={() => toggleSecret(integration.id)}>
                    {showSecrets[integration.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(integration.apiKey!)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {integration.webhookUrl && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={integration.webhookUrl}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(integration.webhookUrl!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
            </div>
          )}

          {!isActive && (
            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" onClick={() => handleToggleIntegration(integration.id)}>
                <Link2 className="h-4 w-4" />
                Conectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const categories = [
    { id: "all", label: "Todas" },
    { id: "payment", label: "Pagamentos" },
    { id: "crm", label: "CRM" },
    { id: "marketing", label: "Marketing" },
    { id: "analytics", label: "Analytics" },
  ]

  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredIntegrations = selectedCategory === "all" 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integracoes</h1>
          <p className="text-muted-foreground">Conecte com suas ferramentas favoritas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Link2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{integrations.length}</p>
                <p className="text-sm text-muted-foreground">Total Integracoes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {Object.values(integrationStates).filter(Boolean).length}
                </p>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/10">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(integrationStates).filter(v => !v).length}
                </p>
                <p className="text-sm text-muted-foreground">Inativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map(renderIntegrationCard)}
      </div>
    </div>
  )
}
