"use client"

import { useEffect } from "react"
import { Check, Zap, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { kirvanoCheckoutLinks } from "@/components/landing/signup-section"

const plans = [
  {
    id: "starter",
    name: "Básico",
    tagline: "Ideal para começar",
    firstMonthPrice: 29.90,
    monthlyPrice: 97.90,
    checkoutUrl: kirvanoCheckoutLinks.starter,
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
    id: "professional",
    name: "Profissional",
    tagline: "Para empresas em crescimento",
    firstMonthPrice: 39.90,
    monthlyPrice: 127.90,
    popular: true,
    checkoutUrl: kirvanoCheckoutLinks.professional,
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
    id: "unlimited",
    name: "Enterprise",
    tagline: "Poder total sem limites",
    firstMonthPrice: 49.90,
    monthlyPrice: 197.90,
    checkoutUrl: kirvanoCheckoutLinks.unlimited,
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

export function SubscribeModal() {
  // Desabilitar tecla ESC globalmente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }
    }

    // Adicionar listener com capture para interceptar antes de outros handlers
    document.addEventListener("keydown", handleKeyDown, { capture: true })
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true })
    }
  }, [])

  const handlePlanClick = (checkoutUrl: string) => {
    // Abrir checkout em nova aba
    window.open(checkoutUrl, "_blank")
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(2px)",
        pointerEvents: "auto",
      }}
      onPointerDown={(e) => {
        // Prevenir fechamento ao clicar fora
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        // Prevenir fechamento ao clicar no overlay
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        style={{
          pointerEvents: "auto",
        }}
        onPointerDown={(e) => {
          // Prevenir propagação de eventos
          e.stopPropagation()
        }}
        onClick={(e) => {
          // Prevenir propagação de eventos
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0d1a1f] to-[#0d1a1f]/90 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Escolha seu plano</h2>
                <p className="text-sm text-white/70">Desbloqueie todos os recursos da plataforma</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              <Zap className="w-4 h-4 mr-1.5" />
              Primeira mensalidade com desconto
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8 text-center">
            <p className="text-lg text-[#0d1a1f]/70">
              Para continuar usando esta funcionalidade, escolha um dos planos abaixo
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                  plan.popular
                    ? "border-[#0d1a1f] bg-[#0d1a1f] text-white shadow-xl scale-105"
                    : "border-[#0d1a1f]/30 bg-white text-[#0d1a1f] hover:border-[#0d1a1f]/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-[#0d1a1f]">
                    Mais Popular
                  </Badge>
                )}

                <div className="mb-4">
                  <h3 className={`mb-1 text-xl font-bold ${
                    plan.popular ? "text-white" : "text-[#0d1a1f]"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs ${
                    plan.popular ? "text-white/70" : "text-[#0d1a1f]/70"
                  }`}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${
                      plan.popular ? "text-white" : "text-[#0d1a1f]"
                    }`}>
                      R$ {plan.firstMonthPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className={`text-sm line-through ${
                      plan.popular ? "text-white/50" : "text-[#0d1a1f]/50"
                    }`}>
                      R$ {plan.monthlyPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className={`mt-1 text-xs font-medium ${
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
                  onClick={() => handlePlanClick(plan.checkoutUrl)}
                  className={`mb-4 w-full gap-2 ${
                    plan.popular
                      ? "bg-white hover:bg-white/90 text-[#0d1a1f]"
                      : "bg-[#0d1a1f] hover:bg-[#0d1a1f]/90 text-white"
                  }`}
                  size="lg"
                >
                  <Zap className="h-4 w-4" />
                  Assinar agora
                </Button>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.popular ? "text-white" : "text-[#0d1a1f]"
                      }`} />
                      <span className={`text-xs ${
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
      </div>
    </div>
  )
}

