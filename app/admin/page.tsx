"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAdmin, getAllUsers, getPayments, getCampaigns, getStats } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, DollarSign, MessageSquare, ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatBRL } from "@/lib/pagarme"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/dashboard")
    } else {
      const allUsers = getAllUsers()
      const allPayments = getPayments()
      const systemStats = getStats()
      const campaigns = getCampaigns()

      setUsers(allUsers)
      setPayments(allPayments)
      setStats({
        ...systemStats,
        totalUsers: allUsers.length,
        activeSubscriptions: allUsers.filter((u) => u.subscriptionStatus === "active").length,
        totalRevenue: allPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
        totalCampaigns: campaigns.length,
      })
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie usuários, pagamentos e monitore o sistema</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.activeSubscriptions || 0} assinaturas ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas Criadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">Total no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSent || 0}</div>
              <p className="text-xs text-muted-foreground">Taxa de entrega: {stats?.deliveryRate}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>Lista de todos os usuários e suas assinaturas</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum usuário cadastrado ainda</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.plan === "enterprise" ? "default" : "secondary"}>
                          {user.plan === "starter" && "Starter"}
                          {user.plan === "pro" && "Pro"}
                          {user.plan === "enterprise" && "Enterprise"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscriptionStatus === "active" ? "default" : "destructive"}>
                          {user.subscriptionStatus === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "destructive" : "outline"}>
                          {user.role === "admin" ? "Admin" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos</CardTitle>
            <CardDescription>Transações recentes via Pagar.me</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum pagamento registrado ainda</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 10).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payment.plan}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatBRL(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "paid"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {payment.status === "paid" && "Pago"}
                          {payment.status === "pending" && "Pendente"}
                          {payment.status === "failed" && "Falhou"}
                          {payment.status === "refunded" && "Reembolsado"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
