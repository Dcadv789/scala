"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { useReveal } from "@/hooks/use-reveal"

export function AboutSection({ scrollToSection }: { scrollToSection?: (index: number) => void }) {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex min-h-screen w-screen shrink-0 snap-start items-center justify-center px-4 pb-12 pt-24 sm:px-6 sm:py-40 md:px-12 md:py-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 md:gap-12 lg:gap-20">
          {/* Left side - Story */}
          <div>
            <div
              className={`mb-4 transition-all duration-700 md:mb-10 lg:mb-12 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-2xl font-light leading-[1.1] tracking-tight text-foreground sm:text-3xl md:mb-4 md:text-3xl lg:text-3xl xl:text-3xl">
                Seu WhatsApp
                <br />
                no Próximo Nível
              </h2>
            </div>

            <div
              className={`space-y-2 transition-all duration-700 md:space-y-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <p className="max-w-md text-sm leading-relaxed text-foreground/90 md:text-sm lg:text-sm">
                Não deixe a instabilidade do WhatsApp comprometer seus resultados. Nossa solução com API Oficial garante
                que você possa escalar suas vendas sem medo de bloqueios.
              </p>
              <p className="max-w-md text-sm leading-relaxed text-foreground/90 md:text-sm lg:text-sm">
                Trabalhamos com implementação completa, suporte técnico dedicado e garantia de estabilidade. Sua
                comunicação funcionando 24/7 com a confiança da API Oficial do WhatsApp.
              </p>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-10 lg:space-y-12">
            {[
              { value: "24h", label: "Ativação", sublabel: "Tempo médio para estar no ar", direction: "right" },
              {
                value: "99.9%",
                label: "Estabilidade",
                sublabel: "Taxa de uptime garantida",
                direction: "left",
              },
              {
                value: "300+",
                label: "Clientes",
                sublabel: "Empresas usando API Oficial",
                direction: "right",
              },
            ].map((stat, i) => {
              const getRevealClass = () => {
                if (!isVisible) {
                  return stat.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
                }
                return "translate-x-0 opacity-100"
              }

              return (
                <div
                  key={i}
                  className={`flex items-baseline gap-3 border-l border-foreground/30 pl-3 transition-all duration-700 md:gap-6 md:pl-6 lg:gap-8 lg:pl-8 ${getRevealClass()}`}
                  style={{
                    transitionDelay: `${300 + i * 150}ms`,
                    marginLeft: i % 2 === 0 ? "0" : "auto",
                    maxWidth: i % 2 === 0 ? "100%" : "85%",
                  }}
                >
                  <div className="text-3xl font-light text-foreground sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl">
                    {stat.value}
                  </div>
                  <div>
                    <div className="font-sans text-sm font-light text-foreground sm:text-sm md:text-base lg:text-base">
                      {stat.label}
                    </div>
                    <div className="font-mono text-xs text-foreground/60 sm:text-xs">{stat.sublabel}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className={`mt-4 flex flex-col gap-3 transition-all duration-700 sm:flex-row sm:flex-wrap md:mt-12 md:gap-4 lg:mt-16 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "750ms" }}
        >
          <MagneticButton
            size="lg"
            variant="primary"
            onClick={() => scrollToSection?.(4)}
            trackEvent="InitiateCheckout"
          >
            Quero a API Oficial Agora
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
