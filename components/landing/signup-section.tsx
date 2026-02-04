"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Eye, EyeOff, Loader2, Lock, ArrowRight, Zap, Gift } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Links do checkout Kirvano
export const kirvanoCheckoutLinks = {
  starter: "https://pay.kirvano.com/71a97d91-a180-4586-83f1-9d619a9dafe5",
  professional: "https://pay.kirvano.com/08ed0806-024e-4b7d-9173-5b5459a2bba6", 
  unlimited: "https://pay.kirvano.com/afff2ffd-4940-4e70-b7dd-81e95ef908f2",
}

const plans = [
  {
    id: "starter",
    name: "Básico",
    price: "97,90",
    promoPrice: "29,90",
    description: "Ideal para começar",
    features: ["2 conexões WhatsApp", "3 membros na equipe", "Disparos ilimitados"],
  },
  {
    id: "professional",
    name: "Profissional",
    price: "127,90",
    promoPrice: "39,90",
    popular: true,
    description: "Mais recursos",
    features: ["5 conexões WhatsApp", "5 membros na equipe", "App Mobile/Desktop", "Suporte prioritário"],
  },
  {
    id: "unlimited",
    name: "Enterprise",
    price: "197,90",
    promoPrice: "49,90",
    description: "Sem limites",
    features: ["Conexões ilimitadas", "Equipe ilimitada", "App Mobile/Desktop", "Gerente de conta"],
  },
]

export function SignupSection() {
  const [selectedPlan, setSelectedPlan] = useState("professional")
  const [step, setStep] = useState<"plan" | "account">("plan")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const { toast } = useToast()

  const handleCreateAccount = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Preencha todos os campos",
        description: "Nome, email e senha sao obrigatorios.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no minimo 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simular criacao de conta
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Salvar dados do usuario no localStorage
    const userData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      plan: selectedPlan,
      planStatus: "pending", // pending, active, cancelled
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("scalazap_user", JSON.stringify(userData))
    localStorage.setItem("scalazap_pending_plan", selectedPlan)

    setLoading(false)

    toast({
      title: "Conta criada com sucesso!",
      description: "Bem-vindo ao ScalaZap! Ative seu plano para desbloquear todos os recursos.",
    })

    // Redirecionar para o dashboard
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
  }

  return (
    <section className="relative w-full px-3 py-16 sm:px-4 md:px-6 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#0d1a1f]/20 text-[#0d1a1f] border-[#0d1a1f]/30 text-sm px-4 py-2">
              <Gift className="w-4 h-4 mr-1.5" />
              Primeira mensalidade com desconto
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d1a1f] mb-6">
              Crie sua conta grátis
            </h2>
            <p className="text-[#0d1a1f]/70 text-base md:text-lg max-w-2xl mx-auto">
              Acesse a plataforma gratuitamente. Escolha um plano para desbloquear todos os recursos.
            </p>
          </div>

          {step === "plan" ? (
            <>
              {/* Plan Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                      selectedPlan === plan.id
                        ? "border-white bg-white text-[#0d1a1f] shadow-xl"
                        : "border-white/20 bg-[#0d1a1f]/90 text-white hover:border-white/40"
                    }`}
                  >
                    {plan.popular && (
                      <Badge className={`absolute -top-2 right-2 text-xs px-2 py-0.5 ${
                        selectedPlan === plan.id 
                          ? "bg-[#0d1a1f] text-white" 
                          : "bg-white text-[#0d1a1f]"
                      }`}>
                        Popular
                      </Badge>
                    )}
                    <div className="mb-3">
                      <h3 className={`font-semibold text-lg md:text-xl ${
                        selectedPlan === plan.id ? "text-[#0d1a1f]" : "text-white"
                      }`}>{plan.name}</h3>
                      <p className={`text-sm ${
                        selectedPlan === plan.id ? "text-[#0d1a1f]/60" : "text-white/60"
                      }`}>{plan.description}</p>
                    </div>
                    <div className="mb-2">
                      <span className={`text-2xl md:text-3xl font-bold ${
                        selectedPlan === plan.id ? "text-[#0d1a1f]" : "text-white"
                      }`}>R$ {plan.promoPrice}</span>
                      <span className={`text-base line-through ml-2 ${
                        selectedPlan === plan.id ? "text-[#0d1a1f]/40" : "text-white/40"
                      }`}>R$ {plan.price}</span>
                    </div>
                    <p className={`text-xs mb-3 font-medium ${
                      selectedPlan === plan.id ? "text-[#0d1a1f]/70" : "text-white/70"
                    }`}>1ª mensalidade - depois R$ {plan.price}/mês</p>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 3).map((feature) => (
                        <li key={feature} className={`flex items-center gap-2 text-sm ${
                          selectedPlan === plan.id ? "text-[#0d1a1f]/70" : "text-white/70"
                        }`}>
                          <Check className={`h-4 w-4 shrink-0 ${
                            selectedPlan === plan.id ? "text-[#0d1a1f]" : "text-white"
                          }`} />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {selectedPlan === plan.id && (
                      <div className="absolute top-3 left-3">
                        <div className="w-6 h-6 rounded-full bg-[#0d1a1f] flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Continue Button */}
              <div className="text-center">
                <Button
                  onClick={() => setStep("account")}
                  size="lg"
                  className="bg-white hover:bg-white/90 text-[#0d1a1f] gap-2 px-8 py-6 text-lg font-bold"
                >
                  <Zap className="h-5 w-5" />
                  Criar Conta Grátis
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-sm text-white/70 mt-3">
                  Plano selecionado: {plans.find(p => p.id === selectedPlan)?.name} - R$ {plans.find(p => p.id === selectedPlan)?.promoPrice} na 1ª mensalidade
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Account Creation Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <Card className="bg-[#0d1a1f]/90 border-white/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white text-lg mb-4">Seus dados</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-white/70">Nome completo</Label>
                        <Input
                          placeholder="Seu nome"
                          className="mt-2 h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-white/70">Email</Label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="mt-2 h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-white/70">WhatsApp (opcional)</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="mt-2 h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-white/70">Senha</Label>
                        <div className="relative mt-2">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            className="h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-12"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setStep("plan")}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Voltar
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleCreateAccount}
                        disabled={loading}
                        className="flex-1 bg-white hover:bg-white/90 text-[#0d1a1f] gap-2 font-bold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5" />
                            Criar conta grátis
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Plan Summary */}
                <Card className="bg-[#0d1a1f]/90 border-white/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white text-lg mb-4">Resumo do plano</h3>
                    
                    {(() => {
                      const plan = plans.find(p => p.id === selectedPlan)
                      if (!plan) return null
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-white text-lg">{plan.name}</h4>
                              <p className="text-sm text-white/60">{plan.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-white">R$ {plan.promoPrice}</span>
                              <span className="text-sm text-white/40 line-through ml-2">R$ {plan.price}</span>
                            </div>
                          </div>
                          <div className="bg-white/10 border border-white/20 rounded-lg p-3 mb-4">
                            <p className="text-xs text-white/80 text-center font-medium">
                              <Gift className="h-4 w-4 inline mr-1" />
                              Primeira mensalidade com desconto - depois R$ {plan.price}/mês
                            </p>
                          </div>

                          <div className="border-t border-white/10 pt-4 mb-4">
                            <p className="text-sm font-medium text-white mb-3">Incluso no plano:</p>
                            <ul className="space-y-2">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                                  <Check className="h-4 w-4 text-white shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Zap className="h-5 w-5 text-white mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-white">Acesso gratuito imediato</p>
                                <p className="text-xs text-white/60">
                                  Crie sua conta grátis e explore a plataforma. Ative seu plano quando quiser para desbloquear todos os recursos com desconto na primeira mensalidade.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Lock className="h-4 w-4" />
                        <span>Pagamento seguro via Kirvano</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-white" />
              <span>Garantia de 7 dias</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-white" />
              <span>Cancele quando quiser</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-white" />
              <span>Suporte via WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
