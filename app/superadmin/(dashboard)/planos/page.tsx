"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, RefreshCw, Search, Trash2, Edit } from "lucide-react"

type Plano = {
  id: string
  nome: string
  slug: string
  descricao: string | null
  valor_padrao: string | number | null
  preco_anual: string | number | null
  limite_conexoes: number | null
  max_contatos: number | null
  limite_campanhas: number | null
  limite_mensagens: number | null
  funcionalidades: any
  ativo: boolean | null
  criado_em: string | null
  atualizado_em: string | null
  id_checkout: string | null
  valor_primeira_mensalidade: string | number | null
  preco_anual_com_desconto: string | number | null
  limite_funcionarios: number | null
  api_oficial: boolean | null
  chat_ao_vivo: string | null
  templates: string | null
  app_mobile: boolean | null
  app_desktop: boolean | null
  suporte: string | null
  gerente_conta_dedicado: boolean | null
  sla_garantido: boolean | null
  treinamento_incluido: boolean | null
}

const emptyPlano = (): Partial<Plano> => ({
  nome: "",
  slug: "",
  descricao: "",
  valor_padrao: 0,
  preco_anual: 0,
  limite_conexoes: 1,
  max_contatos: 500,
  limite_campanhas: 5,
  limite_mensagens: 1000,
  funcionalidades: [],
  ativo: true,
  id_checkout: "",
  valor_primeira_mensalidade: 0,
  preco_anual_com_desconto: 0,
  limite_funcionarios: 1,
  api_oficial: false,
  chat_ao_vivo: "simplificado",
  templates: "basicos",
  app_mobile: false,
  app_desktop: false,
  suporte: "email",
  gerente_conta_dedicado: false,
  sla_garantido: false,
  treinamento_incluido: false,
})

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PlanosPage() {
  const { toast } = useToast()
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<any>(emptyPlano())
  const [originalId, setOriginalId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return planos
    return planos.filter((p) => (p.nome || "").toLowerCase().includes(s) || (p.slug || "").toLowerCase().includes(s))
  }, [planos, search])

  const loadPlanos = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/planos")
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Falha ao carregar planos")
      setPlanos(data.planos || [])
    } catch (e: any) {
      console.error("Error loading planos:", e)
      toast({ title: "Erro", description: e.message || "Falha ao carregar planos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlanos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setIsEdit(false)
    setOriginalId(null)
    setCurrent(emptyPlano())
    setShowDialog(true)
  }

  const openEdit = (p: Plano) => {
    setIsEdit(true)
    setOriginalId(p.id)
    setCurrent({
      ...p,
      funcionalidades: p.funcionalidades ?? [],
    })
    setShowDialog(true)
  }

  const parseFuncionalidades = () => {
    const raw = current.funcionalidades
    if (raw === null || raw === undefined) return null
    if (typeof raw === "object") return raw
    if (String(raw).trim() === "") return null
    try {
      return JSON.parse(String(raw))
    } catch {
      return undefined // inválido
    }
  }

  const handleSave = async () => {
    if (!current.nome?.trim() || !current.slug?.trim()) {
      toast({ title: "Campos obrigatórios", description: "nome e slug são obrigatórios", variant: "destructive" })
      return
    }

    const funcionalidadesParsed = parseFuncionalidades()
    if (funcionalidadesParsed === undefined) {
      toast({ title: "JSON inválido", description: "funcionalidades precisa ser um JSON válido", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        ...current,
        funcionalidades: funcionalidadesParsed,
      }

      const method = isEdit ? "PUT" : "POST"
      if (isEdit) payload.id = originalId

      const res = await fetch("/api/admin/planos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Falha ao salvar plano")

      toast({ title: "Sucesso", description: isEdit ? "Plano atualizado" : "Plano criado" })
      setShowDialog(false)
      await loadPlanos()
    } catch (e: any) {
      console.error("Error saving plano:", e)
      toast({ title: "Erro", description: e.message || "Falha ao salvar plano", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este plano?")) return
    try {
      const res = await fetch(`/api/admin/planos?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Falha ao deletar plano")
      toast({ title: "Removido", description: "Plano deletado com sucesso" })
      await loadPlanos()
    } catch (e: any) {
      console.error("Error deleting plano:", e)
      toast({ title: "Erro", description: e.message || "Falha ao deletar plano", variant: "destructive" })
    }
  }

  const FieldRow = ({
    label,
    description,
    children,
  }: {
    label: string
    description?: string
    children: React.ReactNode
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
      <div className="md:col-span-5 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0">
          <Label className="text-sm whitespace-nowrap">{label}</Label>
          {description ? (
            <span className="text-xs text-muted-foreground truncate">
              {description}
            </span>
          ) : null}
        </div>
      </div>
      <div className="md:col-span-7 min-w-0">{children}</div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os planos e edite todos os campos do banco</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadPlanos} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button className="bg-red-500 hover:bg-red-600" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Novo Plano</span>
          </Button>
        </div>
      </div>

      <Card className="border-red-500/20 bg-card/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Badge variant="secondary" className="ml-auto">
              {filtered.length} plano(s)
            </Badge>
          </div>

          <div className="rounded-md border border-red-500/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Valor (mês)</TableHead>
                  <TableHead>Conexões</TableHead>
                  <TableHead>Mensagens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Nenhum plano encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                      <TableCell>
                        <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Sim" : "Não"}</Badge>
                      </TableCell>
                      <TableCell>{p.valor_padrao ?? "-"}</TableCell>
                      <TableCell>{p.limite_conexoes ?? "-"}</TableCell>
                      <TableCell>{p.limite_mensagens ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {/* Importante: o DialogContent padrão tem `sm:max-w-lg` em `components/ui/dialog.tsx`.
            Então precisamos sobrescrever com `sm:max-w-[...]` aqui para o modal realmente ficar largo. */}
        <DialogContent className="w-[1100px] max-w-[96vw] sm:max-w-[1100px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Plano" : "Criar Plano"}</DialogTitle>
            <DialogDescription>Você pode editar todos os campos do banco (incluindo JSON e timestamps)</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {isEdit ? (
              <FieldRow label="ID" description="ID do plano (não pode ser alterado)">
                <Input value={originalId || ""} disabled />
              </FieldRow>
            ) : (
              <FieldRow label="ID (opcional)" description="Se vazio, o banco gera automaticamente (UUID)">
                <Input
                  value={current.id ?? ""}
                  onChange={(e) => setCurrent({ ...current, id: e.target.value })}
                  placeholder="UUID (opcional)"
                />
              </FieldRow>
            )}

            <FieldRow label="Nome *">
              <Input value={current.nome ?? ""} onChange={(e) => setCurrent({ ...current, nome: e.target.value })} />
            </FieldRow>

            <FieldRow label="Slug *">
              <Input value={current.slug ?? ""} onChange={(e) => setCurrent({ ...current, slug: e.target.value })} />
            </FieldRow>

            <FieldRow label="Descrição">
              <Textarea
                value={current.descricao ?? ""}
                onChange={(e) => setCurrent({ ...current, descricao: e.target.value })}
                rows={3}
              />
            </FieldRow>

            <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm">
              <div className="font-medium text-foreground">Instruções</div>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                <li>
                  Para campos de <strong>limite</strong> (conexões, contatos, campanhas, mensagens, funcionários),
                  use <strong>-1</strong> para <strong>ilimitado</strong>.
                </li>
                <li>
                  Deixe vazio para usar o <strong>valor padrão</strong> configurado no banco (quando aplicável).
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FieldRow label="Valor padrão (mensal)" description="numeric">
                  <Input
                    type="number"
                    step="0.01"
                    value={current.valor_padrao ?? ""}
                    onChange={(e) => setCurrent({ ...current, valor_padrao: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Preço anual" description="numeric">
                  <Input
                    type="number"
                    step="0.01"
                    value={current.preco_anual ?? ""}
                    onChange={(e) => setCurrent({ ...current, preco_anual: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Preço anual com desconto" description="numeric">
                  <Input
                    type="number"
                    step="0.01"
                    value={current.preco_anual_com_desconto ?? ""}
                    onChange={(e) => setCurrent({ ...current, preco_anual_com_desconto: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Valor 1ª mensalidade" description="numeric">
                  <Input
                    type="number"
                    step="0.01"
                    value={current.valor_primeira_mensalidade ?? ""}
                    onChange={(e) => setCurrent({ ...current, valor_primeira_mensalidade: e.target.value })}
                  />
                </FieldRow>
              </div>

              <div className="space-y-4">
                <FieldRow label="Limite conexões" description="integer">
                  <Input
                    type="number"
                    value={current.limite_conexoes ?? ""}
                    onChange={(e) => setCurrent({ ...current, limite_conexoes: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Máx contatos" description="integer">
                  <Input
                    type="number"
                    value={current.max_contatos ?? ""}
                    onChange={(e) => setCurrent({ ...current, max_contatos: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Limite campanhas" description="integer">
                  <Input
                    type="number"
                    value={current.limite_campanhas ?? ""}
                    onChange={(e) => setCurrent({ ...current, limite_campanhas: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Limite mensagens" description="integer">
                  <Input
                    type="number"
                    value={current.limite_mensagens ?? ""}
                    onChange={(e) => setCurrent({ ...current, limite_mensagens: e.target.value })}
                  />
                </FieldRow>
                <FieldRow label="Limite funcionários" description="integer">
                  <Input
                    type="number"
                    value={current.limite_funcionarios ?? ""}
                    onChange={(e) => setCurrent({ ...current, limite_funcionarios: e.target.value })}
                  />
                </FieldRow>
              </div>
            </div>

            <FieldRow label="Funcionalidades (jsonb)" description='Ex.: ["chat", "templates"] ou {"x": true}'>
              <Textarea
                value={
                  typeof current.funcionalidades === "string"
                    ? current.funcionalidades
                    : JSON.stringify(current.funcionalidades ?? [], null, 2)
                }
                onChange={(e) => setCurrent({ ...current, funcionalidades: e.target.value })}
                rows={6}
                className="font-mono"
              />
            </FieldRow>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="ID Checkout">
                <Input
                  value={current.id_checkout ?? ""}
                  onChange={(e) => setCurrent({ ...current, id_checkout: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Suporte" description="text (ex.: email, whatsapp, prioridade)">
                <Input value={current.suporte ?? ""} onChange={(e) => setCurrent({ ...current, suporte: e.target.value })} />
              </FieldRow>
              <FieldRow label="Chat ao vivo" description="text (ex.: simplificado, completo)">
                <Input
                  value={current.chat_ao_vivo ?? ""}
                  onChange={(e) => setCurrent({ ...current, chat_ao_vivo: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Templates" description="text (ex.: basicos, completos)">
                <Input
                  value={current.templates ?? ""}
                  onChange={(e) => setCurrent({ ...current, templates: e.target.value })}
                />
              </FieldRow>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Criado em" description="timestamp">
                <Input
                  type="datetime-local"
                  value={toDatetimeLocal(current.criado_em ?? null)}
                  onChange={(e) => setCurrent({ ...current, criado_em: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Atualizado em" description="timestamp">
                <Input
                  type="datetime-local"
                  value={toDatetimeLocal(current.atualizado_em ?? null)}
                  onChange={(e) => setCurrent({ ...current, atualizado_em: e.target.value })}
                />
              </FieldRow>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Ativo" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch checked={!!current.ativo} onCheckedChange={(v) => setCurrent({ ...current, ativo: v })} />
                  <span className="text-sm text-muted-foreground">{current.ativo ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>

              <FieldRow label="API oficial" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch checked={!!current.api_oficial} onCheckedChange={(v) => setCurrent({ ...current, api_oficial: v })} />
                  <span className="text-sm text-muted-foreground">{current.api_oficial ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>

              <FieldRow label="App mobile" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch checked={!!current.app_mobile} onCheckedChange={(v) => setCurrent({ ...current, app_mobile: v })} />
                  <span className="text-sm text-muted-foreground">{current.app_mobile ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>

              <FieldRow label="App desktop" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch checked={!!current.app_desktop} onCheckedChange={(v) => setCurrent({ ...current, app_desktop: v })} />
                  <span className="text-sm text-muted-foreground">{current.app_desktop ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>

              <FieldRow label="Gerente dedicado" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!current.gerente_conta_dedicado}
                    onCheckedChange={(v) => setCurrent({ ...current, gerente_conta_dedicado: v })}
                  />
                  <span className="text-sm text-muted-foreground">{current.gerente_conta_dedicado ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>

              <FieldRow label="SLA garantido" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch checked={!!current.sla_garantido} onCheckedChange={(v) => setCurrent({ ...current, sla_garantido: v })} />
                  <span className="text-sm text-muted-foreground">{current.sla_garantido ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>

              <FieldRow label="Treinamento incluído" description="boolean">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!current.treinamento_incluido}
                    onCheckedChange={(v) => setCurrent({ ...current, treinamento_incluido: v })}
                  />
                  <span className="text-sm text-muted-foreground">{current.treinamento_incluido ? "Sim" : "Não"}</span>
                </div>
              </FieldRow>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button className="bg-red-500 hover:bg-red-600" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span className={saving ? "ml-2" : ""}>{saving ? "Salvando..." : "Salvar"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


