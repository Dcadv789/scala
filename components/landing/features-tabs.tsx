"use client"

import { useState } from "react"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Plug, 
  Shield, 
  Check,
  TrendingUp,
  Users,
  Send,
  Clock,
  BarChart3,
  Zap,
  Brain,
  Webhook
} from "lucide-react"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chat", label: "Chat Interno", icon: MessageSquare },
  { id: "integration", label: "Integração", icon: Plug },
  { id: "meta", label: "Certificada pela Meta", icon: Shield },
]

export function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <section className="relative w-full px-4 py-20 sm:px-6 md:px-12 md:py-32">
      <div className="mx-auto w-full max-w-7xl">
        
        {/* Tabs Navigation */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-[#0d1a1f] shadow-lg"
                    : "bg-[#0d1a1f]/90 text-white hover:bg-[#0d1a1f]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-sm md:p-12">
          
          {activeTab === "dashboard" && (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Coluna Esquerda - Conteúdo */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0d1a1f]/10 px-4 py-2">
                  <LayoutDashboard className="h-4 w-4 text-[#0d1a1f]" />
                  <span className="text-sm font-medium text-[#0d1a1f]">Dashboard</span>
                </div>
                
                <h3 className="mb-6 font-sans text-2xl font-bold text-[#0d1a1f] md:text-3xl">
                  Dashboard Completo em Tempo Real
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-[#0d1a1f]/80">
                  Acompanhe em um só lugar os atendimentos, contatos, setores, agendamentos e campanhas. Tudo atualizado em tempo real para decisões mais rápidas e inteligentes.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Visão geral de atendimentos",
                    "Métricas de performance",
                    "Análise de equipe",
                    "Relatórios personalizados"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-[#0d1a1f]" />
                      <span className="text-[#0d1a1f]/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna Direita - Mockup Visual */}
              <div className="relative">
                {/* Decoração */}
                <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-[#0d1a1f]/10 blur-3xl" />
                
                {/* Card Principal */}
                <div className="relative rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-2xl">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between border-b border-[#0d1a1f]/10 pb-4">
                    <h4 className="font-semibold text-[#0d1a1f]">Visão Geral</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-[#0d1a1f]/60">Ao vivo</span>
                    </div>
                  </div>

                  {/* Métricas Grid */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[#0d1a1f]/10 bg-gradient-to-br from-[#0d1a1f]/5 to-transparent p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Users className="h-5 w-5 text-[#0d1a1f]/60" />
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-[#0d1a1f]">2,847</p>
                      <p className="text-xs text-[#0d1a1f]/60">Conversas ativas</p>
                    </div>
                    <div className="rounded-xl border border-[#0d1a1f]/10 bg-gradient-to-br from-[#0d1a1f]/5 to-transparent p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Send className="h-5 w-5 text-[#0d1a1f]/60" />
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-[#0d1a1f]">45.2K</p>
                      <p className="text-xs text-[#0d1a1f]/60">Mensagens enviadas</p>
                    </div>
                  </div>

                  {/* Mini Gráfico */}
                  <div className="rounded-xl border border-[#0d1a1f]/10 bg-gradient-to-br from-[#0d1a1f]/5 to-transparent p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-[#0d1a1f]">Performance da Semana</p>
                      <BarChart3 className="h-4 w-4 text-[#0d1a1f]/60" />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t bg-gradient-to-t from-[#0d1a1f]/80 to-[#0d1a1f]/40"
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Coluna Esquerda - Conteúdo */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0d1a1f]/10 px-4 py-2">
                  <MessageSquare className="h-4 w-4 text-[#0d1a1f]" />
                  <span className="text-sm font-medium text-[#0d1a1f]">Chat Interno</span>
                </div>
                
                <h3 className="mb-6 font-sans text-2xl font-bold text-[#0d1a1f] md:text-3xl">
                  Chat Interno Integrado
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-[#0d1a1f]/80">
                  Facilite a troca de mensagens entre os atendentes e mantenha todo o time alinhado, sem precisar sair da plataforma. Colaboração ágil para um atendimento mais eficiente.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Comunicação interna instantânea",
                    "Compartilhamento de informações",
                    "Coordenação de equipe",
                    "Histórico de conversas"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-[#0d1a1f]" />
                      <span className="text-[#0d1a1f]/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna Direita - Mockup Chat */}
              <div className="relative">
                {/* Decoração */}
                <div className="absolute -left-8 -top-8 h-64 w-64 rounded-full bg-[#0d1a1f]/10 blur-3xl" />
                
                {/* Card Chat */}
                <div className="relative rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-2xl">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between border-b border-[#0d1a1f]/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0d1a1f]/20 to-[#0d1a1f]/10" />
                      <div>
                        <p className="font-semibold text-[#0d1a1f]">Equipe de Vendas</p>
                        <p className="text-xs text-[#0d1a1f]/60">5 membros online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="space-y-4">
                    {/* Mensagem 1 */}
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10" />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0d1a1f]">João Silva</span>
                          <span className="text-xs text-[#0d1a1f]/40">10:30</span>
                        </div>
                        <div className="rounded-lg border border-[#0d1a1f]/10 bg-[#0d1a1f]/5 p-3">
                          <p className="text-sm text-[#0d1a1f]/80">
                            Preciso de ajuda com o cliente Premium
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mensagem 2 */}
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10" />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0d1a1f]">Maria Costa</span>
                          <span className="text-xs text-[#0d1a1f]/40">10:32</span>
                        </div>
                        <div className="rounded-lg border border-[#0d1a1f]/10 bg-[#0d1a1f]/5 p-3">
                          <p className="text-sm text-[#0d1a1f]/80">
                            Estou transferindo para você agora! 👍
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mensagem 3 - Typing */}
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/10" />
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0d1a1f]">Carlos Souza</span>
                          <span className="text-xs text-[#0d1a1f]/40">digitando...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#0d1a1f]/20 bg-[#0d1a1f]/5 p-3">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-transparent text-sm text-[#0d1a1f] placeholder:text-[#0d1a1f]/40 focus:outline-none"
                      disabled
                    />
                    <Send className="h-4 w-4 text-[#0d1a1f]/40" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "integration" && (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Coluna Esquerda - Conteúdo */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0d1a1f]/10 px-4 py-2">
                  <Plug className="h-4 w-4 text-[#0d1a1f]" />
                  <span className="text-sm font-medium text-[#0d1a1f]">Integrações</span>
                </div>
                
                <h3 className="mb-6 font-sans text-2xl font-bold text-[#0d1a1f] md:text-3xl">
                  Integrações Poderosas para um Atendimento Completo
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#0d1a1f]">
                      <MessageSquare className="h-5 w-5" />
                      WhatsApp Oficial (API Meta)
                    </h4>
                    <p className="text-[#0d1a1f]/80">Atenda com segurança e escalabilidade.</p>
                  </div>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#0d1a1f]">
                      <Send className="h-5 w-5" />
                      Instagram
                    </h4>
                    <p className="text-[#0d1a1f]/80">Converse com seus seguidores direto na plataforma.</p>
                  </div>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#0d1a1f]">
                      <Brain className="h-5 w-5" />
                      ChatGPT
                    </h4>
                    <p className="text-[#0d1a1f]/80">Use inteligência artificial para acelerar respostas e fluxos.</p>
                  </div>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#0d1a1f]">
                      <Webhook className="h-5 w-5" />
                      Webhooks
                    </h4>
                    <p className="text-[#0d1a1f]/80">Integre com qualquer sistema e automatize processos com flexibilidade.</p>
                  </div>
                </div>
              </div>

              {/* Coluna Direita - Cards de Integrações */}
              <div className="relative">
                {/* Decoração */}
                <div className="absolute -right-8 -bottom-8 h-64 w-64 rounded-full bg-[#0d1a1f]/10 blur-3xl" />
                
                {/* Grid de Integrações */}
                <div className="relative grid grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="group rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10 text-4xl">
                      📱
                    </div>
                    <h5 className="mb-2 font-semibold text-[#0d1a1f]">WhatsApp</h5>
                    <p className="text-xs text-[#0d1a1f]/60">
                      Automatize mensagens e use do app mais usado do país.
                    </p>
                  </div>

                  {/* Instagram */}
                  <div className="group rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-500/10 text-4xl">
                      📷
                    </div>
                    <h5 className="mb-2 font-semibold text-[#0d1a1f]">Instagram</h5>
                    <p className="text-xs text-[#0d1a1f]/60">
                      Responda diretos e automatize interações com seus seguidores.
                    </p>
                  </div>

                  {/* ChatGPT */}
                  <div className="group rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-4xl">
                      🧠
                    </div>
                    <h5 className="mb-2 font-semibold text-[#0d1a1f]">ChatGPT</h5>
                    <p className="text-xs text-[#0d1a1f]/60">
                      Conecte sua automação com a inteligência do OpenAI.
                    </p>
                  </div>

                  {/* Webhooks */}
                  <div className="group rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 text-4xl">
                      🔗
                    </div>
                    <h5 className="mb-2 font-semibold text-[#0d1a1f]">Webhooks</h5>
                    <p className="text-xs text-[#0d1a1f]/60">
                      Integre com qualquer sistema externo. Receba ou envie dados em tempo real.
                    </p>
                  </div>

                  {/* ElevenLabs (adicional) */}
                  <div className="group col-span-2 rounded-2xl border border-[#0d1a1f]/30 bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-4xl">
                        🎙️
                      </div>
                      <div>
                        <h5 className="mb-1 font-semibold text-[#0d1a1f]">ElevenLabs</h5>
                        <p className="text-xs text-[#0d1a1f]/60">
                          Transforme texto em voz com qualidade humana.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "meta" && (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Coluna Esquerda - Conteúdo */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0d1a1f]/10 px-4 py-2">
                  <Shield className="h-4 w-4 text-[#0d1a1f]" />
                  <span className="text-sm font-medium text-[#0d1a1f]">Certificada pela Meta</span>
                </div>
                
                <h3 className="mb-6 font-sans text-2xl font-bold text-[#0d1a1f] md:text-3xl">
                  Parceira Oficial da Meta (WhatsApp Business API)
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-[#0d1a1f]/80">
                  O ScalaZap é uma plataforma aprovada e certificada pela Meta, o que garante total conformidade com as diretrizes do WhatsApp Business API.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-xl border border-[#0d1a1f]/10 bg-white/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xl">
                      🛡️
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#0d1a1f]">Baixo risco de banimento</h4>
                      <p className="text-sm text-[#0d1a1f]/70">Total conformidade com as políticas da Meta</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 rounded-xl border border-[#0d1a1f]/10 bg-white/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xl">
                      🔗
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#0d1a1f]">Conexão estável e autorizada</h4>
                      <p className="text-sm text-[#0d1a1f]/70">Infraestrutura oficial e confiável</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 rounded-xl border border-[#0d1a1f]/10 bg-white/50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xl">
                      🎯
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#0d1a1f]">Suporte prioritário</h4>
                      <p className="text-sm text-[#0d1a1f]/70">Prioridade e assistência técnica oficial</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita - Badge Meta */}
              <div className="relative">
                {/* Decoração */}
                <div className="absolute -left-8 -bottom-8 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                
                {/* Card Certificado */}
                <div className="relative rounded-2xl border-2 border-[#0d1a1f]/30 bg-white p-8 shadow-2xl">
                  {/* Logo Meta */}
                  <div className="mb-6 flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                      <div className="text-6xl">∞</div>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="mb-6 text-center">
                    <h4 className="mb-2 text-xl font-bold text-[#0d1a1f]">Certificado Oficial Meta</h4>
                    <p className="text-sm text-[#0d1a1f]/60">Business Solution Provider</p>
                  </div>

                  {/* Badge de Verificação */}
                  <div className="mb-6 flex items-center justify-center gap-2 rounded-full bg-green-500/10 px-4 py-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">Verificado</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 border-t border-[#0d1a1f]/10 pt-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0d1a1f]/60">Status</span>
                      <span className="font-semibold text-green-600">Ativo</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0d1a1f]/60">Categoria</span>
                      <span className="font-semibold text-[#0d1a1f]">BSP</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0d1a1f]/60">Região</span>
                      <span className="font-semibold text-[#0d1a1f]">Global</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  )
}

