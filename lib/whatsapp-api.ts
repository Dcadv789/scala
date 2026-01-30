// WhatsApp API Integration Layer
// Supports both Official WhatsApp Business API and Unofficial APIs

interface WhatsAppMessage {
  to: string
  type: "text" | "template" | "image" | "video" | "document"
  content: string | { name: string; language: string; components: any[] }
  mediaUrl?: string
  caption?: string
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

interface ConnectionConfig {
  type: "official" | "common"
  phoneNumberId?: string
  accessToken?: string
  webhookUrl?: string
  verifyToken?: string
  apiUrl?: string
  apiKey?: string
}

export class WhatsAppAPI {
  private config: ConnectionConfig

  constructor(config: ConnectionConfig) {
    this.config = config
  }

  async sendMessage(message: WhatsAppMessage): Promise<SendResult> {
    if (this.config.type === "official") {
      return this.sendOfficialMessage(message)
    } else {
      return this.sendUnofficialMessage(message)
    }
  }

  private async sendOfficialMessage(message: WhatsAppMessage): Promise<SendResult> {
    try {
      if (!this.config.phoneNumberId || !this.config.accessToken) {
        throw new Error("Phone Number ID e Access Token são obrigatórios para API Oficial")
      }

      const url = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`

      const payload: any = {
        messaging_product: "whatsapp",
        to: message.to.replace(/\D/g, ""),
      }

      if (message.type === "template") {
        payload.type = "template"
        payload.template = message.content
      } else if (message.type === "text") {
        payload.type = "text"
        payload.text = { body: message.content }
      } else if (["image", "video", "document"].includes(message.type)) {
        payload.type = message.type
        payload[message.type] = {
          link: message.mediaUrl,
          caption: message.caption,
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Falha ao enviar mensagem")
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      }
    } catch (error: any) {
      console.error("[WhatsApp API Official] Error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  private async sendUnofficialMessage(message: WhatsAppMessage): Promise<SendResult> {
    try {
      // Implementação para APIs não oficiais (Evolution API, Baileys, etc.)
      // Este é um exemplo genérico que deve ser adaptado para a API específica
      console.log("[WhatsApp API Unofficial] Sending message:", message)

      // Simula envio bem-sucedido para desenvolvimento
      return {
        success: true,
        messageId: Math.random().toString(36).substr(2, 9),
      }
    } catch (error: any) {
      console.error("[WhatsApp API Unofficial] Error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async sendBulkMessages(
    messages: WhatsAppMessage[],
    options: {
      intervalMs: number
      maxPerHour: number
      randomizeInterval: boolean
      onProgress?: (sent: number, total: number, failed: number) => void
    },
  ): Promise<{ sent: number; failed: number; results: SendResult[] }> {
    const results: SendResult[] = []
    let sent = 0
    let failed = 0
    const maxPerInterval = Math.floor(options.maxPerHour / (3600000 / options.intervalMs))
    let sentInInterval = 0
    let intervalStart = Date.now()

    for (let i = 0; i < messages.length; i++) {
      if (sentInInterval >= maxPerInterval) {
        const elapsed = Date.now() - intervalStart
        if (elapsed < 3600000) {
          await this.sleep(3600000 - elapsed)
        }
        sentInInterval = 0
        intervalStart = Date.now()
      }

      const result = await this.sendMessage(messages[i])
      results.push(result)

      if (result.success) {
        sent++
      } else {
        failed++
      }

      sentInInterval++

      if (options.onProgress) {
        options.onProgress(sent, messages.length, failed)
      }

      if (i < messages.length - 1) {
        const interval = options.randomizeInterval ? this.randomInterval(options.intervalMs) : options.intervalMs
        await this.sleep(interval)
      }
    }

    return { sent, failed, results }
  }

  async submitTemplate(template: {
    name: string
    language: string
    category: string
    components: any[]
  }): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      if (this.config.type !== "official") {
        throw new Error("Template submission only available for Official API")
      }

      if (!this.config.accessToken) {
        throw new Error("Access Token is required")
      }

      // Get WABA ID from the phone number ID
      // In production, you would fetch this from your connection settings
      const wabaId = this.config.phoneNumberId?.split("_")[0] || this.config.phoneNumberId

      const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to submit template")
      }

      return {
        success: true,
        templateId: data.id,
      }
    } catch (error: any) {
      console.error("[WhatsApp API] Template submission error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async uploadMedia(file: File): Promise<{ success: boolean; mediaHandle?: string; error?: string }> {
    try {
      if (this.config.type !== "official") {
        throw new Error("Media upload only available for Official API")
      }

      if (!this.config.phoneNumberId || !this.config.accessToken) {
        throw new Error("Phone Number ID and Access Token are required")
      }

      // Step 1: Create upload session
      const sessionUrl = `https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/uploads`
      const sessionResponse = await fetch(sessionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_name: file.name,
          file_length: file.size,
          file_type: file.type,
        }),
      })

      const sessionData = await sessionResponse.json()

      if (!sessionResponse.ok) {
        throw new Error(sessionData.error?.message || "Failed to create upload session")
      }

      // Step 2: Upload the file
      const uploadUrl = sessionData.upload_url
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `OAuth ${this.config.accessToken}`,
          file_offset: "0",
        },
        body: file,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || "Failed to upload media")
      }

      return {
        success: true,
        mediaHandle: uploadData.h,
      }
    } catch (error: any) {
      console.error("[WhatsApp API] Media upload error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private randomInterval(baseMs: number): number {
    const variance = 0.3
    const min = baseMs * (1 - variance)
    const max = baseMs * (1 + variance)
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}

export function createWhatsAppAPI(connection: {
  type: "official" | "common"
  phoneNumberId?: string
  accessToken?: string
  webhookUrl?: string
  verifyToken?: string
}): WhatsAppAPI {
  const config: ConnectionConfig = {
    type: connection.type,
    phoneNumberId: connection.phoneNumberId,
    accessToken: connection.accessToken,
    webhookUrl: connection.webhookUrl,
    verifyToken: connection.verifyToken,
  }

  return new WhatsAppAPI(config)
}
