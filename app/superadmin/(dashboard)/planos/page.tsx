"use client"

import { useEffect, useMemo, useState, memo, useCallback, useRef } from "react"
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

const FieldRow = memo(({
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
), (prevProps, nextProps) => {
  return prevProps.label === nextProps.label && prevProps.description === nextProps.description
})

FieldRow.displayName = "FieldRow"

// Componente separado para o formulário do modal - SEM MEMO para evitar problemas de re-render
function PlanoForm({
  initialData,
  isEdit,
  originalId,
  saving,
  onSave,
  onCancel,
}: {
  initialData: any
  isEdit: boolean
  originalId: string | null
  saving: boolean
  onSave: (data: any) => void
  onCancel: () => void
}) {
  // Estado local - inicializar apenas UMA VEZ quando o componente montar
  // Usar função inicializadora para garantir que só roda uma vez
  const [localData, setLocalData] = useState(() => {
    // Criar cópia profunda para evitar referências compartilhadas
    const copy = JSON.parse(JSON.stringify(initialData))
    console.log("[PlanoForm] Estado inicializado - nome:", copy?.nome)
    return copy
  })
  
  // Refs para os inputs para atualização direta do DOM
  const nomeInputRef = useRef<HTMLInputElement>(null)

  // NÃO sincronizar mais - o estado local é independente após inicialização
  // Isso evita que o estado seja resetado durante a digitação
  
  // Log quando localData.nome mudar para debug
  useEffect(() => {
    console.log("[PlanoForm] localData.nome mudou para:", localData?.nome)
  }, [localData?.nome])

  const handleSave = () => {
    onSave(localData)
  }

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--foreground))' }}>
          {isEdit ? "Editar Plano" : "Criar Plano"}
        </h2>
        <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
          Você pode editar todos os campos do banco (incluindo JSON e timestamps)
        </p>
      </div>

      <div className="space-y-6 py-2">
        {isEdit ? (
          <FieldRow label="ID" description="ID do plano (não pode ser alterado)">
            <input
              type="text"
              value={originalId || ""}
              disabled
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--muted-foreground))',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--input))',
                borderRadius: '6px',
                outline: 'none',
                cursor: 'not-allowed'
              }}
            />
          </FieldRow>
        ) : (
          <FieldRow label="ID (opcional)" description="Se vazio, o banco gera automaticamente (UUID)">
            <input
              type="text"
              defaultValue={localData.id ?? ""}
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, id: value }))
              }}
              placeholder="UUID (opcional)"
              autoFocus
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
        )}

        <FieldRow label="Nome *">
          <input
            ref={nomeInputRef}
            type="text"
            defaultValue={localData?.nome ?? ""}
            onChange={(e) => {
              const newValue = e.target.value
              console.log("[PlanoForm] onChange nome - digitado:", newValue, "| estado atual:", localData?.nome)
              
              // Atualizar estado diretamente
              setLocalData((prev: any) => {
                const updated = { ...prev, nome: newValue }
                console.log("[PlanoForm] Estado atualizado - novo nome:", updated.nome)
                return updated
              })
            }}
            onFocus={(e) => {
              console.log("[PlanoForm] Input focou, valor no DOM:", e.target.value, "| valor no estado:", localData?.nome)
            }}
            autoFocus
            tabIndex={0}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px',
              fontSize: '14px',
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--input))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
        </FieldRow>

        <FieldRow label="Slug *">
          <input
            type="text"
            defaultValue={localData.slug ?? ""} 
            onChange={(e) => {
              const value = e.target.value
              setLocalData((prev: any) => ({ ...prev, slug: value }))
            }}
            tabIndex={0}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px',
              fontSize: '14px',
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--input))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
        </FieldRow>

        <FieldRow label="Descrição">
          <textarea
            defaultValue={localData.descricao ?? ""}
            onChange={(e) => {
              const value = e.target.value
              setLocalData((prev: any) => ({ ...prev, descricao: value }))
            }}
            rows={3}
            tabIndex={0}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--input))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
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
              <input
                type="number"
                step="0.01"
                defaultValue={localData.valor_padrao ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, valor_padrao: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Preço anual" description="numeric">
              <input
                type="number"
                step="0.01"
                defaultValue={localData.preco_anual ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, preco_anual: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Preço anual com desconto" description="numeric">
              <input
                type="number"
                step="0.01"
                defaultValue={localData.preco_anual_com_desconto ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, preco_anual_com_desconto: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Valor 1ª mensalidade" description="numeric">
              <input
                type="number"
                step="0.01"
                defaultValue={localData.valor_primeira_mensalidade ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, valor_primeira_mensalidade: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
          </div>

          <div className="space-y-4">
            <FieldRow label="Limite conexões" description="integer">
              <input
                type="number"
                defaultValue={localData.limite_conexoes ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, limite_conexoes: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Máx contatos" description="integer">
              <input
                type="number"
                defaultValue={localData.max_contatos ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, max_contatos: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Limite campanhas" description="integer">
              <input
                type="number"
                defaultValue={localData.limite_campanhas ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, limite_campanhas: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Limite mensagens" description="integer">
              <input
                type="number"
                defaultValue={localData.limite_mensagens ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, limite_mensagens: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
            <FieldRow label="Limite funcionários" description="integer">
              <input
                type="number"
                defaultValue={localData.limite_funcionarios ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  setLocalData((prev: any) => ({ ...prev, limite_funcionarios: value }))
                }}
                tabIndex={0}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  backgroundColor: 'hsl(var(--input))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </FieldRow>
          </div>
        </div>

        <FieldRow label="Funcionalidades (jsonb)" description='Ex.: ["chat", "templates"] ou {"x": true}'>
          <textarea
            defaultValue={
              typeof localData.funcionalidades === "string"
                ? localData.funcionalidades
                : JSON.stringify(localData.funcionalidades ?? [], null, 2)
            }
            onChange={(e) => {
              const value = e.target.value
              setLocalData((prev: any) => ({ ...prev, funcionalidades: value }))
            }}
            rows={6}
            tabIndex={0}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--input))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
          />
        </FieldRow>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="ID Checkout">
            <input
              type="text"
              defaultValue={localData.id_checkout ?? ""}
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, id_checkout: value }))
              }}
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
          <FieldRow label="Suporte" description="text (ex.: email, whatsapp, prioridade)">
            <input
              type="text"
              defaultValue={localData.suporte ?? ""} 
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, suporte: value }))
              }}
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
          <FieldRow label="Chat ao vivo" description="text (ex.: simplificado, completo)">
            <input
              type="text"
              defaultValue={localData.chat_ao_vivo ?? ""}
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, chat_ao_vivo: value }))
              }}
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
          <FieldRow label="Templates" description="text (ex.: basicos, completos)">
            <input
              type="text"
              defaultValue={localData.templates ?? ""}
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, templates: value }))
              }}
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="Criado em" description="timestamp">
            <input
              type="datetime-local"
              defaultValue={toDatetimeLocal(localData.criado_em ?? null)}
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, criado_em: value }))
              }}
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
          <FieldRow label="Atualizado em" description="timestamp">
            <input
              type="datetime-local"
              defaultValue={toDatetimeLocal(localData.atualizado_em ?? null)}
              onChange={(e) => {
                const value = e.target.value
                setLocalData((prev: any) => ({ ...prev, atualizado_em: value }))
              }}
              tabIndex={0}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'hsl(var(--input))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </FieldRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="Ativo" description="boolean">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!!localData.ativo} 
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, ativo: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.ativo ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>

          <FieldRow label="API oficial" description="boolean">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!!localData.api_oficial} 
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, api_oficial: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.api_oficial ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>

          <FieldRow label="App mobile" description="boolean">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!!localData.app_mobile} 
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, app_mobile: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.app_mobile ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>

          <FieldRow label="App desktop" description="boolean">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!!localData.app_desktop} 
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, app_desktop: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.app_desktop ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>

          <FieldRow label="Gerente dedicado" description="boolean">
            <div className="flex items-center gap-3">
              <Switch
                checked={!!localData.gerente_conta_dedicado}
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, gerente_conta_dedicado: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.gerente_conta_dedicado ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>

          <FieldRow label="SLA garantido" description="boolean">
            <div className="flex items-center gap-3">
              <Switch 
                checked={!!localData.sla_garantido} 
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, sla_garantido: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.sla_garantido ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>

          <FieldRow label="Treinamento incluído" description="boolean">
            <div className="flex items-center gap-3">
              <Switch
                checked={!!localData.treinamento_incluido}
                onCheckedChange={(v) => {
                  setLocalData((prev: any) => ({ ...prev, treinamento_incluido: v }))
                }}
              />
              <span className="text-sm text-muted-foreground">{localData.treinamento_incluido ? "Sim" : "Não"}</span>
            </div>
          </FieldRow>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button className="bg-red-500 hover:bg-red-600" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span className={saving ? "ml-2" : ""}>{saving ? "Salvando..." : "Salvar"}</span>
        </Button>
      </div>
    </>
  )
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
    // Criar cópia profunda para garantir que não mude durante a edição
    const emptyData = emptyPlano()
    const dataCopy = JSON.parse(JSON.stringify(emptyData))
    setCurrent(dataCopy)
    setShowDialog(true)
  }

  const openEdit = useCallback((p: Plano) => {
    setIsEdit(true)
    setOriginalId(p.id)
    // Criar cópia profunda para garantir que não mude durante a edição
    const dataCopy = JSON.parse(JSON.stringify({
      ...p,
      funcionalidades: p.funcionalidades ?? [],
    }))
    setCurrent(dataCopy)
    setShowDialog(true)
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open && !saving) {
      setShowDialog(false)
    }
  }, [saving])

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

  const handleSave = useCallback(async (data: any) => {
    if (!data.nome?.trim() || !data.slug?.trim()) {
      toast({ title: "Campos obrigatórios", description: "nome e slug são obrigatórios", variant: "destructive" })
      return
    }

    // Parse funcionalidades
    const raw = data.funcionalidades
    let funcionalidadesParsed: any = null
    if (raw !== null && raw !== undefined) {
      if (typeof raw === "object") {
        funcionalidadesParsed = raw
      } else if (String(raw).trim() !== "") {
        try {
          funcionalidadesParsed = JSON.parse(String(raw))
        } catch {
          toast({ title: "JSON inválido", description: "funcionalidades precisa ser um JSON válido", variant: "destructive" })
          return
        }
      }
    }

    setSaving(true)
    try {
      const payload: any = {
        ...data,
        funcionalidades: funcionalidadesParsed,
      }

      const method = isEdit ? "PUT" : "POST"
      if (isEdit) payload.id = originalId

      const res = await fetch("/api/admin/planos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const dataRes = await res.json()
      if (!res.ok || !dataRes.success) throw new Error(dataRes.error || "Falha ao salvar plano")

      toast({ title: "Sucesso", description: isEdit ? "Plano atualizado" : "Plano criado" })
      setShowDialog(false)
      await loadPlanos()
    } catch (e: any) {
      console.error("Error saving plano:", e)
      toast({ title: "Erro", description: e.message || "Falha ao salvar plano", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }, [isEdit, originalId, toast, loadPlanos])

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

      {/* Modal Customizado - SEM Dialog do Radix UI */}
      {showDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowDialog(false)
            }
          }}
        >
          <div
            style={{
              width: '1100px',
              maxWidth: '96vw',
              maxHeight: '85vh',
              backgroundColor: 'hsl(var(--background))',
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              padding: '24px',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 100
            }}
            onClick={(e) => {
              // Só prevenir se clicar no próprio container, não nos inputs
              if (e.target === e.currentTarget) {
                e.stopPropagation()
              }
            }}
          >
            <PlanoForm
              key={isEdit ? `edit-${originalId}` : 'create'}
              initialData={current}
              isEdit={isEdit}
              originalId={originalId}
              saving={saving}
              onSave={handleSave}
              onCancel={() => setShowDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}


