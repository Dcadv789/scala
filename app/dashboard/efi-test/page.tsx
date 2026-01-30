"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"

export default function EfiTestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testEfiConnection = async () => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch("/api/efi/test-connection", {
        method: "POST",
      })
      const data = await response.json()
      setResults(data)
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Diagnóstico EFI</h1>
        <p className="text-muted-foreground">Teste sua integração com a EFI Bank</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testar Conexão EFI</CardTitle>
          <CardDescription>Verifica se as credenciais estão configuradas e funcionando</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testEfiConnection} disabled={testing} size="lg">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              "Testar Integração EFI"
            )}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              {results.success ? (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Conexão com EFI estabelecida com sucesso!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{results.error || "Erro ao conectar com EFI"}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes da Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Client ID</span>
                    <span className="flex items-center gap-2">
                      {results.config?.clientId ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">Configurado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">Não configurado</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Client Secret</span>
                    <span className="flex items-center gap-2">
                      {results.config?.clientSecret ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">Configurado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">Não configurado</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Chave PIX</span>
                    <span className="flex items-center gap-2">
                      {results.config?.pixKey ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">Configurada</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">Não configurada</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Modo Sandbox</span>
                    <span className="text-sm">
                      {results.config?.sandbox ? (
                        <span className="text-yellow-600">Ativo (Testes)</span>
                      ) : (
                        <span className="text-green-600">Produção</span>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {!results.success && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Para configurar a EFI:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Clique no ícone "Vars" na barra lateral esquerda do v0</li>
                      <li>
                        Adicione as variáveis de ambiente:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>EFI_CLIENT_ID</li>
                          <li>EFI_CLIENT_SECRET</li>
                          <li>EFI_PIX_KEY (sua chave PIX cadastrada na EFI)</li>
                          <li>EFI_SANDBOX=true (para testes)</li>
                        </ul>
                      </li>
                      <li>Salve e teste novamente</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
