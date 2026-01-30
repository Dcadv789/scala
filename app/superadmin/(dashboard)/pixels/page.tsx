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
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Plus, Search, CheckCircle, Trash2, Copy, Eye, Facebook, BarChart3, Settings, Zap, ShieldCheck, Info, ExternalLink, RefreshCw, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Suspense } from "react"
import Loading from "./loading"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PixelEvent {
  name: string
  enabled: boolean
  count: number
}

interface Pixel {
  id: string
  name: string
  type: "facebook" | "google" | "tiktok" | "custom"
  pixelId: string
  accessToken: string // Conversion API Token
  testEventCode?: string // For testing
  status: "active" | "inactive"
  events: PixelEvent[]
  conversions: number
  pageViews: number
  createdAt: string
}

const FACEBOOK_EVENTS = [
  { name: "PageView", description: "Visualizacao de pagina" },
  { name: "Lead", description: "Captura de lead" },
  { name: "CompleteRegistration", description: "Cadastro completo" },
  { name: "InitiateCheckout", description: "Inicio de checkout" },
  { name: "Purchase", description: "Compra realizada" },
  { name: "AddToCart", description: "Adicao ao carrinho" },
  { name: "ViewContent", description: "Visualizacao de conteudo" },
  { name: "Subscribe", description: "Assinatura" },
  { name: "Contact", description: "Contato" },
]

const GOOGLE_EVENTS = [
  { name: "page_view", description: "Visualizacao de pagina" },
  { name: "sign_up", description: "Cadastro" },
  { name: "login", description: "Login" },
  { name: "purchase", description: "Compra" },
  { name: "begin_checkout", description: "Inicio de checkout" },
  { name: "add_to_cart", description: "Adicao ao carrinho" },
  { name: "generate_lead", description: "Geracao de lead" },
]

const TIKTOK_EVENTS = [
  { name: "PageView", description: "Visualizacao de pagina" },
  { name: "CompleteRegistration", description: "Cadastro completo" },
  { name: "PlaceAnOrder", description: "Pedido realizado" },
  { name: "CompletePayment", description: "Pagamento completo" },
  { name: "ViewContent", description: "Visualizacao de conteudo" },
  { name: "ClickButton", description: "Clique em botao" },
  { name: "SubmitForm", description: "Envio de formulario" },
]

export default function PixelsPage() {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [search, setSearch] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null)
  const [testingEvent, setTestingEvent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPixel, setNewPixel] = useState({
    name: "",
    type: "facebook" as "facebook" | "google" | "tiktok" | "custom",
    pixelId: "",
    accessToken: "",
    testEventCode: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPixels()
  }, [])

  const loadPixels = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("pixels")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      
      // Mapear dados do banco para o formato esperado
      const mappedPixels: Pixel[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type || "facebook",
        pixelId: p.pixel_id,
        accessToken: p.token || "",
        testEventCode: "",
        status: p.status || "active",
        events: p.events || [],
        conversions: 0,
        pageViews: 0,
        createdAt: p.created_at,
      }))
      
      setPixels(mappedPixels)
    } catch (error) {
      console.error("Erro ao carregar pixels:", error)
      toast({ title: "Erro", description: "Falha ao carregar pixels", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const savePixelToDb = async (pixel: Pixel) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("pixels")
        .upsert({
          id: pixel.id,
          name: pixel.name,
          type: pixel.type,
          pixel_id: pixel.pixelId,
          token: pixel.accessToken,
          status: pixel.status,
          events: pixel.events,
          updated_at: new Date().toISOString(),
        })
      
      if (error) throw error
      return true
    } catch (error) {
      console.error("Erro ao salvar pixel:", error)
      toast({ title: "Erro", description: "Falha ao salvar pixel", variant: "destructive" })
      return false
    } finally {
      setSaving(false)
    }
  }

  const deletePixelFromDb = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pixels")
        .delete()
        .eq("id", id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error("Erro ao deletar pixel:", error)
      toast({ title: "Erro", description: "Falha ao deletar pixel", variant: "destructive" })
      return false
    }
  }

  const getEventsForType = (type: string) => {
    switch (type) {
      case "facebook": return FACEBOOK_EVENTS
      case "google": return GOOGLE_EVENTS
      case "tiktok": return TIKTOK_EVENTS
      default: return FACEBOOK_EVENTS
    }
  }

  const filteredPixels = pixels.filter(px =>
    px.name.toLowerCase().includes(search.toLowerCase()) ||
    px.pixelId.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddPixel = async () => {
    if (!newPixel.name || !newPixel.pixelId) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatorios", variant: "destructive" })
      return
    }

    const events = getEventsForType(newPixel.type).map(e => ({
      name: e.name,
      enabled: ["PageView", "page_view"].includes(e.name),
      count: 0,
    }))

    const pixel: Pixel = {
      id: crypto.randomUUID(),
      name: newPixel.name,
      type: newPixel.type,
      pixelId: newPixel.pixelId,
      accessToken: newPixel.accessToken,
      testEventCode: newPixel.testEventCode,
      status: "active",
      events,
      conversions: 0,
      pageViews: 0,
      createdAt: new Date().toISOString(),
    }

    const success = await savePixelToDb(pixel)
    if (success) {
      setPixels([pixel, ...pixels])
      setShowAddDialog(false)
      setNewPixel({ name: "", type: "facebook", pixelId: "", accessToken: "", testEventCode: "" })
      toast({ title: "Pixel criado", description: "O pixel foi configurado com sucesso." })
    }
  }

  const handleDeletePixel = async (id: string) => {
    const success = await deletePixelFromDb(id)
    if (success) {
      setPixels(pixels.filter(px => px.id !== id))
      toast({ title: "Pixel removido", description: "O pixel foi removido do sistema." })
    }
  }

  const handleToggleStatus = async (id: string) => {
    const pixel = pixels.find(px => px.id === id)
    if (!pixel) return
    
    const updatedPixel = { ...pixel, status: pixel.status === "active" ? "inactive" as const : "active" as const }
    const success = await savePixelToDb(updatedPixel)
    if (success) {
      setPixels(pixels.map(px => px.id === id ? updatedPixel : px))
    }
  }

  const handleToggleEvent = async (pixelId: string, eventName: string) => {
    const pixel = pixels.find(px => px.id === pixelId)
    if (!pixel) return
    
    const updatedPixel = {
      ...pixel,
      events: pixel.events.map(e =>
        e.name === eventName ? { ...e, enabled: !e.enabled } : e
      ),
    }
    const success = await savePixelToDb(updatedPixel)
    if (success) {
      setPixels(pixels.map(px => px.id === pixelId ? updatedPixel : px))
    }
  }

  const handleUpdatePixel = async (updatedPixel: Pixel) => {
    const success = await savePixelToDb(updatedPixel)
    if (success) {
      setPixels(pixels.map(px => px.id === updatedPixel.id ? updatedPixel : px))
      setSelectedPixel(updatedPixel)
      toast({ title: "Pixel atualizado", description: "As configuracoes foram salvas." })
    }
  }

  const handleTestEvent = async (pixel: Pixel, eventName: string) => {
    setTestingEvent(true)

    // Simulate sending test event
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update event count
    setPixels(pixels.map(px =>
      px.id === pixel.id
        ? {
          ...px,
          events: px.events.map(e =>
            e.name === eventName ? { ...e, count: e.count + 1 } : e
          ),
          pageViews: eventName.toLowerCase().includes("page") ? px.pageViews + 1 : px.pageViews,
          conversions: !eventName.toLowerCase().includes("page") ? px.conversions + 1 : px.conversions,
        }
        : px
    ))

    setTestingEvent(false)
    toast({
      title: "Evento de teste enviado",
      description: `${eventName} enviado para ${pixel.name}${pixel.testEventCode ? " (modo teste)" : ""}`,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copiado!", description: "Copiado para a area de transferencia." })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "facebook": return <Facebook className="h-4 w-4 text-blue-500" />
      case "google": return <BarChart3 className="h-4 w-4 text-yellow-500" />
      case "tiktok": return <Code className="h-4 w-4 text-pink-500" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      facebook: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "Facebook" },
      google: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Google" },
      tiktok: { color: "bg-pink-500/10 text-pink-500 border-pink-500/30", label: "TikTok" },
      custom: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Custom" },
    }
    return configs[type] || configs.custom
  }

  const stats = {
    total: pixels.length,
    active: pixels.filter(p => p.status === "active").length,
    totalConversions: pixels.reduce((acc, p) => acc + p.conversions, 0),
    totalPageViews: pixels.reduce((acc, p) => acc + p.pageViews, 0),
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pixels de Rastreamento</h1>
            <p className="text-muted-foreground">Configure pixels com Conversion API para rastreamento de eventos</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Pixel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Pixel com Conversion API</DialogTitle>
                <DialogDescription>Configure um pixel com token de conversao para envio de eventos server-side.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="facebook" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="facebook" onClick={() => setNewPixel({ ...newPixel, type: "facebook" })}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </TabsTrigger>
                  <TabsTrigger value="google" onClick={() => setNewPixel({ ...newPixel, type: "google" })}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Google
                  </TabsTrigger>
                  <TabsTrigger value="tiktok" onClick={() => setNewPixel({ ...newPixel, type: "tiktok" })}>
                    <Code className="h-4 w-4 mr-2" />
                    TikTok
                  </TabsTrigger>
                  <TabsTrigger value="custom" onClick={() => setNewPixel({ ...newPixel, type: "custom" })}>
                    <Settings className="h-4 w-4 mr-2" />
                    Custom
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome do Pixel *</Label>
                    <Input
                      value={newPixel.name}
                      onChange={(e) => setNewPixel({ ...newPixel, name: e.target.value })}
                      placeholder="Ex: Facebook Ads Principal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pixel ID *</Label>
                      <Input
                        value={newPixel.pixelId}
                        onChange={(e) => setNewPixel({ ...newPixel, pixelId: e.target.value })}
                        placeholder={newPixel.type === "facebook" ? "123456789012345" : newPixel.type === "google" ? "G-XXXXXXXXXX" : "Pixel ID"}
                      />
                      <p className="text-xs text-muted-foreground">
                        {newPixel.type === "facebook" && "Encontre em: Gerenciador de Eventos > Fontes de Dados"}
                        {newPixel.type === "google" && "Encontre em: Google Analytics > Admin > Data Streams"}
                        {newPixel.type === "tiktok" && "Encontre em: TikTok Ads Manager > Assets > Events"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Access Token (Conversion API) *
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      </Label>
                      <Input
                        type="password"
                        value={newPixel.accessToken}
                        onChange={(e) => setNewPixel({ ...newPixel, accessToken: e.target.value })}
                        placeholder="Token de acesso para API de conversao"
                      />
                      <p className="text-xs text-muted-foreground">
                        {newPixel.type === "facebook" && "Gere em: Gerenciador de Eventos > Configuracoes > Token de acesso"}
                        {newPixel.type === "google" && "Use a chave de API do Measurement Protocol"}
                        {newPixel.type === "tiktok" && "Gere em: TikTok Events API > Access Token"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Test Event Code (Opcional)
                      <Badge variant="outline" className="text-xs">Modo Teste</Badge>
                    </Label>
                    <Input
                      value={newPixel.testEventCode}
                      onChange={(e) => setNewPixel({ ...newPixel, testEventCode: e.target.value })}
                      placeholder="TEST12345"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use para testar eventos sem afetar suas metricas reais. Encontre no Gerenciador de Eventos {">"} Testar Eventos.
                    </p>
                  </div>

                  <Alert className="bg-blue-500/10 border-blue-500/30">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-500">
                      <strong>Eventos que serao rastreados:</strong> PageView, CompleteRegistration, Lead, Purchase, InitiateCheckout.
                      Voce pode configurar eventos adicionais apos criar o pixel.
                    </AlertDescription>
                  </Alert>
                </div>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
                <Button onClick={handleAddPixel} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Criar Pixel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Code className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Pixels</p>
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
                  <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Conversoes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Eye className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPageViews.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou ID..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pixels Table */}
        <Card>
          <CardContent className="p-0">
            {pixels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Code className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum pixel configurado</h3>
                <p className="text-muted-foreground mb-4">Adicione seu primeiro pixel para comecar a rastrear conversoes.</p>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Pixel
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pixel ID</TableHead>
                    <TableHead>CAPI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Conversoes</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPixels.map((pixel) => (
                    <TableRow key={pixel.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(pixel.type)}
                          <span className="font-medium">{pixel.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeBadge(pixel.type).color}>
                          {getTypeBadge(pixel.type).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{pixel.pixelId}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(pixel.pixelId)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pixel.accessToken ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Nao configurado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={pixel.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-gray-500/10 text-gray-500 border-gray-500/30"}>
                          {pixel.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {pixel.events.filter(e => e.enabled).length} de {pixel.events.length}
                        </span>
                      </TableCell>
                      <TableCell>{pixel.conversions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPixel(pixel)
                              setShowConfigDialog(true)
                            }}
                            title="Configurar eventos"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(pixel.id)}
                            title={pixel.status === "active" ? "Desativar" : "Ativar"}
                          >
                            <CheckCircle className={`h-4 w-4 ${pixel.status === "active" ? "text-green-500" : "text-gray-500"}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePixel(pixel.id)}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Config Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedPixel && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedPixel.type)}
                    Configurar {selectedPixel.name}
                  </DialogTitle>
                  <DialogDescription>
                    Gerencie eventos e configuracoes da Conversion API
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="events" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="events">Eventos</TabsTrigger>
                    <TabsTrigger value="settings">Configuracoes</TabsTrigger>
                    <TabsTrigger value="test">Testar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="events" className="space-y-4 mt-4">
                    <Alert className="bg-blue-500/10 border-blue-500/30">
                      <Info className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="text-sm">
                        Ative os eventos que deseja rastrear. Eventos ativos serao enviados automaticamente via Conversion API.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      {selectedPixel.events.map((event) => {
                        const eventInfo = getEventsForType(selectedPixel.type).find(e => e.name === event.name)
                        return (
                          <div key={event.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={event.enabled}
                                onCheckedChange={() => handleToggleEvent(selectedPixel.id, event.name)}
                              />
                              <div>
                                <p className="font-medium">{event.name}</p>
                                <p className="text-xs text-muted-foreground">{eventInfo?.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">{event.count} envios</span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={testingEvent}
                                onClick={() => handleTestEvent(selectedPixel, event.name)}
                              >
                                {testingEvent ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pixel ID</Label>
                        <div className="flex gap-2">
                          <Input
                            value={selectedPixel.pixelId}
                            onChange={(e) => setSelectedPixel({ ...selectedPixel, pixelId: e.target.value })}
                          />
                          <Button variant="outline" onClick={() => copyToClipboard(selectedPixel.pixelId)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Access Token (Conversion API)
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        </Label>
                        <Input
                          type="password"
                          value={selectedPixel.accessToken}
                          onChange={(e) => setSelectedPixel({ ...selectedPixel, accessToken: e.target.value })}
                          placeholder="Token de acesso"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Test Event Code</Label>
                        <Input
                          value={selectedPixel.testEventCode || ""}
                          onChange={(e) => setSelectedPixel({ ...selectedPixel, testEventCode: e.target.value })}
                          placeholder="TEST12345"
                        />
                        <p className="text-xs text-muted-foreground">
                          Eventos enviados com este codigo aparecerao na aba "Testar Eventos" do Gerenciador.
                        </p>
                      </div>

                      <Button onClick={() => handleUpdatePixel(selectedPixel)} className="w-full">
                        Salvar Configuracoes
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4 mt-4">
                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                      <Info className="h-4 w-4 text-yellow-500" />
                      <AlertDescription>
                        Envie eventos de teste para verificar se sua configuracao esta correta.
                        {selectedPixel.testEventCode && (
                          <span className="block mt-1">
                            <strong>Modo teste ativo:</strong> {selectedPixel.testEventCode}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedPixel.events.filter(e => e.enabled).map((event) => (
                        <Button
                          key={event.name}
                          variant="outline"
                          className="justify-start gap-2 h-auto py-3 bg-transparent"
                          disabled={testingEvent}
                          onClick={() => handleTestEvent(selectedPixel, event.name)}
                        >
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <div className="text-left">
                            <p className="font-medium">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.count} envios</p>
                          </div>
                        </Button>
                      ))}
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <h4 className="font-medium">Como verificar:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Acesse o Gerenciador de Eventos do {selectedPixel.type === "facebook" ? "Facebook" : selectedPixel.type === "google" ? "Google" : "TikTok"}</li>
                        <li>Va para a aba "Testar Eventos"</li>
                        <li>Insira o codigo de teste se necessario</li>
                        <li>Clique em um dos botoes acima para enviar um evento</li>
                        <li>Verifique se o evento aparece na lista</li>
                      </ol>
                      <Button variant="link" className="p-0 h-auto gap-1" asChild>
                        <a
                          href={
                            selectedPixel.type === "facebook"
                              ? "https://business.facebook.com/events_manager"
                              : selectedPixel.type === "google"
                                ? "https://analytics.google.com"
                                : "https://ads.tiktok.com/marketing_api/docs"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Abrir Gerenciador de Eventos
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}
