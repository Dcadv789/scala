"use client"

import { useReveal } from "@/hooks/use-reveal"

export function WorkSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="min-h-screen w-screen shrink-0 snap-start px-4 pb-12 pt-24 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div
          className={`mb-4 transition-all duration-700 md:mb-6 lg:mb-8 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-lg font-light tracking-tight text-foreground sm:text-xl md:mb-3 md:text-xl lg:text-2xl">
            Cansado de Bloqueios
            <br />e Limitações?
          </h2>
        </div>

        <div
          className={`mb-6 max-w-3xl space-y-3 transition-all duration-700 md:mb-8 lg:mb-10 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <p className="text-xs leading-relaxed text-foreground/90 md:text-sm lg:text-sm">
            Se você usa o WhatsApp para vendas ou atendimento em volume, sabe o risco: bloqueios inesperados, perda de
            histórico e a incapacidade de escalar. As soluções não-oficiais são temporárias e colocam seu negócio em
            risco.
          </p>
          <p className="text-xs font-light leading-relaxed text-foreground md:text-sm lg:text-sm">
            A Solução é a API Oficial do WhatsApp Business.
          </p>
        </div>

        <div className="space-y-1 md:space-y-2 lg:space-y-3">
          {[
            {
              number: "01",
              title: "Estabilidade Total",
              description: "Livre-se dos bloqueios e mantenha sua comunicação 24/7",
              direction: "left",
            },
            {
              number: "02",
              title: "Escalabilidade Ilimitada",
              description: "Envie mensagens em massa e gerencie múltiplos atendentes",
              direction: "right",
            },
            {
              number: "03",
              title: "Recursos Avançados",
              description: "Use chatbots, respostas rápidas e integrações com CRMs",
              direction: "left",
            },
          ].map((benefit, i) => (
            <BenefitCard key={i} benefit={benefit} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitCard({
  benefit,
  index,
  isVisible,
}: {
  benefit: { number: string; title: string; description: string; direction: string }
  index: number
  isVisible: boolean
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      return benefit.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
    }
    return "translate-x-0 opacity-100"
  }

  return (
    <div
      className={`group flex items-start justify-between border-b border-foreground/10 py-3 transition-all duration-700 hover:border-foreground/20 md:py-4 lg:py-5 ${getRevealClass()}`}
      style={{
        transitionDelay: `${300 + index * 150}ms`,
      }}
    >
      <div className="flex w-full flex-wrap items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <span className="shrink-0 font-mono text-xs text-foreground/30 transition-colors group-hover:text-foreground/50 md:text-xs lg:text-sm">
          {benefit.number}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 break-words font-sans text-sm font-light text-foreground transition-transform duration-300 group-hover:translate-x-2 sm:text-base md:text-base lg:text-lg">
            {benefit.title}
          </h3>
          <p className="break-words font-mono text-xs text-foreground/60 sm:text-xs md:text-xs lg:text-sm">
            {benefit.description}
          </p>
        </div>
      </div>
    </div>
  )
}
