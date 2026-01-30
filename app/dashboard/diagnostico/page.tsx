"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WEBHOOK_CONFIG } from "@/lib/webhook-config"

export default function DiagnosticoPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const fetchDiagnostico = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/whatsapp/webhook-test")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Erro ao buscar diagnóstico:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDiagnostico()
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: `${label} copiado!` })
  }

  const webhookUrl = WEBHOOK_CONFIG.url
  const verifyToken = WEBHOOK_CONFIG.token

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diagnostico do Webhook</h1>
          <p className="text-muted-foreground">Verifique se o webhook esta recebendo mensagens corretamente</p>
        </div>
        <Button onClick={fetchDiagnostico} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Status Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total de Webhooks Recebidos</div>
              <div className="text-3xl font-bold">{data?.totalLogs || 0}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total de Mensagens Salvas</div>
              <div className="text-3xl font-bold">{data?.totalMessages || 0}</div>
            </div>
          </div>

          {data?.totalLogs === 0 && (
            <Alert className="border-red-500 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                <strong>PROBLEMA:</strong> Nenhum webhook foi recebido. O Facebook NAO esta enviando mensagens para este servidor.
              </AlertDescription>
            </Alert>
          )}

          {data?.totalLogs > 0 && data?.totalMessages === 0 && (
            <Alert className="border-yellow-500 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                Webhooks estao chegando, mas as mensagens nao estao sendo processadas corretamente.
              </AlertDescription>
            </Alert>
          )}

          {data?.totalMessages > 0 && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                O webhook esta funcionando e mensagens estao sendo recebidas!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuracao do Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracao do Webhook no Facebook</CardTitle>
          <CardDescription>Use estas informacoes para configurar o webhook no seu App do Facebook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL de Callback</label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-sm">{webhookUrl}</code>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, "URL")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Token de Verificacao</label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-sm">{verifyToken}</code>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(verifyToken, "Token")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist de Configuracao */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Configuracao</CardTitle>
          <CardDescription>Verifique cada item para garantir que tudo esta configurado corretamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg space-y-2">
            <div className="font-medium">1. Webhook URL e Token configurados</div>
            <p className="text-sm text-muted-foreground">
              No Facebook Developers, va em WhatsApp → Configuration → Webhook e configure a URL e Token acima.
            </p>
            <Badge variant={data?.totalLogs > 0 ? "default" : "destructive"}>
              {data?.totalLogs > 0 ? "OK - Webhook verificado" : "VERIFICAR"}
            </Badge>
          </div>

          <div className="p-3 border rounded-lg space-y-2">
            <div className="font-medium">2. Campo "messages" assinado</div>
            <p className="text-sm text-muted-foreground">
              Clique em "Manage" e certifique-se que o campo "messages" esta com Subscribe ativado.
            </p>
          </div>

          <div className="p-3 border rounded-lg space-y-2 bg-yellow-500/10 border-yellow-500/50">
            <div className="font-medium text-yellow-400">3. WABA vinculado ao App (IMPORTANTE!)</div>
            <p className="text-sm text-muted-foreground">
              O numero de telefone do WhatsApp Business deve pertencer ao WABA (WhatsApp Business Account) que esta vinculado ao seu App.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Para verificar:</strong> Va em WhatsApp → API Setup → verifique se o numero correto aparece na lista "From".
            </p>
          </div>

          <div className="p-3 border rounded-lg space-y-2 bg-red-500/10 border-red-500/50">
            <div className="font-medium text-red-400">4. App em modo Live (NAO Development)</div>
            <p className="text-sm text-muted-foreground">
              Se o App estiver em modo Development, apenas numeros de teste cadastrados receberao webhooks.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Para verificar:</strong> Va em App Settings → Basic → App Mode deve ser "Live".
            </p>
          </div>

          <div className="p-3 border rounded-lg space-y-2">
            <div className="font-medium">5. Permissoes do App</div>
            <p className="text-sm text-muted-foreground">
              O App precisa das permissoes: whatsapp_business_management, whatsapp_business_messaging
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ultimos Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle>Ultimos Webhooks Recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentLogs?.length > 0 ? (
            <div className="space-y-2">
              {data.recentLogs.map((log: any, index: number) => (
                <div key={log.id} className="p-3 border rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Webhook #{log.id}</span>
                    <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum webhook recebido ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Ultimas Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle>Ultimas Mensagens Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentMessages?.length > 0 ? (
            <div className="space-y-2">
              {data.recentMessages.map((msg: any) => (
                <div key={msg.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{msg.contact_name || msg.from_number}</span>
                    <span className="text-muted-foreground text-sm">{new Date(msg.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-sm mt-1">{msg.message_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">De: {msg.from_number}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma mensagem recebida ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Link para Facebook Developers */}
      <div className="flex justify-center">
        <Button asChild>
          <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Facebook Developers
          </a>
        </Button>
      </div>
    </div>
  )
}
