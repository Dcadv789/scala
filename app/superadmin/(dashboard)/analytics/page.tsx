"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar
} from "lucide-react"

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month")

  const metrics = {
    users: { value: 47, change: 12.5, trend: "up" },
    messages: { value: 145832, change: 23.4, trend: "up" },
    revenue: { value: 12847.90, change: 8.7, trend: "up" },
    churn: { value: 2.3, change: -0.5, trend: "down" },
    connections: { value: 23, change: 15.0, trend: "up" },
    campaigns: { value: 156, change: 18.2, trend: "up" },
  }

  const dailyStats = [
    { day: "Seg", users: 12, messages: 4521, revenue: 523.50 },
    { day: "Ter", users: 8, messages: 3892, revenue: 412.30 },
    { day: "Qua", users: 15, messages: 5234, revenue: 687.90 },
    { day: "Qui", users: 11, messages: 4123, revenue: 534.20 },
    { day: "Sex", users: 18, messages: 6789, revenue: 892.40 },
    { day: "Sab", users: 6, messages: 2345, revenue: 234.50 },
    { day: "Dom", users: 4, messages: 1678, revenue: 156.80 },
  ]

  const planDistribution = [
    { plan: "Basico", users: 25, percentage: 53.2 },
    { plan: "Professional", users: 15, percentage: 31.9 },
    { plan: "Ilimitado", users: 7, percentage: 14.9 },
  ]

  const topUsers = [
    { name: "Carlos Lima", messages: 45678, plan: "unlimited" },
    { name: "Joao Silva", messages: 23456, plan: "professional" },
    { name: "Ana Costa", messages: 18901, plan: "professional" },
    { name: "Maria Santos", messages: 12345, plan: "starter" },
    { name: "Pedro Oliveira", messages: 8765, plan: "starter" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Metricas e insights do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-1">
                {metrics.users.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${metrics.users.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {metrics.users.change}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.users.value}</p>
              <p className="text-sm text-muted-foreground">Total de Usuarios</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{metrics.messages.change}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.messages.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Mensagens Enviadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{metrics.revenue.change}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">
                R$ {metrics.revenue.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{Math.abs(metrics.churn.change)}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.churn.value}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Churn</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{metrics.connections.change}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.connections.value}</p>
              <p className="text-sm text-muted-foreground">Conexoes Ativas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{metrics.campaigns.change}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{metrics.campaigns.value}</p>
              <p className="text-sm text-muted-foreground">Campanhas Executadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Diaria</CardTitle>
            <CardDescription>Ultimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyStats.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="w-8 text-sm font-medium">{day.day}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ width: `${(day.messages / 7000) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day.messages.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-500">
                    R$ {day.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao de Planos</CardTitle>
            <CardDescription>Usuarios por plano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((item) => (
                <div key={item.plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.plan}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.users} usuarios ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.plan === "Basico" ? "bg-blue-500" :
                        item.plan === "Professional" ? "bg-purple-500" : "bg-green-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Usuarios por Mensagens</CardTitle>
          <CardDescription>Usuarios mais ativos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div key={user.name} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? "bg-yellow-500" :
                  index === 1 ? "bg-gray-400" :
                  index === 2 ? "bg-orange-600" : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.messages.toLocaleString()} mensagens
                  </p>
                </div>
                <Badge variant="outline">
                  {user.plan === "starter" ? "Basico" : user.plan === "professional" ? "Professional" : "Ilimitado"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
