"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  Phone,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface SystemStats {
  // Users
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  usersThisMonth: number
  // Revenue
  totalRevenue: number
  monthlyRevenue: number
  pendingPayments: number
  refunds: number
  // Connections
  totalConnections: number
  activeConnections: number
  // Messages
  totalMessages: number
  messagesThisMonth: number
  // Carts
  abandonedCarts: number
  pendingCarts: number
  // Webhooks
  webhookEvents: number
  // Plans breakdown
  starterUsers: number
  professionalUsers: number
  unlimitedUsers: number
}

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  plan: string
  planStatus: string
  createdAt: string
}

interface WebhookLog {
  id: string
  event: string
  status: string
  email?: string
  amount?: number
  createdAt: string
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    usersThisMonth: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    refunds: 0,
    totalConnections: 0,
    activeConnections: 0,
    totalMessages: 0,
    messagesThisMonth: 0,
    abandonedCarts: 0,
    pendingCarts: 0,
    webhookEvents: 0,
    starterUsers: 0,
    professionalUsers: 0,
    unlimitedUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<UserData[]>([])
  const [recentWebhooks, setRecentWebhooks] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadRealData = () => {
    setLoading(true)

    // Load ALL users from admin list first (primary source)
    const adminUsers = localStorage.getItem("scalazap_admin_users")
    let allUsers: UserData[] = []
    
    if (adminUsers) {
      try {
        allUsers = JSON.parse(adminUsers)
      } catch (e) {
        console.error("Error parsing admin users:", e)
        allUsers = []
      }
    }
    
    // Check if current logged user exists and update/add them
    const currentUser = localStorage.getItem("scalazap_user")
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        const userData: UserData = {
          id: user.id || Date.now().toString(),
          name: user.name || "Usuario",
          email: user.email || "",
          phone: user.phone || "",
          plan: user.plan || "starter",
          planStatus: user.planStatus || "pending",
          createdAt: user.createdAt || new Date().toISOString(),
        }
        
        const existingIndex = allUsers.findIndex(u => u.email === userData.email)
        if (existingIndex >= 0) {
          allUsers[existingIndex] = { ...allUsers[existingIndex], ...userData }
        } else if (userData.email) {
          allUsers.unshift(userData)
        }
      } catch (e) {
        console.error("Error parsing user:", e)
      }
    }

    // Get webhook logs
    const webhookLogs = localStorage.getItem("scalazap_webhook_logs")
    let parsedWebhooks: WebhookLog[] = []
    if (webhookLogs) {
      try {
        parsedWebhooks = JSON.parse(webhookLogs)
      } catch (e) {
        console.error("Error parsing webhook logs:", e)
      }
    }
    
    // Get pixels
    const pixelsData = localStorage.getItem("scalazap_pixels")

    // Get connections
    const connections = localStorage.getItem("scalazap_connections")
    let parsedConnections: any[] = []
    if (connections) {
      try {
        parsedConnections = JSON.parse(connections)
      } catch (e) {
        console.error("Error parsing connections:", e)
      }
    }

    // Get message logs
    const messageLogs = localStorage.getItem("scalazap_message_logs")
    let parsedMessages: any[] = []
    if (messageLogs) {
      try {
        parsedMessages = JSON.parse(messageLogs)
      } catch (e) {
        console.error("Error parsing messages:", e)
      }
    }

    // Get abandoned carts (pending payments from webhook)
    const abandonedCarts = parsedWebhooks.filter(w => 
      w.event === "PIX_GENERATED" || w.event === "BILLET_GENERATED" || w.event === "SALE_PENDING"
    )

    // Calculate stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeUsers = allUsers.filter(u => u.planStatus === "active")
    const pendingUsers = allUsers.filter(u => u.planStatus === "pending" || !u.planStatus)
    const usersThisMonth = allUsers.filter(u => new Date(u.createdAt) >= startOfMonth)

    // Plan breakdown
    const starterUsers = allUsers.filter(u => u.plan === "starter").length
    const professionalUsers = allUsers.filter(u => u.plan === "professional").length
    const unlimitedUsers = allUsers.filter(u => u.plan === "unlimited").length

    // Calculate revenue from successful webhooks
    const approvedPayments = parsedWebhooks.filter(w => 
      w.event === "SALE_APPROVED" || w.event === "SUBSCRIPTION_RENEWED"
    )
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const monthlyPayments = approvedPayments.filter(p => new Date(p.createdAt) >= startOfMonth)
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Refunds
    const refunds = parsedWebhooks.filter(w => w.event === "SALE_REFUNDED").length

    // Active connections
    const activeConnections = parsedConnections.filter(c => c.status === "connected")

    // Messages this month
    const messagesThisMonth = parsedMessages.filter(m => new Date(m.sentAt) >= startOfMonth)

    setStats({
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      pendingUsers: pendingUsers.length,
      usersThisMonth: usersThisMonth.length,
      totalRevenue: totalRevenue / 100, // Convert from cents
      monthlyRevenue: monthlyRevenue / 100,
      pendingPayments: pendingUsers.length,
      refunds,
      totalConnections: parsedConnections.length,
      activeConnections: activeConnections.length,
      totalMessages: parsedMessages.length,
      messagesThisMonth: messagesThisMonth.length,
      abandonedCarts: abandonedCarts.length,
      pendingCarts: abandonedCarts.length,
      webhookEvents: parsedWebhooks.length,
      starterUsers,
      professionalUsers,
      unlimitedUsers,
    })

    setRecentUsers(allUsers.slice(-10).reverse())
    setRecentWebhooks(parsedWebhooks.slice(-5).reverse())
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadRealData()
    // Auto refresh every 30 seconds
    const interval = setInterval(loadRealData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getPlanPrice = (plan: string): number => {
    switch (plan) {
      case "starter": return 97.90
      case "professional": return 127.90
      case "unlimited": return 197.90
      default: return 0
    }
  }

  const calculateMRR = (): number => {
    return (
      stats.starterUsers * 97.90 +
      stats.professionalUsers * 127.90 +
      stats.unlimitedUsers * 197.90
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "pending": return "bg-yellow-500"
      case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getEventIcon = (event: string) => {
    if (event.includes("APPROVED") || event.includes("RENEWED")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (event.includes("REFUNDED") || event.includes("CANCELLED")) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (event.includes("PENDING") || event.includes("GENERATED")) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    return <AlertCircle className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Dados em tempo real do sistema - Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <Button onClick={loadRealData} disabled={loading} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              {stats.usersThisMonth > 0 && (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total de Usuarios</p>
              <p className="text-xs text-green-500 mt-1">
                +{stats.usersThisMonth} este mes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                R$ {calculateMRR().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">MRR Potencial</p>
              <p className="text-xs text-foreground/60 mt-1">
                {stats.activeUsers} assinantes ativos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Phone className="h-5 w-5 text-purple-500" />
              </div>
              {stats.activeConnections > 0 && (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {stats.activeConnections}/{stats.totalConnections}
              </p>
              <p className="text-sm text-muted-foreground">Conexoes Ativas</p>
              <p className="text-xs text-foreground/60 mt-1">
                {stats.totalConnections > 0 
                  ? `${Math.round((stats.activeConnections / stats.totalConnections) * 100)}% online`
                  : "Nenhuma conexao"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <MessageSquare className="h-5 w-5 text-orange-500" />
              </div>
              {stats.messagesThisMonth > 0 && (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Mensagens Enviadas</p>
              <p className="text-xs text-foreground/60 mt-1">
                {stats.messagesThisMonth.toLocaleString()} este mes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial & Users Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Resumo Financeiro
            </CardTitle>
            <CardDescription>Receita e pagamentos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground">Receita Confirmada</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pendingPayments}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Distribuicao por Plano</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Basico (R$ 97,90)</span>
                  </div>
                  <span className="font-medium">{stats.starterUsers} usuarios</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Professional (R$ 127,90)</span>
                  </div>
                  <span className="font-medium">{stats.professionalUsers} usuarios</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Ilimitado (R$ 197,90)</span>
                  </div>
                  <span className="font-medium">{stats.unlimitedUsers} usuarios</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Carrinhos Abandonados</span>
                <span className="font-medium text-red-500">{stats.abandonedCarts}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Reembolsos</span>
                <span className="font-medium text-red-500">{stats.refunds}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Eventos de Webhook</span>
                <span className="font-medium">{stats.webhookEvents}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Usuarios Recentes
            </CardTitle>
            <CardDescription>Ultimos usuarios cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "Usuario"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline"
                        className={
                          user.plan === "unlimited" ? "border-green-500 text-green-500" :
                          user.plan === "professional" ? "border-purple-500 text-purple-500" :
                          "border-blue-500 text-blue-500"
                        }
                      >
                        {user.plan === "unlimited" ? "Ilimitado" :
                         user.plan === "professional" ? "Professional" : "Basico"}
                      </Badge>
                      <p className={`text-xs mt-1 ${
                        user.planStatus === "active" ? "text-green-500" : "text-yellow-500"
                      }`}>
                        {user.planStatus === "active" ? "Ativo" : "Pendente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Nenhum usuario cadastrado ainda</p>
                <p className="text-sm">Os usuarios aparecerao aqui quando se cadastrarem</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Ativos</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 
                    ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% do total`
                    : "0% do total"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Pagamento</p>
                <p className="text-2xl font-bold">{stats.pendingUsers}</p>
                <p className="text-xs text-yellow-500">Enviar lembrete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <ShoppingCart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carrinhos Abandonados</p>
                <p className="text-2xl font-bold">{stats.abandonedCarts}</p>
                <p className="text-xs text-red-500">Recuperar vendas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Webhooks */}
      {recentWebhooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Ultimos Eventos (Webhooks Kirvano)
            </CardTitle>
            <CardDescription>Eventos recebidos da plataforma de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentWebhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    {getEventIcon(webhook.event)}
                    <div>
                      <p className="font-medium text-sm">{webhook.event}</p>
                      <p className="text-xs text-muted-foreground">{webhook.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {webhook.amount && (
                      <p className="font-medium text-green-500">
                        R$ {(webhook.amount / 100).toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(webhook.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
