"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { ArrowRight, Zap, CheckCircle2, Star } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative w-full px-4 py-20 sm:px-6 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-5xl">
        
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-12 backdrop-blur-xl md:p-16">
          
          {/* Decoração de fundo */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
              <Star className="h-4 w-4 fill-white text-white" />
              <span className="text-sm font-medium text-white">Mais de 10.000 empresas confiam</span>
            </div>

            {/* Título */}
            <h2 className="mb-6 font-sans text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Pronto para transformar seu atendimento?
            </h2>
            
            {/* Subtítulo */}
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
              Junte-se a milhares de empresas que já automatizaram seu WhatsApp e aumentaram suas vendas em até 300%
            </p>

            {/* Benefícios Rápidos */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-6">
              {[
                "Teste grátis por 30 dias",
                "Sem cartão de crédito",
                "Cancele quando quiser",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span className="text-sm text-white/90">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <MagneticButton
                size="lg"
                variant="primary"
                className="gap-3 bg-white hover:bg-white/90 text-[#0d1a1f] px-10 py-6 text-lg font-bold shadow-2xl"
              >
                <Zap className="h-6 w-6" />
                Começar agora grátis
                <ArrowRight className="h-6 w-6" />
              </MagneticButton>
              
              <button className="group flex items-center gap-2 text-white transition-colors hover:text-white/80">
                <span className="text-sm font-medium">Ver demonstração</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-white/30 to-white/10"
                  />
                ))}
              </div>
              <div className="ml-3 text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-white text-white" />
                  ))}
                </div>
                <p className="text-xs text-white/70">Avaliação 4.9 de 5 estrelas</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

