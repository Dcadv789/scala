"use client"

import { 
  Zap,
  Users,
  FileCheck,
  Send,
} from "lucide-react"

const campaignSteps = [
  {
    step: "01",
    title: "Selecione sua Conexão",
    description: "Escolha o número da API Oficial que deseja usar para o disparo",
    icon: Zap,
  },
  {
    step: "02",
    title: "Importe seus Contatos",
    description: "Faça upload de uma lista CSV ou selecione contatos já cadastrados",
    icon: Users,
  },
  {
    step: "03",
    title: "Escolha o Template",
    description: "Selecione um template pré-aprovado ou crie um personalizado",
    icon: FileCheck,
  },
  {
    step: "04",
    title: "Agende e Dispare",
    description: "Defina horário de envio e acompanhe tudo pelo chat ao vivo",
    icon: Send,
  },
]

export function CampaignCreationSection() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Como Criar uma Campanha */}
          <div>
            <div className="mb-12 text-center">
              <h3 className="mb-4 font-sans text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
                Crie campanhas em minutos
              </h3>
              <p className="text-base text-foreground/70 md:text-lg">
                Processo simples e intuitivo para enviar mensagens em escala
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {campaignSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="relative">
                    {/* Linha conectora */}
                    {index < campaignSteps.length - 1 && (
                      <div className="absolute left-1/2 top-12 hidden h-px w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                    )}
                    
                    <div className="relative rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-foreground/10">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {item.step}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h4 className="mb-3 font-sans text-base font-semibold text-foreground md:text-lg">{item.title}</h4>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

