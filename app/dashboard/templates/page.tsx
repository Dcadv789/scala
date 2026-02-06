"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { authFetch } from "@/lib/auth-fetch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  FileIcon,
  Upload,
  X,
  Phone,
  LinkIcon,
  RefreshCw,
  DollarSign,
  ExternalLink,
  Info,
  Copy,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlanGuard } from "@/components/auth/plan-guard"

type Template = {
  id: string
  name: string
  status: "pending" | "approved" | "rejected"
  category: "marketing" | "transactional" | "otp"
  language: string
  headerType?: "text" | "image" | "video" | "document"
  headerText?: string
  headerMediaHandle?: string
  headerMediaUrl?: string
  body: string
  bodyVariables?: number
  footer?: string
  buttons?: Array<{
    type: "quick_reply" | "call_to_action"
    subType?: "phone_number" | "url"
    text: string
    phoneNumber?: string
    url?: string
    urlType?: "static" | "dynamic"
  }>
  createdAt: string
  rejectionReason?: string
  qualityScore?: number
}

function TemplatesPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedConnection, setSelectedConnection] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [connections, setConnections] = useState<any[]>([])
  const [metaTemplates, setMetaTemplates] = useState<any[]>([])
  const [localTemplates, setLocalTemplates] = useState<any[]>([]) // Templates locais (NOT_SENT)
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState("meta")
  const [payloadPreviewOpen, setPayloadPreviewOpen] = useState(false)
  const [connectionSelectModalOpen, setConnectionSelectModalOpen] = useState(false)
  const [selectedConnectionInModal, setSelectedConnectionInModal] = useState("")
  const [templateToSend, setTemplateToSend] = useState<any>(null)
  const [selectedTemplateToSend, setSelectedTemplateToSend] = useState<any>(null)
  const [payloadToSend, setPayloadToSend] = useState<any>(null)
  const [templateDetailsOpen, setTemplateDetailsOpen] = useState(false)
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState<any>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateCategory, setTemplateCategory] = useState("marketing")
  const [templateLanguage, setTemplateLanguage] = useState("pt_BR")
  const [headerType, setHeaderType] = useState("none")
  const [headerText, setHeaderText] = useState("")
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null)
  const [headerMediaPreview, setHeaderMediaPreview] = useState<string | null>(null)
  const [templateBody, setTemplateBody] = useState("")
  const [templateFooter, setTemplateFooter] = useState("")
  const [buttons, setButtons] = useState<Array<{
    type: "quick_reply" | "call_to_action"
    subType?: "phone_number" | "url"
    text: string
    phoneNumber?: string
    url?: string
    urlType?: "static" | "dynamic"
  }>>([])

  const { toast } = useToast()

  // Carregar templates do banco de dados
  const loadTemplatesFromDB = async () => {
    try {
      console.log("[Templates] Carregando templates do banco de dados...")
      const response = await authFetch("/api/templates")
      const data = await response.json()
      
      console.log("[Templates] Resposta da API de templates:", {
        success: data.success,
        templatesCount: data.templates?.length || 0
      })
      
      if (data.success && data.templates) {
        console.log("[Templates] Templates encontrados no banco:", data.templates.length)
        
        // Converter templates do banco para formato da página
        const convertedTemplates = data.templates.map((t: any) => {
          // Converter componentes do formato do banco para array de componentes
          const componentsArray: any[] = []
          
          if (t.componentes) {
            // Header
            if (t.componentes.header) {
              componentsArray.push({
                type: "HEADER",
                format: t.componentes.header.format || "TEXT",
                text: t.componentes.header.text,
                example: t.componentes.header.example
              })
            }
            
            // Body
            if (t.componentes.body) {
              componentsArray.push({
                type: "BODY",
                text: t.componentes.body.text,
                example: t.componentes.body.example
              })
            }
            
            // Footer
            if (t.componentes.footer) {
              componentsArray.push({
                type: "FOOTER",
                text: t.componentes.footer.text
              })
            }
            
            // Buttons - pode ser array direto ou objeto com buttons
            if (t.componentes.buttons) {
              if (Array.isArray(t.componentes.buttons)) {
                // Se já é array, verificar se tem estrutura de buttons
                t.componentes.buttons.forEach((btnGroup: any) => {
                  if (btnGroup.buttons && Array.isArray(btnGroup.buttons)) {
                    componentsArray.push({
                      type: "BUTTONS",
                      buttons: btnGroup.buttons
                    })
                  } else if (btnGroup.type) {
                    // Pode ser um botão direto
                    componentsArray.push({
                      type: "BUTTONS",
                      buttons: [btnGroup]
                    })
                  }
                })
              } else if (t.componentes.buttons.buttons && Array.isArray(t.componentes.buttons.buttons)) {
                componentsArray.push({
                  type: "BUTTONS",
                  buttons: t.componentes.buttons.buttons
                })
              }
            }
          }
          
          return {
            id: t.id,
            name: t.nome,
            status: t.status?.toUpperCase() || "PENDING",
            category: t.categoria?.toUpperCase() || "MARKETING",
            language: t.idioma || "pt_BR",
            components: componentsArray,
            createdAt: t.criado_em,
            rejectedReason: t.motivo_rejeicao,
            metaTemplateId: t.id_meta,
            // Dados originais do banco para referência
            dbData: t
          }
        })
        
        // Separar templates locais (NOT_SENT) dos templates da Meta
        const local = convertedTemplates.filter((t: any) => t.status === "NOT_SENT")
        const meta = convertedTemplates.filter((t: any) => t.status !== "NOT_SENT")
        
        setLocalTemplates(local)
        setMetaTemplates(meta)
        console.log("[Templates] ✅ Templates carregados do banco:")
        console.log("[Templates] - Templates locais (NOT_SENT):", local.length)
        console.log("[Templates] - Templates da Meta:", meta.length)
      } else {
        console.log("[Templates] Nenhum template encontrado no banco ou erro na resposta")
        setMetaTemplates([])
      }
    } catch (error) {
      console.error("[Templates] ❌ Erro ao carregar templates do banco:", error)
      setMetaTemplates([])
    }
  }

  // Sincronizar templates da Meta
  const handleSyncTemplates = async () => {
    setIsSyncing(true)
    try {
      console.log("[Templates] Iniciando sincronização com a Meta...")
      
      const response = await authFetch("/api/templates/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      console.log("[Templates] Resposta da API de sincronização:", response.status)
      const data = await response.json()
      console.log("[Templates] Dados da resposta:", data)

      if (data.success) {
        console.log("[Templates] ✅ Sincronização bem-sucedida!")
        console.log("[Templates] Total processado:", data.total || 0)
        console.log("[Templates] Criados:", data.criados || 0)
        console.log("[Templates] Atualizados:", data.atualizados || 0)
        
        toast({
          title: "Sincronização concluída!",
          description: `${data.total || 0} template(s) processado(s). ${data.criados || 0} criado(s), ${data.atualizados || 0} atualizado(s).`,
        })
        
        // Aguardar um pouco para garantir que o banco foi atualizado
        console.log("[Templates] Aguardando 1 segundo antes de recarregar templates...")
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Recarregar templates do banco
        console.log("[Templates] Recarregando templates do banco após sincronização...")
        await loadTemplatesFromDB()
        console.log("[Templates] ====== SINCRONIZAÇÃO FINALIZADA ======")
      } else {
        console.error("[Templates] Erro na sincronização:", data.error)
        toast({
          title: "Erro na sincronização",
          description: data.error || "Não foi possível sincronizar os templates",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[Templates] Erro ao sincronizar:", error)
      toast({
        title: "Erro ao sincronizar",
        description: error.message || "Ocorreu um erro ao sincronizar os templates",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const loadMetaTemplates = async (conn: any) => {
    const wabaId = conn?.waba_id || conn?.wabaId
    const accessToken = conn?.access_token || conn?.accessToken
    
    if (!wabaId || !accessToken) {
      console.log("[v0] Missing wabaId or accessToken:", { wabaId, accessToken: !!accessToken })
      return
    }
    
    setIsLoadingMeta(true)
    try {
      const response = await fetch(
        `/api/whatsapp/templates?wabaId=${wabaId}&accessToken=${accessToken}`
      )
      const data = await response.json()
      
      console.log("[v0] Meta templates response:", data)
      
      if (data.success) {
        setMetaTemplates(data.templates || [])
      } else {
        console.error("[v0] Failed to load templates:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error loading Meta templates:", error)
    } finally {
      setIsLoadingMeta(false)
    }
  }

  useEffect(() => {
    // PRIMEIRO: Carregar templates do banco de dados imediatamente
    loadTemplatesFromDB()
    
    // DEPOIS: Carregar conexões e outros dados
    const loadData = async () => {
      try {
        // Verificar autenticação antes de fazer requisições
        const authToken = localStorage.getItem("scalazap_auth_token") || 
          (() => {
            const session = localStorage.getItem("scalazap_auth_session")
            if (session) {
              try {
                return JSON.parse(session).access_token
              } catch {}
            }
            return null
          })()
        
        const userJson = localStorage.getItem("scalazap_user")
        
        console.log("[Templates] Verificando autenticação:", {
          hasToken: !!authToken,
          hasUser: !!userJson,
          tokenLength: authToken?.length || 0
        })
        
        if (!authToken || !userJson) {
          console.error("[Templates] Usuário não autenticado. Faça login novamente.")
          return
        }

        // Carregar conexões da API do Supabase
        console.log("[Templates] Fazendo requisição para /api/connections...")
        const response = await authFetch("/api/connections")
        const data = await response.json()
        
        console.log("[Templates] Connections response status:", response.status)
        console.log("[Templates] Connections response data:", data)
        
        if (response.status === 401) {
          console.error("[Templates] Não autenticado (401). Verifique o token.")
          toast({
            title: "Erro de autenticação",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive",
          })
          return
        }
        
        if (data.success && data.connections) {
          // Aceitar todas as conexões, não apenas as "connected"
          const allConnections = data.connections
          setConnections(allConnections)
          
          console.log("[Templates] All connections:", allConnections)
          console.log("[Templates] Primeira conexão completa:", allConnections[0])
          console.log("[Templates] Connections com waba_id:", allConnections.filter((c: any) => c.waba_id))
          console.log("[Templates] Connections com id_waba:", allConnections.filter((c: any) => c.id_waba))
          console.log("[Templates] Connections com access_token:", allConnections.filter((c: any) => c.access_token))
          
          const validConnections = allConnections.filter((c: any) => (c.waba_id || c.id_waba) && c.access_token)
          console.log("[Templates] Connections válidas (waba_id/id_waba + access_token):", validConnections.length)
          console.log("[Templates] Verificação de conexão válida:", validConnections.length > 0)
          
          // Auto-selecionar a primeira conexão válida se houver conexões disponíveis
          if (validConnections.length > 0) {
            // Usar forma funcional do setState para evitar problemas de dependência
            setSelectedConnection((current) => {
              // Se já há uma conexão selecionada, verificar se ela ainda é válida
              if (current) {
                const currentSelected = allConnections.find((c: any) => c.id === current)
                const isCurrentValid = currentSelected && (currentSelected.waba_id || currentSelected.id_waba) && currentSelected.access_token
                if (isCurrentValid) {
                  return current // Manter a seleção atual se ainda é válida
                }
              }
              // Se não há seleção ou a seleção atual não é válida, usar a primeira válida
              console.log("[Templates] ✅ Auto-selecionada primeira conexão válida:", validConnections[0].id)
              return validConnections[0].id
            })
          }
        } else {
          console.log("[Templates] No connections found or API error:", data)
        }
      } catch (error) {
        console.error("[Templates] Error loading connections:", error)
        setConnections([])
      }
    }
    
    loadData()
  }, [])

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setHeaderMediaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setHeaderMediaPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addButton = (type: "quick_reply" | "call_to_action") => {
    if (buttons.length >= 3) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 3 botões",
        variant: "destructive",
      })
      return
    }

    setButtons([
      ...buttons,
      {
        type,
        text: "",
        ...(type === "call_to_action" && { subType: "url" as const }),
      },
    ])
  }

  const updateButton = (index: number, updates: Partial<(typeof buttons)[0]>) => {
    const newButtons = [...buttons]
    newButtons[index] = { ...newButtons[index], ...updates }
    setButtons(newButtons)
  }

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index))
  }

  const countVariables = (text: string): number => {
    const matches = text.match(/\{\{(\d+)\}\}/g)
    return matches ? matches.length : 0
  }

  // Construir componentes do template
  const buildTemplateComponents = () => {
    const components: any[] = []

    // Header component
    if (headerType !== "none") {
      const headerComponent: any = { type: "HEADER", format: headerType.toUpperCase() }

      if (headerType === "text") {
        headerComponent.text = headerText
        if (countVariables(headerText) > 0) {
          headerComponent.example = { header_text: [headerText.replace(/\{\{\d+\}\}/g, "exemplo")] }
        }
      } else if (["image", "video", "document"].includes(headerType) && headerMediaFile) {
        // Para templates locais, não fazemos upload ainda
        // O upload será feito quando enviar à Meta
        headerComponent.format = headerType.toUpperCase()
      }

      components.push(headerComponent)
    }

    // Body component
    const bodyVariables = countVariables(templateBody)
    const bodyComponent: any = {
      type: "BODY",
      text: templateBody,
    }

    if (bodyVariables > 0) {
      bodyComponent.example = {
        body_text: [Array(bodyVariables).fill("exemplo")],
      }
    }

    components.push(bodyComponent)

    // Footer component
    if (templateFooter) {
      components.push({
        type: "FOOTER",
        text: templateFooter,
      })
    }

    // Buttons component
    if (buttons.length > 0) {
      const buttonComponents = buttons.map((btn) => {
        if (btn.type === "quick_reply") {
          return {
            type: "QUICK_REPLY",
            text: btn.text,
          }
        } else {
          // Call to action
          if (btn.subType === "phone_number") {
            return {
              type: "PHONE_NUMBER",
              text: btn.text,
              phone_number: btn.phoneNumber,
            }
          } else {
            return {
              type: "URL",
              text: btn.text,
              url: btn.url,
              ...(btn.urlType === "dynamic" && {
                example: [btn.url],
              }),
            }
          }
        }
      })

      components.push({
        type: "BUTTONS",
        buttons: buttonComponents,
      })
    }

    return components
  }

  // Criar template localmente primeiro (sem enviar à Meta)
  const handleCreateTemplate = async () => {
    // ============================================
    // VALIDAÇÃO 1: CAMPOS OBRIGATÓRIOS BÁSICOS
    // ============================================
    if (!templateName || !templateBody) {
      toast({
        title: "Erro",
        description: "Nome e corpo do template são obrigatórios",
        variant: "destructive",
      })
      return
    }

    // ============================================
    // VALIDAÇÃO 2: SANITIZAÇÃO DO NOME
    // ============================================
    const nomeSanitizado = templateName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")

    if (!nomeSanitizado || nomeSanitizado.length === 0) {
      toast({
        title: "Erro",
        description: "Nome do template inválido. Use apenas letras, números e underscores.",
        variant: "destructive",
      })
      return
    }

    // ============================================
    // VALIDAÇÃO 3: CATEGORIA
    // ============================================
    const categoriaUpper = templateCategory.toUpperCase()
    if (!["MARKETING", "UTILITY", "AUTHENTICATION"].includes(categoriaUpper)) {
      toast({
        title: "Erro",
        description: "Categoria inválida. Use: Marketing, Utility ou Authentication",
        variant: "destructive",
      })
      return
    }

    // ============================================
    // VALIDAÇÃO 4: BODY OBRIGATÓRIO
    // ============================================
    if (!templateBody.trim()) {
      toast({
        title: "Erro",
        description: "O corpo da mensagem é obrigatório",
        variant: "destructive",
      })
      return
    }

    // ============================================
    // VALIDAÇÃO 5: VARIÁVEIS DO CORPO
    // ============================================
    // Encontrar todas as variáveis no formato {{...}}
    const variaveisRegex = /\{\{([^}]+)\}\}/g
    const variaveisEncontradas: string[] = []
    let match
    while ((match = variaveisRegex.exec(templateBody)) !== null) {
      variaveisEncontradas.push(match[1].trim())
    }

    // Verificar se há variáveis com nomes (não números) e corrigir automaticamente
    const variaveisInvalidas = variaveisEncontradas.filter(v => !/^\d+$/.test(v))
    let bodyTextCorrigido = templateBody
    if (variaveisInvalidas.length > 0) {
      let contador = 1
      const variaveisUnicas = [...new Set(variaveisInvalidas)]
      
      variaveisUnicas.forEach(variavel => {
        const regex = new RegExp(`\\{\\{${variavel}\\}\\}`, "g")
        bodyTextCorrigido = bodyTextCorrigido.replace(regex, `{{${contador}}}`)
        contador++
      })
      
      // Atualizar o estado do body com a versão corrigida
      setTemplateBody(bodyTextCorrigido)
      
      toast({
        title: "Variáveis corrigidas",
        description: "Variáveis com nomes foram convertidas para números sequenciais ({{1}}, {{2}}, etc.)",
        variant: "default",
      })
    }

    // ============================================
    // VALIDAÇÃO 6: BOTÕES (CRÍTICO)
    // ============================================
    if (buttons.length > 0) {
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        
        // Validar texto do botão (obrigatório e máximo 25 caracteres)
        if (!button.text || button.text.trim().length === 0) {
          toast({
            title: "Erro",
            description: `Botão ${i + 1}: O texto do botão é obrigatório`,
            variant: "destructive",
          })
          return
        }

        if (button.text.length > 25) {
          toast({
            title: "Erro",
            description: `Botão ${i + 1}: O texto deve ter no máximo 25 caracteres`,
            variant: "destructive",
          })
          return
        }

        // Validação específica para botões de ação (call_to_action)
        if (button.type === "call_to_action") {
          // Verificar se o subType foi selecionado
          if (!button.subType) {
            toast({
              title: "Erro",
              description: `Botão ${i + 1}: Selecione o tipo de ação (Link ou Telefone)`,
              variant: "destructive",
            })
            return
          }

          // Se é URL
          if (button.subType === "url") {
            if (!button.url || button.url.trim().length === 0) {
              toast({
                title: "Erro",
                description: `Botão ${i + 1}: A URL é obrigatória para botões do tipo Link (URL). Por favor, adicione um link válido começando com http:// ou https://`,
                variant: "destructive",
              })
              return
            }

            // Validar se URL começa com http:// ou https://
            const urlTrimmed = button.url.trim()
            if (!urlTrimmed.startsWith("http://") && !urlTrimmed.startsWith("https://")) {
              toast({
                title: "Erro",
                description: `Botão ${i + 1}: A URL deve começar com http:// ou https://`,
                variant: "destructive",
              })
              return
            }
          }
          
          // Se é PHONE_NUMBER
          if (button.subType === "phone_number") {
            if (!button.phoneNumber || button.phoneNumber.trim().length === 0) {
              toast({
                title: "Erro",
                description: `Botão ${i + 1}: O número de telefone é obrigatório para botões do tipo Telefone. Por favor, adicione um número com DDI (ex: +5511999999999).`,
                variant: "destructive",
              })
              return
            }

            // Validar formato do telefone (deve começar com + e ter DDI)
            const phoneTrimmed = button.phoneNumber.trim()
            if (!phoneTrimmed.startsWith("+")) {
              toast({
                title: "Erro",
                description: `Botão ${i + 1}: O número de telefone deve começar com + e incluir DDI (ex: +5511999999999)`,
                variant: "destructive",
              })
              return
            }
          }
        }
      }
    }

    setIsSubmitting(true)

    try {
      const components = buildTemplateComponents()

      // Estrutura de componentes para salvar no banco
      // IMPORTANTE: Não enviar campos null - apenas incluir se tiver conteúdo
      const componentesStructure: any = {
        body: {
          type: "BODY",
          text: bodyTextCorrigido.trim(), // Usar a versão corrigida das variáveis
        }
      }

      // Header - adicionar apenas se não for "none" e tiver conteúdo
      if (headerType !== "none" && headerType) {
        const headerData: any = {
          type: "HEADER",
          format: headerType.toUpperCase()
        }
        
        // Se for texto, adicionar o texto
        if (headerType === "text" && headerText && headerText.trim() !== "") {
          headerData.text = headerText.trim()
        }
        
        componentesStructure.header = headerData
      }

      // Footer - adicionar apenas se tiver texto
      if (templateFooter && templateFooter.trim() !== "") {
        componentesStructure.footer = {
          type: "FOOTER",
          text: templateFooter.trim()
        }
      }

      // Buttons - adicionar apenas se houver botões válidos
      if (buttons.length > 0) {
        componentesStructure.buttons = buttons.map((btn) => {
          const buttonData: any = {
            type: btn.type === "quick_reply" ? "QUICK_REPLY" : (btn.subType === "phone_number" ? "PHONE_NUMBER" : "URL"),
            text: btn.text.trim()
          }

          // Adicionar campos específicos conforme o tipo
          if (btn.subType === "url" && btn.url && btn.url.trim() !== "") {
            buttonData.url = btn.url.trim()
          } else if (btn.subType === "phone_number" && btn.phoneNumber && btn.phoneNumber.trim() !== "") {
            buttonData.phone_number = btn.phoneNumber.trim()
          }

          return buttonData
        })
      }

      // Criar template localmente no banco
      const response = await authFetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeSanitizado, // Usar nome sanitizado
          categoria: categoriaUpper, // Usar categoria validada
          idioma: templateLanguage,
          componentes: componentesStructure,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Falha ao criar template")
      }

      toast({
        title: "Template criado com sucesso!",
        description: "O template foi salvo localmente. Agora você pode visualizar o payload e enviar à Meta.",
      })

      // Recarregar templates do banco
      await loadTemplatesFromDB()

      // Reset form
      resetForm()
      setDialogOpen(false)
      
      // Mudar para aba "Meus Templates" para ver o template criado
      setActiveTab("local")
    } catch (error: any) {
      console.error("Template creation error:", error)
      toast({
        title: "Erro ao criar template",
        description: error.message || "Ocorreu um erro ao criar o template. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Preparar payload e mostrar preview antes de enviar à Meta
  const handlePrepareSendToMeta = async (template: any, connectionId?: string) => {
    // Se connectionId foi fornecido, usar ele; senão, usar a selecionada no modal
    const targetConnectionId = connectionId || selectedConnectionInModal
    
    if (!targetConnectionId) {
      toast({
        title: "Erro",
        description: "Selecione uma conexão para enviar o template",
        variant: "destructive",
      })
      return
    }

    const connection = connections.find((c) => c.id === targetConnectionId)
    if (!connection) {
      toast({
        title: "Erro",
        description: "Conexão não encontrada",
        variant: "destructive",
      })
      return
    }

    // Construir payload para Meta API a partir dos componentes do template
    // Usar os componentes originais do banco (objeto), não o array convertido
    const componentes = template.dbData?.componentes || {}
    
    // Converter para o formato esperado pela Edge Function (ARRAY)
    // EXATAMENTE como a Edge Function faz
    const payloadComponents: any[] = []

    // 1. HEADER (Adicionar somente se tiver conteúdo real)
    if (componentes.header && componentes.header.format && componentes.header.format !== "none" && componentes.header.format !== "NONE") {
      const headerComp: any = {
        type: "HEADER",
        format: componentes.header.format.toUpperCase()
      }
      if (componentes.header.format.toUpperCase() === "TEXT" && componentes.header.text && componentes.header.text.trim() !== "") {
        headerComp.text = componentes.header.text.trim()
      }
      if (componentes.header.example) {
        headerComp.example = componentes.header.example
      }
      payloadComponents.push(headerComp)
    }

    // 2. BODY (Obrigatório - sempre presente após validação)
    const bodyTextFinal = componentes.body?.text?.trim() || ""
    if (!bodyTextFinal || bodyTextFinal.length === 0) {
      toast({
        title: "Erro",
        description: "O template não possui um corpo de mensagem válido.",
        variant: "destructive",
      })
      return
    }

    const bodyComp: any = {
      type: "BODY",
      text: bodyTextFinal
    }
    if (componentes.body.example) {
      bodyComp.example = componentes.body.example
    }
    payloadComponents.push(bodyComp)

    // 3. FOOTER (Opcional - Adicionar somente se tiver texto)
    if (componentes.footer && componentes.footer.text && componentes.footer.text.trim() !== "") {
      payloadComponents.push({
        type: "FOOTER",
        text: componentes.footer.text.trim()
      })
    }

    // 4. BUTTONS (Opcional - Adicionar somente se o array tiver itens válidos)
    if (componentes.buttons && Array.isArray(componentes.buttons) && componentes.buttons.length > 0) {
      const buttonsArray: any[] = []
      componentes.buttons.forEach((button: any) => {
        if (!button.type || !button.text || button.text.trim() === "") {
          return // Pular botão inválido
        }
        const buttonObj: any = {
          type: button.type,
          text: button.text.trim()
        }
        if (button.type === "URL" && button.url && button.url.trim() !== "") {
          buttonObj.url = button.url.trim()
        } else if (button.type === "PHONE_NUMBER" && button.phone_number && button.phone_number.trim() !== "") {
          buttonObj.phone_number = button.phone_number.trim()
        }
        buttonsArray.push(buttonObj)
      })
      if (buttonsArray.length > 0) {
        payloadComponents.push({
          type: "BUTTONS",
          buttons: buttonsArray
        })
      }
    }

    // Validação final: array não pode estar vazio
    if (payloadComponents.length === 0) {
      toast({
        title: "Erro",
        description: "O template não possui componentes válidos.",
        variant: "destructive",
      })
      return
    }

    // Verificar se há pelo menos um BODY válido
    const hasBody = payloadComponents.some((comp: any) => comp.type === "BODY" && comp.text && comp.text.trim().length > 0)
    if (!hasBody) {
      toast({
        title: "Erro",
        description: "O template precisa ter um componente BODY com texto.",
        variant: "destructive",
      })
      return
    }

    // Sanitizar nome (mesma lógica da Edge Function)
    const nomeSanitizado = template.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")

    // Payload para preview (sem credenciais, apenas para visualização)
    const payload = {
      name: nomeSanitizado,
      language: template.language,
      category: template.category.toUpperCase(),
      components: payloadComponents, // ARRAY, não objeto!
    }

    setSelectedTemplateToSend(template)
    setPayloadToSend(payload)
    setPayloadPreviewOpen(true)
  }

  // Enviar template à Meta após preview
  const handleSendToMeta = async () => {
    if (!payloadToSend || !selectedTemplateToSend) {
      return
    }

    setIsSubmitting(true)

    try {
      // Chamar Edge Function para criar template na Meta
      // IMPORTANTE: A Edge Function espera receber componentes como OBJETO (não array)
      // O array é apenas para preview visual
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
      const edgeFunctionUrl = `https://${projectRef}.supabase.co/functions/v1/templates-manager`

      // Usar os componentes originais do template (objeto do banco), não o array do preview
      const componentesOriginais = selectedTemplateToSend.dbData?.componentes || {}

      const response = await authFetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          id_empresa: selectedTemplateToSend.id_empresa || selectedTemplateToSend.dbData?.id_empresa,
          nome: payloadToSend.name,
          categoria: payloadToSend.category,
          idioma: payloadToSend.language,
          componentes: componentesOriginais, // OBJETO, não array!
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Falha ao enviar template à Meta")
      }

      toast({
        title: "Template enviado com sucesso!",
        description: "Seu template foi enviado para aprovação da Meta. Isso pode levar até 24 horas.",
      })

      // Recarregar templates do banco
      await loadTemplatesFromDB()

      // Fechar dialogs
      setPayloadPreviewOpen(false)
      setSelectedTemplateToSend(null)
      setPayloadToSend(null)
    } catch (error: any) {
      console.error("Erro ao enviar template à Meta:", error)
      toast({
        title: "Erro ao enviar template",
        description: error.message || "Ocorreu um erro ao enviar o template. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTemplateName("")
    setTemplateCategory("marketing")
    setTemplateLanguage("pt_BR")
    setHeaderType("none")
    setHeaderText("")
    setHeaderMediaFile(null)
    setHeaderMediaPreview(null)
    setTemplateBody("")
    setTemplateFooter("")
    setButtons([])
    setSelectedConnection("")
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "approved") {
      return (
        <Badge className="bg-green-500/10 text-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Aprovado
        </Badge>
      )
    }
    if (statusLower === "pending" || statusLower === "submitted") {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500">
          <Clock className="mr-1 h-3 w-3" />
          Em Analise
        </Badge>
      )
    }
    if (statusLower === "rejected" || statusLower === "disabled") {
      return (
        <Badge className="bg-red-500/10 text-red-500">
          <XCircle className="mr-1 h-3 w-3" />
          Rejeitado
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-500">
        <Clock className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      MARKETING: "bg-purple-500/10 text-purple-500",
      UTILITY: "bg-blue-500/10 text-blue-500",
      AUTHENTICATION: "bg-orange-500/10 text-orange-500",
      marketing: "bg-purple-500/10 text-purple-500",
      transactional: "bg-blue-500/10 text-blue-500",
      otp: "bg-orange-500/10 text-orange-500",
    }
    return <Badge className={colors[category] || "bg-gray-500/10 text-gray-500"}>{category}</Badge>
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <DashboardHeader />
        <PaymentPendingBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                  Templates Meta
                </h1>
                <p className="text-pretty mt-2 text-sm text-muted-foreground">
                  Crie templates com imagens, vídeos, botões e envie diretamente para aprovação do Meta
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSyncTemplates}
                  disabled={isSyncing || !connections.some((c: any) => (c.waba_id || c.id_waba) && c.access_token)}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Sincronizar com a Meta"}
                </Button>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Criar Novo Template</DialogTitle>
                  <DialogDescription className="text-base">
                    Configure seu template com todos os recursos disponíveis: textos, imagens, vídeos, botões e mais.
                    O template será salvo localmente e você poderá visualizar o payload antes de enviar à Meta.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="buttons">Botões</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="connection">Conexão WhatsApp (Opcional para criar localmente)</Label>
                          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                            <SelectTrigger id="connection">
                              <SelectValue placeholder="Selecione uma conexão (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {connections.map((conn) => (
                                <SelectItem key={conn.id} value={conn.id}>
                                  {conn.name} ({conn.display_phone_number || conn.phone || conn.phone_number_id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            A conexão será necessária apenas quando você for enviar o template à Meta
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="template-name">Nome do Template *</Label>
                            <Input
                              id="template-name"
                              placeholder="Ex: boas_vindas"
                              value={templateName}
                              onChange={(e) => setTemplateName(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Use apenas letras minúsculas e underscores</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="category">Categoria *</Label>
                            <Select value={templateCategory} onValueChange={(v: any) => setTemplateCategory(v)}>
                              <SelectTrigger id="category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="transactional">Transacional</SelectItem>
                                <SelectItem value="otp">OTP (Código)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="language">Idioma</Label>
                          <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                            <SelectTrigger id="language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt_BR">Português (Brasil)</SelectItem>
                              <SelectItem value="en_US">English (US)</SelectItem>
                              <SelectItem value="es_ES">Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Cabeçalho (Opcional)</Label>
                          <RadioGroup value={headerType} onValueChange={(v: any) => setHeaderType(v)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="header-none" />
                              <Label htmlFor="header-none">Sem cabeçalho</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="text" id="header-text" />
                              <Label htmlFor="header-text">Texto</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="image" id="header-image" />
                              <Label htmlFor="header-image">Imagem</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="video" id="header-video" />
                              <Label htmlFor="header-video">Vídeo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="document" id="header-document" />
                              <Label htmlFor="header-document">Documento</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {headerType === "text" && (
                          <div className="space-y-2">
                            <Label htmlFor="header-text-input">Texto do Cabeçalho</Label>
                            <Input
                              id="header-text-input"
                              placeholder="Ex: Bem-vindo!"
                              value={headerText}
                              onChange={(e) => setHeaderText(e.target.value)}
                              maxLength={60}
                            />
                            <p className="text-xs text-muted-foreground">Máximo 60 caracteres</p>
                          </div>
                        )}

                        {["image", "video", "document"].includes(headerType) && (
                          <div className="space-y-2">
                            <Label>Upload de Mídia</Label>
                            {!headerMediaPreview ? (
                              <label
                                htmlFor="media-upload"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary"
                              >
                                <Upload className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Clique para fazer upload</p>
                                <Input
                                  id="media-upload"
                                  type="file"
                                  className="hidden"
                                  accept={
                                    headerType === "image"
                                      ? "image/*"
                                      : headerType === "video"
                                        ? "video/*"
                                        : ".pdf,.doc,.docx"
                                  }
                                  onChange={handleMediaSelect}
                                />
                              </label>
                            ) : (
                              <div className="relative">
                                {headerType === "image" && (
                                  <img
                                    src={headerMediaPreview || "/placeholder.svg"}
                                    alt="Preview"
                                    className="h-48 w-full rounded-lg object-cover"
                                  />
                                )}
                                {headerType === "video" && (
                                  <video src={headerMediaPreview} className="h-48 w-full rounded-lg" controls />
                                )}
                                {headerType === "document" && (
                                  <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                                    <FileIcon className="h-8 w-8" />
                                    <span className="text-sm">{headerMediaFile?.name}</span>
                                  </div>
                                )}
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute right-2 top-2"
                                  onClick={() => {
                                    setHeaderMediaFile(null)
                                    setHeaderMediaPreview(null)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="body">Corpo da Mensagem *</Label>
                          <Textarea
                            id="body"
                            placeholder="Digite a mensagem. Use {{1}}, {{2}} para variáveis"
                            value={templateBody}
                            onChange={(e) => setTemplateBody(e.target.value)}
                            rows={6}
                          />
                          <p className="text-xs text-muted-foreground">
                            Use {"{{1}}"}, {"{{2}}"} para adicionar variáveis dinâmicas. Variáveis encontradas:{" "}
                            {countVariables(templateBody)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="footer">Rodapé (Opcional)</Label>
                          <Input
                            id="footer"
                            placeholder="Ex: ScalaZap - Mensagens em Massa"
                            value={templateFooter}
                            onChange={(e) => setTemplateFooter(e.target.value)}
                            maxLength={60}
                          />
                        </div>
                  </TabsContent>

                  <TabsContent value="buttons" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Botões ({buttons.length}/3)</Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addButton("quick_reply")}
                                disabled={buttons.length >= 3}
                              >
                                Resposta Rápida
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addButton("call_to_action")}
                                disabled={buttons.length >= 3}
                              >
                                Ação
                              </Button>
                            </div>
                          </div>

                          {buttons.map((button, index) => (
                            <Card key={index}>
                              <CardContent className="pt-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Badge>{button.type === "quick_reply" ? "Resposta Rápida" : "Ação"}</Badge>
                                    <Button variant="ghost" size="icon" onClick={() => removeButton(index)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Texto do Botão</Label>
                                    <Input
                                      placeholder="Ex: Ver mais"
                                      value={button.text}
                                      onChange={(e) => updateButton(index, { text: e.target.value })}
                                      maxLength={25}
                                    />
                                  </div>

                                  {button.type === "call_to_action" && (
                                    <>
                                      <div className="space-y-2">
                                        <Label>Tipo de Ação</Label>
                                        <Select
                                          value={button.subType}
                                          onValueChange={(v: any) => updateButton(index, { subType: v })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="url">
                                              <div className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4" />
                                                Link (URL)
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="phone_number">
                                              <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Telefone
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {button.subType === "url" && (
                                        <>
                                          <div className="space-y-2">
                                            <Label>URL</Label>
                                            <Input
                                              placeholder="https://exemplo.com"
                                              value={button.url}
                                              onChange={(e) => updateButton(index, { url: e.target.value })}
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Tipo de URL</Label>
                                            <Select
                                              value={button.urlType || "static"}
                                              onValueChange={(v: any) => updateButton(index, { urlType: v })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="static">Estática</SelectItem>
                                                <SelectItem value="dynamic">Dinâmica (com variável)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </>
                                      )}

                                      {button.subType === "phone_number" && (
                                        <div className="space-y-2">
                                          <Label>Número de Telefone</Label>
                                          <Input
                                            placeholder="+5511999999999"
                                            value={button.phoneNumber}
                                            onChange={(e) => updateButton(index, { phoneNumber: e.target.value })}
                                          />
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          {buttons.length === 0 && (
                            <div className="rounded-lg border-2 border-dashed p-8 text-center">
                              <p className="text-sm text-muted-foreground">
                                Nenhum botão adicionado. Clique em "Resposta Rápida" ou "Ação" para adicionar.
                              </p>
                            </div>
                          )}
                        </div>
                  </TabsContent>
                </Tabs>

                <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-sm">Preview do Template</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 bg-[#e5ddd5] p-4 rounded-b-lg">
                        <div className="max-w-[85%] rounded-lg bg-white p-3 shadow-sm">
                          {headerType === "text" && headerText && (
                            <div className="mb-2 font-semibold text-gray-900">{headerText}</div>
                          )}
                          {headerMediaPreview && headerType !== "text" && headerType !== "none" && (
                            <div className="mb-2">
                              {headerType === "image" && (
                                <img
                                  src={headerMediaPreview || "/placeholder.svg"}
                                  alt="Header"
                                  className="w-full rounded"
                                />
                              )}
                              {headerType === "video" && (
                                <video src={headerMediaPreview} className="w-full rounded" controls />
                              )}
                              {headerType === "document" && (
                                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                                  <FileIcon className="h-6 w-6 text-gray-600" />
                                  <span className="text-xs text-gray-700">{headerMediaFile?.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {templateBody && (
                            <div className="text-sm whitespace-pre-wrap text-gray-800">{templateBody}</div>
                          )}
                          {templateFooter && (
                            <div className="mt-2 text-xs text-gray-500">{templateFooter}</div>
                          )}
                          {buttons.length > 0 && (
                            <div className="mt-3 space-y-1 border-t border-gray-200 pt-2">
                              {buttons.map((btn, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-center gap-2 rounded bg-gray-100 py-2 text-sm text-blue-600"
                                >
                                  {btn.type === "call_to_action" && btn.subType === "phone_number" && (
                                    <Phone className="h-3 w-3" />
                                  )}
                                  {btn.type === "call_to_action" && btn.subType === "url" && (
                                    <LinkIcon className="h-3 w-3" />
                                  )}
                                  {btn.text || "Botao"}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTemplate} disabled={isSubmitting || !templateName || !templateBody}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Template
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="meta">Templates da Meta ({metaTemplates.length})</TabsTrigger>
                <TabsTrigger value="local">Meus Templates</TabsTrigger>
                <TabsTrigger value="pricing">Custos de Envio</TabsTrigger>
              </TabsList>

              <TabsContent value="meta">
                {!connections.some((c: any) => (c.waba_id || c.id_waba) && c.access_token) ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <FileText className="h-16 w-16 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">Conecte sua API Oficial</h3>
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        Você precisa conectar uma API Oficial com id_waba e token_acesso configurados para ver seus templates da Meta
                      </p>
                      <Button className="mt-6" onClick={() => window.location.href = "/dashboard/connections"}>
                        Conectar API
                      </Button>
                    </CardContent>
                  </Card>
                ) : isLoadingMeta ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="mt-4 text-muted-foreground">Carregando templates da Meta...</p>
                    </CardContent>
                  </Card>
                ) : metaTemplates.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <FileText className="h-16 w-16 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">Nenhum template encontrado</h3>
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        Clique em "Sincronizar da Meta" para baixar seus templates aprovados
                      </p>
                      <Button className="mt-6" onClick={handleSyncTemplates} disabled={isSyncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Sincronizando..." : "Sincronizar da Meta"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {metaTemplates.length} template(s) sincronizado(s) da Meta
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {metaTemplates.map((template) => (
                      <Card key={template.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <CardTitle className="text-base truncate">{template.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                {getCategoryBadge(template.category)}
                                <span className="text-xs text-muted-foreground">{template.language}</span>
                              </div>
                            </div>
                            {getStatusBadge(template.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm max-h-40 overflow-y-auto">
                            {template.components?.map((comp: any, i: number) => (
                              <div key={i}>
                                {comp.type === "HEADER" && comp.text && (
                                  <div className="font-semibold text-xs mb-1">{comp.text}</div>
                                )}
                                {comp.type === "HEADER" && comp.format === "IMAGE" && (
                                  <div className="text-xs text-muted-foreground mb-1">[Imagem]</div>
                                )}
                                {comp.type === "HEADER" && comp.format === "VIDEO" && (
                                  <div className="text-xs text-muted-foreground mb-1">[Video]</div>
                                )}
                                {comp.type === "BODY" && (
                                  <div className="whitespace-pre-wrap text-xs">{comp.text}</div>
                                )}
                                {comp.type === "FOOTER" && (
                                  <div className="text-xs text-muted-foreground mt-1">{comp.text}</div>
                                )}
                                {comp.type === "BUTTONS" && comp.buttons && (
                                  <div className="mt-2 space-y-1 border-t pt-2">
                                    {comp.buttons.map((btn: any, j: number) => (
                                      <div key={j} className="text-xs text-primary flex items-center gap-1">
                                        {btn.type === "QUICK_REPLY" && <span>↩</span>}
                                        {btn.type === "URL" && <LinkIcon className="h-3 w-3" />}
                                        {btn.type === "PHONE_NUMBER" && <Phone className="h-3 w-3" />}
                                        {btn.text}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {template.rejectedReason && (
                            <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                              <strong>Motivo:</strong> {template.rejectedReason}
                            </div>
                          )}

                          {template.qualityScore && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Qualidade</span>
                              <Badge variant="outline">{template.qualityScore}</Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="local">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Meus Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Templates criados localmente que ainda não foram enviados à Meta
                      </p>
                    </div>
                    {connections.some((c: any) => (c.waba_id || c.id_waba) && c.access_token) && (
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Novo Template
                      </Button>
                    )}
                  </div>

                  {!connections.some((c: any) => (c.waba_id || c.id_waba) && c.access_token) ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Você precisa conectar uma API Oficial do WhatsApp para criar templates.
                          </AlertDescription>
                        </Alert>
                        <Button className="mt-4" onClick={() => window.location.href = "/dashboard/connections"}>
                          Conectar API
                        </Button>
                      </CardContent>
                    </Card>
                  ) : localTemplates.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">Nenhum template local</h3>
                        <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
                          Crie um novo template para começar. Ele será salvo localmente e você poderá visualizar o payload antes de enviar à Meta.
                        </p>
                        <Button className="mt-6" onClick={() => setDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Novo Template
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {localTemplates.map((template) => (
                        <Card key={template.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Não Enviado
                              </Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {template.category} • {template.language}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {template.components && (
                              <div className="space-y-2 text-sm">
                                {template.components.find((c: any) => c.type === "HEADER") && (
                                  <div>
                                    <span className="font-medium">Header: </span>
                                    <span className="text-muted-foreground">
                                      {template.components.find((c: any) => c.type === "HEADER")?.text || 
                                       template.components.find((c: any) => c.type === "HEADER")?.format}
                                    </span>
                                  </div>
                                )}
                                {template.components.find((c: any) => c.type === "BODY") && (
                                  <div>
                                    <span className="font-medium">Body: </span>
                                    <span className="text-muted-foreground line-clamp-2">
                                      {template.components.find((c: any) => c.type === "BODY")?.text}
                                    </span>
                                  </div>
                                )}
                                {template.components.find((c: any) => c.type === "FOOTER") && (
                                  <div>
                                    <span className="font-medium">Footer: </span>
                                    <span className="text-muted-foreground">
                                      {template.components.find((c: any) => c.type === "FOOTER")?.text}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-col gap-2 pt-2 border-t">
                              <Button 
                                variant="outline"
                                className="w-full" 
                                onClick={() => {
                                  setSelectedTemplateDetails(template)
                                  setTemplateDetailsOpen(true)
                                }}
                              >
                                <Info className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </Button>
                              <Button 
                                variant="outline"
                                className="w-full" 
                                onClick={() => {
                                  // Usar os componentes originais do banco (objeto), não o array convertido
                                  const componentes = template.dbData?.componentes || {}
                                  
                                  // Converter para o formato esperado pela Edge Function (ARRAY)
                                  // EXATAMENTE como a Edge Function faz
                                  const payloadComponents: any[] = []

                                  // 1. HEADER (Adicionar somente se tiver conteúdo real)
                                  if (componentes.header && componentes.header.format && componentes.header.format !== "none" && componentes.header.format !== "NONE") {
                                    const headerComp: any = {
                                      type: "HEADER",
                                      format: componentes.header.format.toUpperCase()
                                    }
                                    if (componentes.header.format.toUpperCase() === "TEXT" && componentes.header.text && componentes.header.text.trim() !== "") {
                                      headerComp.text = componentes.header.text.trim()
                                    }
                                    if (componentes.header.example) {
                                      headerComp.example = componentes.header.example
                                    }
                                    payloadComponents.push(headerComp)
                                  }

                                  // 2. BODY (Obrigatório - sempre presente após validação)
                                  const bodyTextFinal = componentes.body?.text?.trim() || ""
                                  if (!bodyTextFinal || bodyTextFinal.length === 0) {
                                    toast({
                                      title: "Erro",
                                      description: "O template não possui um corpo de mensagem válido.",
                                      variant: "destructive",
                                    })
                                    return
                                  }

                                  const bodyComp: any = {
                                    type: "BODY",
                                    text: bodyTextFinal
                                  }
                                  if (componentes.body.example) {
                                    bodyComp.example = componentes.body.example
                                  }
                                  payloadComponents.push(bodyComp)

                                  // 3. FOOTER (Opcional - Adicionar somente se tiver texto)
                                  if (componentes.footer && componentes.footer.text && componentes.footer.text.trim() !== "") {
                                    payloadComponents.push({
                                      type: "FOOTER",
                                      text: componentes.footer.text.trim()
                                    })
                                  }

                                  // 4. BUTTONS (Opcional - Adicionar somente se o array tiver itens válidos)
                                  if (componentes.buttons && Array.isArray(componentes.buttons) && componentes.buttons.length > 0) {
                                    const buttonsArray: any[] = []
                                    componentes.buttons.forEach((button: any) => {
                                      if (!button.type || !button.text || button.text.trim() === "") {
                                        return // Pular botão inválido
                                      }
                                      const buttonObj: any = {
                                        type: button.type,
                                        text: button.text.trim()
                                      }
                                      if (button.type === "URL" && button.url && button.url.trim() !== "") {
                                        buttonObj.url = button.url.trim()
                                      } else if (button.type === "PHONE_NUMBER" && button.phone_number && button.phone_number.trim() !== "") {
                                        buttonObj.phone_number = button.phone_number.trim()
                                      }
                                      buttonsArray.push(buttonObj)
                                    })
                                    if (buttonsArray.length > 0) {
                                      payloadComponents.push({
                                        type: "BUTTONS",
                                        buttons: buttonsArray
                                      })
                                    }
                                  }

                                  // Validação final: array não pode estar vazio
                                  if (payloadComponents.length === 0) {
                                    toast({
                                      title: "Erro",
                                      description: "O template não possui componentes válidos.",
                                      variant: "destructive",
                                    })
                                    return
                                  }

                                  // Verificar se há pelo menos um BODY válido
                                  const hasBody = payloadComponents.some((comp: any) => comp.type === "BODY" && comp.text && comp.text.trim().length > 0)
                                  if (!hasBody) {
                                    toast({
                                      title: "Erro",
                                      description: "O template precisa ter um componente BODY com texto.",
                                      variant: "destructive",
                                    })
                                    return
                                  }

                                  // Sanitizar nome (mesma lógica da Edge Function)
                                  const nomeSanitizado = template.name
                                    .toLowerCase()
                                    .trim()
                                    .replace(/[^a-z0-9_]/g, "_")
                                    .replace(/_+/g, "_")
                                    .replace(/^_|_$/g, "")

                                  // Payload para preview (sem credenciais) - EXATAMENTE como será enviado à Meta
                                  const payload = {
                                    name: nomeSanitizado,
                                    language: template.language,
                                    category: template.category.toUpperCase(),
                                    components: payloadComponents, // ARRAY, não objeto!
                                  }

                                  setPayloadToSend(payload)
                                  setSelectedTemplateToSend(null) // Não definir template para não mostrar botão de enviar
                                  setPayloadPreviewOpen(true)
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Payload
                              </Button>
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  // Abrir modal de seleção de conexão
                                  setTemplateToSend(template)
                                  setSelectedConnectionInModal("")
                                  setConnectionSelectModalOpen(true)
                                }}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Enviar à Meta
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Tabela de Preços da Meta - WhatsApp Business API
                      </CardTitle>
                      <CardDescription>
                        Valores cobrados pela Meta por conversa (janela de 24h). Cotação: US$ 1 = R$ 5,00 (aproximado)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Categoria</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="text-right">Preço (USD)</TableHead>
                              <TableHead className="text-right">Preço (BRL)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                <Badge className="bg-purple-500/10 text-purple-500">Marketing</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                Promoções, ofertas, novidades, remarketing
                              </TableCell>
                              <TableCell className="text-right font-mono">$0.0625</TableCell>
                              <TableCell className="text-right font-mono text-primary">R$ 0,31</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                <Badge className="bg-blue-500/10 text-blue-500">Utility</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                Confirmações, atualizações de pedido, alertas
                              </TableCell>
                              <TableCell className="text-right font-mono">$0.0350</TableCell>
                              <TableCell className="text-right font-mono text-primary">R$ 0,18</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                <Badge className="bg-orange-500/10 text-orange-500">Authentication</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                Códigos OTP, verificação de conta
                              </TableCell>
                              <TableCell className="text-right font-mono">$0.0315</TableCell>
                              <TableCell className="text-right font-mono text-primary">R$ 0,16</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                <Badge className="bg-green-500/10 text-green-500">Service</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                Resposta a mensagens iniciadas pelo cliente
                              </TableCell>
                              <TableCell className="text-right font-mono">$0.0300</TableCell>
                              <TableCell className="text-right font-mono text-primary">R$ 0,15</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Como funciona a cobrança:</p>
                            <ul className="mt-1 space-y-1 list-disc list-inside">
                              <li>A Meta cobra por <strong>conversa</strong>, não por mensagem</li>
                              <li>Uma conversa = janela de 24 horas de troca de mensagens</li>
                              <li>Primeiras 1.000 conversas de serviço/mês são GRATUITAS</li>
                              <li>Valores podem variar conforme país e cotação do dólar</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Configurar Pagamento na Meta</CardTitle>
                      <CardDescription>
                        Para enviar mensagens, você precisa configurar um método de pagamento no Meta Business Suite
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        A Meta cobra diretamente do seu cartão de crédito cadastrado no Meta Business Suite. 
                        A ScalaZap não realiza cobranças de mensagens - apenas da assinatura da plataforma.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => window.open("https://business.facebook.com/billing_hub/accounts", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Configurar Pagamento na Meta
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => window.open("https://developers.facebook.com/docs/whatsapp/pricing", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Documentação Oficial
                        </Button>
                      </div>

                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-600 dark:text-yellow-500">
                          <strong>Importante:</strong> Sem um método de pagamento configurado, suas mensagens 
                          iniciadas por template não serão entregues após atingir o limite gratuito.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Calculadora de Custos</CardTitle>
                      <CardDescription>Estime o custo mensal dos seus disparos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label>Mensagens Marketing</Label>
                          <Input type="number" placeholder="0" id="calc-marketing" defaultValue="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mensagens Utility</Label>
                          <Input type="number" placeholder="0" id="calc-utility" defaultValue="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mensagens Auth</Label>
                          <Input type="number" placeholder="0" id="calc-auth" defaultValue="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mensagens Service</Label>
                          <Input type="number" placeholder="0" id="calc-service" defaultValue="0" />
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Custo estimado (sem as 1.000 gratuitas):</p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          Preencha os campos acima para calcular
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <MobileNav />
      <WhatsAppSupportButton />

      {/* Dialog de Seleção de Conexão */}
      <Dialog open={connectionSelectModalOpen} onOpenChange={setConnectionSelectModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Conexão WhatsApp</DialogTitle>
            <DialogDescription>
              Selecione a conexão WhatsApp que será usada para enviar o template à Meta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma conexão WhatsApp encontrada.
                </p>
                <p className="text-sm text-muted-foreground">
                  Configure uma conexão WhatsApp primeiro na página de Conexões.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Conexões Disponíveis</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {connections
                      .filter((c: any) => (c.waba_id || c.id_waba) && c.access_token)
                      .map((conn: any) => (
                        <div
                          key={conn.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedConnectionInModal === conn.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedConnectionInModal(conn.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{conn.name || conn.nome || "Sem nome"}</p>
                              <p className="text-sm text-muted-foreground">
                                {conn.display_phone_number || conn.phone || conn.phone_number_id || "Número não disponível"}
                              </p>
                              {conn.status && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {conn.status}
                                </Badge>
                              )}
                            </div>
                            {selectedConnectionInModal === conn.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {connections.filter((c: any) => (c.waba_id || c.id_waba) && c.access_token).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-2">
                        Nenhuma conexão válida encontrada.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        As conexões precisam ter WABA ID e Access Token configurados.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConnectionSelectModalOpen(false)
                      setSelectedConnectionInModal("")
                      setTemplateToSend(null)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (templateToSend && selectedConnectionInModal) {
                        // Fechar modal de conexão
                        setConnectionSelectModalOpen(false)
                        // Preparar e mostrar preview do payload
                        handlePrepareSendToMeta(templateToSend, selectedConnectionInModal)
                      }
                    }}
                    disabled={!selectedConnectionInModal || !templateToSend}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview do Payload antes de enviar à Meta */}
      <Dialog open={payloadPreviewOpen} onOpenChange={setPayloadPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplateToSend ? "Preview do Payload - Enviar à Meta" : "Preview do Payload"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplateToSend 
                ? "Revise o payload que será enviado à Meta antes de confirmar o envio."
                : "Visualize o payload JSON que será enviado à Meta quando você confirmar o envio."}
            </DialogDescription>
          </DialogHeader>
          
          {payloadToSend && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Payload JSON:</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(payloadToSend, null, 2))
                      toast({
                        title: "Copiado!",
                        description: "Payload copiado para a área de transferência",
                      })
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Payload
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg border overflow-hidden w-full">
                  <pre className="text-xs whitespace-pre-wrap break-all overflow-wrap-anywhere word-break-break-all max-w-full" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    {JSON.stringify(payloadToSend, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPayloadPreviewOpen(false)
                    setSelectedTemplateToSend(null)
                    setPayloadToSend(null)
                  }}
                  className={selectedTemplateToSend ? "" : "flex-1"}
                >
                  {selectedTemplateToSend ? "Cancelar" : "Fechar"}
                </Button>
                {selectedTemplateToSend && (
                  <Button
                    onClick={handleSendToMeta}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Confirmar e Enviar à Meta
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes do Template */}
      <Dialog open={templateDetailsOpen} onOpenChange={setTemplateDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Template</DialogTitle>
            <DialogDescription>
              Informações completas do template criado localmente
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplateDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                  <p className="text-base font-semibold">{selectedTemplateDetails.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Não Enviado
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                  <p className="text-base">{selectedTemplateDetails.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Idioma</Label>
                  <p className="text-base">{selectedTemplateDetails.language}</p>
                </div>
              </div>

              {selectedTemplateDetails.components && (
                <div className="space-y-4">
                  {selectedTemplateDetails.components.find((c: any) => c.type === "HEADER") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Header</Label>
                      <div className="rounded-lg border p-3 bg-muted/50">
                        <p className="text-sm">
                          <span className="font-medium">Tipo: </span>
                          {selectedTemplateDetails.components.find((c: any) => c.type === "HEADER")?.format || "TEXT"}
                        </p>
                        {selectedTemplateDetails.components.find((c: any) => c.type === "HEADER")?.text && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Texto: </span>
                            {selectedTemplateDetails.components.find((c: any) => c.type === "HEADER")?.text}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTemplateDetails.components.find((c: any) => c.type === "BODY") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Body</Label>
                      <div className="rounded-lg border p-3 bg-muted/50">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedTemplateDetails.components.find((c: any) => c.type === "BODY")?.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTemplateDetails.components.find((c: any) => c.type === "FOOTER") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Footer</Label>
                      <div className="rounded-lg border p-3 bg-muted/50">
                        <p className="text-sm">
                          {selectedTemplateDetails.components.find((c: any) => c.type === "FOOTER")?.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTemplateDetails.components.find((c: any) => c.type === "BUTTONS") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Botões</Label>
                      <div className="rounded-lg border p-3 bg-muted/50">
                        {selectedTemplateDetails.components.find((c: any) => c.type === "BUTTONS")?.buttons?.map((btn: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 py-1">
                            <Badge variant="outline" className="text-xs">
                              {btn.type}
                            </Badge>
                            <span className="text-sm">{btn.text}</span>
                            {btn.url && <span className="text-xs text-muted-foreground">({btn.url})</span>}
                            {btn.phone_number && <span className="text-xs text-muted-foreground">({btn.phone_number})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setTemplateDetailsOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <PlanGuard>
      <TemplatesPageContent />
    </PlanGuard>
  )
}
