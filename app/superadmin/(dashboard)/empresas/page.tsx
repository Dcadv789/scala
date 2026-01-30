"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Search, MoreHorizontal, Plus, Trash2, Edit, Eye, Users, Loader2, RefreshCw, ChevronDown, ChevronRight, CheckCircle } from "lucide-react"
import React from "react"
import { useToast } from "@/hooks/use-toast"

interface Empresa {
  id: string
  nome: string
  email?: string
  telefone?: string
  documento?: string
  plano_atual: string
  status_assinatura: string
  limite_conexoes: number
  limite_mensagens_mes: number
  limite_campanhas_mes: number
  limite_contatos: number
  criado_em: string
  membros?: Membro[]
  total_membros?: number
  membros_ativos?: number
}

interface Membro {
  id: string
  id_empresa: string
  nome: string
  email: string
  cargo: string
  eh_superadmin: boolean
  ativo: boolean
  criado_em: string
  ultimo_acesso?: string
  id_usuario?: string
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterPlano, setFilterPlano] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [membrosEmpresa, setMembrosEmpresa] = useState<Membro[]>([])
  const [loadingMembros, setLoadingMembros] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddMembroDialog, setShowAddMembroDialog] = useState(false)
  const [showMembroDetailsDialog, setShowMembroDetailsDialog] = useState(false)
  const [selectedMembro, setSelectedMembro] = useState<Membro | null>(null)
  const [newEmpresa, setNewEmpresa] = useState({ nome: "", email: "", telefone: "", documento: "", plano_atual: "starter" })
  const [newMembro, setNewMembro] = useState({ nome: "", email: "", cargo: "membro", id_usuario: "" })
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, cancelled: 0, totalMembros: 0 })
  const { toast } = useToast()

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/empresas")
      const data = await response.json()
      
      if (data.success && data.empresas) {
        setEmpresas(data.empresas)
        // Calcular estatísticas
        const total = data.empresas.length
        const active = data.empresas.filter((e: Empresa) => e.status_assinatura === "active").length
        const pending = data.empresas.filter((e: Empresa) => e.status_assinatura === "pending").length
        const cancelled = data.empresas.filter((e: Empresa) => e.status_assinatura === "cancelled").length
        const totalMembros = data.empresas.reduce((acc: number, e: Empresa) => acc + (e.total_membros || 0), 0)
        setStats({ total, active, pending, cancelled, totalMembros })
      }
    } catch (error) {
      console.error("Error loading empresas:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar empresas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEmpresa = async (empresa: Empresa) => {
    setSelectedEmpresa(empresa)
    await loadMembros(empresa.id)
  }

  const loadMembros = async (empresaId: string) => {
    setLoadingMembros(true)
    
    try {
      const response = await fetch(`/api/admin/empresas/membros?empresa_id=${empresaId}`)
      const data = await response.json()
      
      if (data.success) {
        setMembrosEmpresa(data.membros || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error loading membros:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar membros da empresa",
        variant: "destructive"
      })
      setMembrosEmpresa([])
    } finally {
      setLoadingMembros(false)
    }
  }

  const handleAddMembro = async () => {
    console.log("[Add Membro] Iniciando...", { selectedEmpresa, newMembro })
    
    if (!selectedEmpresa) {
      console.error("[Add Membro] Nenhuma empresa selecionada")
      toast({
        title: "Erro",
        description: "Selecione uma empresa primeiro",
        variant: "destructive"
      })
      return
    }

    if (!newMembro.nome || !newMembro.email) {
      console.error("[Add Membro] Campos obrigatórios faltando", { nome: newMembro.nome, email: newMembro.email })
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      })
      return
    }

    try {
      console.log("[Add Membro] Enviando requisição...", {
        id_empresa: selectedEmpresa.id,
        nome: newMembro.nome,
        email: newMembro.email,
        cargo: newMembro.cargo
      })

      const response = await fetch("/api/admin/empresas/membros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa: selectedEmpresa.id,
          nome: newMembro.nome,
          email: newMembro.email,
          cargo: newMembro.cargo,
          id_usuario: newMembro.id_usuario || null
        })
      })
      
      console.log("[Add Membro] Resposta recebida:", response.status, response.statusText)
      
      const data = await response.json()
      console.log("[Add Membro] Dados da resposta:", data)
      
      if (data.success) {
        toast({
          title: "Membro adicionado",
          description: `${newMembro.nome} foi adicionado à empresa com sucesso`
        })
        setShowAddMembroDialog(false)
        setNewMembro({ nome: "", email: "", cargo: "membro", id_usuario: "" })
        await loadMembros(selectedEmpresa.id)
        loadEmpresas() // Atualizar contador de membros
      } else {
        console.error("[Add Membro] Erro na resposta:", data.error)
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (error: any) {
      console.error("[Add Membro] Erro capturado:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar membro",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMembro = async (membroId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro da empresa?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/empresas/membros?id=${membroId}`, {
        method: "DELETE"
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Membro removido",
          description: "Membro removido da empresa com sucesso"
        })
        if (selectedEmpresa) {
          await loadMembros(selectedEmpresa.id)
          loadEmpresas() // Atualizar contador de membros
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover membro",
        variant: "destructive"
      })
    }
  }

  const handleViewMembroDetails = (membro: Membro) => {
    setSelectedMembro(membro)
    setShowMembroDetailsDialog(true)
  }

  const handleAddEmpresa = async () => {
    if (!newEmpresa.nome || !newEmpresa.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmpresa)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Empresa adicionada",
          description: `${newEmpresa.nome} foi adicionada com sucesso`
        })
        setShowAddDialog(false)
        setNewEmpresa({ nome: "", email: "", telefone: "", documento: "", plano_atual: "starter" })
        loadEmpresas()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar empresa",
        variant: "destructive"
      })
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/admin/empresas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status_assinatura: status })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Status atualizado",
          description: `Status alterado para ${status === "active" ? "Ativo" : status === "pending" ? "Pendente" : "Cancelado"}`
        })
        loadEmpresas()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa? Todos os dados associados serão removidos.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/empresas?id=${id}`, {
        method: "DELETE"
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Empresa excluída",
          description: "Empresa removida com sucesso"
        })
        loadEmpresas()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir empresa",
        variant: "destructive"
      })
    }
  }

  const handleEditEmpresa = async () => {
    if (!selectedEmpresa) return

    try {
      const response = await fetch("/api/admin/empresas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEmpresa.id,
          nome: selectedEmpresa.nome,
          email: selectedEmpresa.email,
          telefone: selectedEmpresa.telefone,
          documento: selectedEmpresa.documento,
          plano_atual: selectedEmpresa.plano_atual,
          status_assinatura: selectedEmpresa.status_assinatura
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Empresa atualizada",
          description: "Dados atualizados com sucesso"
        })
        setShowEditDialog(false)
        setSelectedEmpresa(null)
        loadEmpresas()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar empresa",
        variant: "destructive"
      })
    }
  }

  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = (empresa.nome || "").toLowerCase().includes(search.toLowerCase()) ||
                         (empresa.email || "").toLowerCase().includes(search.toLowerCase()) ||
                         (empresa.documento || "").toLowerCase().includes(search.toLowerCase())
    const matchesPlano = filterPlano === "all" || empresa.plano_atual === filterPlano
    const matchesStatus = filterStatus === "all" || empresa.status_assinatura === filterStatus
    return matchesSearch && matchesPlano && matchesStatus
  })

  const getPlanoBadge = (plano: string) => {
    const colors: Record<string, string> = {
      starter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      professional: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      unlimited: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    }
    const labels: Record<string, string> = {
      starter: "Starter",
      professional: "Professional",
      unlimited: "Ilimitado",
    }
    return <Badge variant="outline" className={colors[plano] || colors.starter}>{labels[plano] || plano}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
      suspended: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    }
    const labels: Record<string, string> = {
      active: "Ativo",
      pending: "Pendente",
      cancelled: "Cancelado",
      suspended: "Suspenso",
    }
    return <Badge variant="outline" className={colors[status] || colors.pending}>{labels[status] || status}</Badge>
  }

  const getCargoBadge = (cargo: string) => {
    const colors: Record<string, string> = {
      dono: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      admin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      membro: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      visualizador: "bg-green-500/20 text-green-400 border-green-500/30",
    }
    return <Badge variant="outline" className={colors[cargo] || colors.membro}>{cargo}</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gerencie todas as empresas e seus membros</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/20 p-3">
                <Building2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-500/20 p-3">
                <Building2 className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/20 p-3">
                <Building2 className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.cancelled}</p>
                <p className="text-sm text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-500/20 p-3">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalMembros}</p>
                <p className="text-sm text-muted-foreground">Total Membros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterPlano} onValueChange={setFilterPlano}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Planos</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="unlimited">Unlimited</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadEmpresas}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Layout de Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
        {/* Coluna Esquerda - Lista de Empresas */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Empresas</h2>
              <p className="text-sm text-muted-foreground">
                {filteredEmpresas.length} empresa{filteredEmpresas.length !== 1 ? "s" : ""} encontrada{filteredEmpresas.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredEmpresas.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground">
                  Nenhuma empresa encontrada
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEmpresas.map((empresa) => {
                    const isSelected = selectedEmpresa?.id === empresa.id
                    return (
                      <div
                        key={empresa.id}
                        onClick={() => handleSelectEmpresa(empresa)}
                        className={`
                          p-4 cursor-pointer transition-colors hover:bg-muted/50
                          ${isSelected ? "bg-muted border-l-4 border-l-red-500" : ""}
                        `}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                              <h3 className="font-semibold truncate">{empresa.nome}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{empresa.email || "-"}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {getPlanoBadge(empresa.plano_atual)}
                              {getStatusBadge(empresa.status_assinatura)}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{empresa.total_membros || 0} membros</span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedEmpresa(empresa)
                                setShowEditDialog(true)
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  const newStatus = empresa.status_assinatura === "active" ? "pending" : "active"
                                  handleUpdateStatus(empresa.id, newStatus)
                                }}
                              >
                                {empresa.status_assinatura === "active" ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Suspender
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteEmpresa(empresa.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coluna Direita - Membros da Empresa Selecionada */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  {selectedEmpresa ? `Membros - ${selectedEmpresa.nome}` : "Selecione uma Empresa"}
                </h2>
                {selectedEmpresa && (
                  <p className="text-sm text-muted-foreground">
                    {membrosEmpresa.length} membro{membrosEmpresa.length !== 1 ? "s" : ""} encontrado{membrosEmpresa.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {selectedEmpresa && (
                <Button 
                  onClick={() => setShowAddMembroDialog(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Membro
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {!selectedEmpresa ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground text-center">
                  <div>
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma empresa à esquerda para ver seus membros</p>
                  </div>
                </div>
              ) : loadingMembros ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : membrosEmpresa.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground">
                  Nenhum membro encontrado para esta empresa
                </div>
              ) : (
                <div className="divide-y">
                  {membrosEmpresa.map((membro) => (
                    <div
                      key={membro.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleViewMembroDetails(membro)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <h3 className="font-semibold">{membro.nome}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{membro.email}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getCargoBadge(membro.cargo)}
                            {membro.eh_superadmin && (
                              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                Superadmin
                              </Badge>
                            )}
                            {!membro.ativo && (
                              <Badge variant="outline" className="bg-gray-500/20 text-gray-400">
                                Inativo
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-xs text-muted-foreground">
                            {new Date(membro.criado_em).toLocaleDateString("pt-BR")}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewMembroDetails(membro)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMembro(membro.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados da empresa para criar uma nova conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={newEmpresa.nome}
                onChange={(e) => setNewEmpresa({ ...newEmpresa, nome: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newEmpresa.email}
                onChange={(e) => setNewEmpresa({ ...newEmpresa, email: e.target.value })}
                placeholder="email@empresa.com"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={newEmpresa.telefone}
                onChange={(e) => setNewEmpresa({ ...newEmpresa, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="documento">CNPJ/CPF</Label>
              <Input
                id="documento"
                value={newEmpresa.documento}
                onChange={(e) => setNewEmpresa({ ...newEmpresa, documento: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <Label htmlFor="plano">Plano</Label>
              <Select
                value={newEmpresa.plano_atual}
                onValueChange={(value) => setNewEmpresa({ ...newEmpresa, plano_atual: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEmpresa}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Atualize os dados da empresa
            </DialogDescription>
          </DialogHeader>
          {selectedEmpresa && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nome">Nome da Empresa</Label>
                <Input
                  id="edit-nome"
                  value={selectedEmpresa.nome}
                  onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, nome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedEmpresa.email || ""}
                  onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input
                  id="edit-telefone"
                  value={selectedEmpresa.telefone || ""}
                  onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, telefone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-documento">CNPJ/CPF</Label>
                <Input
                  id="edit-documento"
                  value={selectedEmpresa.documento || ""}
                  onChange={(e) => setSelectedEmpresa({ ...selectedEmpresa, documento: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-plano">Plano</Label>
                <Select
                  value={selectedEmpresa.plano_atual}
                  onValueChange={(value) => setSelectedEmpresa({ ...selectedEmpresa, plano_atual: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedEmpresa.status_assinatura}
                  onValueChange={(value) => setSelectedEmpresa({ ...selectedEmpresa, status_assinatura: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditEmpresa}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Membro Dialog */}
      <Dialog open={showAddMembroDialog} onOpenChange={setShowAddMembroDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro à Empresa</DialogTitle>
            <DialogDescription>
              Adicione um novo membro à empresa {selectedEmpresa?.nome}
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddMembro()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="membro-nome">Nome *</Label>
              <Input
                id="membro-nome"
                value={newMembro.nome}
                onChange={(e) => setNewMembro({ ...newMembro, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="membro-email">Email *</Label>
              <Input
                id="membro-email"
                type="email"
                value={newMembro.email}
                onChange={(e) => setNewMembro({ ...newMembro, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="membro-cargo">Cargo</Label>
              <Select
                value={newMembro.cargo}
                onValueChange={(value) => setNewMembro({ ...newMembro, cargo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dono">Dono</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="membro-id-usuario">ID Usuário (Opcional - Deixe vazio para criar automaticamente)</Label>
              <Input
                id="membro-id-usuario"
                value={newMembro.id_usuario}
                onChange={(e) => setNewMembro({ ...newMembro, id_usuario: e.target.value })}
                placeholder="UUID do usuário existente (ou deixe vazio para criar novo)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se deixar vazio, um novo usuário será criado automaticamente no Supabase Auth com senha temporária
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setShowAddMembroDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
              >
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Membro Details Dialog */}
      <Dialog open={showMembroDetailsDialog} onOpenChange={setShowMembroDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Membro</DialogTitle>
            <DialogDescription>
              Informações completas do membro
            </DialogDescription>
          </DialogHeader>
          {selectedMembro && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{selectedMembro.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedMembro.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cargo</Label>
                  <div className="mt-1">
                    {getCargoBadge(selectedMembro.cargo)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {selectedMembro.ativo ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/20 text-gray-400">
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Superadmin</Label>
                  <div className="mt-1">
                    {selectedMembro.eh_superadmin ? (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-500/20 text-gray-400">
                        Não
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Usuário</Label>
                  <p className="font-mono text-sm break-all">{selectedMembro.id_usuario || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Membro</Label>
                  <p className="font-mono text-sm break-all">{selectedMembro.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Empresa</Label>
                  <p className="font-mono text-sm break-all">{selectedMembro.id_empresa}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Criado em</Label>
                  <p className="text-sm">{new Date(selectedMembro.criado_em).toLocaleString("pt-BR")}</p>
                </div>
                {selectedMembro.ultimo_acesso && (
                  <div>
                    <Label className="text-muted-foreground">Último Acesso</Label>
                    <p className="text-sm">{new Date(selectedMembro.ultimo_acesso).toLocaleString("pt-BR")}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMembroDetailsDialog(false)}
                >
                  Fechar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowMembroDetailsDialog(false)
                    handleDeleteMembro(selectedMembro.id)
                  }}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover Membro
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

