"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Send, MessageCircle, CheckCircle2 } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { PlanGuard } from "@/components/auth/plan-guard"

const messageData = [
  { date: "01/01", enviadas: 1200, entregues: 1180, lidas: 980 },
  { date: "02/01", enviadas: 1500, entregues: 1470, lidas: 1200 },
  { date: "03/01", enviadas: 1800, entregues: 1750, lidas: 1450 },
  { date: "04/01", enviadas: 2100, entregues: 2050, lidas: 1700 },
  { date: "05/01", enviadas: 1900, entregues: 1860, lidas: 1550 },
  { date: "06/01", enviadas: 2300, entregues: 2250, lidas: 1900 },
  { date: "07/01", enviadas: 2600, entregues: 2540, lidas: 2100 },
]

const campaignPerformance = [
  { name: "Promoção Black Friday", conversao: 8.5 },
  { name: "Lançamento Produto", conversao: 6.2 },
  { name: "Pesquisa Satisfação", conversao: 12.8 },
  { name: "Newsletter Semanal", conversao: 4.3 },
  { name: "Carrinho Abandonado", conversao: 15.2 },
]

const statusDistribution = [
  { name: "Entregues", value: 15240, color: "#10b981" },
  { name: "Lidas", value: 12890, color: "#3b82f6" },
  { name: "Falhas", value: 450, color: "#ef4444" },
  { name: "Pendentes", value: 320, color: "#f59e0b" },
]

function AnalyticsPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                  Analytics
                </h1>
                <p className="text-pretty mt-2 text-sm text-muted-foreground">
                  Análise detalhada do desempenho das suas campanhas
                </p>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Enviado</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28.9K</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+12.5%</span> vs período anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">97.8%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+2.1%</span> vs período anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">82.4%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+5.3%</span> vs período anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">9.2%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+1.8%</span> vs período anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Evolução de Mensagens</CardTitle>
                  <CardDescription>Mensagens enviadas, entregues e lidas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={messageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="enviadas" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="entregues" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="lidas" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Status das Mensagens</CardTitle>
                  <CardDescription>Distribuição atual do status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Campanha</CardTitle>
                <CardDescription>Taxa de conversão das últimas campanhas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversao" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <PlanGuard>
      <AnalyticsPageContent />
    </PlanGuard>
  )
}
