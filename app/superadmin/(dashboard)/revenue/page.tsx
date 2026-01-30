"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Users, 
  RefreshCw,
  ArrowUpRight,
  Calendar,
  Percent,
  Target
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  assinatura_id: string
  email_usuario: string
  plano: string
  valor: number
  status: string
  metodo_pagamento: string
  criado_em: string
}

interface RevenueStats {
  totalRevenue: number
  pendingRevenue: number
  refundedAmount: number
  mrr: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  totalSubscriptions: number
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    pendingRevenue: 0,
    refundedAmount: 0,
    mrr: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    totalSubscriptions: 0
  })
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadRevenue()
  }, [startDate, endDate])

  const loadRevenue = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/admin/revenue?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setPayments(data.payments || [])
      } else {
        throw new Error(data.error || "Erro ao carregar faturamento")
      }
    } catch (error: any) {
      console.error("Error loading revenue:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao carregar faturamento",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      paid: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Pago" },
      pago: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Pago" },
      pending: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Pendente" },
      pendente: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Pendente" },
      failed: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Falhou" },
      refunded: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Reembolsado" },
      reembolsado: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Reembolsado" },
    }
    return configs[status.toLowerCase()] || configs.pending
  }

  const getPlanoLabel = (plano: string) => {
    // O plano já vem como nome da tabela planos, então só retornar direto
    return plano || "N/A"
  }

  // Calcular LTV e Churn Rate
  const ltv = stats.activeSubscriptions > 0 
    ? (stats.mrr / stats.activeSubscriptions) * 12 
    : 0

  const churnRate = stats.totalSubscriptions > 0
    ? ((stats.cancelledSubscriptions / stats.totalSubscriptions) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Faturamento</h1>
          <p className="text-muted-foreground">Acompanhe a receita e métricas financeiras</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="text-sm whitespace-nowrap">Data Inicial:</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate" className="text-sm whitespace-nowrap">Data Final:</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={loadRevenue}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-green-500">
                R$ {stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                R$ {stats.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">MRR (Receita Recorrente)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                R$ {ltv.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">LTV (Lifetime Value)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Percent className="h-5 w-5 text-red-500" />
              </div>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{churnRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Churn</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <CreditCard className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  R$ {stats.pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.activeSubscriptions}</p>
                <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <Users className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.cancelledSubscriptions}</p>
                <p className="text-sm text-muted-foreground">Cancelamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            {startDate || endDate 
              ? `Pagamentos de ${startDate || "início"} até ${endDate || "hoje"}`
              : "Todas as transações realizadas"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum pagamento encontrado no período selecionado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.email_usuario || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPlanoLabel(payment.plano)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {payment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{payment.metodo_pagamento || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(payment.status).color}>
                        {getStatusBadge(payment.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.criado_em).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
