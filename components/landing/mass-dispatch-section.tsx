"use client"

import { Send, Shield, FileCheck, Rocket, BarChart3 } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Sem Risco de Banimento",
    description: "Utilize a API Oficial do WhatsApp Business com total segurança e conformidade com as políticas do Meta",
  },
  {
    icon: FileCheck,
    title: "Templates Pré-Aprovados",
    description: "Biblioteca de templates validados para cobranças, remarketing e prospecção ativa prontos para usar",
  },
  {
    icon: Rocket,
    title: "Alta Velocidade",
    description: "Envie milhares de mensagens por hora com infraestrutura otimizada para grandes volumes",
  },
  {
    icon: BarChart3,
    title: "Métricas em Tempo Real",
    description: "Acompanhe entregas, leituras e respostas de cada campanha em um dashboard completo",
  },
]

export function MassDispatchSection() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Header Principal */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0d1a1f]/30 bg-[#0d1a1f]/10 px-5 py-2.5">
              <Send className="h-5 w-5 text-[#0d1a1f]" />
              <span className="text-sm font-medium text-[#0d1a1f] md:text-base">Disparos em Massa</span>
            </div>
            <h2 className="mb-6 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Realize disparos em massa com a
              <span className="text-[#0d1a1f]"> API Oficial do WhatsApp</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-foreground/80 md:text-xl lg:text-2xl">
              Sem riscos de banimentos. Templates validados e pré-aprovados para cobranças, remarketing e prospecção ativa.
            </p>
          </div>

          {/* Benefícios */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="group rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all hover:border-[#0d1a1f]/50 hover:bg-foreground/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d1a1f]/20 text-[#0d1a1f] transition-colors group-hover:bg-[#0d1a1f]/30">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 font-sans text-lg font-semibold text-foreground md:text-xl">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/70 md:text-base">{benefit.description}</p>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
