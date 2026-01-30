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
    name: "Basico",
    price: "97,90",
    promoPrice: "29,90",
    description: "Ideal para comecar",
    features: ["2 conexoes WhatsApp", "3 membros na equipe", "Disparos ilimitados"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "127,90",
    promoPrice: "39,90",
    popular: true,
    description: "Mais recursos",
    features: ["5 conexoes WhatsApp", "5 membros na equipe", "App Mobile/Desktop", "Suporte prioritario"],
  },
  {
    id: "unlimited",
    name: "Ilimitado",
    price: "197,90",
    promoPrice: "49,90",
    description: "Sem limites",
    features: ["Conexoes ilimitadas", "Equipe ilimitada", "App Mobile/Desktop", "Gerente de conta"],
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
          <div className="text-center mb-4">
            <Badge className="mb-2 bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
              <Gift className="w-3 h-3 mr-1" />
              Primeira mensalidade com desconto
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              Crie sua conta gratis
            </h2>
            <p className="text-foreground/70 text-xs max-w-lg mx-auto">
              Acesse a plataforma gratuitamente. Escolha um plano para desbloquear todos os recursos.
            </p>
          </div>

          {step === "plan" ? (
            <>
              {/* Plan Selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      selectedPlan === plan.id
                        ? "border-primary bg-primary/10"
                        : "border-foreground/10 bg-foreground/5 hover:border-foreground/20"
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 right-2 bg-primary text-primary-foreground text-[8px] px-1.5 py-0">
                        Popular
                      </Badge>
                    )}
                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground text-sm">{plan.name}</h3>
                      <p className="text-[9px] text-foreground/60">{plan.description}</p>
                    </div>
                    <div className="mb-1">
                      <span className="text-lg font-bold text-primary">R$ {plan.promoPrice}</span>
                      <span className="text-xs text-foreground/40 line-through ml-1">R$ {plan.price}</span>
                    </div>
                    <p className="text-[8px] text-green-400 mb-2">1a mensalidade - depois R$ {plan.price}/mes</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center gap-1 text-[9px] text-foreground/70">
                          <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {selectedPlan === plan.id && (
                      <div className="absolute top-2 left-2">
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
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
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Criar Conta Gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-[9px] text-foreground/50 mt-2">
                  Plano selecionado: {plans.find(p => p.id === selectedPlan)?.name} - R$ {plans.find(p => p.id === selectedPlan)?.promoPrice} na 1a mensalidade
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Account Creation Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form */}
                <Card className="bg-foreground/5 border-foreground/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-3">Seus dados</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-foreground/70">Nome completo</Label>
                        <Input
                          placeholder="Seu nome"
                          className="mt-1 h-9 text-sm bg-background/50"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground/70">Email</Label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="mt-1 h-9 text-sm bg-background/50"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground/70">WhatsApp (opcional)</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="mt-1 h-9 text-sm bg-background/50"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground/70">Senha</Label>
                        <div className="relative mt-1">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimo 6 caracteres"
                            className="h-9 text-sm bg-background/50 pr-10"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep("plan")}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCreateAccount}
                        disabled={loading}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Criar conta gratis
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Plan Summary */}
                <Card className="bg-foreground/5 border-foreground/10">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-3">Resumo do plano</h3>
                    
                    {(() => {
                      const plan = plans.find(p => p.id === selectedPlan)
                      if (!plan) return null
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{plan.name}</h4>
                              <p className="text-[10px] text-foreground/60">{plan.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-primary">R$ {plan.promoPrice}</span>
                              <span className="text-xs text-foreground/40 line-through ml-1">R$ {plan.price}</span>
                            </div>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded p-2 mb-3">
                            <p className="text-[9px] text-green-400 text-center">
                              <Gift className="h-3 w-3 inline mr-1" />
                              Primeira mensalidade com desconto - depois R$ {plan.price}/mes
                            </p>
                          </div>

                          <div className="border-t border-foreground/10 pt-3 mb-3">
                            <p className="text-[10px] font-medium text-foreground mb-2">Incluso no plano:</p>
                            <ul className="space-y-1.5">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-[10px] text-foreground/70">
                                  <Check className="h-3 w-3 text-primary shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                            <div className="flex items-start gap-2">
                              <Zap className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-medium text-green-400">Acesso gratuito imediato</p>
                                <p className="text-[9px] text-foreground/60">
                                  Crie sua conta gratis e explore a plataforma. Ative seu plano quando quiser para desbloquear todos os recursos com desconto na primeira mensalidade.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="mt-3 pt-3 border-t border-foreground/10">
                      <div className="flex items-center gap-2 text-[9px] text-foreground/50">
                        <Lock className="h-3 w-3" />
                        <span>Pagamento seguro via Kirvano</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Trust badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-foreground/50">
            <span>Garantia de 7 dias</span>
            <span>•</span>
            <span>Cancele quando quiser</span>
            <span>•</span>
            <span>Suporte via WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  )
}
