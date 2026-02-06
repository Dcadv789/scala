"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { PlanGuard } from "@/components/auth/plan-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Upload, Search, MoreVertical, Trash2, Edit, Users, Loader2, Download, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { authFetch } from "@/lib/auth-fetch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as XLSX from "xlsx"

type Contact = {
  id: string
  name: string
  phone: string
  email?: string
  tags: string[]
  lastContact?: string
}

function ContactsPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [validatedData, setValidatedData] = useState<any[]>([])
  const { toast } = useToast()

  // Carregar contatos do banco de dados
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      const response = await authFetch("/api/contacts")
      const data = await response.json()

      if (data.success && data.contacts) {
        // Mapear dados do banco (português) para o formato da página
        const mappedContacts: Contact[] = data.contacts.map((c: any) => ({
          id: c.id,
          name: c.nome || c.telefone,
          phone: c.telefone || "",
          email: c.email || undefined,
          tags: c.tags || [],
          lastContact: c.atualizado_em || c.criado_em || undefined,
        }))
        setContacts(mappedContacts)
      } else {
        console.error("[Contacts] Erro ao carregar contatos:", data.error)
        toast({
          title: "Erro",
          description: data.error || "Erro ao carregar contatos",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[Contacts] Erro ao carregar contatos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar contatos. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Gerar e baixar modelo Excel (.xlsx)
  const handleDownloadTemplate = () => {
    // Criar workbook
    const workbook = XLSX.utils.book_new()

    // ============================================
    // ABA 1: INSTRUÇÕES
    // ============================================
    const instrucoesData = [
      ["INSTRUÇÕES PARA IMPORTAÇÃO DE CONTATOS"],
      [""],
      ["1. PREENCHIMENTO OBRIGATÓRIO:"],
      ["   • telefone: É OBRIGATÓRIO e deve ter no mínimo 10 dígitos"],
      ["   • nome: Opcional (se vazio, será usado o telefone)"],
      [""],
      ["2. CAMPOS OPCIONAIS:"],
      ["   • email: Email válido do contato"],
      ["   • tags: Separar múltiplas tags por vírgula (ex: cliente,vip,lead)"],
      ["   • status: active ou inactive (padrão: active se vazio)"],
      ["   • aceita_marketing: true ou false (padrão: true se vazio)"],
      ["   • url_foto_perfil: URL completa da foto de perfil"],
      [""],
      ["3. FORMATO DO TELEFONE:"],
      ["   • Pode incluir ou não caracteres especiais"],
      ["   • Exemplos válidos: +5511999999999, 11999999999, (11) 99999-9999"],
      [""],
      ["4. FORMATO DAS TAGS:"],
      ["   • Separar múltiplas tags por vírgula"],
      ["   • Exemplo: cliente,vip,atendido"],
      [""],
      ["5. VALORES PARA STATUS:"],
      ["   • active: Contato ativo"],
      ["   • inactive: Contato inativo"],
      [""],
      ["6. VALORES PARA aceita_marketing:"],
      ["   • true ou 1: Aceita receber marketing"],
      ["   • false ou 0: Não aceita receber marketing"],
      [""],
      ["7. IMPORTANTE:"],
      ["   • Não altere os nomes das colunas na aba 'Modelo'"],
      ["   • Preencha os dados na aba 'Modelo'"],
      ["   • Você pode adicionar quantas linhas precisar"],
      ["   • A primeira linha (cabeçalho) não deve ser alterada"],
      [""],
      ["PRÓXIMOS PASSOS:"],
      ["1. Vá para a aba 'Modelo'"],
      ["2. Preencha os dados dos seus contatos"],
      ["3. Salve o arquivo"],
      ["4. Volte para a página de contatos e faça o upload"],
    ]

    const instrucoesSheet = XLSX.utils.aoa_to_sheet(instrucoesData)
    
    // Ajustar largura das colunas da aba de instruções
    instrucoesSheet["!cols"] = [{ wch: 80 }]
    
    XLSX.utils.book_append_sheet(workbook, instrucoesSheet, "Instruções")

    // ============================================
    // ABA 2: MODELO PARA PREENCHIMENTO
    // ============================================
    const headers = [
      "nome",
      "telefone",
      "email",
      "tags",
      "status",
      "aceita_marketing",
      "url_foto_perfil"
    ]
    
    // Linha de exemplo
    const exampleRow = [
      "João Silva",
      "+5511999999999",
      "joao@exemplo.com",
      "cliente,vip",
      "active",
      "true",
      ""
    ]
    
    const modeloData = [
      headers,
      exampleRow
    ]
    
    const modeloSheet = XLSX.utils.aoa_to_sheet(modeloData)
    
    // Ajustar largura das colunas
    modeloSheet["!cols"] = [
      { wch: 25 }, // nome
      { wch: 20 }, // telefone
      { wch: 30 }, // email
      { wch: 25 }, // tags
      { wch: 12 }, // status
      { wch: 18 }, // aceita_marketing
      { wch: 40 }, // url_foto_perfil
    ]
    
    XLSX.utils.book_append_sheet(workbook, modeloSheet, "Modelo")

    // Gerar arquivo e fazer download
    XLSX.writeFile(workbook, "modelo_importacao_contatos.xlsx")
    
    toast({
      title: "Modelo baixado",
      description: "O arquivo Excel modelo foi baixado com sucesso",
    })
  }

  // Validar arquivo Excel/CSV
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setValidationErrors([])
    setValidatedData([])
    setIsValidating(true)

    try {
      const data: any[] = []
      const errors: string[] = []
      let headers: string[] = []
      let rows: any[][] = []

      // Verificar extensão do arquivo
      const fileName = file.name.toLowerCase()
      const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
      const isCSV = fileName.endsWith(".csv")

      if (isExcel) {
        // Processar arquivo Excel
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        
        // Procurar pela aba "Modelo" ou usar a primeira aba
        let sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes("modelo") || 
          name.toLowerCase().includes("dados")
        ) || workbook.SheetNames[0]
        
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][]
        
        if (jsonData.length === 0) {
          setValidationErrors(["O arquivo está vazio"])
          setIsValidating(false)
          return
        }

        // Primeira linha são os cabeçalhos
        headers = (jsonData[0] || []).map((h: any) => String(h).trim().toLowerCase())
        rows = jsonData.slice(1)
      } else if (isCSV) {
        // Processar arquivo CSV
        const text = await file.text()
        const lines = text.split("\n").filter(line => line.trim() && !line.trim().startsWith("#"))
        
        if (lines.length === 0) {
          setValidationErrors(["O arquivo está vazio"])
          setIsValidating(false)
          return
        }

        headers = lines[0].split(",").map(h => h.trim().toLowerCase())
        rows = lines.slice(1).map(line => line.split(",").map(v => v.trim()))
      } else {
        setValidationErrors(["Formato de arquivo não suportado. Use .xlsx, .xls ou .csv"])
        setIsValidating(false)
        return
      }

      // Verificar se tem telefone (obrigatório)
      const telefoneIndex = headers.indexOf("telefone")
      if (telefoneIndex === -1) {
        setValidationErrors(["Coluna 'telefone' não encontrada. Ela é obrigatória."])
        setIsValidating(false)
        return
      }

      // Processar cada linha
      for (let i = 0; i < rows.length; i++) {
        const rowValues = rows[i]
        if (!rowValues || rowValues.length === 0) continue

        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = rowValues[index] || ""
        })

        // Numeração da linha (considerando que linha 1 é o cabeçalho)
        const linhaNumero = i + 2

        // Validações
        if (!row.telefone || row.telefone.trim() === "") {
          errors.push(`Linha ${linhaNumero}: Telefone é obrigatório`)
          continue
        }

        // Validar telefone (deve ter pelo menos 10 caracteres)
        const phoneClean = row.telefone.replace(/\D/g, "")
        if (phoneClean.length < 10) {
          errors.push(`Linha ${linhaNumero}: Telefone inválido (mínimo 10 dígitos)`)
          continue
        }

        // Validar email se fornecido
        if (row.email && row.email.trim() !== "") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(row.email)) {
            errors.push(`Linha ${linhaNumero}: Email inválido`)
            continue
          }
        }

        // Validar status se fornecido
        if (row.status && row.status.trim() !== "") {
          const validStatuses = ["active", "inactive"]
          if (!validStatuses.includes(row.status.toLowerCase())) {
            errors.push(`Linha ${linhaNumero}: Status inválido. Use: active ou inactive`)
            continue
          }
        }

        // Validar aceita_marketing se fornecido
        if (row.aceita_marketing && row.aceita_marketing.trim() !== "") {
          const validValues = ["true", "false", "1", "0"]
          if (!validValues.includes(row.aceita_marketing.toLowerCase())) {
            errors.push(`Linha ${linhaNumero}: aceita_marketing inválido. Use: true ou false`)
            continue
          }
        }

        // Preparar dados para envio (formato da tabela contatos)
        const contactData: any = {
          nome: row.nome || row.telefone || "",
          telefone: row.telefone,
        }

        if (row.email && row.email.trim() !== "") {
          contactData.email = row.email.trim()
        }
        
        if (row.tags && row.tags.trim() !== "") {
          // Converter tags de string separada por vírgula para array JSONB
          const tagsArray = row.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t)
          if (tagsArray.length > 0) {
            contactData.tags = tagsArray
          }
        }
        
        if (row.status && row.status.trim() !== "") {
          contactData.status = row.status.toLowerCase()
        }
        
        if (row.aceita_marketing && row.aceita_marketing.trim() !== "") {
          contactData.aceita_marketing = ["true", "1"].includes(row.aceita_marketing.toLowerCase())
        }
        
        if (row.url_foto_perfil && row.url_foto_perfil.trim() !== "") {
          contactData.url_foto_perfil = row.url_foto_perfil.trim()
        }

        data.push(contactData)
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
        setValidatedData([])
      } else {
        setValidationErrors([])
        setValidatedData(data)
        toast({
          title: "Validação concluída",
          description: `${data.length} contato(s) válido(s) encontrado(s)`,
        })
      }
    } catch (error: any) {
      console.error("[Contacts] Erro ao processar arquivo:", error)
      setValidationErrors([`Erro ao processar arquivo: ${error.message}`])
      setValidatedData([])
    } finally {
      setIsValidating(false)
    }
  }

  // Importar contatos validados
  const handleImport = async () => {
    if (validatedData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum dado válido para importar",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const response = await authFetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Importação concluída!",
          description: `${data.count || validatedData.length} contato(s) importado(s) com sucesso`,
        })
        
        // Fechar modal e recarregar contatos
        setImportModalOpen(false)
        setSelectedFile(null)
        setValidationErrors([])
        setValidatedData([])
        await loadContacts()
      } else {
        throw new Error(data.error || "Erro ao importar contatos")
      }
    } catch (error: any) {
      console.error("[Contacts] Erro ao importar:", error)
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar contatos. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await authFetch(`/api/contacts?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Remover do estado local
        setContacts(contacts.filter((c) => c.id !== id))
        toast({
          title: "Contato removido",
          description: "O contato foi removido com sucesso",
          variant: "destructive",
        })
      } else {
        throw new Error(data.error || "Erro ao remover contato")
      }
    } catch (error: any) {
      console.error("[Contacts] Erro ao deletar contato:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover contato. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                  Contatos
                </h1>
                <p className="text-pretty mt-2 text-sm text-muted-foreground">
                  Gerencie sua lista de contatos para campanhas
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setImportModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contato
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar contatos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Carregando contatos...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Users className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Nenhum contato encontrado</h3>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {searchQuery 
                        ? "Nenhum contato corresponde à sua busca"
                        : "Adicione contatos manualmente ou importe de um arquivo CSV"}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Último Contato</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.phone}</TableCell>
                          <TableCell>{contact.email || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {contact.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString("pt-BR") : "-"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteContact(contact.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
      <WhatsAppSupportButton />

      {/* Modal de Importação */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
            <DialogDescription>
              Baixe o modelo e importe seus contatos em lote
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seção: Baixar Modelo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">1. Baixar Modelo</Label>
              <p className="text-sm text-muted-foreground">
                Baixe o arquivo modelo para preencher com seus contatos
              </p>
              <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Baixar Modelo Excel (.xlsx)
              </Button>
            </div>

            {/* Seção: Upload de Arquivo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">2. Selecionar Arquivo</Label>
              <p className="text-sm text-muted-foreground">
                Selecione o arquivo CSV preenchido para importar
              </p>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={isValidating || isImporting}
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null)
                      setValidationErrors([])
                      setValidatedData([])
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}
            </div>

            {/* Validação em progresso */}
            {isValidating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validando arquivo...</span>
              </div>
            )}

            {/* Erros de Validação */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold">Erros encontrados ({validationErrors.length}):</p>
                    <ul className="list-disc list-inside space-y-1 text-sm max-h-40 overflow-y-auto">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Sucesso na Validação */}
            {validatedData.length > 0 && validationErrors.length === 0 && !isValidating && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Validação concluída com sucesso!</p>
                  <p className="text-sm mt-1">
                    {validatedData.length} contato(s) pronto(s) para importar
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setImportModalOpen(false)
                  setSelectedFile(null)
                  setValidationErrors([])
                  setValidatedData([])
                }}
                className="flex-1"
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={validatedData.length === 0 || validationErrors.length > 0 || isImporting}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar {validatedData.length > 0 && `(${validatedData.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ContactsPage() {
  return (
    <PlanGuard>
      <ContactsPageContent />
    </PlanGuard>
  )
}
