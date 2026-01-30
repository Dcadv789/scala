"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MessageCircle, MessageSquare, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { authFetch } from "@/lib/auth-fetch"

interface StatsCardsProps {
  startDate?: string
  endDate?: string
  refreshTrigger?: number
}

export function StatsCards({ startDate, endDate, refreshTrigger }: StatsCardsProps) {
  const [stats, setStats] = useState({
    totalSent: 0,
    activeConversations: 0,
    deliveryRate: "0.0",
    readRate: "0.0",
    chatMessagesSent: 0,
    chatMessagesReceived: 0,
    totalChatMessages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log("[StatsCards] ====== Carregando estatísticas ======")
        setIsLoading(true)
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        
        const url = `/api/dashboard/stats${params.toString() ? `?${params.toString()}` : ""}`
        console.log("[StatsCards] URL da requisição:", url)
        
        const response = await authFetch(url)
        console.log("[StatsCards] Status da resposta:", response.status, response.statusText)
        
        if (!response.ok) {
          console.error("[StatsCards] ❌ Erro HTTP:", response.status, response.statusText)
          // Se for erro 401, pode ser problema de autenticação
          if (response.status === 401) {
            console.warn("[StatsCards] ⚠️ Não autenticado - pulando carregamento de estatísticas")
          }
          return // Sair sem atualizar stats (manter valores padrão)
        }
        
        const data = await response.json()
        console.log("[StatsCards] Dados recebidos:", data)

        if (data.success && data.stats) {
          console.log("[StatsCards] ✅ Estatísticas carregadas:", data.stats)
          setStats({
            totalSent: data.stats.chatMessagesSent || 0,
            activeConversations: data.stats.activeConversations || 0,
            deliveryRate: "0.0",
            readRate: "0.0",
            chatMessagesSent: data.stats.chatMessagesSent || 0,
            chatMessagesReceived: data.stats.chatMessagesReceived || 0,
            totalChatMessages: data.stats.totalChatMessages || 0,
          })
        } else {
          // Se não tiver sucesso, apenas logar como warning (não é erro crítico)
          if (data.error) {
            console.warn("[StatsCards] ⚠️ Erro ao carregar estatísticas:", data.error)
          } else {
            console.warn("[StatsCards] ⚠️ Resposta sem sucesso ou sem dados:", data)
          }
          // Manter os valores padrão (zeros) em caso de erro
        }
      } catch (error) {
        console.error("[StatsCards] ❌ Erro ao carregar estatísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [startDate ?? "", endDate ?? "", refreshTrigger])

  const statsData = [
    {
      title: "Total de Mensagens",
      value: stats.totalChatMessages.toLocaleString("pt-BR"),
      icon: MessageSquare,
    },
    {
      title: "Mensagens Enviadas",
      value: stats.chatMessagesSent.toLocaleString("pt-BR"),
      icon: ArrowUpRight,
    },
    {
      title: "Mensagens Recebidas",
      value: stats.chatMessagesReceived.toLocaleString("pt-BR"),
      icon: ArrowDownLeft,
    },
    {
      title: "Conversas Ativas",
      value: stats.activeConversations.toString(),
      icon: MessageCircle,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
