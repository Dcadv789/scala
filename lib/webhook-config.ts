// Configuracao centralizada do webhook - usar estes valores em TODO o sistema

/**
 * Gera a URL do webhook baseada no ambiente atual
 */
export function getWebhookUrl(): string {
  // 1. Tentar variável de ambiente específica
  if (process.env.NEXT_PUBLIC_WEBHOOK_URL) {
    return process.env.NEXT_PUBLIC_WEBHOOK_URL
  }
  
  // 2. Tentar URL base da aplicação
  if (typeof window !== "undefined") {
    // Client-side: usar o domínio atual
    const origin = window.location.origin
    return `${origin}/api/whatsapp/webhook`
  }
  
  // 3. Server-side: tentar variáveis de ambiente
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}/api/whatsapp/webhook`
  }
  
  // 4. Fallback: URL de produção ou localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL || 
                  "https://scalazap.com"
  
  return `${baseUrl}/api/whatsapp/webhook`
}

export const WEBHOOK_CONFIG = {
  // URL dinâmica do webhook
  get url() {
    return getWebhookUrl()
  },
  
  // Token fixo para verificacao - usar este em TODO lugar
  token: "scalazap_verify_token_2024",
  
  // Campos obrigatorios para assinar no Facebook
  requiredFields: ["messages", "message_status"],
}
