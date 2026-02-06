"use client"

import { useState, useEffect } from "react"
import { getMessageLogs, getConnections, clearMessageLogs } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Trash2, CheckCircle2, Clock, XCircle, Eye, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlanGuard } from "@/components/auth/plan-guard"

function MessagesPageContent() {
  const [logs, setLogs] = useState<any[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [connectionFilter, setConnectionFilter] = useState("all")

  const loadData = () => {
    const allLogs = getMessageLogs()
    const allConnections = getConnections()

    let filtered = allLogs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.recipient.includes(searchTerm) ||
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.connectionName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    if (connectionFilter !== "all") {
      filtered = filtered.filter((log) => log.connectionId === connectionFilter)
    }

    setLogs(filtered)
    setConnections(allConnections)
  }

  useEffect(() => {
    loadData()
    // Reload every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [searchTerm, statusFilter, connectionFilter])

  const handleClearLogs = () => {
    if (confirm("Tem certeza que deseja limpar todos os logs de mensagens?")) {
      clearMessageLogs()
      loadData()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case "read":
        return <Eye className="h-4 w-4 text-blue-600" />
      case "sending":
        return <Send className="h-4 w-4 text-yellow-500 animate-pulse" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      sent: "default",
      delivered: "secondary",
      read: "outline",
      sending: "secondary",
      failed: "destructive",
    }
    return (
      <Badge variant={variants[status] || "default"} className="gap-1">
        {getStatusIcon(status)}
        {status === "sending"
          ? "Enviando"
          : status === "sent"
            ? "Enviado"
            : status === "delivered"
              ? "Entregue"
              : status === "read"
                ? "Lido"
                : "Falhou"}
      </Badge>
    )
  }

  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.status === "sent").length,
    delivered: logs.filter((l) => l.status === "delivered").length,
    read: logs.filter((l) => l.status === "read").length,
    failed: logs.filter((l) => l.status === "failed").length,
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Mensagens</h1>
          <p className="text-muted-foreground">Acompanhe todas as mensagens enviadas em tempo real</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleClearLogs}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar Logs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Lidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os logs de mensagens por status, conexão ou busca</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, mensagem ou conexão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="sending">Enviando</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="read">Lido</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
          <Select value={connectionFilter} onValueChange={setConnectionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Conexão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Conexões</SelectItem>
              {connections.map((conn) => (
                <SelectItem key={conn.id} value={conn.id}>
                  {conn.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Mensagens</CardTitle>
          <CardDescription>Atualização automática a cada 5 segundos</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhuma mensagem encontrada. As mensagens aparecerão aqui assim que forem enviadas.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Conexão</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Campanha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{new Date(log.sentAt).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{log.connectionName}</TableCell>
                    <TableCell className="font-mono text-sm">{log.recipient}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{log.message}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.campaignId ? `#${log.campaignId.slice(0, 6)}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <PlanGuard>
      <MessagesPageContent />
    </PlanGuard>
  )
}
