"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Copy, Check, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import { PlanGuard } from "@/components/auth/plan-guard"

function WebhookStatusPageContent() {
  const [loading, setLoading] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : ""
  const verifyToken = "scalazap_verify_token_2024"

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/whatsapp/debug")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error("Error fetching debug data:", error)
    }
    setLoading(false)
  }

  const testWebhook = async () => {
    setLoading(true)
    try {
      // Testar verificacao GET
      const verifyResponse = await fetch(`/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test_challenge_123`)
      const verifyText = await verifyResponse.text()
      
      setTestResult({
        verifyStatus: verifyResponse.status,
        verifyResponse: verifyText,
        success: verifyResponse.ok && verifyText === "test_challenge_123"
      })
    } catch (error: any) {
      setTestResult({ error: error.message })
    }
    setLoading(false)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Status do Webhook WhatsApp</h1>
        <p className="text-muted-foreground mt-2">Diagnostico e configuracao do webhook para receber mensagens</p>
      </div>

      {/* Configuracao do Webhook */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Configuracao Obrigatoria no Facebook
          </CardTitle>
          <CardDescription>
            Configure estes dados no Meta Business Suite para receber mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertDescription className="text-yellow-600">
              <strong>IMPORTANTE:</strong> Voce precisa configurar o webhook no seu aplicativo do Facebook em:
              <br />
              Meta Business Suite → Seu App → WhatsApp → Configuracao → Webhook
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label className="font-semibold">URL de Callback (Webhook URL)</Label>
              <div className="flex mt-1 gap-2">
                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                >
                  {copied === "url" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="font-semibold">Token de Verificacao (Verify Token)</Label>
              <div className="flex mt-1 gap-2">
                <Input value={verifyToken} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(verifyToken, "token")}
                >
                  {copied === "token" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <Label className="font-semibold">Campos para Assinar (Webhook Fields)</Label>
              <p className="text-sm text-muted-foreground mt-1">Marque estes campos no Facebook:</p>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li><code className="bg-background px-1 rounded">messages</code> - Para receber mensagens</li>
                <li><code className="bg-background px-1 rounded">message_status</code> - Para status de entrega</li>
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => window.open("https://developers.facebook.com/apps", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Facebook Developers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teste do Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Webhook</CardTitle>
          <CardDescription>Verifica se o endpoint esta funcionando corretamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testWebhook} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            Testar Verificacao do Webhook
          </Button>

          {testResult && (
            <div className={`p-4 rounded-lg ${testResult.success ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
              {testResult.success ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Webhook funcionando corretamente!</span>
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-medium">Erro no webhook:</p>
                  <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status dos Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Logs de Webhook Recebidos</CardTitle>
            <CardDescription>Mostra os ultimos webhooks recebidos do Facebook</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDebugData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {debugData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Total de logs:</span>
                  <Badge variant={debugData.totalLogs > 0 ? "default" : "destructive"} className="ml-2">
                    {debugData.totalLogs || 0}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mensagens salvas:</span>
                  <Badge variant={debugData.totalMessages > 0 ? "default" : "destructive"} className="ml-2">
                    {debugData.totalMessages || 0}
                  </Badge>
                </div>
              </div>

              {debugData.totalLogs === 0 ? (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-600">
                    <strong>Nenhum webhook recebido!</strong>
                    <br />
                    O Facebook nao esta enviando webhooks. Verifique:
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>A URL do webhook esta correta no Facebook?</li>
                      <li>O token de verificacao esta correto?</li>
                      <li>Voce assinou os campos "messages" no webhook?</li>
                      <li>O webhook foi verificado com sucesso pelo Facebook?</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ultimos logs recebidos:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-60">
                    {JSON.stringify(debugData.recentLogs, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Carregando...</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function WebhookStatusPage() {
  return (
    <PlanGuard>
      <WebhookStatusPageContent />
    </PlanGuard>
  )
}
