"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { ArrowRight, Zap, MessageCircle, Users, TrendingUp, Clock } from "lucide-react"

export function NewHero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center px-4 py-20 sm:px-6 md:px-12">
      <div className="mx-auto w-full max-w-7xl">
        
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Coluna Esquerda - Texto */}
          <div className="text-center lg:text-left">
            {/* Título Principal */}
            <h1 className="mb-4 font-sans text-4xl font-bold leading-tight tracking-tight text-[#0d1a1f] sm:text-5xl md:text-6xl lg:text-7xl">
              Transforme Seu Atendimento:
            </h1>
            
            <h2 className="mb-6 font-sans text-3xl font-bold leading-tight text-[#0d1a1f] sm:text-4xl md:text-5xl lg:text-6xl">
              Envie Mensagens com <span className="text-white drop-shadow-lg">Segurança</span> e{" "}
              <span className="text-white drop-shadow-lg">Eficiência</span>
            </h2>

            {/* Subtítulo */}
            <p className="mx-auto lg:mx-0 mb-10 max-w-3xl text-lg leading-relaxed text-[#0d1a1f]/80 sm:text-xl md:text-2xl">
              Trabalhe de forma mais inteligente sem perder a performance. Aumente seus resultados e eleve o atendimento do seu negócio a outro nível.
            </p>

            {/* CTA */}
            <MagneticButton
              size="lg"
              variant="primary"
              className="gap-3 bg-white hover:bg-white/90 text-[#0d1a1f] px-10 py-6 text-lg font-bold shadow-2xl"
            >
              <Zap className="h-6 w-6" />
              Testar por 30 dias
              <ArrowRight className="h-6 w-6" />
            </MagneticButton>
          </div>

          {/* Coluna Direita - Mockup */}
          <div className="relative">
            {/* Decoração de fundo */}
            <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-4 -left-4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            {/* Card Principal - Dashboard Mockup */}
            <div className="relative rounded-2xl border border-white/30 bg-[#0d1a1f]/95 p-6 backdrop-blur-xl shadow-2xl">
              
              {/* Header do Dashboard */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Dashboard ScalaZap</h3>
                    <p className="text-xs text-white/60">Atendimento em tempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  <span className="text-xs text-white/60">Online</span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Users className="h-5 w-5 text-white/60" />
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">847</p>
                  <p className="text-xs text-white/60">Conversas ativas</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <MessageCircle className="h-5 w-5 text-white/60" />
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">12.5K</p>
                  <p className="text-xs text-white/60">Mensagens hoje</p>
                </div>
              </div>

              {/* Lista de Conversas Simulada */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-white/60">CONVERSAS RECENTES</p>
                {[
                  { name: "Cliente Premium", time: "2 min", unread: 3 },
                  { name: "Suporte Técnico", time: "5 min", unread: 1 },
                  { name: "Vendas - Lead", time: "8 min", unread: 5 },
                ].map((conversation, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/20 to-white/10" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{conversation.name}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-white/40" />
                        <p className="text-xs text-white/60">{conversation.time}</p>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-xs font-bold text-[#0d1a1f]">
                      {conversation.unread}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

