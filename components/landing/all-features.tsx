"use client"

import { 
  Bot, 
  Smartphone, 
  Mic, 
  Webhook, 
  MessageSquare, 
  BarChart3,
  Users,
  Calendar,
  Send,
  Zap,
  Shield,
  Clock
} from "lucide-react"

const allFeatures = [
  { icon: Bot, title: "Robôs Inteligentes", description: "Automações que trabalham 24/7" },
  { icon: MessageSquare, title: "Chat ao Vivo", description: "Atendimento humanizado em tempo real" },
  { icon: BarChart3, title: "Relatórios", description: "Métricas detalhadas de performance" },
  { icon: Users, title: "Equipe Ilimitada", description: "Adicione quantos atendentes precisar" },
  { icon: Calendar, title: "Agendamentos", description: "Programe mensagens estratégicas" },
  { icon: Send, title: "Campanhas", description: "Disparos em massa segmentados" },
  { icon: Zap, title: "Respostas Rápidas", description: "Agilidade no atendimento" },
  { icon: Shield, title: "API Oficial", description: "Segurança e conformidade garantidas" },
  { icon: Smartphone, title: "App Mobile", description: "Atenda de qualquer lugar" },
  { icon: Mic, title: "Transcrição de Áudio", description: "Converta áudios em texto" },
  { icon: Webhook, title: "Integrações", description: "Conecte com suas ferramentas" },
  { icon: Clock, title: "Atendimento 24/7", description: "Nunca perca um cliente" },
]

export function AllFeatures() {
  return (
    <section className="relative w-full px-4 py-20 sm:px-6 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#0d1a1f]/20 px-5 py-2.5">
            <Zap className="h-5 w-5 text-[#0d1a1f]" />
            <span className="text-sm font-medium text-[#0d1a1f]">Todas as Funcionalidades</span>
          </div>
          
          <h2 className="mb-6 font-sans text-3xl font-bold text-[#0d1a1f] md:text-4xl lg:text-5xl">
            Potencialize ao máximo
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[#0d1a1f]/70 md:text-xl">
            Diversas funcionalidades para o seu negócio crescer muito.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-[#0d1a1f]/20 bg-white/90 p-6 backdrop-blur-sm transition-all hover:border-[#0d1a1f]/40 hover:bg-white hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#0d1a1f]/10 text-[#0d1a1f] transition-colors group-hover:bg-[#0d1a1f]/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-sans text-base font-semibold text-[#0d1a1f]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#0d1a1f]/70">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

