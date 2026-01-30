import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function toNumberOrNull(value: any) {
  if (value === "" || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toIntOrNull(value: any) {
  if (value === "" || value === null || value === undefined) return null
  const n = Number.parseInt(String(value), 10)
  return Number.isFinite(n) ? n : null
}

function toBoolOrNull(value: any) {
  if (value === "" || value === null || value === undefined) return null
  if (typeof value === "boolean") return value
  if (value === "true") return true
  if (value === "false") return false
  return null
}

function toDateOrNull(value: any) {
  if (value === "" || value === null || value === undefined) return null
  // aceita string ISO, ou datetime-local (sem timezone)
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function toJsonbOrNull(value: any) {
  if (value === "" || value === null || value === undefined) return null
  if (typeof value === "object") return value
  try {
    return JSON.parse(String(value))
  } catch {
    return null
  }
}

// GET - Listar planos
export async function GET() {
  try {
    const { data: planos, error } = await supabase
      .from("planos")
      .select("*")
      .order("criado_em", { ascending: false })

    if (error) {
      console.error("Error fetching planos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, planos: planos || [], total: planos?.length || 0 })
  } catch (error: any) {
    console.error("Error in GET /api/admin/planos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar plano
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.nome || !body?.slug) {
      return NextResponse.json({ error: "nome e slug são obrigatórios" }, { status: 400 })
    }

    const payload: any = {
      id: body.id || undefined,
      nome: body.nome,
      slug: body.slug,
      descricao: body.descricao ?? null,
      valor_padrao: toNumberOrNull(body.valor_padrao) ?? undefined,
      preco_anual: toNumberOrNull(body.preco_anual) ?? undefined,
      limite_conexoes: toIntOrNull(body.limite_conexoes) ?? undefined,
      max_contatos: toIntOrNull(body.max_contatos) ?? undefined,
      limite_campanhas: toIntOrNull(body.limite_campanhas) ?? undefined,
      limite_mensagens: toIntOrNull(body.limite_mensagens) ?? undefined,
      funcionalidades: toJsonbOrNull(body.funcionalidades) ?? undefined,
      ativo: toBoolOrNull(body.ativo) ?? undefined,
      criado_em: toDateOrNull(body.criado_em) ?? undefined,
      atualizado_em: toDateOrNull(body.atualizado_em) ?? undefined,
      id_checkout: body.id_checkout ?? null,
      valor_primeira_mensalidade: toNumberOrNull(body.valor_primeira_mensalidade) ?? undefined,
      preco_anual_com_desconto: toNumberOrNull(body.preco_anual_com_desconto) ?? undefined,
      limite_funcionarios: toIntOrNull(body.limite_funcionarios) ?? undefined,
      api_oficial: toBoolOrNull(body.api_oficial) ?? undefined,
      chat_ao_vivo: body.chat_ao_vivo ?? null,
      templates: body.templates ?? null,
      app_mobile: toBoolOrNull(body.app_mobile) ?? undefined,
      app_desktop: toBoolOrNull(body.app_desktop) ?? undefined,
      suporte: body.suporte ?? null,
      gerente_conta_dedicado: toBoolOrNull(body.gerente_conta_dedicado) ?? undefined,
      sla_garantido: toBoolOrNull(body.sla_garantido) ?? undefined,
      treinamento_incluido: toBoolOrNull(body.treinamento_incluido) ?? undefined,
    }

    // remover undefined para deixar defaults do banco agirem
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const { data: plano, error } = await supabase
      .from("planos")
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error("Error creating plano:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plano })
  } catch (error: any) {
    console.error("Error in POST /api/admin/planos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar plano (permite trocar o ID: use id (atual) e id_novo opcional)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const idAtual = body?.id
    if (!idAtual) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })

    const idNovo = body.id_novo && String(body.id_novo).trim() ? String(body.id_novo).trim() : null

    const updates: any = {
      ...(idNovo ? { id: idNovo } : {}),
      nome: body.nome ?? undefined,
      slug: body.slug ?? undefined,
      descricao: body.descricao ?? null,
      valor_padrao: toNumberOrNull(body.valor_padrao) ?? undefined,
      preco_anual: toNumberOrNull(body.preco_anual) ?? undefined,
      limite_conexoes: toIntOrNull(body.limite_conexoes) ?? undefined,
      max_contatos: toIntOrNull(body.max_contatos) ?? undefined,
      limite_campanhas: toIntOrNull(body.limite_campanhas) ?? undefined,
      limite_mensagens: toIntOrNull(body.limite_mensagens) ?? undefined,
      funcionalidades: toJsonbOrNull(body.funcionalidades) ?? undefined,
      ativo: toBoolOrNull(body.ativo) ?? undefined,
      criado_em: toDateOrNull(body.criado_em) ?? undefined,
      atualizado_em: toDateOrNull(body.atualizado_em) ?? undefined,
      id_checkout: body.id_checkout ?? null,
      valor_primeira_mensalidade: toNumberOrNull(body.valor_primeira_mensalidade) ?? undefined,
      preco_anual_com_desconto: toNumberOrNull(body.preco_anual_com_desconto) ?? undefined,
      limite_funcionarios: toIntOrNull(body.limite_funcionarios) ?? undefined,
      api_oficial: toBoolOrNull(body.api_oficial) ?? undefined,
      chat_ao_vivo: body.chat_ao_vivo ?? null,
      templates: body.templates ?? null,
      app_mobile: toBoolOrNull(body.app_mobile) ?? undefined,
      app_desktop: toBoolOrNull(body.app_desktop) ?? undefined,
      suporte: body.suporte ?? null,
      gerente_conta_dedicado: toBoolOrNull(body.gerente_conta_dedicado) ?? undefined,
      sla_garantido: toBoolOrNull(body.sla_garantido) ?? undefined,
      treinamento_incluido: toBoolOrNull(body.treinamento_incluido) ?? undefined,
    }

    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k])

    const { data: plano, error } = await supabase
      .from("planos")
      .update(updates)
      .eq("id", idAtual)
      .select()
      .single()

    if (error) {
      console.error("Error updating plano:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plano })
  } catch (error: any) {
    console.error("Error in PUT /api/admin/planos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deletar plano
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })

    const { error } = await supabase.from("planos").delete().eq("id", id)
    if (error) {
      console.error("Error deleting plano:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/planos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



