"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Webhook, Plus, Search, CheckCircle, XCircle, RefreshCw, Copy, Trash2, Eye, Activity, AlertCircle, ExternalLink, Clock, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Suspense } from "react"
import Loading from "./loading"
import { createClient } from "@supabase/supabase-js" // Import createClient from supabase-js

interface WebhookConfig {
  id: string
  name: string
  url: string
  token?: string
  events: string[]
  status: "active" | "inactive" | "error"
  lastTriggered?: string
  successRate: number
  totalCalls: number
  createdAt: string
}

interface WebhookLog {
  id: string
  event: string
  event_description: string
  customer_email: string
  customer_name: string
  customer_phone: string
  sale_id: string
  checkout_id: string
  payment_method: string
  total_price: string
  status: string
  type: string
  received_at: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", token: "", events: [] as string[] })
  const [isLoading, setIsLoading] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("/api/webhooks/kirvano")
  const { toast } = useToast()

  // Set webhook URL on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/webhooks/kirvano`)
    }
  }, [])

// Carregar logs via API
  const loadWebhookLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/webhook-logs")
      const result = await response.json()
      
      if (!response.ok) {
        console.error("Erro ao carregar logs:", result.error)
        toast({
          title: "Erro",
          description: result.error || "Falha ao carregar logs de webhooks",
          variant: "destructive",
        })
        setLogs([])
        return
      }
      
      const data = result.logs

      // Converter formato do Supabase para o formato esperado
      const formattedLogs: WebhookLog[] = (data || []).map((log: any) => ({
        id: log.id,
        event: log.event_type || "UNKNOWN",
        event_description: log.payload?.event_description || log.event_type,
        customer_email: log.customer_email || "",
        customer_name: log.customer_name || "",
        customer_phone: log.payload?.customer?.phone_number || "",
        sale_id: log.payload?.sale_id || "",
        checkout_id: log.payload?.checkout_id || "",
        payment_method: log.payload?.payment_method || "",
        total_price: log.payload?.total_price || "",
        status: log.status || "received",
        type: log.payload?.type || "ONE_TIME",
        received_at: log.created_at,
      }))

      setLogs(formattedLogs)
    } catch (error) {
      console.error("Erro ao carregar logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Carregar webhooks configurados
    const savedWebhooks: WebhookConfig[] = [
      { 
        id: "kirvano-main", 
        name: "Kirvano - Pagamentos ScalaZap", 
        url: webhookUrl, 
        token: "Configurado na Kirvano",
        events: ["SALE_APPROVED", "SALE_REFUSED", "SALE_REFUNDED", "SALE_CHARGEBACK", "PIX_GENERATED", "PIX_EXPIRED", "BANK_SLIP_GENERATED", "BANK_SLIP_EXPIRED", "SUBSCRIPTION_CANCELED", "SUBSCRIPTION_RENEWED"], 
        status: "active", 
        lastTriggered: new Date().toISOString(), 
        successRate: 100, 
        totalCalls: logs.length, 
        createdAt: new Date().toISOString() 
      },
    ]
    setWebhooks(savedWebhooks)

    // Carregar logs reais do Supabase
    loadWebhookLogs()
  }, [webhookUrl])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
                         log.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
                         log.sale_id?.toLowerCase().includes(search.toLowerCase())
    const matchesEvent = eventFilter === "all" || log.event === eventFilter
    return matchesSearch && matchesEvent
  })

  const handleAddWebhook = () => {
    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      ...newWebhook,
      status: "active",
      successRate: 100,
      totalCalls: 0,
      createdAt: new Date().toISOString(),
    }
    setWebhooks([...webhooks, webhook])
    setShowAddDialog(false)
    setNewWebhook({ name: "", url: "", token: "", events: [] })
    toast({ title: "Webhook criado", description: "O webhook foi configurado com sucesso." })
  }

  const handleDeleteWebhook = (id: string) => {
    if (id === "kirvano-main") {
      toast({ title: "Acao bloqueada", description: "O webhook principal da Kirvano nao pode ser removido.", variant: "destructive" })
      return
    }
    setWebhooks(webhooks.filter(wh => wh.id !== id))
    toast({ title: "Webhook removido", description: "O webhook foi removido do sistema." })
  }

  const handleToggleStatus = (id: string) => {
    setWebhooks(webhooks.map(wh => 
      wh.id === id ? { ...wh, status: wh.status === "active" ? "inactive" : "active" } : wh
    ))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copiado!", description: "Copiado para a area de transferencia." })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      active: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Ativo" },
      inactive: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Inativo" },
      error: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Erro" },
    }
    return configs[status] || configs.inactive
  }

  const getEventBadge = (event: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      SALE_APPROVED: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Aprovado" },
      SALE_REFUSED: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Recusado" },
      SALE_REFUNDED: { color: "bg-orange-500/10 text-orange-500 border-orange-500/30", label: "Reembolso" },
      SALE_CHARGEBACK: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Chargeback" },
      PIX_GENERATED: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "PIX Gerado" },
      PIX_EXPIRED: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "PIX Expirado" },
      BANK_SLIP_GENERATED: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "Boleto Gerado" },
      BANK_SLIP_EXPIRED: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Boleto Expirado" },
      SUBSCRIPTION_CANCELED: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Cancelado" },
      SUBSCRIPTION_RENEWED: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Renovado" },
    }
    return configs[event] || { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: event }
  }

  const kirvanoEvents = [
    "SALE_APPROVED",
    "SALE_REFUSED", 
    "SALE_REFUNDED",
    "SALE_CHARGEBACK",
    "PIX_GENERATED",
    "PIX_EXPIRED",
    "BANK_SLIP_GENERATED",
    "BANK_SLIP_EXPIRED",
    "SUBSCRIPTION_CANCELED",
    "SUBSCRIPTION_RENEWED",
  ]

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Configure webhooks e visualize eventos da Kirvano</p>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuracao</TabsTrigger>
            <TabsTrigger value="logs">Logs de Eventos ({logs.length})</TabsTrigger>
            <TabsTrigger value="setup">Como Configurar</TabsTrigger>
          </TabsList>

          {/* Aba de Configuracao */}
          <TabsContent value="config" className="space-y-6">
            {/* URL do Webhook */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>URL do Webhook - Kirvano</CardTitle>
                    <CardDescription>Configure esta URL na sua conta Kirvano para receber eventos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-background border rounded-lg text-sm font-mono">
                    {webhookUrl}
                  </code>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Copie esta URL e configure na Kirvano em: <strong>Integracoes &gt; Webhooks &gt; Criar Webhook</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Webhook className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{webhooks.length}</p>
                      <p className="text-sm text-muted-foreground">Total Webhooks</p>
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
                      <p className="text-2xl font-bold text-green-500">{logs.filter(l => l.event === "SALE_APPROVED").length}</p>
                      <p className="text-sm text-muted-foreground">Vendas Aprovadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-500">{logs.filter(l => l.event.includes("GENERATED")).length}</p>
                      <p className="text-sm text-muted-foreground">Aguardando Pagamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{logs.filter(l => l.event.includes("EXPIRED") || l.event === "SALE_REFUSED").length}</p>
                      <p className="text-sm text-muted-foreground">Perdidos/Expirados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Webhooks Configurados */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Webhooks Configurados</CardTitle>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Webhook</DialogTitle>
                        <DialogDescription>Configure um novo webhook para enviar eventos.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input 
                            value={newWebhook.name} 
                            onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                            placeholder="Nome do webhook"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input 
                            value={newWebhook.url} 
                            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                            placeholder="https://api.exemplo.com/webhook"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Token (opcional)</Label>
                          <Input 
                            type="password"
                            value={newWebhook.token} 
                            onChange={(e) => setNewWebhook({ ...newWebhook, token: e.target.value })}
                            placeholder="Token de autenticacao"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Eventos</Label>
                          <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                            {kirvanoEvents.map(event => (
                              <Badge 
                                key={event}
                                variant={newWebhook.events.includes(event) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => {
                                  if (newWebhook.events.includes(event)) {
                                    setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) })
                                  } else {
                                    setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] })
                                  }
                                }}
                              >
                                {getEventBadge(event).label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
                        <Button onClick={handleAddWebhook}>Adicionar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Eventos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell className="font-medium">{webhook.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded max-w-[250px] truncate">
                              {webhook.url}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(webhook.url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {webhook.events.length} eventos
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(webhook.status).color}>
                            {getStatusBadge(webhook.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleToggleStatus(webhook.id)}
                            >
                              {webhook.status === "active" ? (
                                <XCircle className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Logs */}
          <TabsContent value="logs" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por email, nome ou ID..." 
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os eventos</SelectItem>
                      {kirvanoEvents.map(event => (
                        <SelectItem key={event} value={event}>
                          {getEventBadge(event).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
<Button variant="outline" className="gap-2 bg-transparent" onClick={loadWebhookLogs} disabled={isLoading}>
<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
{isLoading ? "Carregando..." : "Atualizar"}
</Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Logs */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Metodo</TableHead>
                      <TableHead>ID Venda</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum evento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.received_at).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getEventBadge(log.event).color}>
                              {getEventBadge(log.event).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{log.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{log.customer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{log.total_price}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {log.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{log.sale_id}</code>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedLog(log)
                                setShowLogDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Dialog de Detalhes do Log */}
            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes do Evento</DialogTitle>
                  <DialogDescription>Informacoes completas do webhook recebido</DialogDescription>
                </DialogHeader>
                {selectedLog && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Evento</Label>
                        <p className="font-medium">{selectedLog.event_description}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge variant="outline" className={getEventBadge(selectedLog.event).color}>
                          {getEventBadge(selectedLog.event).label}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Cliente</Label>
                        <p className="font-medium">{selectedLog.customer_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedLog.customer_email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Telefone</Label>
                        <p className="font-medium">{selectedLog.customer_phone}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Valor</Label>
                        <p className="font-medium">{selectedLog.total_price}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Metodo de Pagamento</Label>
                        <p className="font-medium">{selectedLog.payment_method}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Tipo</Label>
                        <p className="font-medium">{selectedLog.type === "RECURRING" ? "Assinatura" : "Unico"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">ID da Venda</Label>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{selectedLog.sale_id}</code>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">ID do Checkout</Label>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{selectedLog.checkout_id}</code>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Recebido em</Label>
                      <p className="font-medium">{new Date(selectedLog.received_at).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Aba de Como Configurar */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Configurar o Webhook na Kirvano</CardTitle>
                <CardDescription>Siga os passos abaixo para configurar a integracao</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Acesse sua conta Kirvano</h4>
                      <p className="text-sm text-muted-foreground">
                        Faca login em <a href="https://app.kirvano.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">app.kirvano.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Acesse o menu de Integracoes</h4>
                      <p className="text-sm text-muted-foreground">
                        Va em <strong>Integracoes</strong> &gt; <strong>Webhooks</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Clique em "Criar Webhook"</h4>
                      <p className="text-sm text-muted-foreground">
                        Preencha os campos conforme abaixo
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      4
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Configure os campos</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">Nome</Badge>
                          <span className="text-sm">ScalaZap - Pagamentos</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">URL</Badge>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{webhookUrl}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(webhookUrl)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">Produto</Badge>
                          <span className="text-sm">Selecione os planos do ScalaZap</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">Eventos</Badge>
                          <span className="text-sm">Compra aprovada, Reembolso, Chargeback, Assinatura cancelada</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium">Salve a configuracao</h4>
                      <p className="text-sm text-muted-foreground">
                        Clique em salvar e pronto! Os eventos serao enviados automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert className="border-green-500/30 bg-green-500/5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Apos configurar, todos os eventos de pagamento serao recebidos automaticamente e os usuarios terao acesso liberado instantaneamente apos a confirmacao do pagamento.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos Suportados</CardTitle>
                <CardDescription>Lista de eventos que o sistema processa automaticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {kirvanoEvents.map(event => (
                    <div key={event} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Badge variant="outline" className={getEventBadge(event).color}>
                        {getEventBadge(event).label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{event}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  )
}
