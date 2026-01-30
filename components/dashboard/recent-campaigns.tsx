"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getCampaigns } from "@/lib/store"

const statusColors = {
  draft: "bg-gray-500/20 text-gray-500",
  scheduled: "bg-blue-500/20 text-blue-500",
  running: "bg-primary/20 text-primary",
  paused: "bg-yellow-500/20 text-yellow-500",
  completed: "bg-green-500/20 text-green-500",
  failed: "bg-red-500/20 text-red-500",
}

const statusLabels = {
  draft: "Rascunho",
  scheduled: "Agendada",
  running: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
  failed: "Falhou",
}

interface RecentCampaignsProps {
  refreshTrigger?: number
}

export function RecentCampaigns({ refreshTrigger }: RecentCampaignsProps) {
  const [campaigns, setCampaigns] = useState<ReturnType<typeof getCampaigns>>([])

  const loadCampaigns = () => {
    const allCampaigns = getCampaigns()
    // Show only first 3 campaigns
    setCampaigns(allCampaigns.slice(0, 3))
  }

  useEffect(() => {
    loadCampaigns()
  }, [refreshTrigger])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campanhas Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/campaigns">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma campanha criada ainda</p>
            <Button variant="link" size="sm" asChild className="mt-2">
              <Link href="/dashboard/campaigns">Criar sua primeira campanha</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{campaign.name}</h4>
                    <Badge className={statusColors[campaign.status]}>{statusLabels[campaign.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {campaign.sent > 0
                      ? `${campaign.sent} enviadas · ${campaign.delivered} entregues · ${campaign.read} lidas`
                      : `${campaign.recipients} destinatários`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
