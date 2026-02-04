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

interface Perfil {
  id: string
  nome_completo: string
  email: string
  telefone?: string
  ativo: boolean
}

interface Membro {
  id: string
  id_empresa: string
  id_perfil: string
  cargo: string
  ativo: boolean
  criado_em: string
  ultimo_acesso?: string
  perfis?: Perfil // Dados do perfil associado
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
  const [isEditingMembro, setIsEditingMembro] = useState(false)
  const [editedMembroData, setEditedMembroData] = useState<{
    nome_completo: string
    email: string
    telefone: string
    cargo: string
    ativo: boolean
  }>({
    nome_completo: "",
    email: "",
    telefone: "",
    cargo: "membro",
    ativo: true
  })
  const [newEmpresa, setNewEmpresa] = useState({ nome: "", email: "", telefone: "", documento: "", plano_atual: "starter" })
  const [newMembro, setNewMembro] = useState({ nome: "", email: "", cargo: "membro", id_usuario: "" })
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, cancelled: 0, totalMembros: 0 })
  const { toast } = useToast()

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    console.log("[Empresas] 🔄 Iniciando carregamento de empresas...")
    setLoading(true)
    try {
      console.log("[Empresas] 📡 Fazendo requisição para /api/admin/empresas...")
      const response = await fetch("/api/admin/empresas")
      console.log("[Empresas] 📥 Resposta recebida:", response.status, response.statusText)
      
      const data = await response.json()
      console.log("[Empresas] 📦 Dados recebidos:", {
        success: data.success,
        total: data.total,
        empresasCount: data.empresas?.length || 0,
        empresas: data.empresas
      })
      
      if (data.success && data.empresas) {
        console.log("[Empresas] ✅ Dados válidos, processando...")
        console.log("[Empresas] 📊 Empresas recebidas:", data.empresas.length)
        data.empresas.forEach((emp: Empresa, index: number) => {
          console.log(`[Empresas]   ${index + 1}. ${emp.nome} (${emp.id}) - Status: ${emp.status_assinatura}, Plano: ${emp.plano_atual}, Membros: ${emp.total_membros || 0}`)
        })
        
        setEmpresas(data.empresas)
        console.log("[Empresas] ✅ Estado 'empresas' atualizado com", data.empresas.length, "empresas")
        
        // Calcular estatísticas
        const total = data.empresas.length
        const active = data.empresas.filter((e: Empresa) => e.status_assinatura === "active").length
        const pending = data.empresas.filter((e: Empresa) => e.status_assinatura === "pending").length
        const cancelled = data.empresas.filter((e: Empresa) => e.status_assinatura === "cancelled").length
        const totalMembros = data.empresas.reduce((acc: number, e: Empresa) => acc + (e.total_membros || 0), 0)
        
        console.log("[Empresas] 📈 Estatísticas calculadas:", { total, active, pending, cancelled, totalMembros })
        setStats({ total, active, pending, cancelled, totalMembros })
        console.log("[Empresas] ✅ Estado 'stats' atualizado")
      } else {
        console.error("[Empresas] ❌ Dados inválidos ou sem empresas:", data)
        setEmpresas([])
        setStats({ total: 0, active: 0, pending: 0, cancelled: 0, totalMembros: 0 })
      }
    } catch (error) {
      console.error("[Empresas] ❌ Erro ao carregar empresas:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar empresas",
        variant: "destructive"
      })
      setEmpresas([])
    } finally {
      setLoading(false)
      console.log("[Empresas] ✅ Carregamento finalizado, loading = false")
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
    setIsEditingMembro(false)
    // Inicializar dados para edição
    setEditedMembroData({
      nome_completo: membro.perfis?.nome_completo || "",
      email: membro.perfis?.email || "",
      telefone: membro.perfis?.telefone || "",
      cargo: membro.cargo || "membro",
      ativo: membro.ativo ?? true
    })
    setShowMembroDetailsDialog(true)
  }

  const handleSaveMembro = async () => {
    console.log("[Edit Membro] Iniciando salvamento...", { selectedMembro, editedMembroData })
    
    if (!selectedMembro) {
      console.error("[Edit Membro] Nenhum membro selecionado")
      toast({
        title: "Erro",
        description: "Nenhum membro selecionado para editar",
        variant: "destructive"
      })
      return
    }

    if (!editedMembroData.nome_completo || !editedMembroData.email) {
      console.error("[Edit Membro] Campos obrigatórios faltando")
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      })
      return
    }

    try {
      console.log("[Edit Membro] Enviando requisição de atualização...")
      
      const response = await fetch("/api/admin/empresas/membros", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMembro.id,
          id_perfil: selectedMembro.id_perfil,
          nome_completo: editedMembroData.nome_completo,
          email: editedMembroData.email,
          telefone: editedMembroData.telefone,
          cargo: editedMembroData.cargo,
          ativo: editedMembroData.ativo
        })
      })
      
      console.log("[Edit Membro] Resposta recebida:", response.status, response.statusText)
      
      const data = await response.json()
      console.log("[Edit Membro] Dados da resposta:", data)
      
      if (data.success) {
        toast({
          title: "Membro atualizado",
          description: `${editedMembroData.nome_completo} foi atualizado com sucesso`
        })
        setIsEditingMembro(false)
        setShowMembroDetailsDialog(false)
        
        if (selectedEmpresa) {
          await loadMembros(selectedEmpresa.id)
        }
        loadEmpresas() // Atualizar contador
      } else {
        console.error("[Edit Membro] Erro na resposta:", data.error)
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (error: any) {
      console.error("[Edit Membro] Erro capturado:", error)
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar membro",
        variant: "destructive"
      })
    }
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
    const result = matchesSearch && matchesPlano && matchesStatus
    return result
  })

  // Log de filtros
  useEffect(() => {
    console.log("[Empresas] 🔍 Filtros aplicados:", {
      search,
      filterPlano,
      filterStatus,
      totalEmpresas: empresas.length,
      filteredCount: filteredEmpresas.length
    })
    if (empresas.length > 0 && filteredEmpresas.length === 0) {
      console.warn("[Empresas] ⚠️ ATENÇÃO: Há empresas mas nenhuma passou no filtro!")
      console.log("[Empresas] 📋 Empresas originais:", empresas.map(e => ({
        nome: e.nome,
        plano: e.plano_atual,
        status: e.status_assinatura
      })))
    }
  }, [empresas, search, filterPlano, filterStatus, filteredEmpresas.length])

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

  // Log do estado antes de renderizar
  useEffect(() => {
    console.log("[Empresas] 🎯 Estado atual do componente:", {
      empresasCount: empresas.length,
      filteredCount: filteredEmpresas.length,
      loading,
      stats,
      search,
      filterPlano,
      filterStatus
    })
  })

  // Verificar elementos no DOM após renderização
  useEffect(() => {
    if (!loading && filteredEmpresas.length > 0) {
      setTimeout(() => {
        const empresaElements = document.querySelectorAll('[data-empresa-item]')
        console.log("[Empresas] 🔍 Elementos encontrados no DOM:", empresaElements.length)
        if (empresaElements.length === 0) {
          console.error("[Empresas] ❌ NENHUM ELEMENTO ENCONTRADO NO DOM!")
          console.log("[Empresas] 📋 Tentando encontrar elementos por classe...")
          const divs = document.querySelectorAll('.divide-y > div')
          console.log("[Empresas] 📋 Divs encontrados:", divs.length)
        } else {
          console.log("[Empresas] ✅ Elementos encontrados no DOM:", empresaElements.length)
          // Verificar estilos computados do primeiro elemento
          const firstElement = empresaElements[0] as HTMLElement
          if (firstElement) {
            const computedStyle = window.getComputedStyle(firstElement)
            console.log("[Empresas] 🔍 Estilos computados do primeiro elemento:", {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              opacity: computedStyle.opacity,
              height: computedStyle.height,
              width: computedStyle.width,
              backgroundColor: computedStyle.backgroundColor,
              color: computedStyle.color,
              position: computedStyle.position,
              zIndex: computedStyle.zIndex,
              overflow: computedStyle.overflow
            })
            // Verificar se o elemento está visível
            const rect = firstElement.getBoundingClientRect()
            console.log("[Empresas] 📐 Posição do primeiro elemento:", {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              visible: rect.width > 0 && rect.height > 0
            })
          }
        }
      }, 500)
    }
  }, [loading, filteredEmpresas.length])

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
      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{
          display: 'grid',
          gap: '24px',
          minHeight: '600px',
          height: 'auto',
          width: '100%'
        }}
      >
        {/* Coluna Esquerda - Lista de Empresas */}
        <Card 
          className="bg-card/50 border-border/50"
          style={{
            display: 'flex !important',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            border: '2px solid #333333',
            borderRadius: '12px',
            minHeight: '600px',
            height: 'auto',
            overflow: 'visible',
            visibility: 'visible !important',
            opacity: '1 !important',
            position: 'relative',
            zIndex: 1
          }}
        >
          <CardContent 
            className="p-0 h-full flex flex-col"
            style={{
              padding: 0,
              minHeight: '600px',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible'
            }}
          >
            <div 
              className="p-4 border-b"
              style={{
                padding: '16px',
                borderBottom: '1px solid hsl(var(--border))',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <h2 
                className="font-semibold text-lg"
                style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  color: 'hsl(var(--foreground))',
                  margin: 0
                }}
              >
                Empresas
              </h2>
              <p 
                className="text-sm text-muted-foreground"
                style={{
                  fontSize: '14px',
                  color: 'hsl(var(--muted-foreground))',
                  margin: 0
                }}
              >
                {filteredEmpresas.length} empresa{filteredEmpresas.length !== 1 ? "s" : ""} encontrada{filteredEmpresas.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div 
              className="flex-1 overflow-y-auto"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                overflowX: 'visible',
                minHeight: '400px',
                width: '100%',
                position: 'relative',
                zIndex: 1
              }}
            >
              {loading ? (
                <div 
                  className="flex items-center justify-center p-12"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px'
                  }}
                >
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredEmpresas.length === 0 ? (
                <div 
                  className="flex items-center justify-center p-12 text-muted-foreground"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px',
                    color: 'hsl(var(--muted-foreground))'
                  }}
                >
                  {(() => {
                    console.log("[Empresas] 🎨 Renderizando: Nenhuma empresa encontrada", {
                      loading,
                      empresasLength: empresas.length,
                      filteredLength: filteredEmpresas.length,
                      search,
                      filterPlano,
                      filterStatus
                    })
                    return "Nenhuma empresa encontrada"
                  })()}
                </div>
              ) : (
                <div 
                  className="divide-y"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    minHeight: '400px',
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: 'hsl(var(--card))'
                  }}
                >
                  {(() => {
                    console.log("[Empresas] 🎨 Renderizando lista de empresas:", {
                      total: filteredEmpresas.length,
                      empresas: filteredEmpresas.map(e => ({ id: e.id, nome: e.nome }))
                    })
                    return null
                  })()}
                  {filteredEmpresas.map((empresa, index) => {
                    const isSelected = selectedEmpresa?.id === empresa.id
                    console.log(`[Empresas] 🎨 Renderizando empresa ${index + 1}/${filteredEmpresas.length}:`, {
                      id: empresa.id,
                      nome: empresa.nome,
                      isSelected
                    })
                    return (
                      <div
                        key={empresa.id}
                        data-empresa-item={empresa.id}
                        onClick={() => {
                          console.log("[Empresas] 👆 Clique na empresa:", empresa.nome)
                          handleSelectEmpresa(empresa)
                        }}
                        className={`
                          p-4 cursor-pointer transition-colors hover:bg-muted/50
                          ${isSelected ? "bg-muted border-l-4 border-l-red-500" : ""}
                        `}
                        style={{
                          display: 'flex !important',
                          flexDirection: 'column',
                          padding: '16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid hsl(var(--border))',
                          backgroundColor: isSelected ? 'hsl(var(--muted))' : 'hsl(var(--card))',
                          borderLeft: isSelected ? '4px solid #ef4444' : 'none',
                          transition: 'background-color 0.2s',
                          minHeight: '100px',
                          width: '100%',
                          visibility: 'visible !important',
                          opacity: '1 !important',
                          position: 'relative',
                          zIndex: 10,
                          marginBottom: '0',
                          boxSizing: 'border-box'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'hsl(var(--muted) / 0.5)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <div 
                          className="flex items-start justify-between gap-4"
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '16px',
                            width: '100%'
                          }}
                        >
                          <div 
                            className="flex-1 min-w-0"
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div 
                              className="flex items-center gap-2 mb-2"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                              }}
                            >
                              <Building2 
                                className="h-4 w-4 text-muted-foreground shrink-0" 
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  color: 'hsl(var(--muted-foreground))',
                                  flexShrink: 0
                                }}
                              />
                              <h3 
                                className="font-semibold truncate"
                                style={{
                                  fontWeight: '600',
                                  fontSize: '16px',
                                  color: '#ffffff',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  margin: 0,
                                  padding: 0
                                }}
                              >
                                {empresa.nome}
                              </h3>
                            </div>
                            <p 
                              className="text-sm text-muted-foreground truncate"
                              style={{
                                fontSize: '14px',
                                color: '#cccccc',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                margin: 0,
                                padding: 0
                              }}
                            >
                              {empresa.email || "-"}
                            </p>
                            <div 
                              className="flex items-center gap-2 mt-2 flex-wrap"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '8px',
                                flexWrap: 'wrap'
                              }}
                            >
                              {getPlanoBadge(empresa.plano_atual)}
                              {getStatusBadge(empresa.status_assinatura)}
                              <div 
                                className="flex items-center gap-1 text-xs text-muted-foreground"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  color: '#aaaaaa',
                                  margin: 0,
                                  padding: 0
                                }}
                              >
                                <Users 
                                  className="h-3 w-3" 
                                  style={{ 
                                    width: '12px', 
                                    height: '12px',
                                    color: '#aaaaaa',
                                    display: 'block'
                                  }}
                                />
                                <span style={{ color: '#aaaaaa' }}>{empresa.total_membros || 0} membros</span>
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
        <Card 
          className="bg-card/50 border-border/50"
          style={{
            display: 'flex !important',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            border: '2px solid #333333',
            borderRadius: '12px',
            minHeight: '600px',
            height: 'auto',
            overflow: 'visible',
            visibility: 'visible !important',
            opacity: '1 !important',
            position: 'relative',
            zIndex: 1
          }}
        >
          <CardContent 
            className="p-0 h-full flex flex-col"
            style={{
              padding: 0,
              minHeight: '600px',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'visible'
            }}
          >
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
                            <h3 className="font-semibold">{membro.perfis?.nome_completo || "Nome não disponível"}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{membro.perfis?.email || "Email não disponível"}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getCargoBadge(membro.cargo)}
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

      {/* Membro Details/Edit Dialog */}
      <Dialog open={showMembroDetailsDialog} onOpenChange={(open) => {
        setShowMembroDetailsDialog(open)
        if (!open) setIsEditingMembro(false)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditingMembro ? "Editar Membro" : "Detalhes do Membro"}</DialogTitle>
            <DialogDescription>
              {isEditingMembro ? "Edite as informações do membro e clique em Salvar" : "Informações completas do membro"}
            </DialogDescription>
          </DialogHeader>
          {selectedMembro && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <Label>{isEditingMembro ? "Nome *" : "Nome"}</Label>
                  {isEditingMembro ? (
                    <Input
                      value={editedMembroData.nome_completo}
                      onChange={(e) => setEditedMembroData({ ...editedMembroData, nome_completo: e.target.value })}
                      placeholder="Nome completo"
                    />
                  ) : (
                    <p className="font-medium mt-2">{selectedMembro.perfis?.nome_completo || "Não informado"}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label>{isEditingMembro ? "Email *" : "Email"}</Label>
                  {isEditingMembro ? (
                    <Input
                      type="email"
                      value={editedMembroData.email}
                      onChange={(e) => setEditedMembroData({ ...editedMembroData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  ) : (
                    <p className="font-medium mt-2">{selectedMembro.perfis?.email || "Não informado"}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <Label>Telefone</Label>
                  {isEditingMembro ? (
                    <Input
                      value={editedMembroData.telefone}
                      onChange={(e) => setEditedMembroData({ ...editedMembroData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  ) : (
                    <p className="font-medium mt-2">{selectedMembro.perfis?.telefone || "Não informado"}</p>
                  )}
                </div>

                {/* Cargo */}
                <div>
                  <Label>Cargo</Label>
                  {isEditingMembro ? (
                    <Select
                      value={editedMembroData.cargo}
                      onValueChange={(value) => setEditedMembroData({ ...editedMembroData, cargo: value })}
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
                  ) : (
                    <div className="mt-2">
                      {getCargoBadge(selectedMembro.cargo)}
                    </div>
                  )}
                </div>

                {/* Status Membro */}
                <div>
                  <Label>Status</Label>
                  {isEditingMembro ? (
                    <Select
                      value={editedMembroData.ativo ? "true" : "false"}
                      onValueChange={(value) => setEditedMembroData({ ...editedMembroData, ativo: value === "true" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-2">
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
                  )}
                </div>

                {!isEditingMembro && (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Status Perfil</Label>
                      <div className="mt-2">
                        {selectedMembro.perfis?.ativo ? (
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
                      <Label className="text-muted-foreground">ID Perfil</Label>
                      <p className="font-mono text-sm break-all mt-2">{selectedMembro.id_perfil || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">ID Membro</Label>
                      <p className="font-mono text-sm break-all mt-2">{selectedMembro.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">ID Empresa</Label>
                      <p className="font-mono text-sm break-all mt-2">{selectedMembro.id_empresa}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Criado em</Label>
                      <p className="text-sm mt-2">{new Date(selectedMembro.criado_em).toLocaleString("pt-BR")}</p>
                    </div>
                    {selectedMembro.ultimo_acesso && (
                      <div>
                        <Label className="text-muted-foreground">Último Acesso</Label>
                        <p className="text-sm mt-2">{new Date(selectedMembro.ultimo_acesso).toLocaleString("pt-BR")}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between gap-2 pt-4 border-t">
                {isEditingMembro ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingMembro(false)
                        // Restaurar dados originais
                        setEditedMembroData({
                          nome_completo: selectedMembro.perfis?.nome_completo || "",
                          email: selectedMembro.perfis?.email || "",
                          telefone: selectedMembro.perfis?.telefone || "",
                          cargo: selectedMembro.cargo || "membro",
                          ativo: selectedMembro.ativo ?? true
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveMembro}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setShowMembroDetailsDialog(false)
                        handleDeleteMembro(selectedMembro.id)
                      }}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowMembroDetailsDialog(false)}
                      >
                        Fechar
                      </Button>
                      <Button 
                        onClick={() => setIsEditingMembro(true)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

