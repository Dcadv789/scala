"use client"

import { useReveal } from "@/hooks/use-reveal"
import { Check } from "lucide-react"

export function ServicesSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex min-h-screen w-screen shrink-0 snap-start items-center justify-center px-4 pb-12 pt-24 sm:px-6 sm:py-24 md:px-12 md:py-20 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div
          className={`mb-4 transition-all duration-700 md:mb-12 lg:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-xl font-light leading-tight tracking-tight text-foreground sm:text-2xl md:mb-2 md:text-2xl lg:text-2xl">
            Escolha a Melhor
            <br />
            Opção para o Seu Negócio
          </h2>
          <p className="font-mono text-xs text-foreground/60 md:text-xs lg:text-xs">
            / Flexibilidade e Poder na palma da sua mão
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 md:gap-8 lg:gap-12">
          {[
            {
              title: "Aluguel de Número com API Oficial",
              ideal: "Campanhas de curta duração, testes de mercado, ou negócios que precisam de ativação imediata",
              benefits: [
                "Ativação em 24h",
                "Sem burocracia de aprovação",
                "Flexibilidade de contrato",
                "Suporte técnico incluído",
              ],
              direction: "left",
            },
            {
              title: "Venda e Implementação de Número com API Oficial",
              ideal: "Operações de alto volume, integração total com sistemas internos (CRM, ERP) e uso a longo prazo",
              benefits: [
                "Número próprio com selo de verificação",
                "Controle total da infraestrutura",
                "Eliminação definitiva de bloqueios",
                "Implementação completa",
              ],
              direction: "right",
            },
          ].map((service, i) => (
            <ServiceCard key={i} service={service} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
  isVisible,
}: {
  service: { title: string; ideal: string; benefits: string[]; direction: string }
  index: number
  isVisible: boolean
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      return service.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
    }
    return "translate-x-0 opacity-100"
  }

  return (
    <div
      className={`group rounded-2xl border border-foreground/20 bg-foreground/5 p-4 backdrop-blur-sm transition-all duration-700 hover:border-foreground/40 hover:bg-foreground/10 md:p-8 ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 200}ms`,
      }}
    >
      <h3 className="mb-2 font-sans text-sm font-light leading-tight text-foreground sm:text-base md:mb-6 md:text-base">
        {service.title}
      </h3>

      <div className="mb-3 md:mb-8">
        <p className="mb-1 font-mono text-xs text-foreground/60 md:mb-1 md:text-xs">Ideal Para:</p>
        <p className="text-xs leading-relaxed text-foreground/90 md:text-sm">{service.ideal}</p>
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-xs text-foreground/60 md:text-xs">Benefícios Chave:</p>
        <ul className="space-y-1.5">
          {service.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60 md:h-4 md:w-4" />
              <span className="text-xs text-foreground/90 md:text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
