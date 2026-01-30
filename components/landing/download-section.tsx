"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smartphone, Monitor, Download, Check, ChevronRight, Apple, Chrome } from "lucide-react"

export function DownloadSection() {
  const [activeTab, setActiveTab] = useState("iphone")

  const iphoneSteps = [
    { step: 1, title: "Abra o Safari", description: "Acesse scalazap.com.br pelo navegador Safari" },
    { step: 2, title: "Toque no botao Compartilhar", description: "Icone de quadrado com seta para cima na barra inferior" },
    { step: 3, title: "Role e toque em 'Adicionar a Tela de Inicio'", description: "Escolha um nome e confirme" },
    { step: 4, title: "Pronto!", description: "O ScalaZap aparecera como um app na sua tela inicial" },
  ]

  const androidSteps = [
    { step: 1, title: "Abra o Chrome", description: "Acesse scalazap.com.br pelo navegador Chrome" },
    { step: 2, title: "Toque no menu (3 pontos)", description: "No canto superior direito da tela" },
    { step: 3, title: "Selecione 'Instalar aplicativo'", description: "Ou 'Adicionar a tela inicial'" },
    { step: 4, title: "Pronto!", description: "O ScalaZap sera instalado como um app nativo" },
  ]

  const desktopSteps = [
    { step: 1, title: "Abra o Chrome ou Edge", description: "Acesse scalazap.com.br no navegador" },
    { step: 2, title: "Clique no icone de instalacao", description: "Na barra de endereco, clique no icone de computador com seta" },
    { step: 3, title: "Confirme a instalacao", description: "Clique em 'Instalar' no popup que aparecer" },
    { step: 4, title: "Pronto!", description: "O ScalaZap abrira como um aplicativo de desktop" },
  ]

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
            Aplicativo Nativo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Instale o <span className="text-primary">ScalaZap</span> no seu dispositivo
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Acesse a plataforma como um aplicativo nativo, com notificacoes em tempo real e acesso rapido direto da sua tela inicial
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Preview do App */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 border border-primary/20">
              {/* Phone Mockup */}
              <div className="relative mx-auto w-56 md:w-64">
                <div className="bg-[#1a1a1a] rounded-[2.5rem] p-2 shadow-2xl border-4 border-[#2a2a2a]">
                  {/* Notch */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
                  
                  {/* Screen */}
                  <div className="bg-[#111] rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                    {/* Status Bar */}
                    <div className="h-10 bg-[#0a0a0a] flex items-center justify-between px-6 pt-2">
                      <span className="text-[10px] text-white/70">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-white/70 rounded-sm" />
                        <div className="w-1 h-2 bg-primary rounded-sm" />
                      </div>
                    </div>
                    
                    {/* App Content Preview */}
                    <div className="p-3 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <span className="text-white text-sm font-semibold">ScalaZap</span>
                      </div>
                      
                      {/* Chat Preview */}
                      <div className="space-y-2">
                        <div className="bg-[#1e1e1e] rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">M</div>
                            <div className="flex-1">
                              <p className="text-white text-xs font-medium">Maria Silva</p>
                              <p className="text-white/50 text-[10px]">Oi, gostaria de saber...</p>
                            </div>
                            <span className="text-[10px] text-primary">2</span>
                          </div>
                        </div>
                        <div className="bg-[#1e1e1e] rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">J</div>
                            <div className="flex-1">
                              <p className="text-white text-xs font-medium">Joao Santos</p>
                              <p className="text-white/50 text-[10px]">Obrigado pelo atendimento!</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#1e1e1e] rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">A</div>
                            <div className="flex-1">
                              <p className="text-white text-xs font-medium">Ana Costa</p>
                              <p className="text-white/50 text-[10px]">Vou fazer o pagamento...</p>
                            </div>
                            <span className="text-[10px] text-primary">1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Nav */}
                    <div className="absolute bottom-2 left-2 right-2 bg-[#1a1a1a] rounded-2xl p-2 flex justify-around">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 bg-primary/20 rounded-full" />
                        <span className="text-[8px] text-white/50 mt-1">Home</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 bg-primary rounded-full" />
                        <span className="text-[8px] text-primary mt-1">Chat</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 bg-primary/20 rounded-full" />
                        <span className="text-[8px] text-white/50 mt-1">Config</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="bg-background/50 rounded-lg p-2">
                  <p className="text-xs font-medium text-foreground">Notificacoes</p>
                  <p className="text-[10px] text-foreground/60">Em tempo real</p>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <p className="text-xs font-medium text-foreground">Offline</p>
                  <p className="text-[10px] text-foreground/60">Funciona sem internet</p>
                </div>
                <div className="bg-background/50 rounded-lg p-2">
                  <p className="text-xs font-medium text-foreground">Rapido</p>
                  <p className="text-[10px] text-foreground/60">Acesso instantaneo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="iphone" className="gap-1.5 text-xs">
                  <Apple className="h-4 w-4" />
                  iPhone
                </TabsTrigger>
                <TabsTrigger value="android" className="gap-1.5 text-xs">
                  <Smartphone className="h-4 w-4" />
                  Android
                </TabsTrigger>
                <TabsTrigger value="desktop" className="gap-1.5 text-xs">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </TabsTrigger>
              </TabsList>

              <TabsContent value="iphone">
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    {iphoneSteps.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-foreground/60">{item.description}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-foreground/50 flex items-center gap-1">
                        <Check className="h-3 w-3 text-primary" />
                        Use o Safari para melhor experiencia no iOS
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="android">
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    {androidSteps.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-foreground/60">{item.description}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-foreground/50 flex items-center gap-1">
                        <Chrome className="h-3 w-3 text-primary" />
                        Recomendamos usar o Google Chrome
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="desktop">
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    {desktopSteps.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-foreground/60">{item.description}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-foreground/50 flex items-center gap-1">
                        <Check className="h-3 w-3 text-primary" />
                        Funciona no Chrome, Edge e outros navegadores
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button className="w-full mt-4 gap-2" size="lg" onClick={() => window.location.href = "/register"}>
              <Download className="h-4 w-4" />
              Comecar Agora - Gratis
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
