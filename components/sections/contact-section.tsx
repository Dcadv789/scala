"use client"

import { Instagram, Clock } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"
import { useState, useEffect, type FormEvent } from "react"
import { MagneticButton } from "@/components/magnetic-button"

declare global {
  interface Window {
    fbq: any
  }
}

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [isFormActive, setIsFormActive] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
    currentVolume: "",
    mainGoal: "",
    serviceType: "",
    automationSystem: "",
    usageType: "",
    timeline: "",
    budget: "",
    hasBM: "",
    numbersLost: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const formActiveEvent = new CustomEvent("formActiveChange", { detail: { isActive: isFormActive } })
    window.dispatchEvent(formActiveEvent)
  }, [isFormActive])

  const questions = [
    {
      id: "name",
      label: "Qual é o seu nome?",
      type: "text",
      placeholder: "Seu nome completo",
    },
    {
      id: "email",
      label: "Qual é o seu e-mail?",
      type: "email",
      placeholder: "seu@email.com",
    },
    {
      id: "phone",
      label: "Qual é o seu telefone/WhatsApp?",
      type: "tel",
      placeholder: "(00) 00000-0000",
    },
    {
      id: "company",
      label: "Qual é o nome da sua empresa?",
      type: "text",
      placeholder: "Nome da empresa",
    },
    {
      id: "businessType",
      label: "Qual é o seu tipo de negócio?",
      type: "radio",
      options: ["E-commerce", "Infoprodutos", "Rifas", "iGaming", "Encapsulado", "Rifas e Sorteios", "Outro"],
    },
    {
      id: "currentVolume",
      label: "Qual o volume atual de mensagens por dia?",
      type: "radio",
      options: ["Menos de 100", "100 a 500", "500 a 1.000", "1.000 a 5.000", "Mais de 5.000"],
    },
    {
      id: "hasBM",
      label: "Você possui uma BM para implementarmos o Número?",
      type: "radio",
      options: ["Sim", "Não"],
    },
    {
      id: "numbersLost",
      label: "Quantos números você já perdeu?",
      type: "radio",
      options: ["1 - 5", "5 - 20", "20 - 50", "50+"],
    },
    {
      id: "automationSystem",
      label: "Você já usa algum sistema de automação?",
      type: "radio",
      options: [
        "Sim, uso BotConversa",
        "Sim, uso Evolution API",
        "Sim, uso Telegram",
        "Sim, uso outro sistema",
        "Não, preciso de indicação",
        "Não tenho certeza",
      ],
    },
    {
      id: "usageType",
      label: "Como você pretende usar a API do WhatsApp?",
      type: "radio",
      options: [
        "Disparo em massa de mensagens",
        "Chatbots e respostas automáticas passivas",
        "Ambos (disparo em massa + chatbot)",
        "Ainda não decidi",
      ],
    },
    {
      id: "mainGoal",
      label: "Qual é o seu principal objetivo com o WhatsApp?",
      type: "radio",
      options: [
        "Aumentar Vendas",
        "Melhorar Atendimento",
        "Automatizar Processos",
        "Campanhas de Marketing",
        "Recuperação de Carrinho",
      ],
    },
    {
      id: "timeline",
      label: "Quando você precisa começar?",
      type: "radio",
      options: ["Urgente (24-48h)", "Esta Semana", "Este Mês", "Flexível"],
    },
    {
      id: "budget",
      label: "Qual é o seu orçamento para a solução de WhatsApp API?",
      type: "radio",
      options: ["R$ 700 - R$ 1.500/mês", "R$ 1.500 a R$ 3.000/mês", "R$ 3.000 a R$ 5.000/mês", "Acima de R$ 5.000/mês"],
    },
  ]

  const saveLeadAndRedirectWithData = async (data: typeof formData) => {
    try {
      console.log("[v0] Iniciando salvamento do lead...")

      const formattedPhone = data.phone.startsWith("+") ? data.phone : `+55${data.phone.replace(/\D/g, "")}`

      const leadData = {
        name: data.name,
        email: data.email,
        whatsapp: formattedPhone,
        company: data.company,
        business_type: data.businessType,
        current_volume: data.currentVolume,
        has_bm: data.hasBM,
        numbers_lost: data.numbersLost,
        automation_system: data.automationSystem,
        usage_type: data.usageType,
        goal: data.mainGoal,
        timeline: data.timeline,
        budget: data.budget,
      }

      console.log("[v0] Dados do lead:", leadData)

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] Erro ao salvar lead:", result)
        alert("Erro ao salvar seus dados. Por favor, tente novamente.")
        return
      }

      console.log("[v0] Lead salvo com sucesso:", result)

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Lead", {
          content_name: "WhatsApp API Lead",
          content_category: "Lead Generation",
          value: 0,
          currency: "BRL",
        })

        window.fbq("track", "CompleteRegistration", {
          content_name: "Form Completion",
          status: "completed",
        })

        window.fbq("track", "Contact", {
          content_name: "WhatsApp Funnel Completion",
          content_category: "Funnel to WhatsApp",
        })

        console.log("[v0] Meta Pixel events tracked: Lead + CompleteRegistration + Contact")
      }

      const message = `Olá, preenchi o formulário e quero implementar a API Oficial.

📋 *Minhas Respostas:*

👤 *Nome:* ${data.name}
📧 *Email:* ${data.email}
📱 *Telefone:* ${data.phone}
🏢 *Empresa:* ${data.company}
💼 *Tipo de Negócio:* ${data.businessType}
📊 *Volume de Mensagens:* ${data.currentVolume}
🎯 *Possui BM:* ${data.hasBM}
📵 *Números Perdidos:* ${data.numbersLost}
🤖 *Sistema de Automação:* ${data.automationSystem}
📲 *Tipo de Uso:* ${data.usageType}
🎯 *Objetivo Principal:* ${data.mainGoal}
⏰ *Prazo:* ${data.timeline}
💰 *Orçamento:* ${data.budget}`

      const whatsappURL = `https://wa.me/5511952130474?text=${encodeURIComponent(message)}`

      console.log("[v0] Redirecionando para WhatsApp...")
      window.location.href = whatsappURL
    } catch (error) {
      console.error("[v0] Erro ao processar lead:", error)
      alert("Erro ao processar seus dados. Por favor, tente novamente.")
    }
  }

  const handleRadioChange = (value: string) => {
    const updatedFormData = { ...formData, [currentQuestion.id]: value }
    setFormData(updatedFormData)

    if (currentStep === questions.length - 1) {
      setIsSubmitting(true)
      setTimeout(() => {
        saveLeadAndRedirectWithData(updatedFormData)
      }, 500)
    }
  }

  const handleNext = () => {
    const currentValue = formData[currentQuestion.id as keyof typeof formData]
    const isValid = currentValue !== "" && currentValue !== null

    if (isValid && currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  return (
    <section
      ref={ref}
      onMouseEnter={() => setIsFormActive(true)}
      onMouseLeave={() => setIsFormActive(false)}
      onFocus={() => setIsFormActive(true)}
      onBlur={(e) => {
        // Só desativa se o foco saiu completamente da seção
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFormActive(false)
        }
      }}
      onTouchStart={() => setIsFormActive(true)}
      className="relative w-screen min-h-screen shrink-0 snap-start overflow-y-auto px-4 pb-20 pt-20 md:px-12 md:pb-24 md:pt-32 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12 lg:gap-20">
          <div className="flex flex-col justify-start">
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-2 font-sans text-xl font-light leading-tight tracking-tight text-foreground sm:text-2xl md:mb-3 md:text-3xl lg:text-4xl">
                Chega de Bloqueios.
                <br />
                Comece Agora a<br />
                Vender Mais.
              </h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div
                className={`group block transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Clock className="h-3 w-3 text-foreground/60 md:h-4 md:w-4" />
                  <span className="font-mono text-xs text-foreground/60">Ativação</span>
                </div>
                <p className="text-base text-foreground md:text-xl lg:text-2xl">Em até 24 horas</p>
              </div>

              <a
                href="https://instagram.com/scalazap.br"
                target="_blank"
                rel="noopener noreferrer"
                className={`group block transition-all duration-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "350ms" }}
              >
                <div className="flex items-center gap-2">
                  <Instagram className="h-3 w-3 text-foreground/60 md:h-4 md:w-4" />
                  <span className="font-mono text-xs text-foreground/60">Instagram</span>
                  <span className="ml-auto text-sm text-foreground transition-colors group-hover:text-foreground/70 md:text-base lg:text-lg">
                    @scalazap.br
                  </span>
                </div>
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-foreground/60">
                    Pergunta {currentStep + 1} de {questions.length}
                  </span>
                  <span className="font-mono text-xs text-foreground/60">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full bg-foreground/50 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div
                className={`transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <label className="mb-3 block text-sm font-medium leading-relaxed text-foreground md:mb-4 md:text-base">
                  {currentQuestion.label}
                </label>

                {currentQuestion.type === "radio" && (
                  <div className="space-y-2">
                    {currentQuestion.options?.map((option) => {
                      const isChecked = formData[currentQuestion.id as keyof typeof formData] === option
                      return (
                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                            isChecked
                              ? "border-foreground/60 bg-foreground/15"
                              : "border-foreground/20 bg-foreground/5 hover:border-foreground/40 hover:bg-foreground/10"
                          }`}
                        >
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            value={option}
                            checked={isChecked}
                            onChange={(e) => handleRadioChange(e.target.value)}
                            onFocus={() => setIsFormActive(true)}
                            className="h-4 w-4 shrink-0 cursor-pointer accent-foreground"
                            disabled={isSubmitting}
                          />
                          <span className="text-sm text-foreground md:text-base">{option}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {(currentQuestion.type === "text" ||
                  currentQuestion.type === "email" ||
                  currentQuestion.type === "tel") && (
                  <input
                    type={currentQuestion.type}
                    value={formData[currentQuestion.id as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [currentQuestion.id]: e.target.value })}
                    onFocus={() => setIsFormActive(true)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full rounded-lg border border-foreground/30 bg-transparent px-4 py-3 text-base text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:text-base"
                  />
                )}
              </div>

              {!isSubmitting && currentStep < questions.length - 1 && (
                <div
                  className={`flex gap-3 transition-all duration-700 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: "350ms" }}
                >
                  {currentStep > 0 && (
                    <MagneticButton type="button" variant="secondary" size="lg" className="flex-1" onClick={handleBack}>
                      Voltar
                    </MagneticButton>
                  )}
                  <MagneticButton type="button" variant="primary" size="lg" className="flex-1" onClick={handleNext}>
                    Próxima
                  </MagneticButton>
                </div>
              )}

              {isSubmitting && (
                <div
                  className={`flex items-center justify-center py-4 transition-all duration-700 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: "350ms" }}
                >
                  <p className="text-sm text-foreground/80">Salvando seus dados e redirecionando...</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
