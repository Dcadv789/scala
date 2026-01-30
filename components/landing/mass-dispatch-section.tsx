"use client"

import { 
  Send, 
  Shield, 
  FileCheck, 
  Rocket, 
  MessageSquareText, 
  BarChart3, 
  CheckCircle2,
  Zap,
  Users,
  Clock,
  Target,
  TrendingUp
} from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Sem Risco de Banimento",
    description: "Utilize a API Oficial do WhatsApp Business com total seguranca e conformidade com as politicas do Meta",
  },
  {
    icon: FileCheck,
    title: "Templates Pre-Aprovados",
    description: "Biblioteca de templates validados para cobrancas, remarketing e prospeccao ativa prontos para usar",
  },
  {
    icon: Rocket,
    title: "Alta Velocidade",
    description: "Envie milhares de mensagens por hora com infraestrutura otimizada para grandes volumes",
  },
  {
    icon: BarChart3,
    title: "Metricas em Tempo Real",
    description: "Acompanhe entregas, leituras e respostas de cada campanha em um dashboard completo",
  },
]

const campaignSteps = [
  {
    step: "01",
    title: "Selecione sua Conexao",
    description: "Escolha o numero da API Oficial que deseja usar para o disparo",
    icon: Zap,
  },
  {
    step: "02",
    title: "Importe seus Contatos",
    description: "Faca upload de uma lista CSV ou selecione contatos ja cadastrados",
    icon: Users,
  },
  {
    step: "03",
    title: "Escolha o Template",
    description: "Selecione um template pre-aprovado ou crie um personalizado",
    icon: FileCheck,
  },
  {
    step: "04",
    title: "Agende e Dispare",
    description: "Defina horario de envio e acompanhe tudo pelo chat ao vivo",
    icon: Send,
  },
]

const templateCategories = [
  { 
    name: "Cobrancas", 
    icon: Target,
    examples: ["Lembrete de vencimento", "Boleto disponivel", "Acordo de pagamento"] 
  },
  { 
    name: "Remarketing", 
    icon: TrendingUp,
    examples: ["Carrinho abandonado", "Oferta exclusiva", "Cupom de desconto"] 
  },
  { 
    name: "Prospeccao", 
    icon: Users,
    examples: ["Apresentacao comercial", "Agendamento de reuniao", "Follow-up"] 
  },
]

export function MassDispatchSection() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Header Principal */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Send className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Disparos em Massa</span>
            </div>
            <h2 className="mb-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Realize disparos em massa com a
              <span className="text-primary"> API Oficial do WhatsApp</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-foreground/80 md:text-xl">
              Sem riscos de banimentos. Templates validados e pre-aprovados para cobrancas, remarketing e prospeccao ativa.
            </p>
          </div>

          {/* Beneficios */}
          <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="group rounded-xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-foreground/10"
                >
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary transition-colors group-hover:bg-primary/30">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/70">{benefit.description}</p>
                </div>
              )
            })}
          </div>

          {/* Como Criar uma Campanha */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h3 className="mb-3 font-sans text-2xl font-semibold text-foreground md:text-3xl">
                Crie campanhas em minutos
              </h3>
              <p className="text-foreground/70">
                Processo simples e intuitivo para enviar mensagens em escala
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {campaignSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="relative">
                    {/* Linha conectora */}
                    {index < campaignSteps.length - 1 && (
                      <div className="absolute left-1/2 top-12 hidden h-px w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                    )}
                    
                    <div className="relative rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-foreground/10">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {item.step}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h4 className="mb-2 font-sans text-base font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-foreground/70">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Templates Pre-Aprovados */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h3 className="mb-3 font-sans text-2xl font-semibold text-foreground md:text-3xl">
                Biblioteca de templates validados
              </h3>
              <p className="text-foreground/70">
                Templates pre-aprovados pelo Meta prontos para diferentes casos de uso
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {templateCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div
                    key={category.name}
                    className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-foreground/10"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-sans text-lg font-semibold text-foreground">{category.name}</h4>
                    </div>
                    <ul className="space-y-2">
                      {category.examples.map((example) => (
                        <li key={example} className="flex items-center gap-2 text-sm text-foreground/70">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat ao Vivo + Acompanhamento */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6 md:p-8">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Chat ao Vivo</span>
                </div>
                <h3 className="mb-4 font-sans text-2xl font-semibold text-foreground md:text-3xl">
                  Acompanhe tudo em tempo real
                </h3>
                <p className="mb-6 text-foreground/80">
                  Receba respostas dos seus disparos diretamente no chat ao vivo. Responda leads em segundos e converta mais vendas com atendimento humanizado integrado as suas campanhas.
                </p>
                <ul className="space-y-3">
                  {[
                    "Inbox unificado para todas as conversas",
                    "Historico completo de cada contato",
                    "Respostas rapidas configuráveis",
                    "Atribuicao de conversas para equipe",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground/80">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual do Chat */}
              <div className="relative">
                <div className="overflow-hidden rounded-xl border border-foreground/10 bg-[#111b21] shadow-2xl">
                  {/* Header do Chat */}
                  <div className="flex items-center gap-3 border-b border-foreground/10 bg-[#202c33] px-4 py-3">
                    <div className="h-10 w-10 rounded-full bg-primary/30" />
                    <div>
                      <p className="font-medium text-foreground">Lead da Campanha</p>
                      <p className="text-xs text-foreground/60">Online agora</p>
                    </div>
                  </div>
                  
                  {/* Mensagens */}
                  <div className="space-y-3 p-4">
                    {/* Mensagem enviada */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-lg bg-[#005c4b] px-3 py-2">
                        <p className="text-sm text-foreground">Ola! Temos uma oferta exclusiva para voce. Deseja saber mais?</p>
                        <p className="mt-1 text-right text-xs text-foreground/60">10:30</p>
                      </div>
                    </div>
                    {/* Mensagem recebida */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-[#202c33] px-3 py-2">
                        <p className="text-sm text-foreground">Sim, tenho interesse! Pode me passar mais detalhes?</p>
                        <p className="mt-1 text-right text-xs text-foreground/60">10:32</p>
                      </div>
                    </div>
                    {/* Badge de lead quente */}
                    <div className="flex justify-center">
                      <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                        Lead respondeu em 2 minutos
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Decoracao */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
