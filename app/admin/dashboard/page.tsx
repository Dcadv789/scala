"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, CreditCard, MessageSquare, TrendingUp, Search, LogOut, 
  Edit, Trash2, Ban, CheckCircle, Eye, Download, RefreshCw,
  DollarSign, Calendar, Mail, Phone, Shield, Settings, BarChart3
} from "lucide-react"
import { getCurrentUser, getUsers, getPayments, updateUser, deleteUser, logout } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"

export default function AdminDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlan, setFilterPlan] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "admin") {
      router.push("/admin/login")
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = () => {
    setUsers(getUsers())
    setPayments(getPayments())
  }

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const handleUpdateUser = (userId: string, updates: any) => {
    updateUser(userId, updates)
    loadData()
    setEditDialogOpen(false)
    toast({ title: "Usuario atualizado", description: "As alteracoes foram salvas." })
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuario?")) {
      deleteUser(userId)
      loadData()
      toast({ title: "Usuario excluido", description: "O usuario foi removido do sistema." })
    }
  }

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active"
    updateUser(userId, { subscriptionStatus: newStatus })
    loadData()
    toast({ 
      title: newStatus === "active" ? "Usuario ativado" : "Usuario suspenso",
      description: `O status foi alterado para ${newStatus === "active" ? "ativo" : "suspenso"}.`
    })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan
    const matchesStatus = filterStatus === "all" || user.subscriptionStatus === filterStatus
    return matchesSearch && matchesPlan && matchesStatus
  })

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.subscriptionStatus === "active").length,
    totalRevenue: payments.filter(p => p.status === "confirmed").reduce((acc, p) => acc + (p.amount || 0), 0),
    pendingPayments: payments.filter(p => p.status === "pending").length
  }

  if (!currentUser) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/zap-logo.png" alt="ScalaZap" width={120} height={40} className="object-contain" />
            <Badge variant="destructive" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Ola, {currentUser.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total de Usuarios</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Usuarios Ativos</p>
                  <p className="text-3xl font-bold text-green-500">{stats.activeUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Receita Total</p>
                  <p className="text-3xl font-bold text-emerald-500">
                    R$ {stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pagamentos Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.pendingPayments}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-green-600">
              <Users className="h-4 w-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-green-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatorios
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-600">
              <Settings className="h-4 w-4 mr-2" />
              Configuracoes
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-white">Gerenciar Usuarios</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Select value={filterPlan} onValueChange={setFilterPlan}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Planos</SelectItem>
                        <SelectItem value="starter">Basico</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="enterprise">Ilimitado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={loadData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Usuario</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">Plano</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Cadastro</TableHead>
                        <TableHead className="text-slate-400 text-right">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-700">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-xs text-slate-400">
                                  {user.role === "admin" ? "Administrador" : "Usuario"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={
                              user.plan === "enterprise" ? "default" :
                              user.plan === "professional" ? "secondary" : "outline"
                            } className={
                              user.plan === "enterprise" ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                              user.plan === "professional" ? "bg-blue-600" : ""
                            }>
                              {user.plan === "enterprise" ? "Ilimitado" :
                               user.plan === "professional" ? "Profissional" : "Basico"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              user.subscriptionStatus === "active" ? "default" :
                              user.subscriptionStatus === "pending" ? "secondary" :
                              "destructive"
                            } className={user.subscriptionStatus === "active" ? "bg-green-600" : ""}>
                              {user.subscriptionStatus === "active" ? "Ativo" :
                               user.subscriptionStatus === "pending" ? "Pendente" :
                               user.subscriptionStatus === "suspended" ? "Suspenso" : "Cancelado"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                setEditDialogOpen(open)
                                if (open) setSelectedUser(user)
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700">
                                  <DialogHeader>
                                    <DialogTitle>Editar Usuario</DialogTitle>
                                  </DialogHeader>
                                  {selectedUser && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Nome</Label>
                                        <Input
                                          value={selectedUser.name || ""}
                                          onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                                          className="bg-slate-700 border-slate-600"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                          value={selectedUser.email || ""}
                                          onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                                          className="bg-slate-700 border-slate-600"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Plano</Label>
                                        <Select
                                          value={selectedUser.plan}
                                          onValueChange={(value) => setSelectedUser({...selectedUser, plan: value})}
                                        >
                                          <SelectTrigger className="bg-slate-700 border-slate-600">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="starter">Basico - R$ 79,90</SelectItem>
                                            <SelectItem value="professional">Profissional - R$ 127,90</SelectItem>
                                            <SelectItem value="enterprise">Ilimitado - R$ 197,90</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                          value={selectedUser.subscriptionStatus}
                                          onValueChange={(value) => setSelectedUser({...selectedUser, subscriptionStatus: value})}
                                        >
                                          <SelectTrigger className="bg-slate-700 border-slate-600">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="active">Ativo</SelectItem>
                                            <SelectItem value="pending">Pendente</SelectItem>
                                            <SelectItem value="suspended">Suspenso</SelectItem>
                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => handleUpdateUser(selectedUser.id, selectedUser)}
                                      >
                                        Salvar Alteracoes
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleUserStatus(user.id, user.subscriptionStatus)}
                              >
                                {user.subscriptionStatus === "active" ? (
                                  <Ban className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.role === "admin"}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Historico de Pagamentos</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">ID</TableHead>
                        <TableHead className="text-slate-400">Usuario</TableHead>
                        <TableHead className="text-slate-400">Plano</TableHead>
                        <TableHead className="text-slate-400">Valor</TableHead>
                        <TableHead className="text-slate-400">Metodo</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                            Nenhum pagamento registrado ainda.
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id} className="border-slate-700">
                            <TableCell className="font-mono text-xs text-slate-400">
                              {payment.id?.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="text-white">{payment.userName || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payment.plan === "enterprise" ? "Ilimitado" :
                                 payment.plan === "professional" ? "Profissional" : "Basico"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-emerald-500 font-medium">
                              R$ {(payment.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {payment.method === "pix" ? "PIX" : "Cartao"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                payment.status === "confirmed" ? "default" :
                                payment.status === "pending" ? "secondary" : "destructive"
                              } className={payment.status === "confirmed" ? "bg-green-600" : ""}>
                                {payment.status === "confirmed" ? "Confirmado" :
                                 payment.status === "pending" ? "Pendente" : "Falhou"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("pt-BR") : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Distribuicao de Planos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["starter", "professional", "enterprise"].map((plan) => {
                      const count = users.filter(u => u.plan === plan).length
                      const percentage = users.length > 0 ? (count / users.length) * 100 : 0
                      return (
                        <div key={plan} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">
                              {plan === "enterprise" ? "Ilimitado" :
                               plan === "professional" ? "Profissional" : "Basico"}
                            </span>
                            <span className="text-slate-400">{count} usuarios ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                plan === "enterprise" ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                                plan === "professional" ? "bg-blue-500" : "bg-green-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Receita por Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { plan: "starter", price: 79.90, label: "Basico" },
                      { plan: "professional", price: 127.90, label: "Profissional" },
                      { plan: "enterprise", price: 197.90, label: "Ilimitado" }
                    ].map(({ plan, price, label }) => {
                      const count = users.filter(u => u.plan === plan && u.subscriptionStatus === "active").length
                      const revenue = count * price
                      return (
                        <div key={plan} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">{label}</p>
                            <p className="text-sm text-slate-400">{count} assinaturas ativas</p>
                          </div>
                          <p className="text-lg font-bold text-emerald-500">
                            R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configuracoes do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Precos dos Planos</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Plano Basico</span>
                        <span className="font-bold text-white">R$ 79,90/mes</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Plano Profissional</span>
                        <span className="font-bold text-white">R$ 127,90/mes</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Plano Ilimitado</span>
                        <span className="font-bold text-white">R$ 197,90/mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Integracao EFI</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Status</span>
                        <Badge className="bg-green-600">Conectado</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-slate-300">Ambiente</span>
                        <Badge variant="outline">Producao</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
