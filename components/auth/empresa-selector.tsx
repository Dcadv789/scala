"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Empresa {
  id: string
  nome: string
  plano_atual?: string
  status_assinatura?: string
}

interface EmpresaSelectorProps {
  empresas: Empresa[]
  onSelect: (empresaId: string) => void
}

export function EmpresaSelector({ empresas, onSelect }: EmpresaSelectorProps) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedEmpresa) {
      onSelect(selectedEmpresa)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111c21] via-[#0d1a1f] to-[#00bf63] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto p-4 rounded-full bg-primary/10">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Qual conta deseja acessar hoje?</CardTitle>
          <CardDescription>
            Você possui acesso a múltiplas empresas. Selecione qual deseja acessar agora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {empresas.map((empresa) => {
              const isSelected = selectedEmpresa === empresa.id
              const isSuspended = empresa.status_assinatura === 'suspended'
              
              return (
                <button
                  key={empresa.id}
                  type="button"
                  onClick={() => !isSuspended && setSelectedEmpresa(empresa.id)}
                  disabled={isSuspended}
                  className={cn(
                    "relative flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50",
                    isSuspended && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{empresa.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {empresa.plano_atual && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {empresa.plano_atual}
                          </span>
                        )}
                        {isSuspended && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                            Suspensa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={!selectedEmpresa}
              className="w-full"
              size="lg"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


