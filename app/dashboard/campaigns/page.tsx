"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CampaignList } from "@/components/campaigns/campaign-list"
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CampaignsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <DashboardHeader />
        <PaymentPendingBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                  Campanhas
                </h1>
                <p className="text-pretty mt-2 text-sm text-muted-foreground">
                  Gerencie suas campanhas de disparo em massa
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            </div>

            <CampaignList />
          </div>
        </main>
      </div>

      <CreateCampaignDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <MobileNav />
    </div>
  )
}
