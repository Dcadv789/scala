export async function sendLeadToDataCrazy(leadData: {
  name: string
  email: string
  whatsapp: string
  company?: string
  business_type?: string
  current_volume?: string
  has_bm?: string
  automation_system?: string
  usage_type?: string
  goal?: string
  timeline?: string
  budget?: string
}) {
  try {
    const webhookUrl =
      "https://api.datacrazy.io/v1/crm/api/crm/integrations/webhook/business/763cee43-a9a2-41df-b3ca-8d3388f3653c"

    const payload = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.whatsapp,
      company: leadData.company || "",
      notes: `
Tipo de Negócio: ${leadData.business_type || "Não informado"}
Volume de Mensagens: ${leadData.current_volume || "Não informado"}
Possui BM: ${leadData.has_bm || "Não informado"}
Sistema de Automação: ${leadData.automation_system || "Não informado"}
Tipo de Uso: ${leadData.usage_type || "Não informado"}
Objetivo Principal: ${leadData.goal || "Não informado"}
Prazo: ${leadData.timeline || "Não informado"}
Orçamento: ${leadData.budget || "Não informado"}
      `.trim(),
    }

    console.log("[v0] Enviando lead para DataCrazy:", JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log("[v0] Resposta do DataCrazy:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    })

    if (!response.ok) {
      console.error("[v0] Erro ao enviar para DataCrazy:", {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        payload: payload,
      })
      throw new Error(`DataCrazy webhook failed: ${response.status} ${response.statusText}. Response: ${responseText}`)
    }

    let result
    try {
      result = responseText ? JSON.parse(responseText) : { success: true }
    } catch (e) {
      result = { success: true, raw: responseText }
    }

    console.log("[v0] Lead enviado com sucesso para DataCrazy:", result)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[v0] Erro crítico ao enviar para DataCrazy:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}
