"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Smartphone, 
  Monitor, 
  Apple, 
  Chrome,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  Bell,
  Zap,
  Wifi,
  Check
} from "lucide-react"

type Platform = "iphone" | "android" | "windows" | "mac"

const platforms = [
  { id: "iphone" as Platform, name: "iPhone", icon: Apple, color: "bg-gray-800" },
  { id: "android" as Platform, name: "Android", icon: Smartphone, color: "bg-green-600" },
  { id: "windows" as Platform, name: "Windows", icon: Monitor, color: "bg-blue-600" },
  { id: "mac" as Platform, name: "Mac", icon: Apple, color: "bg-gray-700" },
]

const instructions = {
  iphone: [
    { step: 1, title: "Abra o Safari", description: "Acesse app.scalazap.com.br pelo navegador Safari", icon: Chrome },
    { step: 2, title: "Toque em Compartilhar", description: "Clique no icone de compartilhar na barra inferior", icon: Share },
    { step: 3, title: "Adicionar a Tela Inicial", description: "Role para baixo e toque em 'Adicionar a Tela de Inicio'", icon: PlusSquare },
    { step: 4, title: "Confirme", description: "Toque em 'Adicionar' no canto superior direito", icon: Check },
  ],
  android: [
    { step: 1, title: "Abra o Chrome", description: "Acesse app.scalazap.com.br pelo navegador Chrome", icon: Chrome },
    { step: 2, title: "Menu do Chrome", description: "Toque nos 3 pontos no canto superior direito", icon: MoreVertical },
    { step: 3, title: "Instalar aplicativo", description: "Selecione 'Instalar aplicativo' ou 'Adicionar a tela inicial'", icon: Download },
    { step: 4, title: "Confirme", description: "Toque em 'Instalar' na janela que aparecer", icon: Check },
  ],
  windows: [
    { step: 1, title: "Abra o Chrome ou Edge", description: "Acesse app.scalazap.com.br pelo navegador", icon: Chrome },
    { step: 2, title: "Icone de instalacao", description: "Clique no icone de instalacao na barra de endereco", icon: Download },
    { step: 3, title: "Instalar", description: "Clique em 'Instalar' na janela que aparecer", icon: PlusSquare },
    { step: 4, title: "Pronto!", description: "O app sera adicionado ao menu Iniciar e area de trabalho", icon: Check },
  ],
  mac: [
    { step: 1, title: "Abra o Chrome", description: "Acesse app.scalazap.com.br pelo navegador Chrome", icon: Chrome },
    { step: 2, title: "Menu do Chrome", description: "Clique nos 3 pontos no canto superior direito", icon: MoreVertical },
    { step: 3, title: "Instalar ScalaZap", description: "Selecione 'Instalar ScalaZap...' no menu", icon: Download },
    { step: 4, title: "Confirme", description: "Clique em 'Instalar' - o app aparecera no Launchpad", icon: Check },
  ],
}

const benefits = [
  { icon: Bell, title: "Notificacoes em tempo real", description: "Receba alertas de novas mensagens instantaneamente" },
  { icon: Zap, title: "Acesso rapido", description: "Abra o app direto da tela inicial, sem abrir o navegador" },
  { icon: Wifi, title: "Funciona offline", description: "Visualize conversas mesmo sem conexao com internet" },
]

export function DownloadPageSection() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("iphone")

  return (
    <section className="relative w-full px-3 py-16 sm:px-4 md:px-6 md:py-24">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-4">
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 text-[10px]">
              Disponivel nos planos Professional e Ilimitado
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              Instale o ScalaZap no seu dispositivo
            </h2>
            <p className="text-foreground/70 text-xs max-w-xl mx-auto">
              Transforme o ScalaZap em um app nativo e atenda seus clientes de qualquer lugar.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-center gap-2 p-2 rounded-lg bg-foreground/5 border border-foreground/10">
                <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-foreground text-[10px] truncate">{benefit.title}</h4>
                  <p className="text-[9px] text-foreground/60 truncate">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

        {/* Platform Selector + Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left: Platform Selection */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Selecione seu dispositivo</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedPlatform === platform.id
                      ? "border-primary bg-primary/10"
                      : "border-foreground/10 bg-foreground/5 hover:border-foreground/20"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md ${platform.color} flex items-center justify-center`}>
                    <platform.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-medium text-foreground text-[10px]">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <Card className="bg-foreground/5 border-foreground/10">
              <CardContent className="p-3">
                <h4 className="font-semibold text-foreground text-xs mb-2">
                  Como instalar no {platforms.find(p => p.id === selectedPlatform)?.name}
                </h4>
                <div className="space-y-2">
                  {instructions[selectedPlatform].map((instruction) => (
                    <div key={instruction.step} className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{instruction.step}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground text-[11px]">{instruction.title}</h5>
                        <p className="text-[9px] text-foreground/60">{instruction.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Visual Preview */}
          <div className="flex justify-center">
            {(selectedPlatform === "iphone" || selectedPlatform === "android") ? (
              // Mobile Preview
              <div className="relative">
                <div className="w-36 h-64 bg-gradient-to-b from-[#111b21] to-[#0b141a] rounded-2xl border-2 border-foreground/20 shadow-xl overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-b-lg z-10"></div>
                  
                  {/* Screen Content */}
                  <div className="p-2 pt-5 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[6px] font-bold text-white">SZ</span>
                        </div>
                        <span className="text-[8px] text-white font-semibold">ScalaZap</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">3</span>
                      </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="bg-[#202c33] rounded-lg p-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[6px] font-bold">MS</div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[8px] text-white font-medium block truncate">Maria Silva</span>
                            <p className="text-[6px] text-white/60 truncate">Oi! Quero saber...</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#202c33] rounded-lg p-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[6px] font-bold">JS</div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[8px] text-white font-medium block truncate">Joao Santos</span>
                            <p className="text-[6px] text-white/60 truncate">Fechado! Vou fazer o pix</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Nav */}
                    <div className="mt-1 flex justify-around py-1 border-t border-white/10">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded bg-primary/30"></div>
                        <span className="text-[5px] text-primary">Chats</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded bg-white/20"></div>
                        <span className="text-[5px] text-white/40">Envios</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] font-medium px-2 py-0.5 rounded-full">
                  {selectedPlatform === "iphone" ? "iPhone" : "Android"}
                </div>
              </div>
            ) : (
              // Desktop Preview
              <div className="relative w-full max-w-xs">
                <div className="bg-gradient-to-b from-[#111b21] to-[#0b141a] rounded-lg border border-foreground/20 shadow-xl overflow-hidden">
                  {/* Window Bar */}
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#202c33] border-b border-white/10">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <span className="text-[8px] text-white/60">ScalaZap</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex h-36">
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-white/10 p-1">
                      <div className="space-y-1">
                        <div className="bg-[#2a3942] rounded p-1">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <div className="text-[6px] text-white truncate">Maria</div>
                          </div>
                        </div>
                        <div className="bg-[#202c33] rounded p-1">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <div className="text-[6px] text-white truncate">Joao</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col p-1">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-start">
                          <div className="bg-[#202c33] rounded px-1 py-0.5 text-[6px] text-white">
                            Oi! Quero saber mais
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-[#005c4b] rounded px-1 py-0.5 text-[6px] text-white">
                            Claro, vou explicar!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] font-medium px-2 py-0.5 rounded-full">
                  {selectedPlatform === "windows" ? "Windows" : "macOS"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 text-center">
          <p className="text-foreground/60 text-[10px] mb-2">
            Disponivel para assinantes Professional e Ilimitado
          </p>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-xs"
            onClick={() => window.location.href = "/dashboard"}
          >
            Acessar minha conta
          </Button>
        </div>
      </div>
    </div>
  </section>
)
}
