"use client"

import { LayoutDashboard, Users, Zap, MessageSquare, Calendar, Send, CheckCircle2 } from "lucide-react"
import { MagneticButton } from "@/components/magnetic-button"
import { ArrowRight } from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Intuitivo",
    description: "Tenha uma visão completa dos seus atendimentos, contatos e desempenho da equipe em tempo real.",
  },
  {
    icon: Users,
    title: "Vários atendentes",
    description: "Cadastre toda a sua equipe no painel, dividindo por departamentos.",
  },
  {
    icon: Zap,
    title: "Respostas rápidas",
    description: 'Com o auto resposta, basta digitar "/" para acessar a sua lista de mensagens rápidas',
  },
  {
    icon: MessageSquare,
    title: "Chat interno",
    description: "Seus atendentes podem se comunicar internamente entre eles e outros membros do time",
  },
  {
    icon: Calendar,
    title: "Agendamentos",
    description: "Nosso recurso de agendamento, tem o poder de enviar mensagens no momento certo",
  },
  {
    icon: Send,
    title: "Envios em massa",
    description: "Envie mensagens para todos os seus contatos com o módulo campanha",
  },
]

export function CentralizedFeatures() {
  return (
    <section className="relative w-full px-4 py-20 sm:px-6 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-sans text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Centralize e Potencialize Seu Atendimento no WhatsApp
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70 md:text-xl">
            Transforme a comunicação do seu negócio.
          </p>
          
          <div className="mt-8">
            <MagneticButton
              size="lg"
              variant="primary"
              className="gap-3 bg-white hover:bg-white/90 text-[#0d1a1f] px-8 py-5 text-base font-bold shadow-xl"
            >
              Assinar Agora
              <ArrowRight className="h-5 w-5" />
            </MagneticButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:shadow-xl"
              >
                {/* Decoração de fundo */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all group-hover:bg-white/10" />
                
                <div className="relative">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white transition-all group-hover:bg-white/20 group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 font-sans text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed text-white/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mini Visual Separator */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div className="h-1 w-12 rounded-full bg-white/20" />
          <div className="h-1 w-12 rounded-full bg-white/40" />
          <div className="h-1 w-12 rounded-full bg-white/20" />
        </div>

      </div>
    </section>
  )
}

