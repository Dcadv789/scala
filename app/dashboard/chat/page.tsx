"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { DropdownMenuContent } from "@/components/ui/dropdown-menu"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { DropdownMenu } from "@/components/ui/dropdown-menu"

import React from "react"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"

// File type configurations - moved outside component
const ACCEPTED_FILE_TYPES = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Imagens (JPG, PNG, GIF, WebP)',
  },
  video: {
    extensions: ['.mp4', '.3gp', '.mov'],
    mimeTypes: ['video/mp4', 'video/3gpp', 'video/quicktime'],
    maxSize: 16 * 1024 * 1024, // 16MB
    description: 'Videos (MP4, 3GP, MOV)',
  },
  audio: {
    extensions: ['.mp3', '.ogg', '.amr', '.m4a', '.opus', '.webm'],
    mimeTypes: ['audio/mpeg', 'audio/ogg', 'audio/amr', 'audio/mp4', 'audio/opus', 'audio/webm'],
    maxSize: 16 * 1024 * 1024, // 16MB
    description: 'Audios (MP3, OGG, AMR, M4A)',
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'Documentos (PDF, Word, Excel, PowerPoint, TXT)',
  },
} as const

const getAllAcceptedMimeTypes = () => {
  return Object.values(ACCEPTED_FILE_TYPES).flatMap(t => t.mimeTypes).join(',')
}

const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | null => {
  for (const [type, config] of Object.entries(ACCEPTED_FILE_TYPES)) {
    if (config.mimeTypes.includes(file.type)) {
      return type as 'image' | 'video' | 'audio' | 'document'
    }
  }
  return null
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatRecordingTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
import { useSearchParams } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { FeatureLock } from "@/components/dashboard/feature-lock"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  MessageSquare,
  Mic,
  ImageIcon,
  Zap,
  Clock,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Menu,
  Plus,
  UserPlus,
  FileText,
  StopCircle,
  Upload,
  X,
  File,
  Music,
  AlertCircle,
} from "lucide-react"
import {
  addMessage,
  addConversation,
  getQuickReplies,
  getVoiceFunnels,
  getTemplates,
  getConversations,
  getMessages,
  clearAllConversations,
  type VoiceFunnel,
} from "@/lib/store"
import { fetchConnections } from "@/lib/connections"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { createClient } from "@supabase/supabase-js"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { authFetch } from "@/lib/auth-fetch"

// BYPASS: Ativar para permitir acesso sem restrição de plano
const BYPASS_PLAN_RESTRICTION = true

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function ChatContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const conversationIdFromUrl = searchParams.get("conversation")
  
  // Limpar localStorage de mensagens antigas - agora usamos apenas Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Limpar dados de conversas/mensagens do localStorage (agora usamos Supabase)
      const storedData = localStorage.getItem("scalazap_data")
      if (storedData) {
        try {
          const data = JSON.parse(storedData)
          // Limpar apenas conversas e mensagens, manter o resto
          data.conversations = []
          data.messages = []
          localStorage.setItem("scalazap_data", JSON.stringify(data))
        } catch (e) {
          // Se der erro, ignorar
        }
      }
    }
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<ReturnType<typeof getConversations>>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationIdFromUrl)
  const [messages, setMessages] = useState<ReturnType<typeof getMessages>>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [quickReplies, setQuickReplies] = useState<ReturnType<typeof getQuickReplies>>([])
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showAutomation, setShowAutomation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [recordingAudio, setRecordingAudio] = useState(false)
  const [simulateTyping, setSimulateTyping] = useState(false)
  const [simulateRecording, setSimulateRecording] = useState(false)
  const [connections, setConnections] = useState<any[]>([])
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  
  // Inicializar Supabase client para Realtime COM AUTENTICAÇÃO
  useEffect(() => {
    console.log("[Realtime] ====== INICIALIZANDO CLIENTE SUPABASE ======")
    console.log("[Realtime] Verificando variáveis de ambiente:", {
      supabaseUrl: supabaseUrl || "NÃO CONFIGURADO",
      supabaseAnonKey: supabaseAnonKey ? "CONFIGURADO (oculto)" : "NÃO CONFIGURADO"
    })

    if (supabaseUrl && supabaseAnonKey) {
      console.log("[Realtime] Criando cliente Supabase com Realtime habilitado...")
      try {
        supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey, {
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          },
          auth: {
            persistSession: false, // Não persistir sessão no localStorage (já temos nosso próprio)
            autoRefreshToken: false
          }
        })
        
        // CRÍTICO: Autenticar o cliente com a sessão do localStorage
        // Sem autenticação, o Realtime não funciona com RLS habilitado
        const sessionJson = typeof window !== "undefined" ? localStorage.getItem("scalazap_auth_session") : null
        if (sessionJson) {
          try {
            const sessionData = JSON.parse(sessionJson)
            console.log("[Realtime] Autenticando cliente com sessão do localStorage...")
            console.log("[Realtime] Session data:", {
              hasAccessToken: !!sessionData.access_token,
              hasRefreshToken: !!sessionData.refresh_token,
              userId: sessionData.user?.id
            })
            
            // Usar setSession com a sessão completa
            if (!supabaseRef.current) {
              console.error("[Realtime] ❌ Cliente Supabase não inicializado")
              return
            }
            supabaseRef.current.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token || ""
            }).then(({ data, error }) => {
              if (error) {
                console.error("[Realtime] ❌ Erro ao autenticar cliente:", error)
                console.error("[Realtime] Detalhes:", error.message)
                // Tentar fallback: usar apenas o access_token
                const authToken = typeof window !== "undefined" ? localStorage.getItem("scalazap_auth_token") : null
                if (authToken && supabaseRef.current) {
                  console.log("[Realtime] Tentando fallback com access_token apenas...")
                  supabaseRef.current.auth.setSession({
                    access_token: authToken,
                    refresh_token: ""
                  } as any).catch((err) => {
                    console.error("[Realtime] ❌ Fallback também falhou:", err)
                  })
                }
              } else {
                console.log("[Realtime] ✅ Cliente autenticado com sucesso")
                console.log("[Realtime] User ID:", data.session?.user?.id)
              }
            }).catch((err) => {
              console.error("[Realtime] ❌ Exceção ao autenticar:", err)
            })
          } catch (parseError) {
            console.error("[Realtime] ❌ Erro ao parsear sessão:", parseError)
            // Fallback: tentar com access_token apenas
            const authToken = typeof window !== "undefined" ? localStorage.getItem("scalazap_auth_token") : null
            if (authToken && supabaseRef.current) {
              console.log("[Realtime] Tentando fallback com access_token apenas...")
              supabaseRef.current.auth.setSession({
                access_token: authToken,
                refresh_token: ""
              } as any).catch((err) => {
                console.error("[Realtime] ❌ Fallback também falhou:", err)
              })
            }
          }
        } else {
          console.warn("[Realtime] ⚠️ Sessão de autenticação não encontrada no localStorage")
          // Tentar fallback com access_token
          const authToken = typeof window !== "undefined" ? localStorage.getItem("scalazap_auth_token") : null
          if (authToken && supabaseRef.current) {
            console.log("[Realtime] Tentando autenticar com access_token apenas...")
            supabaseRef.current.auth.setSession({
              access_token: authToken,
              refresh_token: ""
            } as any).catch((err) => {
              console.error("[Realtime] ❌ Fallback falhou:", err)
            })
          } else {
            console.warn("[Realtime] ⚠️ Token de autenticação também não encontrado")
            console.warn("[Realtime] O Realtime pode não funcionar corretamente com RLS habilitado")
            console.warn("[Realtime] Faça login novamente para restaurar a sessão")
          }
        }
        
        console.log("[Realtime] ✅ Cliente Supabase inicializado com sucesso")
        console.log("[Realtime] URL:", supabaseUrl)
      } catch (error) {
        console.error("[Realtime] ❌ Erro ao criar cliente Supabase:", error)
      }
    } else {
      console.error("[Realtime] ❌ Variáveis de ambiente não configuradas!")
      console.error("[Realtime] Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão no .env.local")
      console.error("[Realtime] E se o servidor foi reiniciado após adicionar as variáveis")
    }
  }, [])
  
  // Carregar id_empresa do usuário logado
  useEffect(() => {
    const loadEmpresaId = async () => {
      try {
        console.log("[Chat] ====== Carregando empresaId ======")
        
        // Tentar obter do localStorage primeiro (mais rápido)
        const userJson = localStorage.getItem("scalazap_user")
        if (userJson) {
          try {
            const userData = JSON.parse(userJson)
            if (userData.id_empresa) {
              console.log("[Chat] ✅ EmpresaId carregado do localStorage:", userData.id_empresa)
              setEmpresaId(userData.id_empresa)
              return
            }
          } catch (e) {
            console.error("[Chat] Erro ao parsear userJson:", e)
          }
        }
        
        // Fallback: buscar da API
        console.log("[Chat] Buscando empresaId da API...")
        const response = await authFetch("/api/auth/user")
        const result = await response.json()
        if (result.success && result.empresaId) {
          console.log("[Chat] ✅ EmpresaId carregado da API:", result.empresaId)
          setEmpresaId(result.empresaId)
        } else {
          console.error("[Chat] ❌ Erro ao carregar empresaId:", result)
        }
      } catch (error) {
        console.error("[Chat] ❌ Erro ao carregar empresaId:", error)
      }
    }
    loadEmpresaId()
  }, [])
  
  // Carregar conexões do Supabase
  useEffect(() => {
    const loadConnections = async () => {
      console.log("[Chat] ====== Carregando conexões ======")
      try {
        const conns = await fetchConnections()
        console.log("[Chat] ✅ Conexões carregadas:", conns.length)
        console.log("[Chat] Conexões:", conns.map((c: any) => ({ id: c.id, nome: c.nome, phone: c.phone })))
        setConnections(conns)
        
        // Verificar se há conexão salva no localStorage
        const savedConnection = localStorage.getItem("scalazap_selected_connection")
        if (savedConnection && conns.some((c: any) => c.id === savedConnection)) {
          console.log("[Chat] Usando conexão salva no localStorage:", savedConnection)
          setSelectedConnectionId(savedConnection)
        } else if (conns.length === 1) {
          // Selecionar primeira conexão automaticamente se houver apenas uma
          console.log("[Chat] Selecionando única conexão disponível:", conns[0].id)
          setSelectedConnectionId(conns[0].id)
          localStorage.setItem("scalazap_selected_connection", conns[0].id)
        } else if (conns.length > 1 && !selectedConnectionId) {
          // Se tiver múltiplas, selecionar a primeira por padrão
          console.log("[Chat] Múltiplas conexões encontradas, selecionando primeira:", conns[0].id)
          setSelectedConnectionId(conns[0].id)
          localStorage.setItem("scalazap_selected_connection", conns[0].id)
        }
      } catch (error) {
        console.error("[Chat] ❌ Erro ao carregar conexões:", error)
      }
    }
    loadConnections()
  }, [])
  
  // Carregar perfis disponíveis
  useEffect(() => {
    const loadProfiles = async () => {
      console.log("[Chat] ====== INICIANDO Carregamento de Perfis ======")
      
      // Primeiro, tentar obter o perfil do usuário autenticado do localStorage
      let perfilUsuarioAutenticado: string | null = null
      try {
        const userJson = localStorage.getItem("scalazap_user")
        if (userJson) {
          const userData = JSON.parse(userJson)
          console.log("[Chat] 👤 Usuário autenticado encontrado no localStorage:", {
            id: userData.id,
            email: userData.email,
            name: userData.name
          })
          // O id do usuário no localStorage pode ser o id do perfil ou do auth.users
          // Vamos tentar usar esse ID como perfil inicial
          if (userData.id) {
            perfilUsuarioAutenticado = userData.id
            console.log("[Chat] ✅ ID do usuário autenticado (usado como perfil inicial):", perfilUsuarioAutenticado)
          }
        }
      } catch (error) {
        console.warn("[Chat] ⚠️ Erro ao ler usuário do localStorage:", error)
      }
      
      try {
        console.log("[Chat] 📡 Fazendo requisição para /api/chat/profiles...")
        const response = await authFetch("/api/chat/profiles")
        console.log("[Chat] 📥 Resposta recebida:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("[Chat] ❌ Erro HTTP ao buscar perfis:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error || "Erro desconhecido",
            debug: errorData.debug
          })
          
          // Se houver um perfil do usuário autenticado, usar ele mesmo com erro
          if (perfilUsuarioAutenticado) {
            console.log("[Chat] ⚠️ Usando perfil do usuário autenticado como fallback:", perfilUsuarioAutenticado)
            setProfiles([{ id: perfilUsuarioAutenticado, nome_completo: "Você", email: "" }])
            setSelectedProfileId(perfilUsuarioAutenticado)
            localStorage.setItem("scalazap_selected_profile", perfilUsuarioAutenticado)
          }
          return
        }
        
        const result = await response.json()
        
        console.log("[Chat FRONTEND] ========================================")
        console.log("[Chat FRONTEND] 📊 RESPOSTA COMPLETA DA API DE PERFIS")
        console.log("[Chat FRONTEND] ========================================")
        console.log("[Chat FRONTEND] success:", result.success)
        console.log("[Chat FRONTEND] perfisCount:", result.perfis?.length || 0)
        console.log("[Chat FRONTEND] isDono:", result.isDono)
        console.log("[Chat FRONTEND] tipo de isDono:", typeof result.isDono)
        console.log("[Chat FRONTEND] isDono === true?", result.isDono === true)
        console.log("[Chat FRONTEND] isDono === false?", result.isDono === false)
        console.log("[Chat FRONTEND] error:", result.error)
        console.log("[Chat FRONTEND] perfis:", result.perfis)
        console.log("[Chat FRONTEND] JSON completo:", JSON.stringify(result, null, 2))
        console.log("[Chat FRONTEND] ========================================")
        
        if (result.success && result.perfis) {
          setProfiles(result.perfis)
          
          console.log("[Chat FRONTEND] ====== PROCESSANDO RESPOSTA ======")
          console.log("[Chat FRONTEND] result.isDono recebido:", result.isDono)
          console.log("[Chat FRONTEND] tipo de result.isDono:", typeof result.isDono)
          console.log("[Chat FRONTEND] result.isDono === true?", result.isDono === true)
          console.log("[Chat FRONTEND] result.isDono === false?", result.isDono === false)
          console.log("[Chat FRONTEND] result.isDono || false:", result.isDono || false)
          console.log("[Chat FRONTEND] Boolean(result.isDono):", Boolean(result.isDono))
          
          const isDonoValue = Boolean(result.isDono)
          console.log("[Chat FRONTEND] isDonoValue final:", isDonoValue)
          console.log("[Chat FRONTEND] ========================================")
          
          setIsSuperAdmin(isDonoValue)
          
          // Prioridade: 1) Perfil do usuário autenticado, 2) Perfil salvo, 3) Primeiro da lista
          let perfilParaSelecionar: string | null = null
          
          // 1. Tentar usar o perfil do usuário autenticado (se estiver na lista)
          if (perfilUsuarioAutenticado && result.perfis.some((p: any) => p.id === perfilUsuarioAutenticado)) {
            perfilParaSelecionar = perfilUsuarioAutenticado
            console.log("[Chat] ✅ Selecionando perfil do usuário autenticado:", perfilParaSelecionar)
          } else {
            // 2. Verificar se há perfil salvo no localStorage
            const savedProfile = localStorage.getItem("scalazap_selected_profile")
            if (savedProfile && result.perfis.some((p: any) => p.id === savedProfile)) {
              perfilParaSelecionar = savedProfile
              console.log("[Chat] ✅ Usando perfil salvo no localStorage:", perfilParaSelecionar)
            } else if (result.perfis.length > 0) {
              // 3. Selecionar primeiro perfil da lista
              perfilParaSelecionar = result.perfis[0].id
              console.log("[Chat] ✅ Selecionando primeiro perfil da lista:", perfilParaSelecionar)
            }
          }
          
          if (perfilParaSelecionar) {
            setSelectedProfileId(perfilParaSelecionar)
            localStorage.setItem("scalazap_selected_profile", perfilParaSelecionar)
            console.log("[Chat] ✅ Perfil selecionado e salvo:", perfilParaSelecionar)
          } else {
            console.warn("[Chat] ⚠️ Nenhum perfil disponível para seleção")
          }
        } else {
          console.warn("[Chat] ⚠️ Resposta sem sucesso ou sem perfis:", result)
          setProfiles([])
        }
      } catch (error) {
        console.error("[Chat] ❌ Erro ao carregar perfis:", error)
        setProfiles([])
      }
      
      console.log("[Chat] ====== FINALIZADO Carregamento de Perfis ======")
    }
    loadProfiles()
  }, [])
  
  // Carregar conversas quando conexão ou perfil for selecionado
  useEffect(() => {
    if (selectedConnectionId && selectedProfileId) {
      console.log("[Chat] Conexão e perfil selecionados, carregando conversas...")
      loadConversations()
    }
  }, [selectedConnectionId, selectedProfileId])
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [showVoiceFunnels, setShowVoiceFunnels] = useState(false)
  const [voiceFunnels, setVoiceFunnels] = useState<VoiceFunnel[]>([])
  const [sendingFunnel, setSendingFunnel] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [templates, setTemplates] = useState<ReturnType<typeof getTemplates>>([])
  const [newContactForm, setNewContactForm] = useState({
    name: "",
    phone: "",
    templateId: "",
  })
  // Audio recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // File upload states
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadConversations = async () => {
    try {
      console.log("[Chat] ====== Carregando conversas ======")
      console.log("[Chat] Conexão selecionada:", selectedConnectionId)
      console.log("[Chat] Empresa ID:", empresaId)
      
      if (!selectedConnectionId) {
        console.warn("[Chat] ⚠️ Nenhuma conexão selecionada, não é possível carregar conversas")
        setConversations([])
        return
      }
      
      // Buscar contatos com mensagens recentes via nova API (com autenticação)
      const url = `/api/chat/contacts${selectedConnectionId ? `?id_conexao=${selectedConnectionId}` : ""}`
      console.log("[Chat] URL da requisição:", url)
      
      const response = await authFetch(url, {
        headers: {
          "X-Selected-Connection": selectedConnectionId
        }
      })
      
      console.log("[Chat] Status da resposta:", response.status, response.statusText)
      const result = await response.json()
      console.log("[Chat] Resposta da API de contatos:", {
        success: result.success,
        total: result.total,
        error: result.error
      })
      
      if (result.success && result.contatos) {
        // Converter contatos para formato de conversas (compatibilidade)
        const conversasFormatadas = result.contatos.map((contato: any) => ({
          id: contato.id,
          contactName: contato.nome,
          contactPhone: contato.telefone,
          contactAvatar: contato.nome.charAt(0).toUpperCase(),
          contactPhoto: contato.url_foto_perfil || null, // Foto de perfil do WhatsApp
          lastMessage: contato.ultima_mensagem?.conteudo || "",
          timestamp: contato.ultima_mensagem_em,
          unreadCount: contato.mensagens_nao_lidas || 0,
          status: contato.status || "active",
        }))
        console.log("[Chat] Conversas formatadas:", conversasFormatadas.length)
        setConversations(conversasFormatadas)
      } else {
        console.warn("[Chat] Nenhuma conversa encontrada ou erro na resposta:", result)
        setConversations([])
      }
    } catch (error) {
      console.error("[Chat] Error loading conversations:", error)
      setConversations([])
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      console.log("[Chat] ====== Carregando mensagens ======")
      console.log("[Chat] Contato ID:", conversationId)
      console.log("[Chat] Conexão selecionada:", selectedConnectionId)
      
      if (!selectedConnectionId) {
        console.warn("[Chat] ⚠️ Nenhuma conexão selecionada, não é possível carregar mensagens")
        setMessages([])
        return
      }
      
      // Buscar mensagens do contato via nova API (com autenticação)
      const url = `/api/chat/messages?id_contato=${conversationId}${selectedConnectionId ? `&id_conexao=${selectedConnectionId}` : ""}`
      console.log("[Chat] URL da requisição:", url)
      
      const response = await authFetch(url, {
        headers: {
          "X-Selected-Connection": selectedConnectionId
        }
      })
      
      console.log("[Chat] Status da resposta:", response.status, response.statusText)
      const result = await response.json()
      console.log("[Chat] Resposta da API de mensagens:", {
        success: result.success,
        total: result.total,
        error: result.error
      })
      
      if (result.success && result.mensagens) {
        // Converter mensagens para formato compatível
        const mensagensFormatadas = result.mensagens.map((msg: any) => ({
          id: msg.id,
          conversationId: conversationId,
          text: msg.conteudo,
          content: msg.conteudo,
          type: msg.tipo_midia || "text",
          sender: msg.direcao === "saida" ? "user" : "contact",
          status: msg.status || "sent",
          timestamp: msg.criado_em,
          mediaUrl: msg.url_midia,
        }))
        console.log("[Chat] Mensagens formatadas:", mensagensFormatadas.length)
        setMessages(mensagensFormatadas)
        
        // Marcar mensagens como lidas (com autenticação)
        await authFetch("/api/chat/messages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_contato: conversationId })
        })
        
        // Atualizar conversas
        loadConversations()
      } else {
        console.warn("[Chat] Nenhuma mensagem encontrada ou erro na resposta:", result)
        setMessages([])
      }
    } catch (error) {
      console.error("[Chat] Error loading messages:", error)
      setMessages([])
    }
  }
  
  // Configurar Supabase Realtime para TODAS as mensagens da empresa (atualizar lista de conversas)
  useEffect(() => {
    console.log("[Realtime] ====== INICIANDO CONFIGURAÇÃO REALTIME ======")
    console.log("[Realtime] Verificando condições:", {
      supabaseRef: !!supabaseRef.current,
      empresaId: empresaId,
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey
    })

    if (!supabaseRef.current) {
      console.error("[Realtime] ❌ Cliente Supabase não inicializado!")
      console.error("[Realtime] Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão configuradas")
      return
    }

    if (!empresaId) {
      console.warn("[Realtime] ⚠️ empresaId não disponível ainda, aguardando...")
      return
    }

    console.log("[Realtime] 🔌 Configurando Realtime para empresa:", empresaId)
    const channelName = `mensagens-empresa:${empresaId}`
    console.log("[Realtime] Nome do canal:", channelName)
    
    const channel = supabaseRef.current.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: "" }
      }
    })

    console.log("[Realtime] Canal criado, configurando listener...")
    console.log("[Realtime] Filtro configurado: id_empresa=eq." + empresaId)
    console.log("[Realtime] Tipo do empresaId:", typeof empresaId)

    // TESTE: Adicionar listener SEM filtro para debug (remover depois)
    const testChannel = supabaseRef.current.channel(`test-mensagens-all`)
    testChannel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens"
        },
        (payload) => {
          console.log("[Realtime TEST] ====== QUALQUER MENSAGEM INSERIDA ======")
          console.log("[Realtime TEST] Payload:", payload)
          const msg = payload.new as any
          console.log("[Realtime TEST] id_empresa da mensagem:", msg.id_empresa)
          console.log("[Realtime TEST] empresaId esperado:", empresaId)
          console.log("[Realtime TEST] São iguais?", msg.id_empresa === empresaId)
        }
      )
      .subscribe((status, err) => {
        console.log("[Realtime TEST] Status da subscrição TEST:", status)
        if (err) {
          console.error("[Realtime TEST] Erro:", err)
        }
        if (status === "SUBSCRIBED") {
          console.log("[Realtime TEST] ✅ Listener de teste SUBSCRITO (sem filtro)")
        }
      })

    // Configurar listener para INSERTs na tabela mensagens COM filtro
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `id_empresa=eq.${empresaId}`
        },
        (payload) => {
          console.log("[Realtime] ====== NOVA MENSAGEM RECEBIDA VIA REALTIME ======")
          console.log("[Realtime] Payload completo:", JSON.stringify(payload, null, 2))
          const novaMensagem = payload.new as any
          
          console.log("[Realtime] Detalhes da mensagem:", {
            id: novaMensagem.id,
            id_contato: novaMensagem.id_contato,
            id_empresa: novaMensagem.id_empresa,
            direcao: novaMensagem.direcao,
            conteudo: novaMensagem.conteudo?.substring(0, 50),
            selectedConversationId,
            match: selectedConversationId === novaMensagem.id_contato
          })
          
          // SEMPRE atualizar lista de conversas quando uma nova mensagem chegar
          console.log("[Realtime] Atualizando lista de conversas...")
          loadConversations()
          
          // Se a mensagem é do contato selecionado, adicionar à lista de mensagens IMEDIATAMENTE
          if (selectedConversationId && novaMensagem.id_contato === selectedConversationId) {
            console.log("[Realtime] ✅ Mensagem é do contato selecionado, adicionando ao histórico")
            setMessages((prev) => {
              // Verificar se a mensagem já existe (evitar duplicatas)
              if (prev.some((m) => m.id === novaMensagem.id)) {
                console.log("[Realtime] Mensagem já existe, ignorando duplicata")
                return prev
              }
              console.log("[Realtime] Adicionando nova mensagem ao histórico (total anterior:", prev.length, ")")
              const novaLista = [...prev, {
                id: novaMensagem.id,
                conversationId: selectedConversationId,
                text: novaMensagem.conteudo,
                content: novaMensagem.conteudo,
                type: novaMensagem.tipo_midia || "text",
                sender: (novaMensagem.direcao === "saida" ? "user" : "contact") as "user" | "contact",
                status: (novaMensagem.status || "sent") as "sent" | "delivered" | "read",
                timestamp: novaMensagem.criado_em,
                mediaUrl: novaMensagem.url_midia,
              }]
              console.log("[Realtime] Nova lista de mensagens (total:", novaLista.length, ")")
              return novaLista
            })
            
            // Scroll para a última mensagem
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
          } else {
            console.log("[Realtime] ⚠️ Mensagem não é do contato selecionado ou nenhum contato selecionado")
            console.log("[Realtime] Comparação:", {
              id_contato_mensagem: novaMensagem.id_contato,
              selectedConversationId,
              match: novaMensagem.id_contato === selectedConversationId
            })
          }
        }
      )
      .subscribe((status, err) => {
        console.log("[Realtime] ====== STATUS DA SUBSCRIÇÃO ======")
        console.log("[Realtime] Status:", status)
        if (err) {
          console.error("[Realtime] ❌ Erro na subscrição:", err)
        }
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] ✅ SUBSCRITO COM SUCESSO ao canal:", channelName)
          console.log("[Realtime] ✅ Realtime está ATIVO e escutando mensagens da empresa:", empresaId)
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Realtime] ❌ ERRO ao subscrever ao canal:", channelName)
          console.error("[Realtime] Verifique se o Realtime está habilitado na tabela mensagens no Supabase Dashboard")
        } else if (status === "TIMED_OUT") {
          console.error("[Realtime] ❌ Timeout ao subscrever ao canal")
        } else if (status === "CLOSED") {
          console.warn("[Realtime] ⚠️ Canal fechado")
        }
      })

    // Log adicional para verificar se o canal foi criado
    console.log("[Realtime] Canal configurado, aguardando subscrição...")

    return () => {
      console.log("[Realtime] ====== LIMPANDO SUBSCRIÇÃO ======")
      console.log("[Realtime] Removendo canal:", channelName)
      if (supabaseRef.current) {
        supabaseRef.current.removeChannel(channel)
        supabaseRef.current.removeChannel(testChannel)
      }
    }
  }, [empresaId, selectedConversationId])

  const loadVoiceFunnels = () => {
    setVoiceFunnels(getVoiceFunnels())
  }

  const loadTemplates = () => {
    setTemplates(getTemplates().filter(t => t.status === "approved"))
  }

  // Audio Recording Functions
  const startRecording = async () => {
    console.log("[v0] startRecording called")
    try {
      console.log("[v0] Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("[v0] Microphone access granted, stream:", stream)
      
      // Check supported MIME types
      let mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg'
        } else {
          mimeType = '' // Let browser choose
        }
      }
      console.log("[v0] Using mimeType:", mimeType)
      
      const recorderOptions = mimeType ? { mimeType } : undefined
      const recorder = new MediaRecorder(stream, recorderOptions)
      const chunks: Blob[] = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        console.log("[v0] Recording stopped, creating blob with", chunks.length, "chunks")
        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        console.log("[v0] Audio blob created:", audioBlob.size, "bytes")
        handleSendAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      setAudioChunks(chunks)
      setMediaRecorder(recorder)
      console.log("[v0] Starting recorder...")
      recorder.start()
      console.log("[v0] Recorder started, state:", recorder.state)
      setIsRecording(true)
      console.log("[v0] isRecording set to true")
      setRecordingTime(0)
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique se o navegador tem permissao para usar o microfone",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setMediaRecorder(null)
    }
    setIsRecording(false)
    setRecordingTime(0)
    setAudioChunks([])
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const handleSendAudio = (audioBlob: Blob) => {
    if (!selectedConversationId) return
    
    // Create a data URL for the audio
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Audio = reader.result as string
      
      const newMsg = addMessage({
        conversationId: selectedConversationId,
        content: base64Audio,
        type: "audio",
        sender: "agent",
        status: "sent",
      })
      
      setMessages(prev => [...prev, newMsg])
      loadConversations()
      
      toast({
        title: "Audio enviado",
        description: `Audio de ${formatRecordingTime(recordingTime)} enviado`,
      })
    }
    reader.readAsDataURL(audioBlob)
    setRecordingTime(0)
  }

  // File Upload Functions
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] handleFileSelect called")
    console.log("[v0] Event target:", e.target)
    console.log("[v0] Files:", e.target.files)
    
    const file = e.target.files?.[0]
    if (!file) {
      console.log("[v0] No file selected")
      return
    }

    console.log("[v0] File selected:", file.name, file.type, file.size)
    
    const fileType = getFileType(file)
    console.log("[v0] Detected file type:", fileType)
    
    if (!fileType) {
      console.log("[v0] File type not supported:", file.type)
      toast({
        title: "Tipo de arquivo nao suportado",
        description: `Tipo ${file.type} nao e aceito. Selecione um arquivo nos formatos aceitos.`,
        variant: "destructive",
      })
      return
    }

    const maxSize = ACCEPTED_FILE_TYPES[fileType].maxSize
    if (file.size > maxSize) {
      console.log("[v0] File too large:", file.size, "max:", maxSize)
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho maximo para ${ACCEPTED_FILE_TYPES[fileType].description} e ${formatFileSize(maxSize)}`,
        variant: "destructive",
      })
      return
    }

    console.log("[v0] File accepted, setting state...")
    setSelectedFile(file)
    
    // Create preview for images
    if (fileType === 'image') {
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("[v0] Image preview created")
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
    
    console.log("[v0] Opening file upload dialog")
    setShowFileUpload(true)
    
    // Reset input value to allow selecting same file again
    e.target.value = ''
  }, [toast])

  const handleSendFile = useCallback(() => {
    console.log("[v0] handleSendFile called")
    console.log("[v0] selectedFile:", selectedFile?.name)
    console.log("[v0] selectedConversationId:", selectedConversationId)
    
    if (!selectedFile || !selectedConversationId) {
      console.log("[v0] Missing file or conversation")
      return
    }

    const fileType = getFileType(selectedFile)
    if (!fileType) {
      console.log("[v0] Invalid file type")
      return
    }

    console.log("[v0] Reading file as base64...")
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      console.log("[v0] Base64 created, length:", base64.length)
      
      const newMsg = addMessage({
        conversationId: selectedConversationId,
        content: base64,
        type: fileType,
        sender: "agent",
        status: "sent",
        caption: selectedFile.name,
      })
      
      console.log("[v0] Message added:", newMsg.id)
      setMessages(prev => [...prev, newMsg])
      loadConversations()
      
      toast({
        title: "Arquivo enviado",
        description: `${selectedFile.name} enviado com sucesso`,
      })
      
      // Reset
      setSelectedFile(null)
      setFilePreview(null)
      setShowFileUpload(false)
    }
    reader.onerror = (error) => {
      console.error("[v0] FileReader error:", error)
      toast({
        title: "Erro ao ler arquivo",
        description: "Nao foi possivel processar o arquivo",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(selectedFile)
  }, [selectedFile, selectedConversationId, toast])

  const cancelFileUpload = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setShowFileUpload(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStartNewConversation = () => {
    if (!newContactForm.name || !newContactForm.phone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o nome e telefone do contato",
        variant: "destructive",
      })
      return
    }

    // Format phone number
    const phone = newContactForm.phone.replace(/\D/g, "")
    if (phone.length < 10) {
      toast({
        title: "Telefone invalido",
        description: "Insira um telefone valido com DDD",
        variant: "destructive",
      })
      return
    }

    // Create new conversation
    const newConv = addConversation({
      contactName: newContactForm.name,
      contactPhone: phone,
      contactAvatar: newContactForm.name.charAt(0).toUpperCase(),
      lastMessage: "",
      timestamp: new Date().toISOString(),
      unreadCount: 0,
      status: "active",
    })

    // If template selected, send the template message
    if (newContactForm.templateId) {
      const template = templates.find(t => t.id === newContactForm.templateId)
      if (template) {
        // Send template via API
        const connection = connections[0]
        if (connection) {
          // Add initial message indicating template sent
          addMessage({
            conversationId: newConv.id,
            content: `[Template: ${template.name}]\n\n${template.content}`,
            type: "text",
            sender: "user" as const,
            status: "sent",
          })
          
          toast({
            title: "Conversa iniciada",
            description: `Template "${template.name}" enviado para ${newContactForm.name}`,
          })
        } else {
          toast({
            title: "Conversa criada",
            description: "Conecte um numero WhatsApp para enviar o template",
            variant: "destructive",
          })
        }
      }
    } else {
      toast({
        title: "Conversa criada",
        description: `Conversa com ${newContactForm.name} criada com sucesso`,
      })
    }

    // Select the new conversation
    setSelectedConversationId(newConv.id)
    loadConversations()
    loadMessages(newConv.id)
    setMobileView("chat")
    
    // Reset form
    setNewContactForm({ name: "", phone: "", templateId: "" })
    setShowNewConversation(false)
  }

  const handleSendFunnel = async (funnel: VoiceFunnel) => {
    if (!selectedConversationId || sendingFunnel) return
    
    setSendingFunnel(true)
    setShowVoiceFunnels(false)

    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i]
      
      // Simulate delay between messages
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Determine message type
      let messageType: "text" | "image" | "audio" | "video" | "document" = "text"
      if (step.type === "audio") messageType = "audio"
      else if (step.type === "image") messageType = "image"
      else if (step.type === "video") messageType = "video"
      else if (step.type === "document") messageType = "document"

      // Show typing/recording indicator
      if (step.type === "text") {
        setSimulateTyping(true)
        const typingTime = (step.typingDelay || 2) * 1000
        await new Promise(resolve => setTimeout(resolve, typingTime))
        setSimulateTyping(false)
      } else if (step.type === "audio") {
        setSimulateRecording(true)
        const recordingTime = (step.duration || 3) * 1000
        await new Promise(resolve => setTimeout(resolve, recordingTime))
        setSimulateRecording(false)
      } else {
        // For images/videos, show a brief typing indicator
        setSimulateTyping(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setSimulateTyping(false)
      }

      const newMsg = addMessage({
        conversationId: selectedConversationId,
        content: step.content,
        type: messageType,
        sender: "agent",
        status: "sent",
        caption: step.caption,
      })

      setMessages(prev => [...prev, newMsg])
    }

    setSendingFunnel(false)
    toast({
      title: "Funil enviado!",
      description: `${funnel.steps.length} mensagens enviadas com sucesso.`,
    })
  }

  const loadQuickReplies = () => {
    setQuickReplies(getQuickReplies())
    loadVoiceFunnels()
    loadTemplates()
  }

  const handleClearConversations = async () => {
    if (confirm("Tem certeza que deseja limpar todas as conversas? Esta acao nao pode ser desfeita.")) {
      try {
        // Limpar mensagens no banco de dados
        await fetch("/api/messages/clear", { method: "DELETE" })
        setConversations([])
        setMessages([])
        setSelectedConversationId(null)
      } catch (error) {
        console.error("Erro ao limpar conversas:", error)
      }
    }
  }

  // Buscar novas mensagens do webhook diretamente do Supabase
  const fetchWebhookMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      const data = await response.json()
      
      if (data.success && data.conversations && data.conversations.length > 0) {
        // Atualizar conversas com as do Supabase
        setConversations(data.conversations)
        
        // Recarregar mensagens se tiver uma conversa selecionada
        if (selectedConversationId) {
          loadMessages(selectedConversationId)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching webhook messages:", error)
    }
  }

  useEffect(() => {
    loadConversations()
    loadQuickReplies()
    fetchWebhookMessages()

    // Buscar novas mensagens do webhook a cada 3 segundos
    const interval = setInterval(() => {
      fetchWebhookMessages()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedConversationId) {
      console.log("[Chat] Contato selecionado, carregando mensagens:", selectedConversationId)
      loadMessages(selectedConversationId)
    } else {
      console.log("[Chat] Nenhum contato selecionado, limpando mensagens")
      setMessages([])
    }
  }, [selectedConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !selectedConversation) {
      console.warn("[Chat] ⚠️ Não é possível enviar mensagem:", {
        hasMessage: !!newMessage.trim(),
        hasConversation: !!selectedConversationId,
        hasSelectedConversation: !!selectedConversation
      })
      return
    }
    
    if (!selectedConnectionId) {
      console.error("[Chat] ❌ Nenhuma conexão selecionada")
      toast({
        title: "Erro",
        description: "Selecione uma conexão WhatsApp antes de enviar mensagens",
        variant: "destructive",
      })
      return
    }

    const messageText = newMessage
    setNewMessage("")

    // Enviar via nova API de chat
    try {
      console.log("[Chat] ====== Enviando mensagem ======")
      console.log("[Chat] Contato ID:", selectedConversationId)
      console.log("[Chat] Conexão ID:", selectedConnectionId)
      console.log("[Chat] Conteúdo:", messageText.substring(0, 50) + "...")
      
      const response = await authFetch("/api/chat/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Selected-Connection": selectedConnectionId
        },
        body: JSON.stringify({
          id_contato: selectedConversationId,
          conteudo: messageText,
          tipo_midia: "text",
          id_conexao: selectedConnectionId
        }),
      })
      
      console.log("[Chat] Status da resposta:", response.status, response.statusText)
      
      const result = await response.json()
      
      if (!result.success) {
        toast({
          title: "Erro ao enviar",
          description: result.error || "Falha ao enviar mensagem",
          variant: "destructive",
        })
      } else {
        // Adicionar mensagem localmente imediatamente (feedback visual)
        // A mensagem JÁ FOI SALVA no banco pela API, então vamos recarregar para ter certeza
        if (result.mensagem) {
          console.log("[Chat] ✅ Mensagem salva no banco, ID:", result.mensagem.id)
          const novaMsg = {
            id: result.mensagem.id,
            conversationId: selectedConversationId,
            text: result.mensagem.conteudo || messageText,
            content: result.mensagem.conteudo || messageText,
            type: result.mensagem.tipo_midia || "text",
            sender: "user" as const, // Mensagem enviada = user (atendente)
            status: result.mensagem.status || "sent",
            timestamp: result.mensagem.criado_em || new Date().toISOString(),
            mediaUrl: result.mensagem.url_midia || null,
          }
          
          setMessages((prev) => [...prev, novaMsg])
          console.log("[Chat] Mensagem adicionada localmente (salva no banco):", novaMsg)
        } else if (result.messageId) {
          // Se não veio mensagem completa mas tem messageId, recarregar do banco
          console.log("[Chat] Mensagem enviada com sucesso, recarregando do banco...")
          setTimeout(() => {
            loadMessages(selectedConversationId)
          }, 500)
        } else {
          console.warn("[Chat] ⚠️ Mensagem enviada mas não retornou dados completos")
        }
        
        // Recarregar conversas para atualizar última mensagem
        loadConversations()
        toast({
          title: "Mensagem enviada",
          description: "Mensagem entregue com sucesso!",
        })
      }
    } catch (error: any) {
      console.log("[Chat] Erro ao enviar mensagem:", error)
      toast({
        title: "Erro ao enviar",
        description: error.message || "Erro de conexao",
        variant: "destructive",
      })
    }
  }

  const handleSendQuickReply = async (reply: any) => {
    if (!selectedConversationId) return

    if (reply.type === "audio" && simulateRecording) {
      setIsRecording(true)
      await new Promise((resolve) => setTimeout(resolve, reply.audioDuration || 3000))
      setIsRecording(false)
    } else if (simulateTyping) {
      setIsTyping(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsTyping(false)
    }

    addMessage(
      {
        conversationId: selectedConversationId,
        text: reply.type === "audio" ? `🎤 Áudio (${reply.audioDuration}s)` : reply.content,
        timestamp: new Date().toISOString(),
        sender: "user",
        status: "sent",
      },
      selectedConversationId,
    )

    loadMessages(selectedConversationId)
    loadConversations()
    setShowQuickReplies(false)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#111b21]">
      <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <DashboardHeader />
        <PaymentPendingBanner />
        {BYPASS_PLAN_RESTRICTION ? (
          <main className="flex flex-1 overflow-hidden">
  {/* Conversations Sidebar - WhatsApp Style */}
  <div className={cn(
  "border-r border-[#2a3942] bg-[#111b21]",
            "w-full md:w-[400px]",
            mobileView === "chat" && "hidden md:block"
          )}>
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="bg-[#202c33] p-4">
                {/* Seletores: Conexão e Agente */}
                <div className="mb-3 grid grid-cols-2 gap-3">
                  {/* Seletor de Conexão */}
                  <div>
                    <Label htmlFor="connection-select" className="text-xs text-[#8696a0] mb-1 block">
                      Conexão WhatsApp
                    </Label>
                    <Select
                      value={selectedConnectionId || undefined}
                      onValueChange={(connId) => {
                        console.log("[Chat] ====== Conexão selecionada ======")
                        console.log("[Chat] Nova conexão ID:", connId)
                        setSelectedConnectionId(connId)
                        
                        // Salvar no localStorage para usar em outras requisições
                        if (connId) {
                          localStorage.setItem("scalazap_selected_connection", connId)
                          console.log("[Chat] Conexão salva no localStorage")
                          // Recarregar conversas quando mudar a conexão
                          loadConversations()
                        } else {
                          localStorage.removeItem("scalazap_selected_connection")
                          setConversations([])
                          setMessages([])
                        }
                      }}
                    >
                      <SelectTrigger 
                        id="connection-select"
                        className="w-full border-[#2a3942] bg-[#111b21] text-[#e9edef] hover:bg-[#202c33] focus:border-[#00a884] focus:ring-[#00a884]/20 [&_svg]:text-[#8696a0] [&_svg:hover]:text-[#e9edef]"
                      >
                        <SelectValue placeholder="Selecione uma conexão" />
                      </SelectTrigger>
                      <SelectContent className="border-[#2a3942] bg-[#202c33] text-[#e9edef]">
                        {connections.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-[#8696a0]">
                            Nenhuma conexão disponível
                          </div>
                        ) : (
                          connections.map((conn) => (
                            <SelectItem 
                              key={conn.id} 
                              value={conn.id}
                              className="text-[#e9edef] hover:bg-[#2a3942] focus:bg-[#2a3942]"
                            >
                              {conn.nome || conn.phone || conn.display_phone_number || `Conexão ${conn.id.substring(0, 8)}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Seletor de Agente */}
                  <div>
                    <Label htmlFor="profile-select" className="text-xs text-[#8696a0] mb-1 block">
                      Agente
                    </Label>
                    <Select
                      value={selectedProfileId || undefined}
                      onValueChange={(profileId) => {
                        console.log("[Chat] ====== Perfil selecionado ======")
                        console.log("[Chat] Novo perfil ID:", profileId)
                        setSelectedProfileId(profileId)
                        
                        // Salvar no localStorage
                        if (profileId) {
                          localStorage.setItem("scalazap_selected_profile", profileId)
                          console.log("[Chat] Perfil salvo no localStorage")
                          // Recarregar conversas quando mudar o perfil
                          loadConversations()
                        } else {
                          localStorage.removeItem("scalazap_selected_profile")
                          setConversations([])
                          setMessages([])
                        }
                      }}
                    >
                      <SelectTrigger 
                        id="profile-select"
                        className="w-full border-[#2a3942] bg-[#111b21] text-[#e9edef] hover:bg-[#202c33] focus:border-[#00a884] focus:ring-[#00a884]/20 [&_svg]:text-[#8696a0] [&_svg:hover]:text-[#e9edef]"
                      >
                        <SelectValue placeholder="Selecione um agente" />
                      </SelectTrigger>
                      <SelectContent className="border-[#2a3942] bg-[#202c33] text-[#e9edef]">
                        {profiles.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-[#8696a0]">
                            Nenhum perfil disponível
                          </div>
                        ) : (
                          profiles.map((profile) => (
                            <SelectItem 
                              key={profile.id} 
                              value={profile.id}
                              className="text-[#e9edef] hover:bg-[#2a3942] focus:bg-[#2a3942]"
                            >
                              {profile.nome_completo || profile.email || `Perfil ${profile.id.substring(0, 8)}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {connections.length === 0 && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Nenhuma conexão disponível. Configure uma conexão na página de Conexões.
                  </p>
                )}
                
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#e9edef]">Conversas</h2>
                  <div className="flex gap-2">
                    {/* New Conversation Button */}
                    <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-[#00a884] hover:bg-[#2a3942]" title="Nova conversa">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Nova Conversa
                          </DialogTitle>
                          <DialogDescription>
                            Adicione um contato e inicie uma conversa usando um template aprovado
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactName">Nome do Contato *</Label>
                            <Input
                              id="contactName"
                              placeholder="Ex: Joao Silva"
                              value={newContactForm.name}
                              onChange={(e) => setNewContactForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Telefone com DDD *</Label>
                            <Input
                              id="contactPhone"
                              placeholder="Ex: 11999999999"
                              value={newContactForm.phone}
                              onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">Apenas numeros, com DDD</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="template">Template (opcional)</Label>
                            <select
                              id="template"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={newContactForm.templateId}
                              onChange={(e) => setNewContactForm(prev => ({ ...prev, templateId: e.target.value }))}
                            >
                              <option value="">Iniciar sem template</option>
                              {templates.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.category})
                                </option>
                              ))}
                            </select>
                            {templates.length === 0 && (
                              <p className="text-xs text-yellow-500">
                                Nenhum template aprovado. Crie templates na aba Templates.
                              </p>
                            )}
                          </div>
                          {newContactForm.templateId && (
                            <div className="rounded-lg border bg-muted/50 p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Preview do Template</span>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {templates.find(t => t.id === newContactForm.templateId)?.content || ""}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowNewConversation(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleStartNewConversation} className="gap-2">
                            <Send className="h-4 w-4" />
                            {newContactForm.templateId ? "Enviar Template" : "Criar Conversa"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showAutomation} onOpenChange={setShowAutomation}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942]">
                          <Zap className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Automação e Funis</DialogTitle>
                          <DialogDescription>Configure funis automáticos e respostas inteligentes</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="rounded-lg border p-4">
                            <h3 className="mb-2 font-medium">Funil Automático</h3>
                            <p className="text-sm text-muted-foreground">
                              Em breve: Configure sequências automáticas de mensagens com delays e condições
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#8696a0] hover:bg-[#2a3942]"
                      onClick={() => setShowQuickReplies(!showQuickReplies)}
                      title="Respostas rapidas"
                    >
                      <Clock className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("hover:bg-[#2a3942]", showVoiceFunnels ? "text-[#00a884]" : "text-[#8696a0]")}
                      onClick={() => setShowVoiceFunnels(!showVoiceFunnels)}
                      title="ScalaVoice - Funis de audio"
                    >
                      <Zap className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#8696a0] hover:bg-[#2a3942]"
                      onClick={handleClearConversations}
                      title="Limpar todas as conversas"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8696a0]" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none bg-[#202c33] pl-9 text-[#e9edef] placeholder:text-[#8696a0]"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div>
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-[#8696a0]/50" />
                      <p className="mt-4 text-sm text-[#8696a0]">Nenhuma conversa encontrada</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => { setSelectedConversationId(conversation.id); setMobileView("chat"); }}
                        className={cn(
                          "w-full border-b border-[#2a3942] p-3 text-left transition-colors hover:bg-[#202c33]",
                          selectedConversationId === conversation.id && "bg-[#2a3942]",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            {conversation.contactPhoto && (
                              <AvatarImage 
                                src={conversation.contactPhoto} 
                                alt={conversation.contactName}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback className="bg-[#00a884] text-white">
                              {conversation.contactName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="truncate font-medium text-[#e9edef]">{conversation.contactName}</h4>
                              <span className="text-xs text-[#8696a0]">{conversation.lastMessageTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="truncate text-sm text-[#8696a0]">{conversation.lastMessage}</p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="ml-2 h-5 min-w-[20px] rounded-full bg-[#00a884] p-0 text-xs text-black">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Chat Area - WhatsApp Style */}
          <div className={cn(
            "flex flex-1 flex-col",
            mobileView === "list" && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-[#2a3942] bg-[#202c33] p-3 md:p-4">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 md:hidden text-[#8696a0] hover:bg-[#2a3942]"
                    onClick={() => setMobileView("list")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {selectedConversation.contactPhoto && (
                        <AvatarImage 
                          src={selectedConversation.contactPhoto} 
                          alt={selectedConversation.contactName}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-[#00a884] text-white">
                        {selectedConversation.contactName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-[#e9edef]">{selectedConversation.contactName}</h3>
                      <p className="text-sm text-[#8696a0]">{selectedConversation.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942]">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942]">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942]">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages - WhatsApp Style */}
                <div
                  className="flex-1 overflow-y-auto p-4"
                  style={{
                    backgroundImage: 'url("/whatsapp-bg.png")',
                    backgroundColor: "#0b141a",
                  }}
                >
                  <div className="space-y-2">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-12 w-12 text-[#8696a0]/50" />
                        <p className="mt-4 text-sm text-[#8696a0]">Nenhuma mensagem ainda. Envie a primeira!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isFromMe = message.sender === "me" || message.sender === "user"
                        return (
                        <div
                          key={message.id}
                          className={cn("flex", isFromMe ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[65%] rounded-lg px-3 py-2 shadow-md",
                              isFromMe ? "bg-[#005c4b]" : "bg-[#202c33]",
                            )}
                          >
                            <p className="text-sm text-[#e9edef]">{message.text}</p>
                            <div
                              className={cn(
                                "mt-1 flex items-center justify-end gap-1 text-xs",
                                isFromMe ? "text-[#8696a0]" : "text-[#8696a0]",
                              )}
                            >
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString("pt-BR", { timeStyle: "short" })}
                              </span>
                              {isFromMe && (
                                <>
                                  {message.status === "sent" && <Check className="h-3 w-3" />}
                                  {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                                  {message.status === "read" && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )})
                    )}

                    {(isTyping || isRecording || simulateTyping || simulateRecording) && (
                      <div className="flex justify-start">
                        <div className="rounded-lg bg-[#202c33] px-4 py-3 shadow-md">
                          <div className="flex items-center gap-2">
                            {(isRecording || simulateRecording) ? (
                              <>
                                <Mic className="h-4 w-4 animate-pulse text-red-500" />
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 [animation-delay:0.1s]" />
                                  <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 [animation-delay:0.2s]" />
                                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 [animation-delay:0.3s]" />
                                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 [animation-delay:0.4s]" />
                                </div>
                                <span className="text-sm text-[#8696a0]">gravando audio...</span>
                              </>
                            ) : (
                              <>
                                <div className="flex gap-1">
                                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#00a884] [animation-delay:-0.3s]" />
                                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#00a884] [animation-delay:-0.15s]" />
                                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#00a884]" />
                                </div>
                                <span className="text-sm text-[#8696a0]">digitando...</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input - WhatsApp Style */}
                <div className="border-t border-[#2a3942] bg-[#202c33] p-4">
                  {/* Voice Funnels Panel */}
                  {showVoiceFunnels && (
                    <div className="mb-3 rounded-lg border border-[#2a3942] bg-[#111b21] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[#00a884]" />
                          <h4 className="text-sm font-medium text-[#e9edef]">ScalaVoice</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-[#00a884] hover:text-[#00a884]"
                          onClick={() => window.location.href = "/dashboard/scalavoice"}
                        >
                          Gerenciar Funis
                        </Button>
                      </div>
                      {voiceFunnels.length === 0 ? (
                        <p className="text-xs text-[#8696a0] text-center py-4">
                          Nenhum funil criado. Crie funis de audio e midia para respostas rapidas.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {voiceFunnels.map((funnel) => (
                            <Button
                              key={funnel.id}
                              variant="outline"
                              size="sm"
                              className="justify-start gap-2 border-[#2a3942] bg-transparent text-[#e9edef] hover:bg-[#2a3942] text-xs h-auto py-2"
                              onClick={() => handleSendFunnel(funnel)}
                              disabled={sendingFunnel}
                            >
                              <div className="flex items-center gap-1">
                                {funnel.steps.slice(0, 4).map((step, i) => (
                                  <span key={i} className="text-[#00a884]">
                                    {step.type === "text" && <MessageSquare className="h-3 w-3" />}
                                    {step.type === "audio" && <Mic className="h-3 w-3" />}
                                    {step.type === "image" && <ImageIcon className="h-3 w-3" />}
                                    {step.type === "video" && <Video className="h-3 w-3" />}
                                  </span>
                                ))}
                              </div>
                              <span className="truncate">{funnel.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {showQuickReplies && (
                    <div className="mb-3 rounded-lg border border-[#2a3942] bg-[#111b21] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[#e9edef]">Respostas Rápidas</h4>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[#00a884] hover:text-[#00a884]"
                            >
                              + Criar Nova
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Nova Resposta Rápida</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Nome</Label>
                                <Input placeholder="Ex: Saudação" />
                              </div>
                              <div>
                                <Label>Tipo</Label>
                                <Tabs defaultValue="text">
                                  <TabsList className="w-full">
                                    <TabsTrigger value="text" className="flex-1">
                                      Texto
                                    </TabsTrigger>
                                    <TabsTrigger value="audio" className="flex-1">
                                      Áudio
                                    </TabsTrigger>
                                    <TabsTrigger value="image" className="flex-1">
                                      Imagem
                                    </TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="text">
                                    <Textarea placeholder="Digite a mensagem..." />
                                  </TabsContent>
                                  <TabsContent value="audio">
                                    <div className="space-y-2">
                                      <Button className="w-full">
                                        <Mic className="mr-2 h-4 w-4" />
                                        Gravar Áudio
                                      </Button>
                                      <Input type="number" placeholder="Duração (segundos)" />
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="image">
                                    <Button className="w-full">
                                      <ImageIcon className="mr-2 h-4 w-4" />
                                      Selecionar Imagem
                                    </Button>
                                  </TabsContent>
                                </Tabs>
                              </div>
                              <Button className="w-full">Salvar</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.length === 0 ? (
                          <p className="text-xs text-[#8696a0]">
                            Nenhuma resposta rápida. Clique em "Criar Nova" para adicionar.
                          </p>
                        ) : (
                          quickReplies.map((reply) => (
                            <Button
                              key={reply.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendQuickReply(reply)}
                              className="h-8 border-[#2a3942] bg-[#202c33] text-xs text-[#e9edef] hover:bg-[#2a3942]"
                            >
                              {reply.type === "audio" && <Mic className="mr-1 h-3 w-3" />}
                              {reply.type === "image" && <ImageIcon className="mr-1 h-3 w-3" />}
                              {reply.name}
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-2 flex gap-2">
                    <Button
                      variant={simulateTyping ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSimulateTyping(!simulateTyping)}
                      className="h-7 text-xs"
                    >
                      {simulateTyping ? "✓" : ""} Simular Digitando
                    </Button>
                    <Button
                      variant={simulateRecording ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSimulateRecording(!simulateRecording)}
                      className="h-7 text-xs"
                    >
                      {simulateRecording ? "✓" : ""} Simular Gravando
                    </Button>
                  </div>

                  {/* File Upload Dialog */}
                  <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Enviar Arquivo
                        </DialogTitle>
                        <DialogDescription>
                          Revise o arquivo antes de enviar
                        </DialogDescription>
                      </DialogHeader>
                      {selectedFile && (
                        <div className="space-y-4">
                          {filePreview ? (
                            <div className="relative rounded-lg overflow-hidden bg-muted">
                              <img src={filePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 w-full object-contain" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                              {getFileType(selectedFile) === 'video' && <Video className="h-10 w-10 text-blue-500" />}
                              {getFileType(selectedFile) === 'audio' && <Music className="h-10 w-10 text-purple-500" />}
                              {getFileType(selectedFile) === 'document' && <File className="h-10 w-10 text-orange-500" />}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{selectedFile.name}</p>
                                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={cancelFileUpload} className="flex-1 bg-transparent">
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button onClick={handleSendFile} className="flex-1">
                              <Send className="h-4 w-4 mr-2" />
                              Enviar
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAllAcceptedMimeTypes()}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Recording UI */}
                  {isRecording ? (
                    <div className="flex items-center gap-3 p-2 bg-[#202c33] rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-500 font-mono text-lg">{formatRecordingTime(recordingTime)}</span>
                        <div className="flex-1 flex items-center gap-1">
                          {[...Array(20)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-red-500/60 rounded-full animate-pulse"
                              style={{
                                height: `${Math.random() * 20 + 8}px`,
                                animationDelay: `${i * 50}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelRecording}
                        className="text-[#8696a0] hover:text-red-500 hover:bg-red-500/10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <StopCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942]">
                        <Smile className="h-5 w-5" />
                      </Button>
                      
                      {/* File Upload Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#2a3942]">
                            <Paperclip className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-72">
                          <div className="p-2 border-b">
                            <p className="text-sm font-medium mb-1">Enviar Arquivo</p>
                            <p className="text-xs text-muted-foreground">Selecione o tipo de arquivo</p>
                          </div>
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault()
                            console.log("[v0] Image option clicked")
                            console.log("[v0] fileInputRef.current:", fileInputRef.current)
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = ACCEPTED_FILE_TYPES.image.mimeTypes.join(',')
                              console.log("[v0] Setting accept to:", fileInputRef.current.accept)
                              fileInputRef.current.click()
                              console.log("[v0] File input clicked")
                            }
                          }} className="gap-3 py-3 cursor-pointer">
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium">Imagem</p>
                              <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (max 5MB)</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault()
                            console.log("[v0] Video option clicked")
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = ACCEPTED_FILE_TYPES.video.mimeTypes.join(',')
                              fileInputRef.current.click()
                            }
                          }} className="gap-3 py-3 cursor-pointer">
                            <Video className="h-5 w-5 text-purple-500" />
                            <div className="flex-1">
                              <p className="font-medium">Video</p>
                              <p className="text-xs text-muted-foreground">MP4, 3GP, MOV (max 16MB)</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault()
                            console.log("[v0] Audio option clicked")
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = ACCEPTED_FILE_TYPES.audio.mimeTypes.join(',')
                              fileInputRef.current.click()
                            }
                          }} className="gap-3 py-3 cursor-pointer">
                            <Music className="h-5 w-5 text-green-500" />
                            <div className="flex-1">
                              <p className="font-medium">Audio</p>
                              <p className="text-xs text-muted-foreground">MP3, OGG, M4A (max 16MB)</p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault()
                            console.log("[v0] Document option clicked")
                            if (fileInputRef.current) {
                              fileInputRef.current.accept = ACCEPTED_FILE_TYPES.document.mimeTypes.join(',')
                              fileInputRef.current.click()
                            }
                          }} className="gap-3 py-3 cursor-pointer">
                            <File className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                              <p className="font-medium">Documento</p>
                              <p className="text-xs text-muted-foreground">PDF, Word, Excel (max 100MB)</p>
                            </div>
                          </DropdownMenuItem>
                          <div className="p-2 border-t bg-muted/50">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-xs text-muted-foreground">
                                Formatos suportados pela API Oficial do WhatsApp
                              </p>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Input
                        placeholder="Digite uma mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="flex-1 border-none bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0]"
                      />
                      
                      {newMessage.trim() ? (
                        <Button
                          onClick={handleSendMessage}
                          className="bg-[#00a884] text-white hover:bg-[#00a884]/90"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            console.log("[v0] Mic button clicked")
                            startRecording()
                          }}
                          className="text-[#8696a0] hover:bg-[#2a3942] hover:text-[#00a884]"
                          title="Gravar audio"
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center bg-[#0b141a]">
                <MessageSquare className="h-16 w-16 text-[#8696a0]/50" />
                <h3 className="mt-4 text-lg font-medium text-[#e9edef]">Selecione uma conversa</h3>
                <p className="mt-2 text-sm text-[#8696a0]">Escolha uma conversa para começar a conversar</p>
              </div>
            )}
          </div>
        </main>
        ) : (
        <FeatureLock>
          <main className="flex flex-1 overflow-hidden">
            {/* Conteúdo do chat aqui - mantido para uso futuro */}
          </main>
        </FeatureLock>
        )}
      </div>
      <MobileNav />
      <WhatsAppSupportButton />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <ChatContent />
    </Suspense>
  )
}
