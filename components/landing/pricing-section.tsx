"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { Check, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Basico",
    price: "R$ 97,90",
    promoPrice: "R$ 29,90",
    period: "/mes",
    description: "Ideal para comecar",
    planKey: "starter",
    checkoutUrl: "https://pay.kirvano.com/71a97d91-a180-4586-83f1-9d619a9dafe5",
    features: [
      "Conexao API Oficial",
      "Ate 5.000 mensagens/mes",
      "2 numeros conectados",
      "3 funcionarios",
      "Chat ao vivo",
      "Templates basicos",
      "Suporte por email",
    ],
  },
  {
    name: "Professional",
    price: "R$ 127,90",
    promoPrice: "R$ 39,90",
    period: "/mes",
    description: "Para empresas em crescimento",
    planKey: "pro",
    checkoutUrl: "https://pay.kirvano.com/08ed0806-024e-4b7d-9173-5b5459a2bba6",
    features: [
      "Conexao API Oficial",
      "Ate 50.000 mensagens/mes",
      "5 numeros conectados",
      "5 funcionarios",
      "Chat ao vivo avancado",
      "Templates ilimitados",
      "App Mobile e Desktop",
      "Suporte prioritario",
    ],
    popular: true,
    hasApp: true,
  },
  {
    name: "Ilimitado",
    price: "R$ 197,90",
    promoPrice: "R$ 49,90",
    period: "/mes",
    description: "Poder total sem limites",
    planKey: "enterprise",
    checkoutUrl: "https://pay.kirvano.com/afff2ffd-4940-4e70-b7dd-81e95ef908f2",
    features: [
      "Conexao API Oficial",
      "Mensagens ilimitadas",
      "Numeros ilimitados",
      "Funcionarios ilimitados",
      "Campanhas ilimitadas",
      "App Mobile e Desktop",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Treinamento incluido",
    ],
    hasApp: true,
  },
]

export function PricingSection() {
  const handleSelectPlan = (checkoutUrl: string) => {
    window.open(checkoutUrl, "_blank")
  }

  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-6xl">
        <div className="mb-8 text-center">
          <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
            <Zap className="w-3 h-3 mr-1" />
            Primeira mensalidade com desconto
          </Badge>
          <h2 className="mb-4 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Planos para cada necessidade
          </h2>
          <p className="mx-auto max-w-2xl text-base text-foreground/80 md:text-lg">
            Escolha o plano ideal para o tamanho da sua operacao.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 backdrop-blur-sm transition-all ${
                plan.popular
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-foreground/10 bg-foreground/5 hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 font-sans text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mb-4 text-sm text-foreground/70">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{plan.promoPrice}</span>
                  <span className="text-lg text-foreground/50 line-through">{plan.price}</span>
                </div>
                <p className="text-xs text-foreground/60 mt-1">
                  Primeira mensalidade - depois {plan.price}{plan.period}
                </p>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton
                variant={plan.popular ? "primary" : "secondary"}
                className="w-full"
                trackEvent="InitiateCheckout"
                onClick={() => handleSelectPlan(plan.checkoutUrl)}
              >
                Comecar agora
              </MagneticButton>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
