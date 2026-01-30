"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { updateCampaign, addCampaign, deleteCampaign } from "@/api/campaigns"

interface Campaign {
  id: string
  name: string
  status: "draft" | "scheduled" | "sending" | "running" | "paused" | "completed" | "failed"
  recipients: number
  sent: number
  delivered: number
  read_count: number
  failed: number
  template_name?: string
  created_at: string
  started_at?: string
  completed_at?: string
  connections?: { name: string; phone: string; display_phone_number: string }
}

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [startingCampaign, setStartingCampaign] = useState<string | null>(null)
  const { toast } = useToast()

  const loadCampaigns = async () => {
    try {
      console.log("[CampaignList] ====== Carregando campanhas ======")
      setLoading(true)
      
      // Verificar dados do usuário no localStorage
      const userJson = localStorage.getItem("scalazap_user")
      if (userJson) {
        const userData = JSON.parse(userJson)
        console.log("[CampaignList] Dados do usuário:", {
          id: userData.id,
          email: userData.email,
          id_empresa: userData.id_empresa
        })
      }
      
      const { authFetch } = await import("@/lib/auth-fetch")
      const response = await authFetch("/api/campaigns")
      
      console.log("[CampaignList] Status da resposta:", response.status, response.statusText)
      
      if (!response.ok) {
        console.error("[CampaignList] ❌ Erro HTTP:", response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error("[CampaignList] Erro ao carregar campanhas:", errorData)
        setCampaigns([])
        return
      }
      
      const data = await response.json()
      console.log("[CampaignList] Resposta da API:", {
        success: data.success,
        campaignsCount: data.campaigns?.length || 0,
        error: data.error
      })
      
      if (data.success) {
        const campaignsList = data.campaigns || []
        setCampaigns(campaignsList)
        console.log("[CampaignList] ✅ Campanhas carregadas:", campaignsList.length)
        if (campaignsList.length > 0) {
          console.log("[CampaignList] Primeira campanha:", {
            id: campaignsList[0].id,
            name: campaignsList[0].name,
            status: campaignsList[0].status
          })
        } else {
          console.log("[CampaignList] Nenhuma campanha encontrada para esta empresa")
        }
      } else {
        console.error("[CampaignList] ❌ Erro ao carregar campanhas:", data.error)
        setCampaigns([])
      }
    } catch (error) {
      console.error("[CampaignList] ❌ Erro ao carregar campanhas:", error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()

    // Ouvir evento de recarregar campanhas
    const handleReload = () => {
      console.log("[CampaignList] Evento de recarregar recebido")
      loadCampaigns()
    }

    window.addEventListener("campaigns-reload", handleReload)
    return () => {
      window.removeEventListener("campaigns-reload", handleReload)
    }
  }, [])

  const handleStartCampaign = async (campaignId: string) => {
    setStartingCampaign(campaignId)
    try {
      const response = await fetch("/api/campaigns/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId })
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Disparo iniciado!",
          description: data.message,
        })
        loadCampaigns()
      } else {
        toast({
          title: "Erro ao iniciar disparo",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao iniciar o disparo",
        variant: "destructive",
      })
    } finally {
      setStartingCampaign(null)
    }
  }

  const handlePause = async (campaignId: string) => {
    // Implement pause functionality here
  }

  const handleResume = async (campaignId: string) => {
    // Implement resume functionality here
  }

  const handleDuplicate = async (campaign: Campaign) => {
    // Implement duplicate functionality here
  }

  const handleDelete = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: "DELETE"
      })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Campanha excluída",
          description: "A campanha foi excluída com sucesso.",
        })
        loadCampaigns()
      } else {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir campanha",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Campaign["status"]) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: "Rascunho", className: "bg-gray-500/10 text-gray-500" },
      scheduled: { label: "Agendada", className: "bg-blue-500/10 text-blue-500" },
      sending: { label: "Enviando", className: "bg-emerald-500/10 text-emerald-500" },
      running: { label: "Em Execução", className: "bg-green-500/10 text-green-500" },
      paused: { label: "Pausada", className: "bg-yellow-500/10 text-yellow-500" },
      completed: { label: "Concluída", className: "bg-purple-500/10 text-purple-500" },
      failed: { label: "Falhou", className: "bg-red-500/10 text-red-500" },
    }

    const config = statusConfig[status] || statusConfig.draft
    return <Badge className={cn("font-medium", config.className)}>{config.label}</Badge>
  }

  const getProgress = (campaign: Campaign) => {
    if (campaign.recipients === 0) return 0
    return (campaign.sent / campaign.recipients) * 100
  }

  const getDeliveryRate = (campaign: Campaign) => {
    if (campaign.sent === 0) return 0
    return ((campaign.delivered / campaign.sent) * 100).toFixed(1)
  }

  const getReadRate = (campaign: Campaign) => {
    if (campaign.delivered === 0) return 0
    return ((campaign.read_count / campaign.delivered) * 100).toFixed(1)
  }

  // Calcular contagens por status
  const getStatusCount = (status: string) => {
    if (status === "all") {
      return campaigns.length
    }
    if (status === "running") {
      // Incluir tanto "running" quanto "sending"
      return campaigns.filter(c => c.status === "running" || c.status === "sending").length
    }
    return campaigns.filter(c => (c.status || "draft") === status).length
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    // Mapear status para corresponder aos filtros
    let campaignStatus = campaign.status || "draft"
    
    // Mapear "running" para "sending" se necessário
    if (statusFilter === "running" && (campaignStatus === "running" || campaignStatus === "sending")) {
      return matchesSearch
    }
    
    const matchesStatus = statusFilter === "all" || campaignStatus === statusFilter
    return matchesSearch && matchesStatus
  })
  
  console.log("[CampaignList] Filtros aplicados:", {
    totalCampaigns: campaigns.length,
    filteredCampaigns: filteredCampaigns.length,
    statusFilter,
    searchQuery
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({getStatusCount("all")})
          </TabsTrigger>
          <TabsTrigger value="running">
            Em Execução ({getStatusCount("running")})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Agendadas ({getStatusCount("scheduled")})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({getStatusCount("completed")})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Rascunhos ({getStatusCount("draft")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Carregando campanhas...</p>
              </CardContent>
            </Card>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {campaigns.length === 0
                    ? "Nenhuma campanha criada ainda. Clique em 'Nova Campanha' para começar."
                    : `Nenhuma campanha encontrada${statusFilter !== "all" ? ` com status "${statusFilter}"` : ""}${searchQuery ? ` para "${searchQuery}"` : ""}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.connections?.name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(campaign.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {(campaign.status === "draft" || campaign.status === "scheduled") && (
                            <DropdownMenuItem 
                              onClick={() => handleStartCampaign(campaign.id)}
                              disabled={startingCampaign === campaign.id}
                            >
                              {startingCampaign === campaign.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="mr-2 h-4 w-4" />
                              )}
                              Iniciar Disparo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Ver Relatório
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(campaign.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Destinatários</p>
                      <p className="text-2xl font-semibold">{campaign.recipients.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Enviados</p>
                      <p className="text-2xl font-semibold">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                      <p className="text-2xl font-semibold">{getDeliveryRate(campaign)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Taxa de Leitura</p>
                      <p className="text-2xl font-semibold">{getReadRate(campaign)}%</p>
                    </div>
                  </div>

                  {(campaign.status === "running" || campaign.status === "sending") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{getProgress(campaign).toFixed(1)}%</span>
                      </div>
                      <Progress value={getProgress(campaign)} className="h-2" />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">
                        Entregues: <span className="font-medium text-foreground">{campaign.delivered}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">
                        Falhas: <span className="font-medium text-foreground">{campaign.failed}</span>
                      </span>
                    </div>
                    {campaign.started_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">
                          Agendado para:{" "}
                          <span className="font-medium text-foreground">
                            {new Date(campaign.started_at).toLocaleString("pt-BR")}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
