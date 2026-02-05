import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data: config, error } = await supabase
      .from("configuracoes_saas")
      .select("webhook_free_link")
      .single()

    if (error) {
      console.error("[Webhook Free Link] Erro ao buscar:", error)
      return NextResponse.json(
        { error: "Erro ao buscar configuração" },
        { status: 500 }
      )
    }

    if (!config?.webhook_free_link) {
      return NextResponse.json(
        { error: "Webhook URL não configurado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ webhook_url: config.webhook_free_link })
  } catch (err: any) {
    console.error("[Webhook Free Link] Erro:", err)
    return NextResponse.json(
      { error: err.message || "Erro interno" },
      { status: 500 }
    )
  }
}

