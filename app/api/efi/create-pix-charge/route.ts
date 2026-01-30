import { type NextRequest, NextResponse } from "next/server"
import { createPixCharge } from "@/lib/efi"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { valor, devedor, solicitacaoPagador, expiracao } = body

    if (!valor || !devedor?.nome) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    console.log("[v0] PIX Charge - Starting REAL payment generation")
    console.log("[v0] PIX Charge - Amount:", valor, "Customer:", devedor.nome)

    const result = await createPixCharge({
      valor,
      devedor,
      solicitacaoPagador,
      expiracao,
    })

    console.log("[v0] PIX Charge - REAL EFI API success:", result.txid)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] PIX Charge - Error:", error)
    return NextResponse.json(
      {
        error: error.message || "Erro ao processar pagamento",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
