"use client"

import { useRouter } from "next/navigation"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    id: "basico",
    name: "Básico",
    tagline: "Ideal para começar",
    firstMonthPrice: 29.90,
    monthlyPrice: 97.90,
    features: [
      "Conexão API Oficial",
      "Até 5.000 mensagens/mês",
      "2 números conectados",
      "3 funcionários",
      "Chat ao vivo",
      "Templates básicos",
      "Suporte por email",
    ],
  },
  {
    id: "profissional",
    name: "Profissional",
    tagline: "Para empresas em crescimento",
    firstMonthPrice: 39.90,
    monthlyPrice: 127.90,
    popular: true,
    features: [
      "Conexão API Oficial",
      "Até 50.000 mensagens/mês",
      "5 números conectados",
      "5 funcionários",
      "Chat ao vivo avançado",
      "Templates ilimitados",
      "App Mobile e Desktop",
      "Suporte prioritário",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Poder total sem limites",
    firstMonthPrice: 49.90,
    monthlyPrice: 197.90,
    features: [
      "Conexão API Oficial",
      "Mensagens ilimitadas",
      "Números ilimitados",
      "Funcionários ilimitados",
      "Campanhas ilimitadas",
      "App Mobile e Desktop",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Treinamento incluído",
    ],
  },
]

export function NewPricing() {
  const router = useRouter()

  const handlePlanClick = (planId: string) => {
    // Redirecionar para register com o plano selecionado
    router.push(`/register?plan=${planId}`)
  }

  return (
    <section className="relative w-full px-4 py-20 sm:px-6 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-[#0d1a1f]/20 text-[#0d1a1f] border-[#0d1a1f]/30 text-sm px-4 py-2">
            <Zap className="w-4 h-4 mr-1.5" />
            Primeira mensalidade com desconto
          </Badge>
          <h2 className="mb-4 font-sans text-3xl font-bold text-[#0d1a1f] md:text-4xl lg:text-5xl">
            Planos da Plataforma
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[#0d1a1f]/70">
            Escolha o plano que mais se adequa as suas necessidades e comece hoje mesmo a profissionalizar o seu atendimento.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all hover:shadow-2xl ${
                plan.popular
                  ? "border-[#0d1a1f] bg-[#0d1a1f] text-white shadow-2xl scale-105"
                  : "border-[#0d1a1f]/30 bg-white/90 text-[#0d1a1f] hover:border-[#0d1a1f]/50"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#0d1a1f]">
                  Mais Popular
                </Badge>
              )}


              <div className="mb-6">
                <h3 className={`mb-2 text-2xl font-bold ${
                  plan.popular ? "text-white" : "text-[#0d1a1f]"
                }`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${
                  plan.popular ? "text-white/70" : "text-[#0d1a1f]/70"
                }`}>
                  {plan.tagline}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className={`text-4xl font-bold ${
                    plan.popular ? "text-white" : "text-[#0d1a1f]"
                  }`}>
                    R$ {plan.firstMonthPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className={`text-lg line-through ${
                    plan.popular ? "text-white/50" : "text-[#0d1a1f]/50"
                  }`}>
                    R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className={`mt-2 text-sm font-medium ${
                  plan.popular ? "text-white" : "text-[#0d1a1f]"
                }`}>
                  Primeira mensalidade
                </p>
                <p className={`text-xs ${
                  plan.popular ? "text-white/70" : "text-[#0d1a1f]/70"
                }`}>
                  Depois R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}/mês
                </p>
              </div>

              <Button
                onClick={() => handlePlanClick(plan.id)}
                className={`mb-8 w-full gap-2 ${
                  plan.popular
                    ? "bg-white hover:bg-white/90 text-[#0d1a1f]"
                    : "bg-[#0d1a1f] hover:bg-[#0d1a1f]/90 text-white"
                }`}
                size="lg"
              >
                <Zap className="h-5 w-5" />
                Comece agora grátis
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`mt-0.5 h-5 w-5 shrink-0 ${
                      plan.popular ? "text-white" : "text-[#0d1a1f]"
                    }`} />
                    <span className={`text-sm ${
                      plan.popular ? "text-white/80" : "text-[#0d1a1f]/80"
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

