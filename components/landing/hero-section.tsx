"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { MessageCircle, Send, BarChart3, Shield, Check } from "lucide-react"

interface HeroSectionProps {
  scrollToSection: (index: number) => void
}

export function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-20 pt-28 sm:px-6 md:px-12 lg:pt-32">
      {/* Container centralizado */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Coluna de Texto - Centralizada */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0d1a1f]/30 bg-[#0d1a1f]/10 px-4 py-2 backdrop-blur-md">
              <Shield className="h-4 w-4 text-[#0d1a1f]" />
              <p className="font-mono text-xs text-[#0d1a1f]">API Oficial WhatsApp • Sem Bloqueios</p>
            </div>

            {/* Título Principal */}
            <h1 className="mb-6 font-sans text-4xl font-bold leading-[1.1] tracking-tight text-[#0d1a1f] sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-balance">
                Dispare no{" "}
                <span className="text-white drop-shadow-lg">
                  WhatsApp
                </span>
                {" "}sem riscos
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mb-8 max-w-xl text-base leading-relaxed text-[#0d1a1f]/80 sm:text-lg md:text-xl">
              Plataforma completa com API Oficial do WhatsApp. Envie milhares de mensagens, gerencie conversas em tempo real e escale suas vendas com segurança.
            </p>

            {/* Features em lista */}
            <div className="mb-8 flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d1a1f]/20">
                  <Check className="h-4 w-4 text-[#0d1a1f]" />
                </div>
                <p className="text-sm text-[#0d1a1f]/80">Chat ao vivo integrado</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d1a1f]/20">
                  <Check className="h-4 w-4 text-[#0d1a1f]" />
                </div>
                <p className="text-sm text-[#0d1a1f]/80">Templates aprovados pela Meta</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d1a1f]/20">
                  <Check className="h-4 w-4 text-[#0d1a1f]" />
                </div>
                <p className="text-sm text-[#0d1a1f]/80">Relatórios em tempo real</p>
              </div>
            </div>

            {/* Botões de CTA */}
            <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
              <MagneticButton 
                size="lg" 
                variant="primary" 
                onClick={() => scrollToSection(2)} 
                trackEvent="InitiateCheckout"
                className="gap-3 whitespace-nowrap min-w-[200px] justify-center"
              >
                <Send className="h-5 w-5 flex-shrink-0" />
                <span>Começar Agora</span>
              </MagneticButton>
              <MagneticButton 
                size="lg" 
                variant="secondary" 
                onClick={() => scrollToSection(1)} 
                trackEvent="ViewContent"
                className="whitespace-nowrap min-w-[180px] justify-center"
              >
                Ver Recursos
              </MagneticButton>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#0d1a1f]/70">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-[#0d1a1f] border-2 border-white" />
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-white" />
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 border-2 border-white" />
                </div>
                <p className="font-medium text-[#0d1a1f]">+1000 empresas</p>
              </div>
              <div className="h-4 w-px bg-[#0d1a1f]/20" />
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-[#0d1a1f]" />
                <p className="text-[#0d1a1f]/70">10M+ mensagens enviadas</p>
              </div>
            </div>
          </div>

          {/* Coluna de Imagem/Mockup */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            {/* Card com mockup de dashboard */}
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Decoração de fundo */}
              <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

              {/* Card Principal */}
              <div className="relative rounded-2xl border border-white/20 bg-[#0d1a1f]/95 p-6 backdrop-blur-xl shadow-2xl">
                
                {/* Header do Card */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Dashboard ScalaZap</h3>
                      <p className="text-xs text-white/60">Ativo agora</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    <span className="text-xs text-white/60">Online</span>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Mensagens</p>
                    <p className="text-xl font-bold text-white">12.5K</p>
                    <p className="text-xs text-white/60">hoje</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Conversas</p>
                    <p className="text-xl font-bold text-white">847</p>
                    <p className="text-xs text-white/60">ativas</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/60">Taxa</p>
                    <p className="text-xl font-bold text-white">98%</p>
                    <p className="text-xs text-white/60">entrega</p>
                  </div>
                </div>

                {/* Lista de conversas simulada */}
                <div className="mt-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/30 hover:bg-white/10"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/20 to-white/10" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Cliente {i}</p>
                        <p className="text-xs text-white/60">Mensagem recebida...</p>
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0d1a1f]">
                        {i}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Indicador de scroll - atualizado */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-in fade-in duration-1000 delay-500 lg:block">
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-xs text-[#0d1a1f]/70">Role para explorar</p>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-[#0d1a1f]/30 bg-[#0d1a1f]/10 p-1 backdrop-blur-md">
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#0d1a1f]" />
          </div>
        </div>
      </div>
    </section>
  )
}
