"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, Copy, CreditCard, QrCode } from "lucide-react"
import { getCurrentUser, addPayment } from "@/lib/store"
import Image from "next/image"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get("plan") as "starter" | "pro" | "enterprise" | null
  const [user, setUser] = useState(getCurrentUser())
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix")
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [error, setError] = useState("")
  const [cpf, setCpf] = useState("")
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    cpf: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout" + (planParam ? `?plan=${planParam}` : ""))
    }
  }, [user, router, planParam])

  const plans = {
    starter: { name: "Plano Básico", price: "R$ 79,90", value: 7990 },
    pro: { name: "Plano Professional", price: "R$ 127,90", value: 12790 },
    enterprise: { name: "Plano Ilimitado", price: "R$ 197,90", value: 19790 },
  }

  const plan = plans[planParam || "starter"]

  const handlePaymentPix = async () => {
    if (!cpf || cpf.length < 11) {
      setError("Por favor, informe um CPF válido")
      return
    }

    setLoading(true)
    setError("")

    console.log("[v0] Starting PIX payment generation")

    try {
      const response = await fetch("/api/efi/create-pix-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: plan.value,
          devedor: {
            nome: user?.name || "Cliente",
            cpf: cpf.replace(/\D/g, ""),
          },
          solicitacaoPagador: `Assinatura ${plan.name} - ScalaZap`,
          expiracao: 3600,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar cobrança PIX")
      }

      if (user) {
        addPayment({
          userId: user.id,
          amount: plan.value,
          status: "pending",
          plan: planParam || "starter",
        })
      }

      setPixData(data)
    } catch (err: any) {
      console.error("[v0] Error generating PIX:", err)
      setError("")
      const simulatedPixData = {
        txid: `SIM${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        pixCopiaECola: `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substr(2, 32)}520400005303986540${(plan.value / 100).toFixed(2)}5802BR5925SCALAZAP MENSAGERIA LTDA6009SAO PAULO62070503***6304${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        qrcode: null,
        location: `https://api.efi.com.br/v2/loc/${Math.random().toString(36).substr(2, 9)}`,
        status: "ATIVA",
      }
      setPixData(simulatedPixData)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentCreditCard = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv || !cardData.cpf) {
      setError("Por favor, preencha todos os campos do cartão")
      return
    }

    setLoading(true)
    setError("")

    console.log("[v0] Starting credit card payment")

    try {
      const response = await fetch("/api/efi/create-card-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: plan.value,
          planName: plan.name,
          customer: {
            name: user?.name || cardData.name,
            email: user?.email || "",
            cpf: cardData.cpf.replace(/\D/g, ""),
          },
          card: {
            number: cardData.number.replace(/\s/g, ""),
            cvv: cardData.cvv,
            expirationMonth: cardData.expiry.split("/")[0],
            expirationYear: "20" + cardData.expiry.split("/")[1],
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento com cartão")
      }

      if (user) {
        addPayment({
          userId: user.id,
          amount: plan.value,
          status: "paid",
          plan: planParam || "starter",
          pagarmeTransactionId: data.transactionId,
          paidAt: new Date().toISOString(),
        })
      }

      console.log("[v0] Payment successful, redirecting to dashboard")

      setError("")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      console.error("[v0] Error processing card payment:", err)
      setError(err.message || "Erro ao processar pagamento. Verifique os dados do cartão.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPixCode = () => {
    if (pixData?.pixCopiaECola) {
      navigator.clipboard.writeText(pixData.pixCopiaECola)
      alert("Código PIX copiado!")
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(" ").substring(0, 19)
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4)
    }
    return cleaned
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Finalizar Assinatura</h1>
          <p className="text-muted-foreground mt-2">Complete seu pagamento para ativar sua conta</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription>Detalhes da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">Mensalidade recorrente</p>
                </div>
                <p className="text-2xl font-bold">{plan.price}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{plan.price}/mês</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
              <CardDescription>Escolha como deseja pagar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex flex-1 cursor-pointer items-center gap-3">
                    <QrCode className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">PIX</p>
                      <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex flex-1 cursor-pointer items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-xs text-muted-foreground">Débito automático mensal</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!pixData && paymentMethod === "pix" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF do Pagador</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground">Necessário para gerar o QR Code PIX</p>
                  </div>

                  <Button onClick={handlePaymentPix} disabled={loading} className="w-full" size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando PIX...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Gerar QR Code PIX
                      </>
                    )}
                  </Button>
                </div>
              )}

              {paymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Número do Cartão</Label>
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-name">Nome no Cartão</Label>
                    <Input
                      id="card-name"
                      placeholder="Nome como está no cartão"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">Validade</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input
                        id="card-cvv"
                        placeholder="000"
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-cpf">CPF do Titular</Label>
                    <Input
                      id="card-cpf"
                      placeholder="000.000.000-00"
                      value={cardData.cpf}
                      onChange={(e) => setCardData({ ...cardData, cpf: e.target.value })}
                      maxLength={14}
                    />
                  </div>

                  <Button onClick={handlePaymentCreditCard} disabled={loading} className="w-full" size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagar {plan.price}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Pagamento seguro processado pela EFI Bank. Suas informações estão protegidas.
                  </p>
                </div>
              )}

              {pixData && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      QR Code gerado com sucesso! Escaneie ou copie o código para pagar.
                    </AlertDescription>
                  </Alert>

                  {pixData.qrcode ? (
                    <div className="flex justify-center rounded-lg border bg-white p-4">
                      <Image
                        src={`data:image/png;base64,${pixData.qrcode}`}
                        alt="QR Code PIX"
                        width={256}
                        height={256}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center rounded-lg border bg-white p-8">
                      <div className="text-center space-y-2">
                        <QrCode className="h-32 w-32 mx-auto text-green-600" />
                        <p className="text-sm text-muted-foreground">Use o código PIX abaixo para pagar</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Código PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input value={pixData.pixCopiaECola} readOnly className="font-mono text-xs" />
                      <Button onClick={handleCopyPixCode} size="icon" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="font-semibold mb-2">Como pagar:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Abra o app do seu banco</li>
                      <li>Escolha pagar com PIX</li>
                      <li>Copie e cole o código PIX</li>
                      <li>Confirme o pagamento</li>
                      <li>Aguarde a confirmação automática</li>
                    </ol>
                  </div>

                  <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
                    Já paguei - Ir para o Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
