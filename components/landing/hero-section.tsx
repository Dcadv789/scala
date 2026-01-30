"use client"

import { MagneticButton } from "@/components/magnetic-button"

interface HeroSectionProps {
  scrollToSection: (index: number) => void
}

export function HeroSection({ scrollToSection }: HeroSectionProps) {
  return (
    <section className="flex min-h-screen w-full flex-col justify-center px-4 py-20 pt-32 sm:justify-end sm:px-6 sm:pb-16 sm:pt-20 md:px-12 md:pb-24 md:pt-24">
      <div className="max-w-3xl">
        <div className="mb-3 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-3 py-1.5 backdrop-blur-md duration-700 sm:mb-4 sm:px-4">
          <p className="font-mono text-xs text-foreground/90">API Oficial WhatsApp • Chat ao Vivo • Sem Bloqueios</p>
        </div>
        <h1 className="mb-3 animate-in fade-in slide-in-from-bottom-8 font-sans text-3xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 sm:mb-4 sm:text-4xl md:mb-6 md:text-4xl lg:text-4xl xl:text-5xl">
          <span className="text-balance">Trabalhe no WhatsApp de forma tranquila e sem riscos de Bloqueios</span>
        </h1>
        <p className="mb-5 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-sm leading-relaxed text-foreground/90 duration-1000 delay-200 sm:mb-6 sm:text-base md:mb-8 md:text-base">
          <span className="text-pretty">
            Plataforma completa para gerenciar suas campanhas, templates e conversas com a API Oficial do WhatsApp.
            Envie milhares de mensagens com segurança e acompanhe em tempo real.
          </span>
        </p>
        <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-3 duration-1000 delay-300 sm:flex-row sm:items-center sm:gap-4">
          <MagneticButton size="lg" variant="primary" onClick={() => scrollToSection(2)} trackEvent="InitiateCheckout">
            Começar Agora
          </MagneticButton>
          <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(1)} trackEvent="ViewContent">
            Ver Recursos
          </MagneticButton>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-in fade-in duration-1000 delay-500 md:block">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs text-foreground/80">Role para explorar</p>
          <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/80" />
          </div>
        </div>
      </div>
    </section>
  )
}
