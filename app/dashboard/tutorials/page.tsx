"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Zap, 
  Settings, 
  MessageSquare,
  ExternalLink,
  Copy,
  ChevronRight,
  Clock,
  GraduationCap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"

const tutorials = [
  {
    id: "api-oficial",
    title: "Criar API Oficial do WhatsApp",
    description: "Aprenda a criar sua conta no Meta Business e obter as credenciais da API",
    duration: "15 min",
    difficulty: "Iniciante",
    icon: Zap,
    steps: [
      {
        title: "Criar conta no Meta Business",
        content: `
**Passo 1: Acesse o Meta Business Suite**

1. Acesse [business.facebook.com](https://business.facebook.com)
2. Clique em "Criar conta" se ainda nao tiver uma
3. Preencha os dados da sua empresa:
   - Nome da empresa
   - Seu nome
   - Email corporativo
4. Confirme seu email

**Importante:** Use um email profissional, nao use emails pessoais como Gmail ou Hotmail para contas comerciais.
        `,
      },
      {
        title: "Criar App no Meta Developers",
        content: `
**Passo 2: Criar aplicativo no Meta for Developers**

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique em "Meus Apps" no canto superior direito
3. Clique em "Criar App"
4. Selecione "Empresa" como tipo de app
5. Preencha:
   - Nome do app (ex: "Minha Empresa WhatsApp")
   - Email de contato
   - Conta Business (selecione a que voce criou)
6. Clique em "Criar App"

**Dica:** O nome do app nao aparece para seus clientes, e apenas para organizacao interna.
        `,
      },
      {
        title: "Adicionar WhatsApp ao App",
        content: `
**Passo 3: Configurar o produto WhatsApp**

1. No painel do seu app, clique em "Adicionar produtos"
2. Encontre "WhatsApp" e clique em "Configurar"
3. Selecione sua conta Business
4. Voce vera a tela de "Primeiros passos" do WhatsApp

**Na tela de configuracao:**
- Anote o **Phone Number ID** (ex: 968366073024172)
- Anote o **WhatsApp Business Account ID** (WABA ID)
- Esses numeros serao usados na conexao
        `,
      },
      {
        title: "Gerar Token de Acesso Permanente",
        content: `
**Passo 4: Criar Token de Acesso**

1. No menu lateral, va em "Configuracoes do app" > "Basico"
2. Anote o **App ID** e **App Secret**
3. Va em "WhatsApp" > "Configuracao da API"
4. Clique em "Gerar token de acesso"
5. Selecione as permissoes:
   - whatsapp_business_management
   - whatsapp_business_messaging
6. Copie o token gerado

**IMPORTANTE:** 
- O token temporario expira em 24h
- Para token permanente, va em Configuracoes > Tokens de acesso
- Guarde o token em local seguro, ele nao sera mostrado novamente
        `,
      },
      {
        title: "Adicionar Numero de Telefone",
        content: `
**Passo 5: Configurar numero de telefone**

1. Na secao WhatsApp > Configuracao da API
2. Clique em "Adicionar numero de telefone"
3. Preencha os dados:
   - Nome de exibicao da empresa
   - Categoria do negocio
   - Descricao (opcional)
4. Insira o numero de telefone
5. Escolha verificacao por SMS ou Ligacao
6. Digite o codigo recebido

**Requisitos do numero:**
- Deve ser um numero que voce possui
- Nao pode estar vinculado a outro WhatsApp Business
- Pode ser numero fixo ou celular
        `,
      },
    ],
  },
  {
    id: "conectar-plataforma",
    title: "Conectar na Plataforma ScalaZap",
    description: "Configure suas credenciais e ative a conexao com a API Oficial",
    duration: "5 min",
    difficulty: "Iniciante",
    icon: Settings,
    steps: [
      {
        title: "Acessar area de Conexoes",
        content: `
**Passo 1: Navegue ate Conexoes**

1. No menu lateral, clique em "Conexoes"
2. Clique na aba "Adicionar Conexao"
3. Voce vera o formulario de configuracao da API Oficial
        `,
      },
      {
        title: "Inserir credenciais",
        content: `
**Passo 2: Preencha os dados da API**

Insira as informacoes que voce obteve no Meta:

1. **Phone Number ID**: O ID do seu numero de telefone
   - Encontrado em WhatsApp > Configuracao da API
   - Exemplo: 968366073024172

2. **Access Token**: Seu token de acesso
   - O token que voce gerou no passo anterior
   - Comeca com "EAA..."

3. **WABA ID**: WhatsApp Business Account ID
   - Encontrado nas configuracoes do WhatsApp Business
   - Exemplo: 230760384627131

4. Clique em "Conectar API Oficial"
        `,
      },
      {
        title: "Configurar Webhook",
        content: `
**Passo 3: Configure o Webhook no Meta**

Apos conectar, voce recebera os dados do webhook:

1. Copie a **URL do Webhook** fornecida
2. Copie o **Token de Verificacao**
3. Volte ao Meta Developers
4. Va em WhatsApp > Configuracao
5. Clique em "Editar" no Webhook
6. Cole a URL e o Token
7. Clique em "Verificar e salvar"

**Campos para se inscrever:**
- messages
- message_status (opcional)
        `,
      },
      {
        title: "Testar conexao",
        content: `
**Passo 4: Verificar se esta funcionando**

1. Va em "Conexoes" no menu
2. Verifique o status da sua conexao
3. Use o botao "Verificar Webhook" para testar a configuracao
4. Se aparecer "Ativo", esta tudo certo!

**Teste de envio:**
1. Va para a pagina "Chat ao Vivo"
2. Selecione um contato ou crie um novo
3. Envie uma mensagem de teste
4. Verifique se a mensagem chegou

**Problemas comuns:**
- Token expirado: Gere um novo token na pagina de Conexoes
- Webhook nao verificado: Use o botao "Verificar Webhook" na pagina de Conexoes
- Numero nao aprovado: Aguarde aprovacao do Meta
        `,
      },
    ],
  },
  {
    id: "primeiro-disparo",
    title: "Fazer seu Primeiro Disparo",
    description: "Envie sua primeira campanha de mensagens em massa",
    duration: "10 min",
    difficulty: "Iniciante",
    icon: MessageSquare,
    steps: [
      {
        title: "Criar template de mensagem",
        content: `
**Passo 1: Crie um template aprovado**

A API Oficial exige templates aprovados pelo Meta:

1. Va em "Templates" no menu
2. Clique em "Novo Template"
3. Preencha:
   - Nome do template (sem espacos, use underscores)
   - Categoria: Marketing, Transacional ou Autenticacao
   - Idioma: Portugues (Brasil)
4. Escreva sua mensagem
5. Clique em "Enviar para aprovacao"

**Dicas para aprovacao:**
- Nao use linguagem enganosa
- Inclua opcao de descadastro
- Seja claro sobre quem esta enviando
- Aprovacao leva de 1 a 24 horas
        `,
      },
      {
        title: "Importar contatos",
        content: `
**Passo 2: Adicione seus contatos**

1. Va em "Contatos" no menu
2. Clique em "Importar CSV"
3. Seu arquivo deve ter as colunas:
   - nome (opcional)
   - telefone (obrigatorio, com DDD)
4. Selecione o arquivo e clique em "Importar"

**Formato do telefone:**
- Com codigo do pais: 5511999999999
- Apenas numeros, sem espacos ou tracos
- DDD obrigatorio
        `,
      },
      {
        title: "Criar campanha",
        content: `
**Passo 3: Configure sua campanha**

1. Va em "Campanhas" no menu
2. Clique em "Nova Campanha"
3. Preencha:
   - Nome da campanha
   - Selecione o template aprovado
   - Selecione a conexao (API Oficial)
   - Escolha os contatos ou importe lista
4. Configure o intervalo entre mensagens (recomendado: 3-5 segundos)
5. Clique em "Salvar"
        `,
      },
      {
        title: "Iniciar disparo",
        content: `
**Passo 4: Inicie o envio**

1. Na lista de campanhas, encontre sua campanha
2. Clique em "Iniciar"
3. Confirme o envio
4. Acompanhe em tempo real:
   - Mensagens enviadas
   - Entregues
   - Lidas
   - Erros

**Boas praticas:**
- Comece com lotes pequenos (100-500)
- Monitore a taxa de entrega
- Respeite os limites da API
- Nao envie para contatos que nao autorizaram
        `,
      },
    ],
  },
]

const faqs = [
  {
    question: "Quanto custa a API Oficial do WhatsApp?",
    answer: "A API Oficial cobra por conversa. Conversas iniciadas pelo usuario sao gratuitas por 24h. Conversas iniciadas pela empresa (marketing) custam aproximadamente R$ 0,25 a R$ 0,50 por conversa, dependendo do pais.",
  },
  {
    question: "Quanto tempo leva para aprovar minha conta?",
    answer: "A verificacao da conta Business leva de 1 a 7 dias uteis. A aprovacao de templates leva de 1 a 24 horas. Numeros de telefone sao verificados instantaneamente.",
  },
  {
    question: "Posso usar meu numero pessoal do WhatsApp?",
    answer: "Sim, mas voce perdera o acesso ao WhatsApp normal naquele numero. Recomendamos usar um numero dedicado para a empresa.",
  },
  {
    question: "Qual o limite de mensagens por dia?",
    answer: "Contas novas comecam com limite de 250 conversas/dia. Conforme voce envia mensagens com boa qualidade, o limite aumenta para 1.000, depois 10.000, e eventualmente ilimitado.",
  },
  {
    question: "O que acontece se meu numero for bloqueado?",
    answer: "Com a API Oficial, bloqueios sao muito raros se voce seguir as politicas do WhatsApp. Caso ocorra, voce pode recorrer diretamente com o Meta.",
  },
  {
    question: "Preciso de CNPJ para usar a API Oficial?",
    answer: "Sim, a API Oficial requer verificacao da empresa com documentos como CNPJ, contrato social ou comprovante de endereco comercial.",
  },
]

export default function TutorialsPage() {
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({})
  const [activeTutorial, setActiveTutorial] = useState(tutorials[0].id)
  const { toast } = useToast()

  const toggleStep = (tutorialId: string, stepIndex: number) => {
    setCompletedSteps(prev => {
      const current = prev[tutorialId] || []
      if (current.includes(stepIndex)) {
        return { ...prev, [tutorialId]: current.filter(i => i !== stepIndex) }
      }
      return { ...prev, [tutorialId]: [...current, stepIndex] }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a area de transferencia.",
    })
  }

  const getProgress = (tutorialId: string, totalSteps: number) => {
    const completed = completedSteps[tutorialId]?.length || 0
    return Math.round((completed / totalSteps) * 100)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />
      <div className="flex-1">
<DashboardHeader />
          <PaymentPendingBanner />
          <main className="p-6">
            <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Central de Aprendizado</h1>
              </div>
              <p className="text-muted-foreground">
                Aprenda passo a passo como configurar e usar a API Oficial do WhatsApp
              </p>
            </div>

            <Tabs value={activeTutorial} onValueChange={setActiveTutorial} className="space-y-6">
              <TabsList className="grid grid-cols-3 h-auto p-1">
                {tutorials.map((tutorial) => {
                  const Icon = tutorial.icon
                  const progress = getProgress(tutorial.id, tutorial.steps.length)
                  return (
                    <TabsTrigger 
                      key={tutorial.id} 
                      value={tutorial.id}
                      className="flex flex-col items-start gap-1 p-4 h-auto data-[state=active]:bg-primary/10"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{tutorial.title}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {tutorial.duration}
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          {progress}% concluido
                        </Badge>
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {tutorials.map((tutorial) => (
                <TabsContent key={tutorial.id} value={tutorial.id} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {tutorial.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {tutorial.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{tutorial.difficulty}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {completedSteps[tutorial.id]?.length || 0} de {tutorial.steps.length} passos
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${getProgress(tutorial.id, tutorial.steps.length)}%` }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {tutorial.steps.map((step, index) => {
                          const isCompleted = completedSteps[tutorial.id]?.includes(index)
                          return (
                            <div 
                              key={index}
                              className={`border rounded-lg overflow-hidden transition-all ${
                                isCompleted ? "border-primary/50 bg-primary/5" : ""
                              }`}
                            >
                              <button
                                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                                onClick={() => toggleStep(tutorial.id, index)}
                              >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <span className="font-medium">{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-medium ${isCompleted ? "text-primary" : ""}`}>
                                    {step.title}
                                  </h4>
                                </div>
                                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                                  isCompleted ? "rotate-90" : ""
                                }`} />
                              </button>
                              
                              {isCompleted && (
                                <div className="px-4 pb-4 pt-0">
                                  <div className="pl-11 prose prose-sm dark:prose-invert max-w-none">
                                    <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-line">
                                      {step.content}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Links uteis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Links Uteis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="https://business.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Meta Business Suite</p>
                      <p className="text-xs text-muted-foreground">Gerenciar conta Business</p>
                    </div>
                  </a>
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Meta for Developers</p>
                      <p className="text-xs text-muted-foreground">Criar e gerenciar apps</p>
                    </div>
                  </a>
                  <a
                    href="https://developers.facebook.com/docs/whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Documentacao WhatsApp</p>
                      <p className="text-xs text-muted-foreground">Guia oficial da API</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <WhatsAppSupportButton />
    </div>
  )
}
