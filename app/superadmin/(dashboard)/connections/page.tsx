"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Search, CheckCircle, XCircle, RefreshCw, Activity, Zap, MessageSquare, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Connection {
  id: string
  nome: string
  telefone: string | null
  numero_exibicao: string | null
  id_waba: string | null
  id_numero_telefone: string | null
  status: string
  nome_verificado: string | null
  tipo_conexao: string | null
  ultima_conexao_em: string | null
  criado_em: string
  empresas: {
    id: string
    nome: string
  } | null
}

interface Empresa {
  id: string
  nome: string
}

export default function ConnectionsAdminPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterEmpresa, setFilterEmpresa] = useState("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadConnections()
    loadEmpresas()
  }, [filterStatus, filterEmpresa])

  const loadEmpresas = async () => {
    try {
      const response = await fetch("/api/admin/connections")
      const data = await response.json()
      if (data.success && data.empresas) {
        setEmpresas(data.empresas)
      }
    } catch (error) {
      console.error("Error loading empresas:", error)
    }
  }

  const loadConnections = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.append("status", filterStatus)
      if (filterEmpresa !== "all") params.append("id_empresa", filterEmpresa)

      const response = await fetch(`/api/admin/connections?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.conexoes) {
        setConnections(data.conexoes)
      } else {
        throw new Error(data.error || "Erro ao carregar conexões")
      }
    } catch (error: any) {
      console.error("Error loading connections:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao carregar conexões",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = 
      conn.nome?.toLowerCase().includes(search.toLowerCase()) ||
      conn.telefone?.includes(search) ||
      conn.numero_exibicao?.includes(search) ||
      conn.empresas?.nome?.toLowerCase().includes(search.toLowerCase())

    return matchesSearch
  })

  const stats = {
    total: connections.length,
    connected: connections.filter(c => c.status === "connected" || c.status === "conectado").length,
    disconnected: connections.filter(c => c.status === "disconnected" || c.status === "desconectado").length,
    error: connections.filter(c => c.status === "error" || c.status === "erro").length,
    pending: connections.filter(c => c.status === "pending" || c.status === "pendente").length,
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ""
    const configs: Record<string, { color: string; label: string; icon: any }> = {
      connected: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Conectado", icon: CheckCircle },
      conectado: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Conectado", icon: CheckCircle },
      disconnected: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Desconectado", icon: XCircle },
      desconectado: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: "Desconectado", icon: XCircle },
      error: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Erro", icon: XCircle },
      erro: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Erro", icon: XCircle },
      pending: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "Pendente", icon: Activity },
      pendente: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "Pendente", icon: Activity },
    }
    return configs[statusLower] || configs.disconnected
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conexões</h1>
          <p className="text-muted-foreground">Gerencie todas as conexões WhatsApp do sistema</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 bg-transparent"
          onClick={loadConnections}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.connected}</p>
                <p className="text-sm text-muted-foreground">Conectados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <XCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.disconnected}</p>
                <p className="text-sm text-muted-foreground">Desconectados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.error}</p>
                <p className="text-sm text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, telefone ou empresa..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="connected">Conectado</SelectItem>
                  <SelectItem value="disconnected">Desconectado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Empresas</SelectItem>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conexões</CardTitle>
          <CardDescription>
            {filteredConnections.length} conexão(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma conexão encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>WABA ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Última Conexão</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConnections.map((conn) => {
                  const status = getStatusBadge(conn.status)
                  return (
                    <TableRow key={conn.id}>
                      <TableCell className="font-medium">{conn.nome || "N/A"}</TableCell>
                      <TableCell>
                        {conn.empresas ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{conn.empresas.nome}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {conn.numero_exibicao || conn.telefone || "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {conn.id_waba || conn.id_numero_telefone || "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${status.color}`}>
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {conn.tipo_conexao || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conn.ultima_conexao_em 
                          ? new Date(conn.ultima_conexao_em).toLocaleString("pt-BR")
                          : "Nunca"
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(conn.criado_em).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
