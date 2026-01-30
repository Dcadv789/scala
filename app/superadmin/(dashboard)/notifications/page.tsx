"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bell, Send, Users, Mail, MessageSquare, Plus, CheckCircle, Clock, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "all" | "active" | "pending" | "specific"
  channel: "email" | "whatsapp" | "both"
  status: "sent" | "scheduled" | "draft"
  sentAt?: string
  scheduledFor?: string
  recipients: number
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "Atualizacao do Sistema", message: "Nova versao disponivel com melhorias de performance.", type: "all", channel: "email", status: "sent", sentAt: "2024-01-20T10:00:00Z", recipients: 47 },
    { id: "2", title: "Lembrete de Pagamento", message: "Seu plano vence em 3 dias. Renove agora!", type: "pending", channel: "both", status: "scheduled", scheduledFor: "2024-01-22T09:00:00Z", recipients: 8 },
    { id: "3", title: "Novidades Janeiro", message: "Confira as novidades do mes de janeiro.", type: "all", channel: "email", status: "draft", recipients: 0 },
  ])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "all",
    channel: "email",
  })
  const { toast } = useToast()

  const handleSendNotification = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      status: "sent",
      sentAt: new Date().toISOString(),
      recipients: newNotification.type === "all" ? 47 : newNotification.type === "active" ? 33 : 8,
    }
    setNotifications([notification, ...notifications])
    setShowAddDialog(false)
    setNewNotification({ title: "", message: "", type: "all", channel: "email" })
    toast({ title: "Notificacao enviada", description: "A notificacao foi enviada com sucesso." })
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
    toast({ title: "Notificacao removida", description: "A notificacao foi removida." })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      sent: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Enviada", icon: CheckCircle },
      scheduled: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Agendada", icon: Clock },
      draft: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Rascunho", icon: Mail },
    }
    return configs[status] || configs.draft
  }

  const getTypeBadge = (type: string) => {
    const configs: Record<string, string> = {
      all: "Todos usuarios",
      active: "Usuarios ativos",
      pending: "Pagamentos pendentes",
      specific: "Usuarios especificos",
    }
    return configs[type] || type
  }

  const stats = {
    sent: notifications.filter(n => n.status === "sent").length,
    scheduled: notifications.filter(n => n.status === "scheduled").length,
    totalRecipients: notifications.filter(n => n.status === "sent").reduce((acc, n) => acc + n.recipients, 0),
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificacoes</h1>
          <p className="text-muted-foreground">Envie notificacoes para seus usuarios</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Notificacao
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enviar Notificacao</DialogTitle>
              <DialogDescription>Envie uma notificacao para seus usuarios.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input 
                  value={newNotification.title} 
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Titulo da notificacao"
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea 
                  value={newNotification.message} 
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Escreva sua mensagem..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destinatarios</Label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(v) => setNewNotification({ ...newNotification, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos usuarios</SelectItem>
                      <SelectItem value="active">Usuarios ativos</SelectItem>
                      <SelectItem value="pending">Pagamentos pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select 
                    value={newNotification.channel} 
                    onValueChange={(v) => setNewNotification({ ...newNotification, channel: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
              <Button onClick={handleSendNotification} className="gap-2">
                <Send className="h-4 w-4" />
                Enviar Agora
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.sent}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Agendadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRecipients}</p>
                <p className="text-sm text-muted-foreground">Total Destinatarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Notificacoes</CardTitle>
          <CardDescription>Todas as notificacoes enviadas e agendadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map((notification) => {
            const status = getStatusBadge(notification.status)
            return (
              <div key={notification.id} className="flex items-start gap-4 p-4 rounded-lg border">
                <div className={`p-2 rounded-lg ${status.color.split(" ")[0]}`}>
                  <status.icon className={`h-5 w-5 ${status.color.split(" ")[1]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={status.color}>
                      {status.label}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeBadge(notification.type)}
                    </Badge>
                    <Badge variant="outline">
                      {notification.channel === "email" ? "Email" : notification.channel === "whatsapp" ? "WhatsApp" : "Email + WhatsApp"}
                    </Badge>
                    {notification.status === "sent" && (
                      <span className="text-xs text-muted-foreground">
                        {notification.recipients} destinatarios - {new Date(notification.sentAt!).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    {notification.status === "scheduled" && (
                      <span className="text-xs text-muted-foreground">
                        Agendada para {new Date(notification.scheduledFor!).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
