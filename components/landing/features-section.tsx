"use client"

import { Send, MessageCircle, FileText, Users, Phone, Mic } from "lucide-react"

const features = [
  {
    icon: Send,
    title: "Disparos em Massa",
    description: "Envie milhares de mensagens simultaneamente com a API Oficial do WhatsApp",
  },
  {
    icon: MessageCircle,
    title: "Chat ao Vivo",
    description: "Atenda seus clientes em tempo real com inbox organizado e historico completo",
  },
  {
    icon: FileText,
    title: "Gerenciador de Templates",
    description: "Crie e envie templates para aprovacao do Meta diretamente pela plataforma",
  },
  {
    icon: Users,
    title: "Gestao de Contatos",
    description: "Importe listas via CSV e organize seus contatos de forma inteligente",
  },
  {
    icon: Phone,
    title: "Multiplas Conexoes",
    description: "Conecte varios numeros da API Oficial para maxima capacidade de envio",
  },
  {
    icon: Mic,
    title: "ScalaVoice",
    description: "Crie funis de voz com audios, imagens e textos para engajar seus leads",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-12 md:py-24">
  <div className="flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="mb-4 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Tudo que voce precisa em uma plataforma
          </h2>
          <p className="mx-auto max-w-2xl text-base text-foreground/80 md:text-lg">
            Recursos poderosos para escalar suas vendas no WhatsApp com seguranca e estabilidade
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-foreground/10"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-sans text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </section>
  )
}
