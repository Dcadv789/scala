"use client"

import { Bot, Brain, Target } from "lucide-react"

const automationFeatures = [
  {
    icon: Bot,
    title: "Robô",
    description: "Com o Robô, você pode montar jornadas personalizadas com base em condições específicas, escolher mensagens estratégicas para cada etapa da conversa e garantir que cada cliente receba exatamente a resposta certa no momento certo. Ideal para transformar atendimentos manuais em processos automáticos, sem perder o toque humano.",
  },
  {
    icon: Brain,
    title: "Agente de Inteligência Artificial",
    description: "Utilize o poder da IA para atender seus clientes de forma inteligente e natural. O agente aprende com suas conversas e melhora continuamente, oferecendo respostas precisas e personalizadas 24/7.",
  },
  {
    icon: Target,
    title: "Campanhas Segmentadas",
    description: "Crie campanhas direcionadas para grupos específicos de clientes. Segmente sua base, personalize mensagens e dispare no momento ideal para maximizar resultados e conversões.",
  },
]

export function Automations() {
  return (
    <section className="relative w-full px-4 py-20 sm:px-6 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5">
            <Bot className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">Automações</span>
          </div>
          
          <h2 className="mb-6 font-sans text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            ROBÔS E AUTOMAÇÕES QUE TRABALHAM POR VOCÊ
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-white/80 md:text-xl">
            Recursos inteligentes para criar fluxos de conversa, disparar mensagens em massa e atender automaticamente em múltiplos canais.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {automationFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:shadow-2xl"
              >
                {/* Decoração */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />
                
                <div className="relative">
                  <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/10 text-white transition-all group-hover:scale-110 group-hover:from-white/30 group-hover:to-white/20">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 font-sans text-xl font-semibold text-white">
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

        {/* Visual de Fluxo de Automação */}
        <div className="mt-16 rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-sm md:p-12">
          <div className="mb-8 text-center">
            <h3 className="mb-3 font-sans text-2xl font-semibold text-white md:text-3xl">
              Crie fluxos personalizados em minutos
            </h3>
            <p className="text-white/70">Arraste, solte e configure - simples assim</p>
          </div>
          
          {/* Mockup de Fluxo */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "Início", icon: "🚀", color: "from-green-500/20 to-emerald-500/20" },
              { label: "Condição", icon: "❓", color: "from-blue-500/20 to-cyan-500/20" },
              { label: "Ação", icon: "⚡", color: "from-purple-500/20 to-pink-500/20" },
              { label: "Fim", icon: "✅", color: "from-orange-500/20 to-red-500/20" },
            ].map((node, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`rounded-xl border border-white/20 bg-gradient-to-br ${node.color} p-4 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/40`}>
                  <div className="mb-2 text-center text-2xl">{node.icon}</div>
                  <p className="text-sm font-medium text-white">{node.label}</p>
                </div>
                {i < 3 && (
                  <div className="hidden h-0.5 w-8 bg-gradient-to-r from-white/40 to-white/20 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

