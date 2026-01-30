// Armazenamento temporario de mensagens recebidas via webhook
// Em producao, isso deve ser substituido por um banco de dados real

type IncomingMessage = {
  id: string
  from: string
  contactName: string
  text: string
  timestamp: string
  type: "text" | "image" | "audio" | "video" | "document" | "sticker"
  mediaUrl?: string
  phoneNumberId: string
}

// Usar variavel global para persistir entre requests no mesmo processo
declare global {
  var webhookMessages: IncomingMessage[]
  var processedMessageIds: Set<string>
}

// Inicializar se nao existir
if (!global.webhookMessages) {
  global.webhookMessages = []
}
if (!global.processedMessageIds) {
  global.processedMessageIds = new Set()
}

export const addIncomingMessage = (message: IncomingMessage) => {
  // Evitar duplicatas
  if (global.processedMessageIds.has(message.id)) {
    return
  }
  
  global.processedMessageIds.add(message.id)
  global.webhookMessages.unshift(message)
  
  // Manter apenas as ultimas 1000 mensagens na memoria
  if (global.webhookMessages.length > 1000) {
    global.webhookMessages = global.webhookMessages.slice(0, 1000)
  }
  
  // Limpar IDs antigos
  if (global.processedMessageIds.size > 5000) {
    global.processedMessageIds.clear()
  }
}

export const getIncomingMessages = (since?: string): IncomingMessage[] => {
  if (!since) {
    return global.webhookMessages
  }
  
  const sinceTime = new Date(since).getTime()
  return global.webhookMessages.filter(m => new Date(m.timestamp).getTime() > sinceTime)
}

export const clearIncomingMessages = () => {
  global.webhookMessages = []
  global.processedMessageIds.clear()
}
