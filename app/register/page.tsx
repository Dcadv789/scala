import { Suspense } from "react"
import Image from "next/image"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111c21] via-[#0d1a1f] to-[#00bf63] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <Image src="/zap-logo.png" alt="ScalaZap" width={180} height={80} className="h-12 w-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>Comece a enviar mensagens em massa agora</CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6">Carregando...</div>}>
          <RegisterForm />
        </Suspense>
      </Card>
    </div>
  )
}
