"use client"

import { MessageSquareText, CheckCircle2 } from "lucide-react"

export function RealtimeChatSection() {
  return (
    <section className="relative w-full px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-6xl">
          
          {/* Chat ao Vivo + Acompanhamento */}
          <div className="rounded-2xl border border-[#0d1a1f]/20 bg-gradient-to-br from-[#0d1a1f]/10 to-transparent p-8 md:p-10">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#0d1a1f]/20 px-4 py-2">
                  <MessageSquareText className="h-4 w-4 text-[#0d1a1f]" />
                  <span className="text-sm font-medium text-[#0d1a1f] md:text-base">Chat ao Vivo</span>
                </div>
                <h3 className="mb-6 font-sans text-2xl font-semibold text-[#0d1a1f] md:text-3xl lg:text-4xl">
                  Acompanhe tudo em tempo real
                </h3>
                <p className="mb-8 text-base text-[#0d1a1f]/80 md:text-lg">
                  Receba respostas dos seus disparos diretamente no chat ao vivo. Responda leads em segundos e converta mais vendas com atendimento humanizado integrado às suas campanhas.
                </p>
                <ul className="space-y-4">
                  {[
                    "Inbox unificado para todas as conversas",
                    "Histórico completo de cada contato",
                    "Respostas rápidas configuráveis",
                    "Atribuição de conversas para equipe",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#0d1a1f]/80 md:text-base">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0d1a1f]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual do Chat */}
              <div className="relative">
                <div className="overflow-hidden rounded-xl border border-white/20 bg-[#111b21] shadow-2xl">
                  {/* Header do Chat */}
                  <div className="flex items-center gap-3 border-b border-white/10 bg-[#202c33] px-4 py-3">
                    <div className="h-10 w-10 rounded-full bg-[#0d1a1f]" />
                    <div>
                      <p className="font-medium text-white">Lead da Campanha</p>
                      <p className="text-xs text-white/60">Online agora</p>
                    </div>
                  </div>
                  
                  {/* Mensagens */}
                  <div className="space-y-3 p-4">
                    {/* Mensagem enviada */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-lg bg-[#0d1a1f] px-3 py-2">
                        <p className="text-sm text-white">Olá! Temos uma oferta exclusiva para você. Deseja saber mais?</p>
                        <p className="mt-1 text-right text-xs text-white/60">10:30</p>
                      </div>
                    </div>
                    {/* Mensagem recebida */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-[#202c33] px-3 py-2">
                        <p className="text-sm text-white">Sim, tenho interesse! Pode me passar mais detalhes?</p>
                        <p className="mt-1 text-right text-xs text-white/60">10:32</p>
                      </div>
                    </div>
                    {/* Badge de lead quente */}
                    <div className="flex justify-center">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0d1a1f]">
                        Lead respondeu em 2 minutos
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Decoração */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#0d1a1f]/20 blur-3xl" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-[#0d1a1f]/10 blur-3xl" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

