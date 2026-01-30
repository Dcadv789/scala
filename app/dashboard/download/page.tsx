"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  Apple, 
  Chrome,
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  Check
} from "lucide-react"
import Link from "next/link"

type Platform = "iphone" | "android" | "windows" | "mac"

const platforms = [
  { id: "iphone" as Platform, name: "iPhone", icon: Apple, color: "bg-gray-800" },
  { id: "android" as Platform, name: "Android", icon: Smartphone, color: "bg-green-600" },
  { id: "windows" as Platform, name: "Windows", icon: Monitor, color: "bg-blue-600" },
  { id: "mac" as Platform, name: "macOS", icon: Apple, color: "bg-gray-700" },
]

const instructions: Record<Platform, { step: number; title: string; description: string; icon?: any }[]> = {
  iphone: [
    { step: 1, title: "Abra o Safari", description: "Acesse scalazap.com pelo navegador Safari", icon: Chrome },
    { step: 2, title: "Toque em Compartilhar", description: "Toque no icone de compartilhar (quadrado com seta) na barra inferior", icon: Share },
    { step: 3, title: "Adicionar a Tela de Inicio", description: "Role para baixo e toque em 'Adicionar a Tela de Inicio'", icon: PlusSquare },
    { step: 4, title: "Confirme", description: "Toque em 'Adicionar' no canto superior direito", icon: Check },
  ],
  android: [
    { step: 1, title: "Abra o Chrome", description: "Acesse scalazap.com pelo navegador Chrome", icon: Chrome },
    { step: 2, title: "Menu do navegador", description: "Toque nos tres pontos no canto superior direito", icon: MoreVertical },
    { step: 3, title: "Instalar aplicativo", description: "Selecione 'Instalar aplicativo' ou 'Adicionar a tela inicial'", icon: Download },
    { step: 4, title: "Confirme", description: "Toque em 'Instalar' para adicionar o app", icon: Check },
  ],
  windows: [
    { step: 1, title: "Abra o Chrome ou Edge", description: "Acesse scalazap.com pelo navegador", icon: Chrome },
    { step: 2, title: "Icone de instalacao", description: "Clique no icone de instalacao na barra de endereco (lado direito)", icon: Download },
    { step: 3, title: "Instalar", description: "Clique em 'Instalar' na janela que aparecer", icon: PlusSquare },
    { step: 4, title: "Pronto!", description: "O app sera instalado e abrira automaticamente", icon: Check },
  ],
  mac: [
    { step: 1, title: "Abra o Chrome", description: "Acesse scalazap.com pelo navegador Chrome", icon: Chrome },
    { step: 2, title: "Menu do Chrome", description: "Clique nos tres pontos no canto superior direito", icon: MoreVertical },
    { step: 3, title: "Instalar ScalaZap", description: "Selecione 'Instalar ScalaZap...' no menu", icon: Download },
    { step: 4, title: "Confirme", description: "Clique em 'Instalar' para adicionar ao Dock", icon: Check },
  ],
}

const benefits = [
  {
    icon: Smartphone,
    title: "Notificacoes em tempo real",
    description: "Receba alertas de novas mensagens instantaneamente",
  },
  {
    icon: Download,
    title: "Acesso rapido",
    description: "Abra o app direto da tela inicial sem precisar do navegador",
  },
  {
    icon: Monitor,
    title: "Experiencia nativa",
    description: "Interface otimizada que funciona como um app nativo",
  },
]

export default function DownloadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("iphone")

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
            App ScalaZap
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Instale o ScalaZap no seu dispositivo
          </h1>
          <p className="text-foreground/70">
            Transforme o ScalaZap em um aplicativo nativo e atenda seus clientes de qualquer lugar.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-foreground/5 border-foreground/10">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{benefit.title}</h3>
                  <p className="text-xs text-foreground/60">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selecione seu dispositivo</CardTitle>
            <CardDescription>Escolha a plataforma para ver as instrucoes de instalacao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedPlatform === platform.id
                      ? "border-primary bg-primary/10"
                      : "border-foreground/10 bg-foreground/5 hover:border-foreground/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center`}>
                    <platform.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-foreground text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>
              Como instalar no {platforms.find(p => p.id === selectedPlatform)?.name}
            </CardTitle>
            <CardDescription>
              Siga os passos abaixo para adicionar o ScalaZap ao seu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {instructions[selectedPlatform].map((instruction) => (
                <div key={instruction.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">{instruction.step}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-foreground">{instruction.title}</h4>
                    <p className="text-sm text-foreground/70 mt-1">{instruction.description}</p>
                  </div>
                  {instruction.icon && (
                    <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0">
                      <instruction.icon className="w-5 h-5 text-foreground/60" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Preview */}
            {(selectedPlatform === "iphone" || selectedPlatform === "android") && (
              <div className="mt-8 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-80 bg-gradient-to-b from-[#111b21] to-[#0b141a] rounded-3xl border-4 border-foreground/20 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl"></div>
                    <div className="p-3 pt-8 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-white">SZ</div>
                        <span className="text-[10px] text-white/90 font-medium">ScalaZap</span>
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="bg-[#202c33] rounded-lg p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                            <span className="text-[8px] text-white/80">Maria Silva</span>
                          </div>
                          <div className="text-[7px] text-white/60 truncate">Oi, gostaria de saber mais...</div>
                        </div>
                        <div className="bg-[#202c33] rounded-lg p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-green-500"></div>
                            <span className="text-[8px] text-white/80">Joao Santos</span>
                          </div>
                          <div className="text-[7px] text-white/60 truncate">Fechado! Vou fazer o pix</div>
                        </div>
                        <div className="bg-[#202c33] rounded-lg p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                            <span className="text-[8px] text-white/80">Ana Costa</span>
                          </div>
                          <div className="text-[7px] text-white/60 truncate">Qual o prazo de entrega?</div>
                        </div>
                      </div>
                      <div className="mt-2 bg-[#2a3942] rounded-full py-1.5 px-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                        <span className="text-[7px] text-white/40">Digite uma mensagem...</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {selectedPlatform === "iphone" ? "iPhone" : "Android"}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Preview */}
            {(selectedPlatform === "windows" || selectedPlatform === "mac") && (
              <div className="mt-8 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="bg-gradient-to-b from-[#111b21] to-[#0b141a] rounded-xl border border-foreground/20 shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#202c33] border-b border-white/10">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <span className="text-xs text-white/60">ScalaZap</span>
                      </div>
                    </div>
                    <div className="flex h-48">
                      <div className="w-1/3 border-r border-white/10 p-2">
                        <div className="space-y-2">
                          <div className="bg-[#2a3942] rounded p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                              <div className="flex-1">
                                <div className="text-[9px] text-white">Maria Silva</div>
                                <div className="text-[7px] text-white/40 truncate">Oi! Quero saber...</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-[#202c33] rounded p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-500"></div>
                              <div className="flex-1">
                                <div className="text-[9px] text-white">Joao Santos</div>
                                <div className="text-[7px] text-white/40 truncate">Fechado!</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col p-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-start">
                            <div className="bg-[#202c33] rounded-lg px-3 py-2 text-[10px] text-white max-w-[80%]">
                              Oi! Quero saber mais sobre o produto
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="bg-[#005c4b] rounded-lg px-3 py-2 text-[10px] text-white max-w-[80%]">
                              Ola! Claro, vou te explicar tudo!
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 bg-[#2a3942] rounded-full py-2 px-4">
                          <span className="text-[9px] text-white/40">Digite uma mensagem...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {selectedPlatform === "windows" ? "Windows" : "macOS"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-foreground/60 text-sm">
            Precisa de ajuda? Entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </div>
  )
}
