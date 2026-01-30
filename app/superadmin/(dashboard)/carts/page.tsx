"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, DollarSign, Clock, CheckCircle, XCircle, Send, TrendingUp, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

interface AbandonedCart {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  plan: string
  amount: number
  status: "abandoned" | "recovered" | "expired" | "contacted"
  abandonedAt: string
  lastContactAt?: string
  recoveryAttempts: number
}

export default function CartsPage() {
  const searchParams = useSearchParams()
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadCarts()
  }, [])

  const loadCarts = () => {
    // Load from saved carts or from webhook events (PIX_GENERATED, BILLET_GENERATED, SALE_PENDING)
    const savedCarts = localStorage.getItem("scalazap_abandoned_carts")
    const webhookLogs = localStorage.getItem("scalazap_webhook_logs")
    
    let allCarts: AbandonedCart[] = []
    
    // Load saved carts
    if (savedCarts) {
      try {
        allCarts = JSON.parse(savedCarts)
      } catch (e) {}
    }
    
    // Add carts from webhook events (pending payments)
    if (webhookLogs) {
      try {
        const logs = JSON.parse(webhookLogs)
        const pendingEvents = logs.filter((l: any) => 
          l.event === "PIX_GENERATED" || l.event === "BILLET_GENERATED" || l.event === "SALE_PENDING"
        )
        
        pendingEvents.forEach((event: any) => {
          // Check if this cart is not already recovered (has SALE_APPROVED)
          const isRecovered = logs.some((l: any) => 
            l.event === "SALE_APPROVED" && l.email === event.email
          )
          
          if (!allCarts.find(c => c.userEmail === event.email)) {
            const plan = event.productName?.toLowerCase().includes("ilimitado") ? "unlimited" :
                        event.productName?.toLowerCase().includes("professional") ? "professional" : "starter"
            
            allCarts.push({
              id: event.id || Date.now().toString(),
              userId: event.customerId || "unknown",
              userName: event.customerName || "Usuario",
              userEmail: event.email || "",
              userPhone: event.phone || "",
              plan,
              amount: (event.amount || 0) / 100,
              status: isRecovered ? "recovered" : "abandoned",
              abandonedAt: event.createdAt || new Date().toISOString(),
              recoveryAttempts: 0,
            })
          }
        })
      } catch (e) {}
    }
    
    // Also check pending users (registered but not paid)
    const adminUsers = localStorage.getItem("scalazap_admin_users")
    if (adminUsers) {
      try {
        const users = JSON.parse(adminUsers)
        const pendingUsers = users.filter((u: any) => u.planStatus === "pending")
        
        pendingUsers.forEach((user: any) => {
          if (!allCarts.find(c => c.userEmail === user.email)) {
            const price = user.plan === "unlimited" ? 49.90 :
                         user.plan === "professional" ? 39.90 : 29.90
            
            allCarts.push({
              id: user.id,
              userId: user.id,
              userName: user.name || "Usuario",
              userEmail: user.email || "",
              userPhone: user.phone || "",
              plan: user.plan || "starter",
              amount: price,
              status: "abandoned",
              abandonedAt: user.createdAt || new Date().toISOString(),
              recoveryAttempts: 0,
            })
          }
        })
      } catch (e) {}
    }
    
    setCarts(allCarts)
    localStorage.setItem("scalazap_abandoned_carts", JSON.stringify(allCarts))
  }

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = cart.userName.toLowerCase().includes(search.toLowerCase()) ||
                          cart.userEmail.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || cart.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSendRecovery = (cartId: string) => {
    setCarts(carts.map(cart => 
      cart.id === cartId ? { 
        ...cart, 
        status: "contacted" as const, 
        lastContactAt: new Date().toISOString(),
        recoveryAttempts: cart.recoveryAttempts + 1
      } : cart
    ))
    toast({ title: "Mensagem enviada", description: "Mensagem de recuperacao enviada com sucesso." })
  }

  const handleMarkRecovered = (cartId: string) => {
    setCarts(carts.map(cart => 
      cart.id === cartId ? { ...cart, status: "recovered" as const } : cart
    ))
    toast({ title: "Carrinho recuperado", description: "O carrinho foi marcado como recuperado." })
  }

  const stats = {
    total: carts.length,
    abandoned: carts.filter(c => c.status === "abandoned").length,
    contacted: carts.filter(c => c.status === "contacted").length,
    recovered: carts.filter(c => c.status === "recovered").length,
    totalValue: carts.filter(c => c.status === "abandoned" || c.status === "contacted").reduce((acc, c) => acc + c.amount, 0),
    recoveredValue: carts.filter(c => c.status === "recovered").reduce((acc, c) => acc + c.amount, 0),
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      abandoned: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Abandonado" },
      contacted: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Contatado" },
      recovered: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Recuperado" },
      expired: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Expirado" },
    }
    return configs[status] || configs.abandoned
  }

  const getTimeSinceAbandoned = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h atras`
    const days = Math.floor(hours / 24)
    return `${days}d atras`
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carrinhos Abandonados</h1>
            <p className="text-muted-foreground">Recupere vendas perdidas</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ShoppingCart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{stats.abandoned}</p>
                  <p className="text-sm text-muted-foreground">Abandonados</p>
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
                  <p className="text-2xl font-bold text-yellow-500">{stats.contacted}</p>
                  <p className="text-sm text-muted-foreground">Aguardando</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">{stats.recovered}</p>
                  <p className="text-sm text-muted-foreground">Recuperados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor a Recuperar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recovery Stats */}
        <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Valor Recuperado</p>
                  <p className="text-3xl font-bold text-green-500">
                    R$ {stats.recoveredValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Taxa de Recuperacao</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.total > 0 ? ((stats.recovered / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nome ou email..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="abandoned">Abandonados</SelectItem>
                  <SelectItem value="contacted">Contatados</SelectItem>
                  <SelectItem value="recovered">Recuperados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Carts Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cart.userName}</p>
                        <p className="text-sm text-muted-foreground">{cart.userEmail}</p>
                        {cart.userPhone && (
                          <p className="text-xs text-muted-foreground">{cart.userPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cart.plan === "starter" ? "Basico" : cart.plan === "professional" ? "Professional" : "Ilimitado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {cart.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(cart.status).color}>
                        {getStatusBadge(cart.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getTimeSinceAbandoned(cart.abandonedAt)}
                      </span>
                    </TableCell>
                    <TableCell>{cart.recoveryAttempts}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {cart.status !== "recovered" && cart.status !== "expired" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="gap-1 text-blue-500"
                              onClick={() => handleSendRecovery(cart.id)}
                            >
                              <Send className="h-3 w-3" />
                              Enviar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="gap-1 text-green-500"
                              onClick={() => handleMarkRecovered(cart.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Recuperado
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}
