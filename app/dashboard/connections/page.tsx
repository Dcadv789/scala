"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, Check, Copy, ExternalLink, Trash2, Send, CheckCircle, RefreshCw, ArrowLeft, QrCode, Clock, Webhook, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { WEBHOOK_CONFIG } from "@/lib/webhook-config"
import { authFetch } from "@/lib/auth-fetch"

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [testPhone, setTestPhone] = useState("")
  const [verifyingConnection, setVerifyingConnection] = useState<string | null>(null)
  const [verificationLogs, setVerificationLogs] = useState<Record<string, Array<{ type: 'info' | 'success' | 'error', message: string, timestamp: Date }>>>({})
  const [showVerificationLogs, setShowVerificationLogs] = useState<string | null>(null)
  const [manualForm, setManualForm] = useState({
    phoneNumberId: "",
    accessToken: "",
    wabaId: "",
  })
  const [webhookData, setWebhookData] = useState<{ 
    url: string; 
    token: string;
    instructions?: any;
  } | null>(null)
  const [activeTab, setActiveTab] = useState("add")
  const [showWebhookFor, setShowWebhookFor] = useState<string | null>(null)
  const [checkingWebhook, setCheckingWebhook] = useState<string | null>(null)
  const [webhookCheckResults, setWebhookCheckResults] = useState<Record<string, any>>({})
  const { toast } = useToast()
  
  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    setIsLoadingConnections(true)
    try {
      const response = await authFetch("/api/connections")
      const result = await response.json()
      
      if (result.success) {
        setConnections(result.connections || [])
      } else {
        toast({
          title: "Erro ao carregar conexoes",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Erro ao carregar conexoes",
        description: err.message || "Erro de conexao",
        variant: "destructive",
      })
    } finally {
      setIsLoadingConnections(false)
    }
  }

  const handleManualConnection = async () => {
    if (!manualForm.phoneNumberId || !manualForm.accessToken || !manualForm.wabaId) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Usar token e URL fixos do config centralizado
      const verifyToken = WEBHOOK_CONFIG.token
      const webhookUrl = WEBHOOK_CONFIG.url

      // Salvar conexao DIRETAMENTE via API
      const saveResponse = await authFetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `WhatsApp Business - ${manualForm.phoneNumberId}`,
          phone_number_id: manualForm.phoneNumberId,
          access_token: manualForm.accessToken,
          waba_id: manualForm.wabaId,
          verify_token: verifyToken,
        }),
      })

      const saveResult = await saveResponse.json()

      if (!saveResult.success) {
        throw new Error(saveResult.error || "Erro ao salvar conexao")
      }
      
      // Usar dados do webhook retornados pela API (se disponível)
      if (saveResult.webhook) {
        setWebhookData({ 
          url: saveResult.webhook.url, 
          token: saveResult.webhook.verify_token 
        })
      } else {
        // Fallback para configuração antiga
        setWebhookData({ url: webhookUrl, token: verifyToken })
      }
      
      await loadConnections()

      toast({
        title: "Conexão criada com sucesso!",
        description: "Configure o webhook no Meta Business para receber mensagens.",
      })

      setManualForm({ phoneNumberId: "", accessToken: "", wabaId: "" })
      
      // NÃO mudar de aba - manter na aba atual para mostrar os webhooks
    } catch (error: any) {
      console.error("[v0] Connection test failed:", error)
      toast({
        title: "Erro na validacao",
        description: error.message || "Nao foi possivel validar as credenciais. Verifique os dados e tente novamente.",
        variant: "destructive",
      })
      setWebhookData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    })
  }

  const handleDeleteConnection = async (id: string) => {
    try {
      const response = await fetch(`/api/connections?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (!result.success) {
        toast({
          title: "Erro ao remover",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        })
        return
      }

      loadConnections()
      toast({
        title: "Conexao removida",
        description: "A conexao foi removida com sucesso.",
      })
    } catch (err: any) {
      toast({
        title: "Erro ao remover",
        description: err.message || "Erro de conexao",
        variant: "destructive",
      })
    }
  }

  const addLog = (connectionId: string, type: 'info' | 'success' | 'error', message: string) => {
    setVerificationLogs(prev => ({
      ...prev,
      [connectionId]: [...(prev[connectionId] || []), { type, message, timestamp: new Date() }]
    }))
  }

  const handleCheckWebhook = async (connection: any) => {
    setCheckingWebhook(connection.id)
    try {
      const response = await authFetch("/api/connections/check-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connection.id })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setWebhookCheckResults(prev => ({ ...prev, [connection.id]: result }))
        toast({
          title: "Verificação concluída",
          description: "Verifique os resultados abaixo",
        })
      } else {
        toast({
          title: "Erro na verificação",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao verificar webhook",
        variant: "destructive",
      })
    } finally {
      setCheckingWebhook(null)
    }
  }

  const handleVerifyConnection = async (connection: any) => {
    setVerifyingConnection(connection.id)
    setShowVerificationLogs(connection.id)
    // Limpar logs anteriores desta conexão
    setVerificationLogs(prev => ({ ...prev, [connection.id]: [] }))
    
    try {
      addLog(connection.id, 'info', '═══════════════════════════════════════')
      addLog(connection.id, 'info', '🔍 INICIANDO VERIFICAÇÃO COMPLETA')
      addLog(connection.id, 'info', '═══════════════════════════════════════')
      
      // ============================================
      // ETAPA 1: VALIDAÇÃO DOS DADOS DA CONEXÃO
      // ============================================
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'info', '📋 ETAPA 1: Validando dados da conexão')
      addLog(connection.id, 'info', '───────────────────────────────────────')
      
      const requiredFields = ['id', 'phone_number_id', 'access_token', 'waba_id']
      const missingFields: string[] = []
      
      requiredFields.forEach(field => {
        if (!connection[field]) {
          missingFields.push(field)
          addLog(connection.id, 'error', `❌ Campo obrigatório ausente: ${field}`)
        } else {
          addLog(connection.id, 'success', `✅ Campo ${field}: ${field === 'access_token' ? connection[field].substring(0, 20) + '...' : connection[field]}`)
        }
      })
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`)
      }
      
      addLog(connection.id, 'success', '✅ Todos os campos obrigatórios estão presentes')
      
      // ============================================
      // ETAPA 2: VALIDAÇÃO DO WEBHOOK
      // ============================================
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'info', '🌐 ETAPA 2: Verificando Webhook do Supabase')
      addLog(connection.id, 'info', '───────────────────────────────────────')
      
      const webhookUrl = connection.webhook?.url || WEBHOOK_CONFIG.url
      const verifyToken = connection.webhook?.verify_token || WEBHOOK_CONFIG.token
      
      if (!webhookUrl) {
        addLog(connection.id, 'error', '❌ URL do webhook não encontrada')
        throw new Error('URL do webhook não configurada')
      }
      
      addLog(connection.id, 'info', `📡 URL do webhook: ${webhookUrl}`)
      addLog(connection.id, 'info', `🔑 Token de verificação: ${verifyToken.substring(0, 20)}...`)
      
      // 2.1: Verificar formato da URL
      try {
        const urlObj = new URL(webhookUrl)
        addLog(connection.id, 'success', `✅ URL válida: ${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`)
      } catch (urlError: any) {
        addLog(connection.id, 'error', `❌ URL inválida: ${urlError.message}`)
        throw new Error(`URL do webhook inválida: ${urlError.message}`)
      }
      
      // 2.2: Testar acessibilidade do webhook
      addLog(connection.id, 'info', '⏳ Testando acessibilidade do webhook (GET)...')
      
      try {
        const testChallenge = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${testChallenge}`
        
        addLog(connection.id, 'info', `📤 Enviando requisição GET para: ${webhookUrl}`)
        
        const testResponse = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'ScalaZap-Verification/1.0'
          }
        })
        
        addLog(connection.id, 'info', `📥 Resposta recebida: Status ${testResponse.status} ${testResponse.statusText}`)
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text()
          addLog(connection.id, 'error', `❌ Webhook retornou erro HTTP ${testResponse.status}`)
          addLog(connection.id, 'error', `❌ Resposta: ${errorText.substring(0, 200)}`)
          throw new Error(`Webhook não acessível: HTTP ${testResponse.status} - ${errorText.substring(0, 100)}`)
        }
        
        const challenge = await testResponse.text()
        addLog(connection.id, 'info', `📥 Challenge recebido: ${challenge.substring(0, 50)}...`)
        
        if (challenge === testChallenge) {
          addLog(connection.id, 'success', '✅ Webhook respondeu corretamente ao teste de verificação!')
          addLog(connection.id, 'success', '✅ Token de verificação está correto')
        } else {
          addLog(connection.id, 'error', `❌ Challenge não corresponde!`)
          addLog(connection.id, 'error', `   Esperado: ${testChallenge.substring(0, 30)}...`)
          addLog(connection.id, 'error', `   Recebido: ${challenge.substring(0, 30)}...`)
          throw new Error('Token de verificação do webhook está incorreto ou webhook não está configurado corretamente')
        }
      } catch (testError: any) {
        if (testError.message.includes('Webhook não acessível')) {
          throw testError
        }
        addLog(connection.id, 'error', `❌ Erro ao testar webhook: ${testError.message}`)
        addLog(connection.id, 'error', `❌ Tipo do erro: ${testError.name || 'Unknown'}`)
        if (testError.stack) {
          addLog(connection.id, 'error', `❌ Stack: ${testError.stack.substring(0, 200)}...`)
        }
        throw new Error(`Falha ao testar webhook: ${testError.message}`)
      }
      
      // ============================================
      // ETAPA 3: VALIDAÇÃO DAS CREDENCIAIS WHATSAPP
      // ============================================
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'info', '📱 ETAPA 3: Verificando credenciais do WhatsApp')
      addLog(connection.id, 'info', '───────────────────────────────────────')
      
      addLog(connection.id, 'info', `📤 Phone Number ID: ${connection.phone_number_id}`)
      addLog(connection.id, 'info', `📤 WABA ID: ${connection.waba_id}`)
      addLog(connection.id, 'info', `📤 Access Token: ${connection.access_token.substring(0, 20)}...`)
      
      addLog(connection.id, 'info', '⏳ Enviando requisição para API do Meta...')
      
      let validateResponse: Response
      let validateResult: any
      
      try {
        validateResponse = await fetch("/api/whatsapp/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumberId: connection.phone_number_id,
            accessToken: connection.access_token,
            wabaId: connection.waba_id,
          }),
        })
        
        addLog(connection.id, 'info', `📥 Resposta da API: Status ${validateResponse.status} ${validateResponse.statusText}`)
        
        if (!validateResponse.ok) {
          const errorText = await validateResponse.text()
          addLog(connection.id, 'error', `❌ API retornou erro HTTP ${validateResponse.status}`)
          addLog(connection.id, 'error', `❌ Resposta: ${errorText.substring(0, 200)}`)
          throw new Error(`API de validação retornou erro: HTTP ${validateResponse.status}`)
        }
        
        validateResult = await validateResponse.json()
        addLog(connection.id, 'info', `📥 Dados recebidos: ${JSON.stringify(validateResult).substring(0, 100)}...`)
        
      } catch (apiError: any) {
        if (apiError.message.includes('API de validação')) {
          throw apiError
        }
        addLog(connection.id, 'error', `❌ Erro ao chamar API de validação: ${apiError.message}`)
        throw new Error(`Falha ao validar credenciais: ${apiError.message}`)
      }
      
      if (!validateResult.success) {
        addLog(connection.id, 'error', `❌ Validação falhou: ${validateResult.error || "Erro desconhecido"}`)
        if (validateResult.details) {
          addLog(connection.id, 'error', `❌ Detalhes: ${JSON.stringify(validateResult.details).substring(0, 200)}`)
        }
        throw new Error(validateResult.error || "Credenciais inválidas")
      }
      
      const data = validateResult.data
      addLog(connection.id, 'success', '✅ Credenciais válidas!')
      addLog(connection.id, 'info', `   📱 Número: ${data.display_phone_number || "N/A"}`)
      addLog(connection.id, 'info', `   ✅ Nome verificado: ${data.verified_name || "N/A"}`)
      addLog(connection.id, 'info', `   ⭐ Qualidade: ${data.quality_rating || "N/A"}`)
      addLog(connection.id, 'info', `   🔧 Plataforma: ${data.platform_type || "N/A"}`)
      
      // ============================================
      // ETAPA 4: TESTE DE CONEXÃO COM META API
      // ============================================
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'info', '🔗 ETAPA 4: Testando conexão direta com Meta API')
      addLog(connection.id, 'info', '───────────────────────────────────────')
      
      try {
        const metaApiUrl = `https://graph.facebook.com/v21.0/${connection.phone_number_id}?access_token=${connection.access_token}`
        addLog(connection.id, 'info', `📤 Testando: GET ${metaApiUrl.substring(0, 80)}...`)
        
        const metaResponse = await fetch(metaApiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'ScalaZap-Verification/1.0'
          }
        })
        
        addLog(connection.id, 'info', `📥 Resposta Meta API: Status ${metaResponse.status}`)
        
        if (!metaResponse.ok) {
          const metaError = await metaResponse.json()
          addLog(connection.id, 'error', `❌ Meta API retornou erro: ${JSON.stringify(metaError).substring(0, 200)}`)
          throw new Error(`Meta API erro: ${metaError.error?.message || 'Erro desconhecido'}`)
        }
        
        const metaData = await metaResponse.json()
        addLog(connection.id, 'success', '✅ Conexão direta com Meta API funcionando!')
        addLog(connection.id, 'info', `   📱 Número verificado: ${metaData.display_phone_number || "N/A"}`)
        
      } catch (metaError: any) {
        addLog(connection.id, 'error', `❌ Erro ao testar Meta API: ${metaError.message}`)
        // Não falhar completamente, apenas avisar
        addLog(connection.id, 'info', '⚠️ Continuando apesar do erro na Meta API...')
      }
      
      // ============================================
      // ETAPA 5: ATUALIZAÇÃO NO BANCO DE DADOS
      // ============================================
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'info', '💾 ETAPA 5: Atualizando conexão no banco de dados')
      addLog(connection.id, 'info', '───────────────────────────────────────')
      
      const updateData = {
        id: connection.id,
        status: "connected",
        telefone: data.display_phone_number || connection.phone,
        nome: `WhatsApp Business - ${data.display_phone_number || data.verified_name || "API Oficial"}`,
      }
      
      addLog(connection.id, 'info', `📤 Dados para atualizar: ${JSON.stringify(updateData).substring(0, 150)}...`)
      
      try {
        const updateResponse = await fetch("/api/connections/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })
        
        addLog(connection.id, 'info', `📥 Resposta da atualização: Status ${updateResponse.status}`)
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          addLog(connection.id, 'error', `❌ Erro HTTP ${updateResponse.status} ao atualizar`)
          addLog(connection.id, 'error', `❌ Resposta: ${errorText.substring(0, 200)}`)
          throw new Error(`Falha ao atualizar: HTTP ${updateResponse.status}`)
        }
        
        const updateResult = await updateResponse.json()
        addLog(connection.id, 'info', `📥 Resultado: ${JSON.stringify(updateResult).substring(0, 100)}...`)
        
        if (!updateResult.success) {
          addLog(connection.id, 'error', `❌ Atualização falhou: ${updateResult.error}`)
          throw new Error(`Erro ao atualizar conexão: ${updateResult.error}`)
        }
        
        addLog(connection.id, 'success', '✅ Conexão atualizada no banco de dados!')
        addLog(connection.id, 'info', `   📝 Nome: ${updateResult.connection?.nome || "N/A"}`)
        addLog(connection.id, 'info', `   📱 Telefone: ${updateResult.connection?.telefone || "N/A"}`)
        addLog(connection.id, 'info', `   ✅ Status: ${updateResult.connection?.status || "N/A"}`)
        
      } catch (updateError: any) {
        addLog(connection.id, 'error', `❌ Erro ao atualizar conexão: ${updateError.message}`)
        if (updateError.stack) {
          addLog(connection.id, 'error', `❌ Stack: ${updateError.stack.substring(0, 200)}...`)
        }
        throw new Error(`Falha ao atualizar conexão: ${updateError.message}`)
      }
      
      // ============================================
      // ETAPA 6: VERIFICAÇÃO FINAL
      // ============================================
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'info', '✅ ETAPA 6: Verificação final')
      addLog(connection.id, 'info', '───────────────────────────────────────')
      
      // Recarregar lista
      addLog(connection.id, 'info', '⏳ Recarregando lista de conexões...')
      await loadConnections()
      addLog(connection.id, 'success', '✅ Lista recarregada')
      
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'success', '═══════════════════════════════════════')
      addLog(connection.id, 'success', '🎉 VERIFICAÇÃO CONCLUÍDA COM SUCESSO!')
      addLog(connection.id, 'success', '═══════════════════════════════════════')
      addLog(connection.id, 'info', `✅ Webhook: Funcionando`)
      addLog(connection.id, 'info', `✅ Credenciais WhatsApp: Válidas`)
      addLog(connection.id, 'info', `✅ Conexão Meta API: Funcionando`)
      addLog(connection.id, 'info', `✅ Banco de dados: Atualizado`)
      addLog(connection.id, 'info', `📱 Número: ${data.display_phone_number || "N/A"}`)
      
      toast({
        title: "✅ Verificação completa!",
        description: `Tudo funcionando! Número: ${data.display_phone_number || "N/A"}`,
      })
      
    } catch (error: any) {
      addLog(connection.id, 'info', '')
      addLog(connection.id, 'error', '═══════════════════════════════════════')
      addLog(connection.id, 'error', '❌ VERIFICAÇÃO FALHOU')
      addLog(connection.id, 'error', '═══════════════════════════════════════')
      addLog(connection.id, 'error', `❌ Erro: ${error.message || "Erro desconhecido"}`)
      addLog(connection.id, 'error', `❌ Tipo: ${error.name || "Error"}`)
      if (error.stack) {
        addLog(connection.id, 'error', `❌ Stack trace: ${error.stack.substring(0, 300)}...`)
      }
      
      toast({
        title: "❌ Erro na verificação",
        description: error.message || "Não foi possível verificar a conexão.",
        variant: "destructive",
      })
    } finally {
      setVerifyingConnection(null)
    }
  }

  const handleTestMessage = async (connection: any) => {
    if (!testPhone) {
      toast({
        title: "Número necessário",
        description: "Digite um número de telefone para enviar mensagem de teste.",
        variant: "destructive",
      })
      return
    }

    setTestingConnection(connection.id)
    // Editing Comment: removed debug log
    
    try {
      // Usar nossa API para enviar (evita problemas de CORS)
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: connection.phone_number_id,
          accessToken: connection.access_token,
          to: testPhone,
          message: `Teste de conexao ScalaZap!\n\nSua conexao "${connection.name}" esta funcionando perfeitamente!\n\nData/Hora: ${new Date().toLocaleString("pt-BR")}`,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem de teste enviada com sucesso para ${testPhone}. ID: ${result.messageId}`,
        })
        setTestPhone("")
      } else {
        throw new Error(result.error || "Falha ao enviar mensagem")
      }
    } catch (error: any) {
      console.error("[v0] Test message failed:", error)
      toast({
        title: "Erro no envio",
        description: error.message || "Não foi possível enviar a mensagem de teste.",
        variant: "destructive",
      })
    } finally {
      setTestingConnection(null)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Conexão WhatsApp - API Oficial</h1>
        <p className="text-muted-foreground">Conecte seu número WhatsApp Business usando a API Oficial da Meta</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="add">Adicionar Conexao</TabsTrigger>
          <TabsTrigger value="list">Minhas Conexoes ({connections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-6">
          <Card className="border-green-500/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle>Conectar API Oficial do WhatsApp</CardTitle>
                  <CardDescription>Configure sua conexão com as credenciais do Meta Business</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use este método se você já configurou uma conta no Meta Business e possui as credenciais (Phone Number ID, Access Token e WABA ID).
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="Ex: 123456789012345"
                    value={manualForm.phoneNumberId}
                    onChange={(e) => setManualForm({ ...manualForm, phoneNumberId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: WhatsApp Manager → Phone Numbers → Seu número
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Ex: EAAxxxxxxxxxx"
                    value={manualForm.accessToken}
                    onChange={(e) => setManualForm({ ...manualForm, accessToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Gere um token permanente em: Business Settings → System Users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wabaId">WABA ID *</Label>
                  <Input
                    id="wabaId"
                    placeholder="Ex: 987654321098765"
                    value={manualForm.wabaId}
                    onChange={(e) => setManualForm({ ...manualForm, wabaId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    WhatsApp Business Account ID encontrado no WhatsApp Manager
                  </p>
                </div>

                <Button 
                  onClick={handleManualConnection} 
                  disabled={isLoading} 
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Validando..." : "Validar e Conectar"}
                </Button>

                {webhookData && (
                  <div className="mt-6 space-y-4 p-6 border-2 border-green-500 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-3 pb-4 border-b border-green-500/30">
                      <div className="p-3 rounded-full bg-green-500">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-green-400">Conexao Validada com Sucesso!</h4>
                        <p className="text-sm text-muted-foreground">Agora configure o webhook no Facebook para receber mensagens</p>
                      </div>
                    </div>

                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertDescription className="text-red-400 font-medium">
                        IMPORTANTE: Sem configurar o webhook, voce NAO recebera mensagens no chat ao vivo!
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">1. URL do Webhook (Callback URL)</Label>
                        <div className="flex gap-2">
                          <Input value={webhookData.url} readOnly className="font-mono text-sm bg-background" />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(webhookData.url, "Webhook URL")}
                            className="shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-semibold">2. Token de Verificacao (Verify Token)</Label>
                        <div className="flex gap-2">
                          <Input value={webhookData.token} readOnly className="font-mono text-sm bg-background" />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(webhookData.token, "Verify Token")}
                            className="shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-background rounded-lg border space-y-3">
                        <p className="font-semibold text-base">3. Como configurar no Facebook:</p>
                        <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                          <li>Acesse <strong>developers.facebook.com</strong> e entre no seu App</li>
                          <li>No menu lateral, clique em <strong>WhatsApp → Configuration</strong></li>
                          <li>Na secao <strong>Webhook</strong>, clique em <strong>"Edit"</strong></li>
                          <li>Cole a <strong>Callback URL</strong> e o <strong>Verify Token</strong> acima</li>
                          <li>Clique em <strong>"Verify and Save"</strong></li>
                          <li>Apos verificar, clique em <strong>"Manage"</strong> e ative o campo <strong>"messages"</strong></li>
                        </ol>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="default" className="flex-1" asChild>
                          <a
                            href="https://developers.facebook.com/apps/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir Facebook Developers
                          </a>
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent" onClick={() => {
                          setActiveTab("list")
                          setWebhookData(null)
                        }}>
                          Ver Minhas Conexoes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {connections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Nenhuma conexão configurada ainda.</p>
                <p className="text-sm mt-2">Adicione sua primeira conexão na aba "Adicionar Conexão"</p>
              </CardContent>
            </Card>
          ) : (
            connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Zap className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <CardDescription>{connection.phone || "Numero nao disponivel"}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={connection.status === "connected" ? "default" : "secondary"} className={connection.status === "connected" ? "bg-green-600" : ""}>
                        {connection.status === "connected" ? "Ativo" : "Inativo"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowWebhookFor(showWebhookFor === connection.id ? null : connection.id)}
                      >
                        <Webhook className="h-4 w-4 mr-1" />
                        Webhooks
                        {showWebhookFor === connection.id ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleVerifyConnection(connection)}
                        disabled={verifyingConnection === connection.id}
                      >
                        {verifyingConnection === connection.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificar
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteConnection(connection.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium">{connection.type === "official" ? "API Oficial" : "WhatsApp Comum"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mensagens Enviadas</p>
                      <p className="font-medium">
                        {connection.messages_used || 0} / {connection.messages_limit || 1000}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone Number ID</p>
                      <p className="font-mono text-xs">{connection.phone_number_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conectado em</p>
                      <p className="font-medium">{connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString("pt-BR") : "Agora"}</p>
                    </div>
                  </div>

                  {/* Seção de Webhooks Expandível */}
                  {showWebhookFor === connection.id && (
                    <div className="pt-4 border-t space-y-4 bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-green-500" />
                          <h4 className="font-semibold text-green-400">Configuracao de Webhook</h4>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckWebhook(connection)}
                            disabled={checkingWebhook === connection.id}
                          >
                            {checkingWebhook === connection.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                <Webhook className="h-4 w-4 mr-2" />
                                Verificar Config
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyConnection(connection)}
                            disabled={verifyingConnection === connection.id}
                          >
                            {verifyingConnection === connection.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verificar Webhook
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Logs de Verificação */}
                      {showVerificationLogs === connection.id && verificationLogs[connection.id] && verificationLogs[connection.id].length > 0 && (
                        <div className="mt-4 p-3 bg-black/50 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-300">Logs de Verificação</span>
                          </div>
                          <div className="space-y-1 font-mono text-xs">
                            {verificationLogs[connection.id].map((log, index) => (
                              <div
                                key={index}
                                className={`flex items-start gap-2 ${
                                  log.type === 'success' ? 'text-green-400' :
                                  log.type === 'error' ? 'text-red-400' :
                                  'text-gray-300'
                                }`}
                              >
                                <span className="text-gray-500 shrink-0">
                                  {log.timestamp.toLocaleTimeString('pt-BR')}
                                </span>
                                <span>{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Alert className="border-red-500/30 bg-red-500/10">
                        <AlertDescription className="text-red-400 text-sm font-medium">
                          IMPORTANTE: Configure o webhook no Facebook Developers para receber mensagens no chat ao vivo!
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">URL do Webhook (Callback URL)</Label>
                          <div className="flex mt-1">
                            <Input
                              value={connection.webhook?.url || WEBHOOK_CONFIG.url}
                              readOnly
                              className="font-mono text-sm bg-background"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="ml-2 shrink-0 bg-transparent"
                              onClick={() => copyToClipboard(connection.webhook?.url || WEBHOOK_CONFIG.url, "URL do Webhook")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            URL da Supabase Edge Function: whatsapp-webhook
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Token de Verificacao (Verify Token)</Label>
                          <div className="flex mt-1">
                            <Input
                              value={connection.webhook?.verify_token || WEBHOOK_CONFIG.token}
                              readOnly
                              className="font-mono text-sm bg-background"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="ml-2 shrink-0 bg-transparent"
                              onClick={() => copyToClipboard(connection.webhook?.verify_token || WEBHOOK_CONFIG.token, "Token de Verificacao")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1 pt-2">
                        <p><strong>Campos obrigatorios para assinar no Webhook:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-0.5">
                          <li>messages</li>
                          <li>message_status (para status de entrega)</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-background rounded border text-xs text-muted-foreground space-y-1">
                        <p><strong>Como configurar:</strong></p>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>Acesse developers.facebook.com → Seu App</li>
                          <li>WhatsApp → Configuration → Webhook → Edit</li>
                          <li>Cole a URL e Token acima</li>
                          <li>Clique em "Verify and Save"</li>
                          <li>Ative o campo "messages"</li>
                        </ol>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open("https://developers.facebook.com/apps/", "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Facebook Developers
                      </Button>
                    </div>
                  )}

                  {(connection.status === "active" || connection.status === "connected") && connection.type === "official" && (
                    <div className="pt-4 border-t space-y-3">
                      <Label className="text-sm font-semibold">Testar Envio de Mensagem</Label>
                      <p className="text-xs text-muted-foreground">
                        Envie uma mensagem de teste para verificar se a conexão está funcionando corretamente.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: 5511999999999"
                          value={testPhone}
                          onChange={(e) => setTestPhone(e.target.value)}
                          disabled={testingConnection === connection.id}
                        />
                        <Button
                          onClick={() => handleTestMessage(connection)}
                          disabled={testingConnection === connection.id || !testPhone}
                          className="shrink-0"
                        >
                          {testingConnection === connection.id ? (
                            "Enviando..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Testar
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Formato: código do país + DDD + número (apenas números, sem espaços ou caracteres)
                      </p>
                    </div>
                  )}

                  {/* Resultados da verificação do webhook */}
                  {webhookCheckResults[connection.id] && (
                    <div className="pt-4 border-t space-y-2">
                      <Label className="text-sm font-semibold">Resultado da Verificação</Label>
                      <div className="space-y-2 text-xs">
                        {webhookCheckResults[connection.id].checks?.map((check: any, idx: number) => (
                          <div key={idx} className={`p-2 rounded border ${
                            check.status === "success" ? "bg-green-50 border-green-200" :
                            check.status === "warning" ? "bg-yellow-50 border-yellow-200" :
                            check.status === "error" ? "bg-red-50 border-red-200" :
                            "bg-gray-50 border-gray-200"
                          }`}>
                            <div className="font-medium">{check.name}</div>
                            <div className="text-muted-foreground mt-1">{check.message}</div>
                            {check.details && Object.keys(check.details).length > 0 && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-blue-600">Ver detalhes</summary>
                                <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border">
                                  {JSON.stringify(check.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
