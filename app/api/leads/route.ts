import { NextResponse } from "next/server"
import { sendLeadToDataCrazy } from "@/lib/datacrazy"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Recebendo lead:", body)

    // Validate required fields
    if (!body.name || !body.email || !body.whatsapp) {
      console.error("[v0] Campos obrigatórios faltando")
      return NextResponse.json({ error: "Nome, email e WhatsApp são obrigatórios" }, { status: 400 })
    }

    try {
      console.log("[v0] Enviando lead para DataCrazy CRM...")
      const datacrazyResult = await sendLeadToDataCrazy({
        name: body.name,
        email: body.email,
        whatsapp: body.whatsapp,
        company: body.company,
        business_type: body.business_type,
        current_volume: body.current_volume,
        service_type: body.service_type,
        automation_system: body.automation_system,
        usage_type: body.usage_type,
        goal: body.goal,
        timeline: body.timeline,
        budget: body.budget,
      })

      if (datacrazyResult.success) {
        console.log("[v0] Lead enviado com sucesso para DataCrazy")
      } else {
        console.error("[v0] Falha ao enviar para DataCrazy:", datacrazyResult.error)
        return NextResponse.json({ error: "Erro ao enviar lead para o CRM" }, { status: 500 })
      }
    } catch (datacrazyError) {
      console.error("[v0] Erro ao enviar para DataCrazy:", datacrazyError)
      return NextResponse.json({ error: "Erro ao enviar lead para o CRM" }, { status: 500 })
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/facebook-conversions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: "Lead",
          eventData: {
            email: body.email,
            phone: body.whatsapp,
            firstName: body.name.split(" ")[0],
            customData: {
              content_name: "WhatsApp API Lead",
              content_category: "Lead Generation",
              value: 0,
              currency: "BRL",
            },
          },
        }),
      })
      console.log("[v0] Facebook Conversions API event sent")
    } catch (fbError) {
      console.error("[v0] Facebook Conversions API error:", fbError)
      // Não falhar se o Facebook Conversions API falhar
    }

    return NextResponse.json({
      success: true,
      message: "Lead enviado com sucesso",
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
