"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Upload, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  FileText,
  Loader2,
  X,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { authFetch } from "@/lib/auth-fetch"

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ParsedContact {
  name: string
  phone: string
  valid: boolean
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const [step, setStep] = useState(1)
  const [campaignName, setCampaignName] = useState("")
  const [selectedConnection, setSelectedConnection] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [connections, setConnections] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [metaTemplates, setMetaTemplates] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [uploadedContacts, setUploadedContacts] = useState<ParsedContact[]>([])
  const [uploadError, setUploadError] = useState("")
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [useExistingContacts, setUseExistingContacts] = useState(false)
  const [existingContactsCount, setExistingContactsCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const totalSteps = 3

  useEffect(() => {
    if (open) {
      // Buscar conexões do Supabase via API
      const loadConnections = async () => {
        try {
          const response = await authFetch("/api/connections")
          const data = await response.json()
          if (data.success) {
            setConnections(data.connections || [])
            console.log("[CreateCampaignDialog] Conexões carregadas:", data.connections?.length || 0)
          } else {
            console.error("[CreateCampaignDialog] Erro ao carregar conexões:", data.error)
            setConnections([])
          }
        } catch (error) {
          console.error("[CreateCampaignDialog] Erro ao carregar conexões:", error)
          setConnections([])
        }
      }

      // Buscar contagem de contatos existentes
      const loadContactsCount = async () => {
        try {
          const response = await authFetch("/api/contacts")
          const data = await response.json()
          if (data.success && data.contacts) {
            const count = Array.isArray(data.contacts) ? data.contacts.length : 0
            setExistingContactsCount(count)
            console.log("[CreateCampaignDialog] Contatos existentes carregados:", count)
          } else {
            console.error("[CreateCampaignDialog] Erro ao carregar contatos:", data.error)
            setExistingContactsCount(0)
          }
        } catch (error) {
          console.error("[CreateCampaignDialog] Erro ao carregar contatos:", error)
          setExistingContactsCount(0)
        }
      }

      loadConnections()
      loadContactsCount()
    } else {
      // Reset ao fechar
      setExistingContactsCount(0)
    }
  }, [open])

  useEffect(() => {
    if (selectedConnection) {
      loadMetaTemplates()
    }
  }, [selectedConnection])

  const loadMetaTemplates = async () => {
    const connection = connections.find((c: any) => c.id === selectedConnection)
    if (!connection?.waba_id || !connection?.access_token) return
    
    setIsLoadingTemplates(true)
    try {
      const response = await fetch(
        `/api/whatsapp/templates?wabaId=${connection.waba_id}&accessToken=${connection.access_token}`
      )
      const data = await response.json()
      
      if (data.success) {
        const approvedTemplates = data.templates?.filter((t: any) => 
          t.status?.toLowerCase() === "approved"
        ) || []
        setMetaTemplates(approvedTemplates)
      }
    } catch (error) {
      console.error("Error loading Meta templates:", error)
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const parseCSV = (content: string): ParsedContact[] => {
    const lines = content.split(/\r?\n/).filter(line => line.trim())
    const contacts: ParsedContact[] = []
    
    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes("nome") || 
                       lines[0]?.toLowerCase().includes("name") ||
                       lines[0]?.toLowerCase().includes("telefone") ||
                       lines[0]?.toLowerCase().includes("phone") ? 1 : 0
    
    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(/[,;|\t]/).map(p => p.trim().replace(/"/g, ""))
      if (parts.length >= 2) {
        const name = parts[0]
        const phone = parts[1].replace(/\D/g, "")
        const valid = phone.length >= 10 && phone.length <= 15
        contacts.push({ name, phone, valid })
      } else if (parts.length === 1) {
        const phone = parts[0].replace(/\D/g, "")
        const valid = phone.length >= 10 && phone.length <= 15
        contacts.push({ name: "Sem nome", phone, valid })
      }
    }
    
    return contacts
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    setUploadError("")

    try {
      const fileName = file.name.toLowerCase()
      
      if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        const content = await file.text()
        const contacts = parseCSV(content)
        setUploadedContacts(contacts)
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        // For Excel files, we'll use a simple approach
        toast({
          title: "Arquivo Excel detectado",
          description: "Por favor, exporte seu arquivo como CSV para melhor compatibilidade.",
          variant: "destructive",
        })
        setUploadError("Por favor, converta o arquivo Excel para CSV antes de fazer upload.")
      } else {
        setUploadError("Formato nao suportado. Use arquivos CSV ou TXT.")
      }
    } catch (error) {
      console.error("Error parsing file:", error)
      setUploadError("Erro ao processar arquivo. Verifique o formato.")
    } finally {
      setIsProcessingFile(false)
    }
  }

  const validContacts = uploadedContacts.filter(c => c.valid)
  const invalidContacts = uploadedContacts.filter(c => !c.valid)

  const handleNext = () => {
    if (step === 1) {
      if (!campaignName.trim()) {
        toast({ title: "Informe o nome da campanha", variant: "destructive" })
        return
      }
      if (!selectedConnection) {
        toast({ title: "Selecione uma conexao WhatsApp", variant: "destructive" })
        return
      }
    }
    if (step === 2) {
      if (!selectedTemplate) {
        toast({ title: "Selecione um template", variant: "destructive" })
        return
      }
    }
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e?: React.MouseEvent) => {
    // Prevenir comportamento padrão se for evento
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("[CreateCampaignDialog] handleSubmit chamado!", {
      step,
      isSubmitting,
      campaignName,
      selectedConnection,
      selectedTemplate
    })

    // Prevenir múltiplos cliques
    if (isSubmitting) {
      console.log("[CreateCampaignDialog] Já está enviando, ignorando clique")
      return
    }

    setIsSubmitting(true)

    try {
      const recipientCount = useExistingContacts ? existingContactsCount : validContacts.length
      
      console.log("[CreateCampaignDialog] Validando dados...", {
        recipientCount,
        useExistingContacts,
        existingContactsCount,
        validContactsLength: validContacts.length,
        uploadedContactsLength: uploadedContacts.length,
        selectedConnection,
        selectedTemplate,
        campaignName
      })

      if (recipientCount === 0) {
        let errorMessage = "Adicione contatos para a campanha. "
        if (useExistingContacts) {
          errorMessage += "Você selecionou usar contatos cadastrados, mas não há contatos disponíveis. "
        } else {
          errorMessage += "Faça upload de um arquivo CSV ou selecione usar contatos cadastrados. "
        }
        errorMessage += "Clique na área de upload para adicionar um arquivo."
        
        toast({ 
          title: "Nenhum contato adicionado", 
          description: errorMessage,
          variant: "destructive",
          duration: 5000
        })
        setIsSubmitting(false)
        return
      }

      if (!selectedConnection) {
        toast({ 
          title: "Erro", 
          description: "Selecione uma conexão WhatsApp",
          variant: "destructive" 
        })
        setIsSubmitting(false)
        return
      }

      if (!selectedTemplate) {
        toast({ 
          title: "Erro", 
          description: "Selecione um template",
          variant: "destructive" 
        })
        setIsSubmitting(false)
        return
      }

      if (!campaignName || campaignName.trim() === "") {
        toast({ 
          title: "Erro", 
          description: "Digite um nome para a campanha",
          variant: "destructive" 
        })
        setIsSubmitting(false)
        return
      }

      const connection = connections.find((c: any) => c.id === selectedConnection)
      const template = metaTemplates.find((t: any) => t.id === selectedTemplate) || 
                       templates.find((t: any) => t.id === selectedTemplate)

      if (!template) {
        toast({ 
          title: "Erro", 
          description: "Template selecionado não encontrado",
          variant: "destructive" 
        })
        setIsSubmitting(false)
        return
      }

      console.log("[CreateCampaignDialog] Todos os dados válidos, criando campanha...")

      // Criar campanha via API (Supabase)
      const response = await authFetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          connectionId: selectedConnection,
          templateName: template?.name || template?.nome || "hello_world",
          templateId: selectedTemplate,
          recipients: useExistingContacts ? [] : validContacts.map(c => ({ phone: c.phone, name: c.name })),
          status: "draft"
        })
      })

      console.log("[CreateCampaignDialog] Resposta recebida:", response.status, response.statusText)

      const data = await response.json()

      console.log("[CreateCampaignDialog] Dados da resposta:", data)

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || "Erro desconhecido ao criar campanha"
        console.error("[CreateCampaignDialog] Erro ao criar campanha:", errorMessage)
        toast({
          title: "Erro ao criar campanha",
          description: errorMessage,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      console.log("[CreateCampaignDialog] Campanha criada com sucesso!")

      toast({
        title: "Campanha criada com sucesso!",
        description: `A campanha "${campaignName}" foi criada com ${recipientCount} destinatário(s).`,
      })

      // Reset form
      setCampaignName("")
      setSelectedConnection("")
      setSelectedTemplate("")
      setUploadedContacts([])
      setUseExistingContacts(false)
      setStep(1)
      setIsSubmitting(false)
      
      // Fechar modal e recarregar lista de campanhas
      onOpenChange(false)
      
      // Disparar evento para recarregar a lista de campanhas
      window.dispatchEvent(new CustomEvent("campaigns-reload"))
    } catch (error: any) {
      console.error("[CreateCampaignDialog] Erro ao criar campanha:", error)
      const errorMessage = error?.message || "Falha ao criar campanha. Tente novamente."
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const selectedConnectionData = connections.find(c => c.id === selectedConnection)
  const selectedTemplateData = metaTemplates.find(t => t.id === selectedTemplate) || 
                               templates.find(t => t.id === selectedTemplate)

  const downloadSampleCSV = () => {
    const sampleData = "nome,telefone\nJoao Silva,5511999998888\nMaria Santos,5521988887777\nPedro Costa,5531977776666"
    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "modelo_contatos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Nova Campanha de Disparo</DialogTitle>
          <DialogDescription>Configure sua campanha em massa para WhatsApp</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 w-full overflow-x-hidden">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      step > i + 1
                        ? "bg-primary text-primary-foreground"
                        : step === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && <div className={cn("h-0.5 w-12", step > i + 1 ? "bg-primary" : "bg-muted")} />}
                </div>
              ))}
            </div>
            <Badge variant="outline">
              Passo {step} de {totalSteps}
            </Badge>
          </div>

          <Progress value={(step / totalSteps) * 100} className="h-2" />

          {/* Step 1: Basic Info + Connection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                <Input
                  id="campaign-name"
                  placeholder="Ex: Promocao Black Friday 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connection">Conexao WhatsApp *</Label>
                {connections.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhuma conexao ativa encontrada
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 bg-transparent"
                        onClick={() => window.location.href = "/dashboard/connections"}
                      >
                        Configurar Conexao
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                    <SelectTrigger id="connection" className="w-full">
                      <SelectValue placeholder="Selecione uma conexao" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
                      {connections.map((conn: any) => (
                        <SelectItem key={conn.id} value={conn.id}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="truncate">{conn.name}</span>
                            {(conn.phone || conn.display_phone_number) && (
                              <span className="text-muted-foreground shrink-0 whitespace-nowrap">({conn.phone || conn.display_phone_number})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedConnectionData && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Numero: {selectedConnectionData.phone || selectedConnectionData.display_phone_number || selectedConnectionData.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Template */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione um Template Aprovado *</Label>
                <p className="text-xs text-muted-foreground">
                  Apenas templates aprovados pela Meta podem ser usados em disparos em massa
                </p>
              </div>

              {isLoadingTemplates ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando templates...</p>
                  </CardContent>
                </Card>
              ) : metaTemplates.length === 0 && templates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Nenhum template aprovado encontrado
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-transparent"
                      onClick={() => window.location.href = "/dashboard/templates"}
                    >
                      Criar Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 max-h-[300px] overflow-y-auto overflow-x-hidden w-full">
                  {metaTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary w-full min-w-0",
                        selectedTemplate === template.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4 w-full min-w-0">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium truncate">{template.name}</h4>
                              <Badge variant="outline" className="text-xs shrink-0">{template.language}</Badge>
                              <Badge className="bg-green-500/10 text-green-500 text-xs shrink-0">
                                Aprovado
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 break-words">
                              Categoria: {template.category}
                            </p>
                            {template.components?.find((c: any) => c.type === "BODY")?.text && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {template.components.find((c: any) => c.type === "BODY").text}
                              </p>
                            )}
                          </div>
                          {selectedTemplate === template.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {templates.filter(t => t.status === "approved").map((template) => (
                    <Card 
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary w-full min-w-0",
                        selectedTemplate === template.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4 w-full min-w-0">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium truncate">{template.name}</h4>
                              <Badge className="bg-green-500/10 text-green-500 text-xs shrink-0">
                                Aprovado
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 break-words">
                              {template.body}
                            </p>
                          </div>
                          {selectedTemplate === template.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Upload Contacts */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Contatos para Disparo *</Label>
                <p className="text-xs text-muted-foreground">
                  Importe uma lista de contatos ou use os contatos ja cadastrados
                </p>
              </div>

              {/* Use Existing Contacts Option */}
              {existingContactsCount > 0 && (
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    useExistingContacts && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    setUseExistingContacts(true)
                    setUploadedContacts([])
                  }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-medium">Usar contatos cadastrados</h4>
                        <p className="text-sm text-muted-foreground">
                          {existingContactsCount} contatos disponiveis
                        </p>
                      </div>
                    </div>
                    {useExistingContacts && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </CardContent>
                </Card>
              )}

              {/* Upload New Contacts */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:border-primary border-dashed",
                  !useExistingContacts && uploadedContacts.length > 0 && "border-primary bg-primary/5"
                )}
                onClick={() => {
                  setUseExistingContacts(false)
                  fileInputRef.current?.click()
                }}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isProcessingFile ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                    </>
                  ) : uploadedContacts.length > 0 && !useExistingContacts ? (
                    <>
                      <FileSpreadsheet className="h-10 w-10 text-primary mb-2" />
                      <p className="font-medium">{validContacts.length} contatos validos</p>
                      {invalidContacts.length > 0 && (
                        <p className="text-xs text-yellow-500">
                          {invalidContacts.length} contatos invalidos (serao ignorados)
                        </p>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setUploadedContacts([])
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="font-medium">Clique para fazer upload</p>
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: CSV, TXT (colunas: nome, telefone)
                      </p>
                      {existingContactsCount === 0 && (
                        <p className="text-xs text-yellow-600 mt-2 font-medium">
                          ⚠️ Nenhum contato cadastrado encontrado. Você precisa fazer upload de um arquivo.
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {uploadError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}

              <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                <Download className="h-4 w-4 mr-2" />
                Baixar modelo CSV
              </Button>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold">Resumo da Campanha</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="font-medium">{campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conexao:</span>
                      <span className="font-medium">
                        {selectedConnectionData?.name} 
                        {selectedConnectionData?.phoneNumber && ` (${selectedConnectionData.phoneNumber})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span className="font-medium">{selectedTemplateData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destinatarios:</span>
                      <span className="font-medium">
                        {useExistingContacts ? existingContactsCount : validContacts.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Proximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={(e) => {
                  console.log("[CreateCampaignDialog] Botão clicado!")
                  handleSubmit(e)
                }}
                disabled={isSubmitting}
                className="relative"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Criar Campanha
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
