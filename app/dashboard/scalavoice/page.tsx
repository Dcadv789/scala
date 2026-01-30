"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { PaymentPendingBanner } from "@/components/dashboard/payment-pending-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Mic,
  ImageIcon,
  Video,
  FileText,
  Play,
  Trash2,
  Edit,
  Clock,
  Volume2,
  Zap,
  Upload,
  MessageSquare,
  Check,
  Layers,
  Library,
  StopCircle,
  X,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getVoiceFunnels, 
  addVoiceFunnel, 
  removeVoiceFunnel, 
  getVoiceMediaLibrary,
  addVoiceMedia,
  updateVoiceMedia,
  removeVoiceMedia,
  type VoiceFunnel,
  type VoiceMediaItem,
} from "@/lib/store"

export default function ScalaVoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("biblioteca")
  const { toast } = useToast()

  // Media Library State
  const [mediaLibrary, setMediaLibrary] = useState<VoiceMediaItem[]>([])
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<VoiceMediaItem | null>(null)
  const [mediaType, setMediaType] = useState<"text" | "audio" | "image" | "video">("text")
  const [mediaName, setMediaName] = useState("")
  const [mediaContent, setMediaContent] = useState("")
  const [mediaCaption, setMediaCaption] = useState("")
  const [mediaDuration, setMediaDuration] = useState(3)
  const [mediaTypingDelay, setMediaTypingDelay] = useState(2)
  const [mediaCategory, setMediaCategory] = useState("geral")
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // File Upload State
  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(false)

  // Funnel State
  const [funnels, setFunnels] = useState<VoiceFunnel[]>([])
  const [funnelDialogOpen, setFunnelDialogOpen] = useState(false)
  const [funnelName, setFunnelName] = useState("")
  const [funnelCategory, setFunnelCategory] = useState("atendimento")
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setMediaLibrary(getVoiceMediaLibrary())
    setFunnels(getVoiceFunnels())
  }

  const resetMediaForm = () => {
    setMediaName("")
    setMediaContent("")
    setMediaCaption("")
    setMediaDuration(3)
    setMediaTypingDelay(2)
    setMediaCategory("geral")
    setMediaType("text")
    setEditingMedia(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setIsRecording(false)
    setRecordingTime(0)
  }

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Determine supported MIME type
      let mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg'
        } else {
          mimeType = ''
        }
      }
      
      const options = mimeType ? { mimeType } : undefined
      const recorder = new MediaRecorder(stream, options)
      audioChunksRef.current = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Convert to base64 and set as content
        const reader = new FileReader()
        reader.onloadend = () => {
          setMediaContent(reader.result as string)
        }
        reader.readAsDataURL(blob)
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique se o navegador tem permissao para usar o microfone",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
    setRecordingTime(0)
    setAudioBlob(null)
    setAudioUrl(null)
    audioChunksRef.current = []
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // File Upload Functions
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      toast({ title: "Erro", description: "Selecione um arquivo de audio valido", variant: "destructive" })
      return
    }

    if (file.size > 16 * 1024 * 1024) {
      toast({ title: "Erro", description: "Arquivo muito grande. Maximo 16MB", variant: "destructive" })
      return
    }

    setUploadProgress(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaContent(reader.result as string)
      setAudioUrl(URL.createObjectURL(file))
      setUploadProgress(false)
      toast({ title: "Audio carregado", description: file.name })
    }
    reader.onerror = () => {
      setUploadProgress(false)
      toast({ title: "Erro", description: "Falha ao carregar arquivo", variant: "destructive" })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: "Erro", description: "Selecione uma imagem valida", variant: "destructive" })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erro", description: "Imagem muito grande. Maximo 5MB", variant: "destructive" })
      return
    }

    setUploadProgress(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaContent(reader.result as string)
      setUploadProgress(false)
      toast({ title: "Imagem carregada", description: file.name })
    }
    reader.onerror = () => {
      setUploadProgress(false)
      toast({ title: "Erro", description: "Falha ao carregar imagem", variant: "destructive" })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast({ title: "Erro", description: "Selecione um video valido", variant: "destructive" })
      return
    }

    if (file.size > 16 * 1024 * 1024) {
      toast({ title: "Erro", description: "Video muito grande. Maximo 16MB", variant: "destructive" })
      return
    }

    setUploadProgress(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaContent(reader.result as string)
      setUploadProgress(false)
      toast({ title: "Video carregado", description: file.name })
    }
    reader.onerror = () => {
      setUploadProgress(false)
      toast({ title: "Erro", description: "Falha ao carregar video", variant: "destructive" })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSaveMedia = () => {
    if (!mediaName.trim() || !mediaContent.trim()) {
      toast({ title: "Erro", description: "Preencha nome e conteudo", variant: "destructive" })
      return
    }

    const mediaData = {
      name: mediaName,
      type: mediaType,
      content: mediaContent,
      caption: mediaType === "image" || mediaType === "video" ? mediaCaption : undefined,
      duration: mediaType === "audio" ? mediaDuration : undefined,
      typingDelay: mediaType === "text" ? mediaTypingDelay : undefined,
      category: mediaCategory,
    }

    if (editingMedia) {
      updateVoiceMedia(editingMedia.id, mediaData)
      toast({ title: "Mensagem atualizada!" })
    } else {
      addVoiceMedia(mediaData)
      toast({ title: "Mensagem adicionada!" })
    }

    setMediaDialogOpen(false)
    resetMediaForm()
    loadData()
  }

  const handleEditMedia = (media: VoiceMediaItem) => {
    setEditingMedia(media)
    setMediaName(media.name)
    setMediaType(media.type as "text" | "audio" | "image" | "video")
    setMediaContent(media.content)
    setMediaCaption(media.caption || "")
    setMediaDuration(media.duration || 3)
    setMediaTypingDelay(media.typingDelay || 2)
    setMediaCategory(media.category || "geral")
    setMediaDialogOpen(true)
  }

  const handleDeleteMedia = (mediaId: string) => {
    removeVoiceMedia(mediaId)
    toast({ title: "Mensagem removida!" })
    loadData()
  }

  const handleToggleMediaSelection = (mediaId: string) => {
    setSelectedMediaIds(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    )
  }

  const handleCreateFunnel = () => {
    if (!funnelName.trim()) {
      toast({ title: "Erro", description: "Digite um nome para o funil", variant: "destructive" })
      return
    }

    if (selectedMediaIds.length === 0) {
      toast({ title: "Erro", description: "Selecione ao menos uma mensagem", variant: "destructive" })
      return
    }

    // Convert selected media to funnel steps
    const steps = selectedMediaIds.map(id => {
      const media = mediaLibrary.find(m => m.id === id)
      if (!media) return null
      return {
        id: `${Date.now()}-${id}`,
        type: media.type,
        content: media.content,
        duration: media.duration,
        caption: media.caption,
        typingDelay: media.typingDelay,
      }
    }).filter(Boolean)

    addVoiceFunnel({
      name: funnelName,
      category: funnelCategory,
      steps: steps as any,
    })

    toast({ title: "Funil criado!", description: `${steps.length} mensagens adicionadas` })
    setFunnelDialogOpen(false)
    setFunnelName("")
    setSelectedMediaIds([])
    loadData()
  }

  const handleDeleteFunnel = (funnelId: string) => {
    removeVoiceFunnel(funnelId)
    toast({ title: "Funil removido!" })
    loadData()
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "text": return <MessageSquare className="h-4 w-4" />
      case "audio": return <Mic className="h-4 w-4" />
      case "image": return <ImageIcon className="h-4 w-4" />
      case "video": return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getMediaColor = (type: string) => {
    switch (type) {
      case "text": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "audio": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "image": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "video": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <DashboardHeader />
        <PaymentPendingBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold">ScalaVoice</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie mensagens e monte funis de envio rapido
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="biblioteca" className="gap-2">
                  <Library className="h-4 w-4" />
                  Biblioteca de Mensagens
                </TabsTrigger>
                <TabsTrigger value="funis" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Meus Funis
                </TabsTrigger>
              </TabsList>

              {/* BIBLIOTECA DE MENSAGENS */}
              <TabsContent value="biblioteca" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Adicione textos, audios, imagens e videos para usar nos funis
                  </p>
                  <Button onClick={() => { resetMediaForm(); setMediaDialogOpen(true) }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Mensagem
                  </Button>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-transparent"
                    onClick={() => { resetMediaForm(); setMediaType("text"); setMediaDialogOpen(true) }}
                  >
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    Texto
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-transparent"
                    onClick={() => { resetMediaForm(); setMediaType("audio"); setMediaDialogOpen(true) }}
                  >
                    <Mic className="h-4 w-4 text-green-400" />
                    Audio
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-transparent"
                    onClick={() => { resetMediaForm(); setMediaType("image"); setMediaDialogOpen(true) }}
                  >
                    <ImageIcon className="h-4 w-4 text-purple-400" />
                    Imagem
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-transparent"
                    onClick={() => { resetMediaForm(); setMediaType("video"); setMediaDialogOpen(true) }}
                  >
                    <Video className="h-4 w-4 text-red-400" />
                    Video
                  </Button>
                </div>

                {/* Media Grid */}
                {mediaLibrary.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Library className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium mb-1">Biblioteca vazia</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Adicione mensagens de texto, audio, imagem ou video para comecar a criar seus funis
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {mediaLibrary.map((media) => (
                      <Card key={media.id} className="group hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getMediaColor(media.type)}>
                                {getMediaIcon(media.type)}
                              </Badge>
                              <span className="font-medium text-sm truncate">{media.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleEditMedia(media)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteMedia(media.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {media.content}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {media.type === "audio" && media.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {media.duration}s
                              </span>
                            )}
                            {media.type === "text" && media.typingDelay && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {media.typingDelay}s digitando
                              </span>
                            )}
                            {media.category && (
                              <Badge variant="outline" className="text-[10px]">
                                {media.category}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* MEUS FUNIS */}
              <TabsContent value="funis" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Monte funis selecionando mensagens da biblioteca
                  </p>
                  <Button 
                    onClick={() => { setSelectedMediaIds([]); setFunnelName(""); setFunnelDialogOpen(true) }} 
                    className="gap-2"
                    disabled={mediaLibrary.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Criar Funil
                  </Button>
                </div>

                {mediaLibrary.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Library className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium mb-1">Adicione mensagens primeiro</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                        Va ate a aba "Biblioteca de Mensagens" e adicione textos, audios e imagens
                      </p>
                      <Button variant="outline" onClick={() => setActiveTab("biblioteca")}>
                        Ir para Biblioteca
                      </Button>
                    </CardContent>
                  </Card>
                ) : funnels.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium mb-1">Nenhum funil criado</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Crie funis para enviar sequencias de mensagens rapidamente no chat
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {funnels.map((funnel) => (
                      <Card key={funnel.id} className="group hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" />
                                {funnel.name}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {funnel.steps.length} mensagens
                              </CardDescription>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                              onClick={() => handleDeleteFunnel(funnel.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1.5">
                            {funnel.steps.map((step, i) => (
                              <Badge key={i} variant="outline" className={`${getMediaColor(step.type)} gap-1 text-[10px]`}>
                                {getMediaIcon(step.type)}
                                {i + 1}
                              </Badge>
                            ))}
                          </div>
                          <Badge variant="outline" className="mt-3 text-[10px]">
                            {funnel.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <MobileNav />
      <WhatsAppSupportButton />

      {/* Dialog Adicionar/Editar Mensagem */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMedia ? "Editar" : "Nova"} Mensagem</DialogTitle>
            <DialogDescription>
              {editingMedia ? "Atualize os dados da mensagem" : "Adicione uma nova mensagem a biblioteca"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: "text", icon: MessageSquare, label: "Texto", color: "text-blue-400" },
                { type: "audio", icon: Mic, label: "Audio", color: "text-green-400" },
                { type: "image", icon: ImageIcon, label: "Imagem", color: "text-purple-400" },
                { type: "video", icon: Video, label: "Video", color: "text-red-400" },
              ].map((item) => (
                <Button
                  key={item.type}
                  type="button"
                  variant={mediaType === item.type ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setMediaType(item.type as any)}
                >
                  <item.icon className={`h-4 w-4 ${mediaType !== item.type ? item.color : ""}`} />
                  <span className="text-[10px]">{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome da mensagem</Label>
              <Input 
                placeholder="Ex: Boas-vindas inicial"
                value={mediaName}
                onChange={(e) => setMediaName(e.target.value)}
              />
            </div>

            {/* Conteudo */}
            <div className="space-y-2">
              <Label>
                {mediaType === "text" && "Texto da mensagem"}
                {mediaType === "audio" && "Descricao do audio (ou texto para TTS)"}
                {mediaType === "image" && "URL da imagem"}
                {mediaType === "video" && "URL do video"}
              </Label>
              {mediaType === "text" ? (
                <Textarea 
                  placeholder="Digite a mensagem..."
                  value={mediaContent}
                  onChange={(e) => setMediaContent(e.target.value)}
                  rows={3}
                />
              ) : mediaType === "audio" ? (
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Descricao do audio (opcional)..."
                    value={mediaContent.startsWith('data:') ? 'Audio gravado/carregado' : mediaContent}
                    onChange={(e) => !mediaContent.startsWith('data:') && setMediaContent(e.target.value)}
                    rows={2}
                    disabled={mediaContent.startsWith('data:')}
                  />
                  
                  {/* Hidden file input */}
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  
                  {/* Recording UI */}
                  {isRecording ? (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-500 font-mono">{formatTime(recordingTime)}</span>
                      <div className="flex-1 flex items-center gap-1">
                        {[...Array(15)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-500/60 rounded-full animate-pulse"
                            style={{ height: `${Math.random() * 16 + 8}px`, animationDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" onClick={cancelRecording} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white gap-2">
                        <StopCircle className="h-4 w-4" />
                        Parar
                      </Button>
                    </div>
                  ) : audioUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <Play className="h-5 w-5 text-green-500" />
                        <audio src={audioUrl} controls className="flex-1 h-8" />
                        <Button variant="ghost" size="icon" onClick={() => { setAudioUrl(null); setAudioBlob(null); setMediaContent("") }} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 bg-transparent"
                        onClick={startRecording}
                      >
                        <Mic className="h-4 w-4" />
                        Gravar Audio
                      </Button>
                      <span className="text-xs text-muted-foreground">ou</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 bg-transparent"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={uploadProgress}
                      >
                        {uploadProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Formatos aceitos: MP3, OGG, M4A, WAV (max 16MB)</p>
                </div>
              ) : mediaType === "image" ? (
                <div className="space-y-3">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {mediaContent ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={mediaContent || "/placeholder.svg"} 
                          alt="Preview" 
                          className="max-h-48 w-full object-contain"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setMediaContent("")} 
                          className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {uploadProgress ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Clique para selecionar uma imagem</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (max 5MB)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/3gpp,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  
                  {mediaContent ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden bg-muted">
                        <video 
                          src={mediaContent} 
                          controls
                          className="max-h-48 w-full"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setMediaContent("")} 
                          className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      {uploadProgress ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Video className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Clique para selecionar um video</p>
                          <p className="text-xs text-muted-foreground">MP4, 3GP, MOV (max 16MB)</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption para imagem/video */}
            {(mediaType === "image" || mediaType === "video") && (
              <div className="space-y-2">
                <Label>Legenda (opcional)</Label>
                <Input 
                  placeholder="Legenda da midia..."
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                />
              </div>
            )}

            {/* Duracao para audio */}
            {mediaType === "audio" && (
              <div className="space-y-2">
                <Label>Duracao do audio (segundos)</Label>
                <Input 
                  type="number"
                  min={1}
                  max={60}
                  value={mediaDuration}
                  onChange={(e) => setMediaDuration(parseInt(e.target.value) || 3)}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo que ira aparecer "gravando audio..." antes de enviar
                </p>
              </div>
            )}

            {/* Typing delay para texto */}
            {mediaType === "text" && (
              <div className="space-y-2">
                <Label>Tempo digitando (segundos)</Label>
                <Input 
                  type="number"
                  min={1}
                  max={10}
                  value={mediaTypingDelay}
                  onChange={(e) => setMediaTypingDelay(parseInt(e.target.value) || 2)}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo que ira aparecer "digitando..." antes de enviar
                </p>
              </div>
            )}

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={mediaCategory} onValueChange={setMediaCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setMediaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMedia}>
                {editingMedia ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Criar Funil */}
      <Dialog open={funnelDialogOpen} onOpenChange={setFunnelDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Funil</DialogTitle>
            <DialogDescription>
              Selecione as mensagens que deseja incluir no funil (na ordem de envio)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nome do Funil */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Funil</Label>
                <Input 
                  placeholder="Ex: Funil de Boas-vindas"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={funnelCategory} onValueChange={setFunnelCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selecao de Mensagens */}
            <div className="space-y-2">
              <Label>Selecione as mensagens (clique para selecionar)</Label>
              <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                {mediaLibrary.map((media) => {
                  const isSelected = selectedMediaIds.includes(media.id)
                  const order = selectedMediaIds.indexOf(media.id) + 1

                  return (
                    <div
                      key={media.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-primary/10 border border-primary" 
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => handleToggleMediaSelection(media.id)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-background border"
                      }`}>
                        {isSelected ? order : <Check className="h-3 w-3 opacity-0" />}
                      </div>

                      <Badge className={getMediaColor(media.type)}>
                        {getMediaIcon(media.type)}
                      </Badge>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{media.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{media.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedMediaIds.length} mensagem(ns) selecionada(s)
              </p>
            </div>

            {/* Preview da ordem */}
            {selectedMediaIds.length > 0 && (
              <div className="space-y-2">
                <Label>Ordem de envio:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMediaIds.map((id, i) => {
                    const media = mediaLibrary.find(m => m.id === id)
                    if (!media) return null
                    return (
                      <Badge key={id} variant="outline" className="gap-1">
                        <span className="font-bold">{i + 1}.</span>
                        {getMediaIcon(media.type)}
                        {media.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFunnelDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFunnel} disabled={selectedMediaIds.length === 0}>
                <Zap className="h-4 w-4 mr-2" />
                Criar Funil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
