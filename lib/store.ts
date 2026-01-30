type Campaign = {
  id: string
  name: string
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "failed"
  type: "text" | "template" | "media"
  recipients: number
  sent: number
  delivered: number
  read: number
  failed: number
  scheduledFor?: string
  createdAt: string
  connection: string
  message?: string
  templateId?: string
  mediaUrl?: string
  mediaType?: string
  contactSource?: string
}

type Connection = {
  id: string
  name: string
  type: "official" | "common" | "coexistence"
  phone: string
  phoneNumberId?: string
  accessToken?: string
  webhookUrl?: string
  verifyToken?: string
  wabaId?: string
  businessAccountId?: string
  qrCode?: string
  sessionData?: string
  status: "connected" | "disconnected" | "error" | "connecting" | "qr_pending"
  messagesUsed: number
  messagesLimit: number
  createdAt: string
}

type ChatConversation = {
  id: string
  contactName: string
  contactPhone: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  avatar?: string
  contactPhoto?: string | null // URL da foto de perfil do WhatsApp
  status: "active" | "archived"
}

type ChatMessage = {
  id: string
  conversationId: string
  text: string
  timestamp: string
  sender: "user" | "contact"
  status: "sent" | "delivered" | "read"
}

type User = {
  id: string
  name: string
  email: string
  plan: "starter" | "pro" | "enterprise"
  createdAt: string
  role?: "user" | "admin"
  subscriptionStatus?: "active" | "canceled" | "expired"
  subscriptionId?: string
  lastPaymentDate?: string
  nextPaymentDate?: string
}

type Payment = {
  id: string
  userId: string
  amount: number
  status: "pending" | "paid" | "failed" | "refunded"
  plan: "starter" | "pro" | "enterprise"
  pagarmeTransactionId?: string
  createdAt: string
  paidAt?: string
}

type Template = {
  id: string
  name: string
  status: "pending" | "approved" | "rejected"
  category: "marketing" | "transactional" | "otp"
  language: string
  headerType?: "text" | "image" | "video" | "document"
  headerText?: string
  headerMediaHandle?: string
  headerMediaUrl?: string
  body: string
  bodyVariables?: number
  footer?: string
  buttons?: Array<{
    type: "quick_reply" | "call_to_action"
    subType?: "phone_number" | "url"
    text: string
    phoneNumber?: string
    url?: string
    urlType?: "static" | "dynamic"
  }>
  createdAt: string
  connectionId?: string
  metaTemplateId?: string
  rejectionReason?: string
}

type MessageLog = {
  id: string
  connectionId: string
  connectionName: string
  recipient: string
  message: string
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  error?: string
  sentAt: string
  deliveredAt?: string
  readAt?: string
  campaignId?: string
  messageId?: string
}

type AutomationFunnel = {
  id: string
  name: string
  trigger: "keyword" | "first_message" | "manual"
  keyword?: string
  steps: AutomationStep[]
  active: boolean
  createdAt: string
}

type AutomationStep = {
  id: string
  type: "text" | "audio" | "image" | "video" | "delay" | "conditional"
  content?: string
  audioUrl?: string
  audioName?: string
  audioDuration?: number
  imageUrl?: string
  delay?: number // seconds
  condition?: {
    waitForResponse: boolean
    keywords?: string[]
    nextStepIfMatch?: string
    nextStepIfNoMatch?: string
  }
}

type QuickReply = {
  id: string
  name: string
  type: "text" | "audio" | "image"
  content: string
  audioUrl?: string
  audioDuration?: number
  imageUrl?: string
  category?: string
}

type ChatbotFlow = {
  id: string
  name: string
  description?: string
  active: boolean
  trigger: "keyword" | "first_message" | "menu" | "always"
  keywords?: string[]
  nodes: ChatbotNode[]
  connections: ChatbotConnection[]
  createdAt: string
  updatedAt: string
}

type ChatbotNode = {
  id: string
  type: "message" | "question" | "condition" | "delay" | "action" | "menu"
  position: { x: number; y: number }
  data: {
    label: string
    messageType?: "text" | "audio" | "image" | "video" | "document"
    text?: string
    audioUrl?: string
    imageUrl?: string
    videoUrl?: string
    delay?: number
    options?: Array<{ label: string; value: string; nextNode?: string }>
    conditions?: Array<{ keyword: string; nextNode?: string }>
    action?: "transfer_to_human" | "save_data" | "api_call"
  }
}

type ChatbotConnection = {
  id: string
  source: string
  target: string
  label?: string
}

type TeamMember = {
  id: string
  email: string
  name?: string
  role: "admin" | "manager" | "operator"
  status: "pending" | "active" | "inactive"
  invitedBy: string
  invitedAt: string
  acceptedAt?: string
  permissions: {
    campaigns: boolean
    chat: boolean
    contacts: boolean
    templates: boolean
    connections: boolean
    settings: boolean
  }
}

type StoreData = {
  campaigns: Campaign[]
  connections: Connection[]
  conversations: ChatConversation[]
  messages: ChatMessage[]
  user: User | null
  payments: Payment[]
  allUsers: User[]
  templates: Template[]
  messageLogs: MessageLog[]
  automationFunnels: AutomationFunnel[]
  quickReplies: QuickReply[]
  chatbotFlows?: ChatbotFlow[]
  teamMembers?: TeamMember[]
}

const STORAGE_KEY = "scalazap_data"

const PREDEFINED_USERS: {
  email: string
  password: string
  name: string
  plan: "starter" | "pro" | "enterprise"
  role: "user" | "admin"
}[] = [
  {
    email: "reginaldobeserra139@gmail.com",
    password: "Beserra139@@",
    name: "Reginaldo Beserra",
    plan: "enterprise",
    role: "user",
  },
  {
    email: "adminadmin",
    password: "Beserra139@@",
    name: "Admin",
    plan: "enterprise",
    role: "admin",
  },
]

// Initialize with default data if not exists
const getDefaultData = (): StoreData => ({
  campaigns: [],
  connections: [],
  conversations: [],
  messages: [],
  user: null,
  payments: [],
  allUsers: [],
  templates: [],
  messageLogs: [],
  automationFunnels: [],
  quickReplies: [],
})

const loadData = (): StoreData => {
  if (typeof window === "undefined") return getDefaultData()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultData()
    return JSON.parse(stored)
  } catch {
    return getDefaultData()
  }
}

const saveData = (data: StoreData) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Campaign functions
export const getCampaigns = (): Campaign[] => {
  return loadData().campaigns
}

export const addCampaign = (campaign: Omit<Campaign, "id" | "createdAt">): Campaign => {
  const data = loadData()
  const newCampaign: Campaign = {
    ...campaign,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  }
  data.campaigns.unshift(newCampaign)
  saveData(data)
  return newCampaign
}

export const updateCampaign = (id: string, updates: Partial<Campaign>) => {
  const data = loadData()
  const index = data.campaigns.findIndex((c) => c.id === id)
  if (index !== -1) {
    data.campaigns[index] = { ...data.campaigns[index], ...updates }
    saveData(data)
  }
}

export const deleteCampaign = (id: string) => {
  const data = loadData()
  data.campaigns = data.campaigns.filter((c) => c.id !== id)
  saveData(data)
}

// Connection functions
export const getConnections = (): Connection[] => {
  return loadData().connections
}

export const addConnection = (connection: Omit<Connection, "id" | "createdAt">): Connection => {
  const data = loadData()
  const newConnection: Connection = {
    ...connection,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  }
  data.connections.unshift(newConnection)
  saveData(data)
  return newConnection
}

export const updateConnection = (id: string, updates: Partial<Connection>) => {
  const data = loadData()
  const index = data.connections.findIndex((c) => c.id === id)
  if (index !== -1) {
    data.connections[index] = { ...data.connections[index], ...updates }
    saveData(data)
  }
}

export const deleteConnection = (id: string) => {
  const data = loadData()
  data.connections = data.connections.filter((c) => c.id !== id)
  saveData(data)
}

export const removeConnection = deleteConnection

// Chat functions
export const getConversations = (): ChatConversation[] => {
  return loadData().conversations
}

export const clearAllConversations = () => {
  const data = loadData()
  data.conversations = []
  data.messages = []
  saveData(data)
}

export const getMessages = (conversationId: string): ChatMessage[] => {
  return loadData().messages.filter((m) => m.conversationId === conversationId)
}

export const addMessage = (message: Omit<ChatMessage, "id">, conversationId: string): ChatMessage => {
  const data = loadData()
  const newMessage: ChatMessage = {
    ...message,
    id: Math.random().toString(36).substr(2, 9),
  }
  data.messages.push(newMessage)

  // Update conversation last message
  const convIndex = data.conversations.findIndex((c) => c.id === conversationId)
  if (convIndex !== -1) {
    data.conversations[convIndex].lastMessage = message.text
    data.conversations[convIndex].lastMessageTime = message.timestamp
    if (message.sender === "contact") {
      data.conversations[convIndex].unreadCount += 1
    }
  }

  saveData(data)
  return newMessage
}

export const markConversationAsRead = (conversationId: string) => {
  const data = loadData()
  const index = data.conversations.findIndex((c) => c.id === conversationId)
  if (index !== -1) {
    data.conversations[index].unreadCount = 0
    saveData(data)
  }
}

export const addConversation = (conversation: Omit<ChatConversation, "id">): ChatConversation => {
  const data = loadData()
  const newConversation: ChatConversation = {
    ...conversation,
    id: Math.random().toString(36).substr(2, 9),
  }
  data.conversations.unshift(newConversation)
  saveData(data)
  return newConversation
}

// Stats functions
export const getStats = () => {
  const data = loadData()
  const campaigns = data.campaigns
  const messages = data.messages || []

  const campaignSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0)
  const totalRead = campaigns.reduce((sum, c) => sum + c.read, 0)
  const activeConversations = data.conversations.filter((c) => c.status === "active").length

  // Chat messages stats
  const chatMessagesSent = messages.filter((m) => m.sender === "user").length
  const chatMessagesReceived = messages.filter((m) => m.sender === "contact").length
  const totalChatMessages = messages.length

  // Total sent = campaigns + chat messages sent
  const totalSent = campaignSent + chatMessagesSent

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "0.0"
  const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : "0.0"

  return {
    totalSent,
    activeConversations,
    deliveryRate,
    readRate,
    chatMessagesSent,
    chatMessagesReceived,
    totalChatMessages,
  }
}

// Authentication functions
export const login = (email: string, password: string): User | null => {
  const predefinedUser = PREDEFINED_USERS.find((u) => u.email === email && u.password === password)

  if (predefinedUser) {
    const user: User = {
      id: predefinedUser.email === "adminadmin" ? "admin-001" : "user-001",
      name: predefinedUser.name,
      email: predefinedUser.email,
      plan: predefinedUser.plan,
      role: predefinedUser.role,
      createdAt: new Date().toISOString(),
      subscriptionStatus: "active",
    }
    const data = loadData()
    data.user = user
    // Added to all users if not exists
    const existingIndex = data.allUsers.findIndex((u) => u.email === user.email)
    if (existingIndex === -1) {
      data.allUsers.push(user)
    }
    saveData(data)
    return user
  }

  // Simple authentication - in production, this would be a real API call
  if (password.length >= 6) {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      plan: "pro",
      role: "user",
      createdAt: new Date().toISOString(),
      subscriptionStatus: "active",
    }
    const data = loadData()
    data.user = user
    saveData(data)
    return user
  }
  return null
}

export const register = (
  name: string,
  email: string,
  password: string,
  plan: "starter" | "pro" | "enterprise",
): User | null => {
  // Simple registration - in production, this would be a real API call
  if (password.length >= 6) {
    const userId = Math.random().toString(36).substr(2, 9)
    const createdAt = new Date().toISOString()
    
    const user: User = {
      id: userId,
      name,
      email,
      plan,
      role: "user",
      createdAt,
      subscriptionStatus: "active",
    }
    
    // Save to main store
    const data = loadData()
    data.user = user
    data.allUsers.push(user)
    saveData(data)
    
    // Also save to scalazap_user with planStatus pending
    const userWithStatus = {
      ...user,
      planStatus: "pending", // New users start with pending status
    }
    localStorage.setItem("scalazap_user", JSON.stringify(userWithStatus))
    localStorage.setItem("scalazap_pending_plan", plan)
    
    // Also save to scalazap_admin_users for superadmin visibility
    const adminUsers = localStorage.getItem("scalazap_admin_users")
    let adminUsersList: any[] = []
    if (adminUsers) {
      try {
        adminUsersList = JSON.parse(adminUsers)
      } catch { /* ignore */ }
    }
    
    // Check if user already exists
    const existingIndex = adminUsersList.findIndex((u: any) => u.email === email)
    if (existingIndex === -1) {
      adminUsersList.push({
        id: userId,
        name,
        email,
        phone: "",
        plan,
        planStatus: "pending",
        createdAt,
        connections: 0,
        messagesSent: 0,
      })
    }
    localStorage.setItem("scalazap_admin_users", JSON.stringify(adminUsersList))
    
    return user
  }
  return null
}

export const logout = () => {
  const data = loadData()
  data.user = null
  saveData(data)
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  
  // Check new auth system first (scalazap_user)
  const newUser = localStorage.getItem("scalazap_user")
  if (newUser) {
    try {
      const userData = JSON.parse(newUser)
      if (userData && userData.email) {
        return {
          id: userData.id || userData.email,
          name: userData.name || userData.email.split("@")[0],
          email: userData.email,
          plan: userData.plan || "starter",
          role: userData.role || "user",
          createdAt: userData.createdAt || new Date().toISOString(),
          subscriptionStatus: userData.planStatus === "active" ? "active" : "expired",
        }
      }
    } catch { /* ignore */ }
  }
  
  // Fallback to old system
  return loadData().user
}

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  
  // Check new auth system first (scalazap_user)
  const newUser = localStorage.getItem("scalazap_user")
  if (newUser) {
    try {
      const userData = JSON.parse(newUser)
      if (userData && userData.email) {
        return true
      }
    } catch { /* ignore */ }
  }
  
  // Fallback to old system
  return loadData().user !== null
}

export const isAdmin = (): boolean => {
  const user = loadData().user
  return user?.role === "admin"
}

// Check if user has active payment/subscription
export const hasActiveSubscription = (): boolean => {
  if (typeof window === "undefined") return false
  
  const user = localStorage.getItem("scalazap_user")
  if (!user) return false
  
  try {
    const userData = JSON.parse(user)
    // Admin always has access
    if (userData.role === "admin") return true
    // Check if planStatus is active
    return userData.planStatus === "active"
  } catch {
    return false
  }
}

// Get user plan status
export const getUserPlanStatus = (): { plan: string; status: string; isPending: boolean } => {
  if (typeof window === "undefined") return { plan: "starter", status: "pending", isPending: true }
  
  const user = localStorage.getItem("scalazap_user")
  if (!user) return { plan: "starter", status: "pending", isPending: true }
  
  try {
    const userData = JSON.parse(user)
    // Admin always has full access
    if (userData.role === "admin") {
      return { plan: userData.plan || "enterprise", status: "active", isPending: false }
    }
    return {
      plan: userData.plan || "starter",
      status: userData.planStatus || "pending",
      isPending: userData.planStatus !== "active"
    }
  } catch {
    return { plan: "starter", status: "pending", isPending: true }
  }
}

// Activate user subscription (called when payment is confirmed)
export const activateUserSubscription = (email: string): void => {
  if (typeof window === "undefined") return
  
  // Update scalazap_user if it matches
  const user = localStorage.getItem("scalazap_user")
  if (user) {
    try {
      const userData = JSON.parse(user)
      if (userData.email === email) {
        userData.planStatus = "active"
        localStorage.setItem("scalazap_user", JSON.stringify(userData))
      }
    } catch { /* ignore */ }
  }
  
  // Update in admin users list
  const adminUsers = localStorage.getItem("scalazap_admin_users")
  if (adminUsers) {
    try {
      const users = JSON.parse(adminUsers)
      const userIndex = users.findIndex((u: any) => u.email === email)
      if (userIndex >= 0) {
        users[userIndex].planStatus = "active"
        localStorage.setItem("scalazap_admin_users", JSON.stringify(users))
      }
    } catch { /* ignore */ }
  }
}

// Payment management functions
export const getPayments = (): Payment[] => {
  return loadData().payments
}

export const addPayment = (payment: Omit<Payment, "id" | "createdAt">): Payment => {
  const data = loadData()
  const newPayment: Payment = {
    ...payment,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  }
  data.payments.unshift(newPayment)
  saveData(data)
  return newPayment
}

export const updatePayment = (id: string, updates: Partial<Payment>) => {
  const data = loadData()
  const index = data.payments.findIndex((p) => p.id === id)
  if (index !== -1) {
    data.payments[index] = { ...data.payments[index], ...updates }
    saveData(data)
  }
}

// Admin functions to manage all users
export const getAllUsers = (): User[] => {
  return loadData().allUsers
}

export const updateUserSubscription = (userId: string, updates: Partial<User>) => {
  const data = loadData()
  const index = data.allUsers.findIndex((u) => u.id === userId)
  if (index !== -1) {
    data.allUsers[index] = { ...data.allUsers[index], ...updates }
    saveData(data)
  }
}

export const deleteUser = (userId: string) => {
  const data = loadData()
  data.allUsers = data.allUsers.filter((u) => u.id !== userId)
  saveData(data)
}

export const getTemplates = (): Template[] => {
  return loadData().templates
}

export const addTemplate = (template: Omit<Template, "id" | "createdAt">): Template => {
  const data = loadData()
  const newTemplate: Template = {
    ...template,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  }
  data.templates.unshift(newTemplate)
  saveData(data)
  return newTemplate
}

export const updateTemplate = (id: string, updates: Partial<Template>) => {
  const data = loadData()
  const index = data.templates.findIndex((t) => t.id === id)
  if (index !== -1) {
    data.templates[index] = { ...data.templates[index], ...updates }
    saveData(data)
  }
}

export const deleteTemplate = (id: string) => {
  const data = loadData()
  data.templates = data.templates.filter((t) => t.id !== id)
  saveData(data)
}

// Message log functions
export const getMessageLogs = (filters?: {
  connectionId?: string
  status?: string
  campaignId?: string
}): MessageLog[] => {
  let logs = loadData().messageLogs

  if (filters?.connectionId) {
    logs = logs.filter((log) => log.connectionId === filters.connectionId)
  }
  if (filters?.status) {
    logs = logs.filter((log) => log.status === filters.status)
  }
  if (filters?.campaignId) {
    logs = logs.filter((log) => log.campaignId === filters.campaignId)
  }

  return logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
}

export const addMessageLog = (log: Omit<MessageLog, "id" | "sentAt">): MessageLog => {
  const data = loadData()
  const newLog: MessageLog = {
    ...log,
    id: Math.random().toString(36).substr(2, 9),
    sentAt: new Date().toISOString(),
  }
  data.messageLogs.unshift(newLog)

  // Keep only last 10000 logs to prevent storage overflow
  if (data.messageLogs.length > 10000) {
    data.messageLogs = data.messageLogs.slice(0, 10000)
  }

  saveData(data)
  return newLog
}

export const updateMessageLog = (id: string, updates: Partial<MessageLog>) => {
  const data = loadData()
  const index = data.messageLogs.findIndex((log) => log.id === id)
  if (index !== -1) {
    data.messageLogs[index] = { ...data.messageLogs[index], ...updates }
    saveData(data)
  }
}

export const clearMessageLogs = () => {
  const data = loadData()
  data.messageLogs = []
  saveData(data)
}

// Automation Funnel functions
export const getAutomationFunnels = (): AutomationFunnel[] => {
  return loadData().automationFunnels
}

export const addAutomationFunnel = (funnel: Omit<AutomationFunnel, "id" | "createdAt">): AutomationFunnel => {
  const data = loadData()
  const newFunnel: AutomationFunnel = {
    ...funnel,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  }
  data.automationFunnels.push(newFunnel)
  saveData(data)
  return newFunnel
}

export const updateAutomationFunnel = (id: string, updates: Partial<AutomationFunnel>) => {
  const data = loadData()
  const index = data.automationFunnels.findIndex((f) => f.id === id)
  if (index !== -1) {
    data.automationFunnels[index] = { ...data.automationFunnels[index], ...updates }
    saveData(data)
  }
}

export const deleteAutomationFunnel = (id: string) => {
  const data = loadData()
  data.automationFunnels = data.automationFunnels.filter((f) => f.id !== id)
  saveData(data)
}

// Quick Replies functions
export const getQuickReplies = (): QuickReply[] => {
  return loadData().quickReplies
}

export const addQuickReply = (reply: Omit<QuickReply, "id">): QuickReply => {
  const data = loadData()
  const newReply: QuickReply = {
    ...reply,
    id: Math.random().toString(36).substr(2, 9),
  }
  data.quickReplies.push(newReply)
  saveData(data)
  return newReply
}

export const updateQuickReply = (id: string, updates: Partial<QuickReply>) => {
  const data = loadData()
  const index = data.quickReplies.findIndex((r) => r.id === id)
  if (index !== -1) {
    data.quickReplies[index] = { ...data.quickReplies[index], ...updates }
    saveData(data)
  }
}

export const deleteQuickReply = (id: string) => {
  const data = loadData()
  data.quickReplies = data.quickReplies.filter((r) => r.id !== id)
  saveData(data)
}

// Chatbot Flow functions
export const getChatbotFlows = (): ChatbotFlow[] => {
  return loadData().chatbotFlows || []
}

export const addChatbotFlow = (flow: Omit<ChatbotFlow, "id" | "createdAt" | "updatedAt">): ChatbotFlow => {
  const data = loadData()
  if (!data.chatbotFlows) data.chatbotFlows = []
  const newFlow: ChatbotFlow = {
    ...flow,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.chatbotFlows.push(newFlow)
  saveData(data)
  return newFlow
}

export const updateChatbotFlow = (id: string, updates: Partial<ChatbotFlow>) => {
  const data = loadData()
  if (!data.chatbotFlows) data.chatbotFlows = []
  const index = data.chatbotFlows.findIndex((f) => f.id === id)
  if (index !== -1) {
    data.chatbotFlows[index] = {
      ...data.chatbotFlows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveData(data)
  }
}

export const deleteChatbotFlow = (id: string) => {
  const data = loadData()
  if (!data.chatbotFlows) data.chatbotFlows = []
  data.chatbotFlows = data.chatbotFlows.filter((f) => f.id !== id)
  saveData(data)
}

// Alias exports for admin panel compatibility
export const getUsers = getAllUsers
export const updateUser = (userId: string, updates: Partial<User>) => {
  const data = loadData()
  const index = data.allUsers.findIndex((u) => u.id === userId)
  if (index !== -1) {
    data.allUsers[index] = { ...data.allUsers[index], ...updates }
    saveData(data)
  }
}

// Team member functions
export const getTeamMembers = (): TeamMember[] => {
  const data = loadData()
  return data.teamMembers || []
}

export const addTeamMember = (member: Omit<TeamMember, "id">): TeamMember => {
  const data = loadData()
  if (!data.teamMembers) data.teamMembers = []
  const newMember: TeamMember = {
    ...member,
    id: Date.now().toString(),
  }
  data.teamMembers.push(newMember)
  saveData(data)
  return newMember
}

export const updateTeamMember = (memberId: string, updates: Partial<TeamMember>) => {
  const data = loadData()
  if (!data.teamMembers) return
  const index = data.teamMembers.findIndex((m) => m.id === memberId)
  if (index !== -1) {
    data.teamMembers[index] = { ...data.teamMembers[index], ...updates }
    saveData(data)
  }
}

export const removeTeamMember = (memberId: string) => {
  const data = loadData()
  if (!data.teamMembers) return
  data.teamMembers = data.teamMembers.filter((m) => m.id !== memberId)
  saveData(data)
}

export const getPlanLimits = (plan: string) => {
  switch (plan) {
    case "starter":
      return { maxConnections: 2, maxTeamMembers: 3 }
    case "pro":
    case "professional":
      return { maxConnections: 5, maxTeamMembers: 5 }
    case "enterprise":
      return { maxConnections: 999, maxTeamMembers: 999 }
    default:
      return { maxConnections: 2, maxTeamMembers: 3 }
  }
}

// Contact functions
export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  tags?: string[]
  createdAt: string
  lastMessage?: string
  lastMessageAt?: string
}

export const getContacts = (): Contact[] => {
  const data = loadData()
  return data.contacts || []
}

export const addContact = (contact: Omit<Contact, "id" | "createdAt">): Contact => {
  const data = loadData()
  if (!data.contacts) data.contacts = []
  
  const newContact: Contact = {
    ...contact,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  
  // Check for duplicate phone
  const exists = data.contacts.find((c: Contact) => c.phone === contact.phone)
  if (!exists) {
    data.contacts.push(newContact)
    saveData(data)
  }
  
  return exists || newContact
}

export const updateContact = (contactId: string, updates: Partial<Contact>) => {
  const data = loadData()
  if (!data.contacts) return
  const index = data.contacts.findIndex((c: Contact) => c.id === contactId)
  if (index !== -1) {
    data.contacts[index] = { ...data.contacts[index], ...updates }
    saveData(data)
  }
}

export const removeContact = (contactId: string) => {
  const data = loadData()
  if (!data.contacts) return
  data.contacts = data.contacts.filter((c: Contact) => c.id !== contactId)
  saveData(data)
}

export const importContacts = (contacts: Omit<Contact, "id" | "createdAt">[]): number => {
  let imported = 0
  contacts.forEach(contact => {
    const result = addContact(contact)
    if (result) imported++
  })
  return imported
}

// Voice Media Library - individual messages
export interface VoiceMediaItem {
  id: string
  name: string
  type: "audio" | "image" | "video" | "document" | "text"
  content: string
  duration?: number
  caption?: string
  fileName?: string
  typingDelay?: number
  category?: string
  createdAt: string
}

export const getVoiceMediaLibrary = (): VoiceMediaItem[] => {
  const data = loadData()
  return data.voiceMediaLibrary || []
}

export const addVoiceMedia = (media: Omit<VoiceMediaItem, "id" | "createdAt">): VoiceMediaItem => {
  const data = loadData()
  if (!data.voiceMediaLibrary) data.voiceMediaLibrary = []
  
  const newMedia: VoiceMediaItem = {
    ...media,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  
  data.voiceMediaLibrary.push(newMedia)
  saveData(data)
  return newMedia
}

export const updateVoiceMedia = (mediaId: string, updates: Partial<VoiceMediaItem>) => {
  const data = loadData()
  if (!data.voiceMediaLibrary) return
  
  const index = data.voiceMediaLibrary.findIndex((m: VoiceMediaItem) => m.id === mediaId)
  if (index !== -1) {
    data.voiceMediaLibrary[index] = { ...data.voiceMediaLibrary[index], ...updates }
    saveData(data)
  }
}

export const removeVoiceMedia = (mediaId: string) => {
  const data = loadData()
  if (!data.voiceMediaLibrary) return
  data.voiceMediaLibrary = data.voiceMediaLibrary.filter((m: VoiceMediaItem) => m.id !== mediaId)
  saveData(data)
}

// Voice Funnel functions
export interface VoiceFunnelStep {
  id: string
  type: "audio" | "image" | "video" | "document" | "text"
  content: string
  duration?: number
  caption?: string
  fileName?: string
  typingDelay?: number // delay in seconds to simulate typing
}

export interface VoiceFunnel {
  id: string
  name: string
  category: string
  steps: VoiceFunnelStep[]
  createdAt: string
  updatedAt: string
}

export const getVoiceFunnels = (): VoiceFunnel[] => {
  const data = loadData()
  return data.voiceFunnels || []
}

export const addVoiceFunnel = (funnel: Omit<VoiceFunnel, "id" | "createdAt" | "updatedAt">): VoiceFunnel => {
  const data = loadData()
  if (!data.voiceFunnels) data.voiceFunnels = []
  
  const newFunnel: VoiceFunnel = {
    ...funnel,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  data.voiceFunnels.push(newFunnel)
  saveData(data)
  return newFunnel
}

export const updateVoiceFunnel = (funnelId: string, updates: Partial<VoiceFunnel>) => {
  const data = loadData()
  if (!data.voiceFunnels) return
  
  const index = data.voiceFunnels.findIndex((f: VoiceFunnel) => f.id === funnelId)
  if (index !== -1) {
    data.voiceFunnels[index] = { 
      ...data.voiceFunnels[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveData(data)
  }
}

export const removeVoiceFunnel = (funnelId: string) => {
  const data = loadData()
  if (!data.voiceFunnels) return
  data.voiceFunnels = data.voiceFunnels.filter((f: VoiceFunnel) => f.id !== funnelId)
  saveData(data)
}
