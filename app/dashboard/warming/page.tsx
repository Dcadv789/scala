"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Flame, Play, Pause, TrendingUp, Shield, Clock, Zap } from "lucide-react"

export default function WarmingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [warmingActive, setWarmingActive] = useState(true)

  const warmingProfiles = [
    {
      id: "1",
      name: "WhatsApp Vendas 1",
      phone: "+55 11 99999-1111",
      status: "active",
      progress: 65,
      day: 13,
      totalDays: 21,
      messagesSent: 325,
      messagesLimit: 500,
      health: "good",
    },
    {
      id: "2",
      name: "WhatsApp Suporte",
      phone: "+55 11 99999-2222",
      status: "active",
      progress: 45,
      day: 9,
      totalDays: 21,
      messagesSent: 180,
      messagesLimit: 400,
      health: "excellent",
    },
    {
      id: "3",
      name: "WhatsApp Marketing",
      phone: "+55 11 99999-3333",
      status: "paused",
      progress: 30,
      day: 6,
      totalDays: 21,
      messagesSent: 90,
      messagesLimit: 300,
      health: "good",
    },
  ]

  const getHealthBadge = (health: string) => {
    if (health === "excellent") {
      return (
        <Badge className="bg-green-500/10 text-green-500">
          <Shield className="mr-1 h-3 w-3" />
          Excelente
        </Badge>
      )
    }
    if (health === "good") {
      return (
        <Badge className="bg-blue-500/10 text-blue-500">
          <Shield className="mr-1 h-3 w-3" />
          Bom
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-500/10 text-yellow-500">
        <Shield className="mr-1 h-3 w-3" />
        Atenção
      </Badge>
    )
  }

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
                  Aquecimento de Chips
                </h1>
                <p className="text-pretty mt-2 text-sm text-muted-foreground">
                  Sistema inteligente para reduzir bloqueios e aumentar a reputação dos seus números
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Chips em Aquecimento</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 ativos, 1 pausado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.5%</div>
                  <p className="text-xs text-muted-foreground">Sem bloqueios detectados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Dias Médios</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">9.3</div>
                  <p className="text-xs text-muted-foreground">De 21 dias recomendados</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Como Funciona o Aquecimento</CardTitle>
                    <CardDescription>Processo gradual para construir reputação e evitar bloqueios</CardDescription>
                  </div>
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-primary">1</span>
                    </div>
                    <h4 className="font-medium">Início Gradual</h4>
                    <p className="text-sm text-muted-foreground">
                      Começamos com 50-100 mensagens por dia nos primeiros 3 dias
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-primary">2</span>
                    </div>
                    <h4 className="font-medium">Aumento Progressivo</h4>
                    <p className="text-sm text-muted-foreground">
                      Aumentamos gradualmente até 500 mensagens/dia em 21 dias
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-semibold text-primary">3</span>
                    </div>
                    <h4 className="font-medium">Monitoramento</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema monitora resposta e ajusta automaticamente o ritmo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Números em Aquecimento</h2>

              {warmingProfiles.map((profile) => (
                <Card key={profile.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <CardDescription>{profile.phone}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getHealthBadge(profile.health)}
                        {profile.status === "active" ? (
                          <Badge className="bg-green-500/10 text-green-500">
                            <Play className="mr-1 h-3 w-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/10 text-gray-500">
                            <Pause className="mr-1 h-3 w-3" />
                            Pausado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso do Aquecimento</span>
                        <span className="font-medium">
                          Dia {profile.day} de {profile.totalDays}
                        </span>
                      </div>
                      <Progress value={profile.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">{profile.progress}% concluído</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Mensagens Hoje</p>
                        <p className="text-lg font-semibold">
                          {profile.messagesSent} / {profile.messagesLimit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
                        <p className="text-lg font-semibold">12.5%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Aquecimento Automático</span>
                      </div>
                      <Switch checked={profile.status === "active"} />
                    </div>

                    <div className="flex gap-2">
                      {profile.status === "active" ? (
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar
                        </Button>
                      ) : (
                        <Button className="flex-1">
                          <Play className="mr-2 h-4 w-4" />
                          Retomar
                        </Button>
                      )}
                      <Button variant="outline">Ver Histórico</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
