import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext, getEmpresaFilter } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function GET(request: NextRequest) {
  try {
    console.log("[Connections API] ====== INICIANDO GET /api/connections ======")
    console.log("[Connections API] Headers recebidos:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa")
    })
    
    // Tentar obter empresaId diretamente do header como fallback
    let empresaId: string | null = null
    let isSuperAdmin = false
    
    const authContext = await getAuthContext(request)
    
    if (authContext) {
      empresaId = authContext.empresaId
      isSuperAdmin = authContext.isSuperAdmin
      console.log("[Connections API] ✅ AuthContext encontrado - Empresa ID:", empresaId, "SuperAdmin:", isSuperAdmin)
    } else {
      console.error("[Connections API] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Connections API] ✅ Usando empresa do header (fallback):", empresaId)
      } else {
        console.error("[Connections API] ❌ Nenhuma empresa encontrada (nem no authContext nem no header)")
        return NextResponse.json({ 
          success: false, 
          error: "Você precisa estar logado para ver conexões. Faça login novamente." 
        }, { status: 401 })
      }
    }
    
    if (!empresaId) {
      console.error("[Connections API] ❌ empresaId não encontrado")
      return NextResponse.json({ 
        success: false, 
        error: "Empresa não identificada" 
      }, { status: 400 })
    }

    console.log("[Connections API] Buscando conexões para:", {
      empresa_id: empresaId,
      is_superadmin: isSuperAdmin
    })
    
    // Construir query com filtro Multi-Tenant
    let query = supabase
      .from("conexoes")
      .select("*")
      .eq("tipo_conexao", "api_oficial")
      .order("criado_em", { ascending: false })
    
    // Filtrar por empresa (superadmin vê todas, membro vê só da sua empresa)
    if (!isSuperAdmin) {
      query = query.eq("id_empresa", empresaId)
      console.log("[Connections API] Filtrando conexões por id_empresa:", empresaId)
    } else {
      console.log("[Connections API] SuperAdmin - buscando todas as conexões")
    }
    
    const { data, error } = await query

    if (error) {
      console.error("[Connections API] ❌ Erro ao buscar conexões:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    console.log("[Connections API] ✅ Conexões encontradas:", data?.length || 0)

    // Função helper para gerar URL do webhook do Supabase Edge Function
    const getWebhookUrl = () => {
      // 1. Tentar variável de ambiente específica
      if (process.env.NEXT_PUBLIC_WEBHOOK_URL) {
        return process.env.NEXT_PUBLIC_WEBHOOK_URL
      }
      
      // 2. Usar Supabase Edge Function URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      if (supabaseUrl) {
        // Extrair project ref da URL do Supabase
        const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
        if (projectRef) {
          return `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook`
        }
      }
      
      // 3. Fallback: tentar variáveis de ambiente
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.NEXT_PUBLIC_SITE_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                     "https://scalazap.com"
      
      // Se não for Supabase, usar rota Next.js como fallback
      return `${baseUrl}/api/whatsapp/webhook`
    }
    
    const webhookUrl = getWebhookUrl()
    const webhookToken = process.env.WHATSAPP_VERIFY_TOKEN || "scalazap_verify_token_2024"
    
    console.log("[Connections API] Webhook URL gerada para todas as conexões:", webhookUrl)

    // Mapear campos para formato compatível com o código existente
    const connections = (data || []).map((conn: any) => ({
      id: conn.id,
      name: conn.nome,
      type: "official",
      status: conn.status,
      phone: conn.telefone || conn.numero_exibicao,
      phone_number_id: conn.id_numero_telefone,
      access_token: conn.token_acesso,
      waba_id: conn.id_waba,
      verify_token: conn.token_verificacao,
      verified_name: conn.nome_verificado,
      display_phone_number: conn.numero_exibicao,
      messages_used: 0,
      messages_limit: 1000,
      created_at: conn.criado_em,
      id_empresa: conn.id_empresa,
      // Adicionar informações do webhook
      webhook: {
        url: webhookUrl,
        verify_token: webhookToken,
        required_fields: ["messages", "message_status"]
      }
    }))

    console.log("[Connections API] Conexões encontradas:", connections.length)
    return NextResponse.json({ success: true, connections })
  } catch (error: any) {
    console.error("[Connections API] Erro inesperado:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter contexto Multi-Tenant (membro e empresa)
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({ 
        success: false, 
        error: "Você precisa estar logado para criar uma conexão. Faça login novamente." 
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone_number_id, access_token, waba_id, phone, verify_token, verified_name, display_phone_number } = body

    if (!phone_number_id || !access_token || !waba_id) {
      return NextResponse.json({ success: false, error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    console.log("[Connections API] Criando conexão para:", {
      membro_id: authContext.membro.id,
      membro_nome: authContext.membro.nome,
      empresa_id: authContext.empresaId,
      empresa_nome: authContext.membro.empresa?.nome
    })

    // Obter o id_usuario correto (deve ser o ID do Supabase Auth, não o ID do membro)
    // id_usuario na tabela conexoes referencia auth.users.id (não membros.id)
    const idUsuario = authContext.membro.id_usuario
    
    if (!idUsuario) {
      console.error("[Connections API] Membro não tem id_usuario (Supabase Auth ID)")
      return NextResponse.json({ 
        success: false, 
        error: "Erro de autenticação: usuário não vinculado ao sistema de autenticação." 
      }, { status: 500 })
    }

    console.log("[Connections API] Usando id_usuario (Supabase Auth ID):", idUsuario)

    // Criar conexão associada à empresa e membro
    const { data, error } = await supabase
      .from("conexoes")
      .insert({
        nome: name || `WhatsApp Business - ${display_phone_number || phone_number_id}`,
        tipo_conexao: "api_oficial",
        status: "connected",
        id_numero_telefone: phone_number_id,
        token_acesso: access_token,
        id_waba: waba_id,
        telefone: phone || display_phone_number || "",
        token_verificacao: verify_token || "",
        nome_verificado: verified_name || "",
        numero_exibicao: display_phone_number || "",
        // Multi-Tenant: associar à empresa e membro
        id_empresa: authContext.empresaId, // OBRIGATÓRIO - associa à empresa
        id_usuario: idUsuario, // ID do Supabase Auth (auth.users.id) - deve existir na constraint
        email_usuario: authContext.membro.email,
      })
      .select()
      .single()

    if (error) {
      console.error("[Connections API] Erro ao criar conexão:", error)
      console.error("[Connections API] Detalhes do erro:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Mensagem de erro mais específica para foreign key
      if (error.message?.includes("foreign key constraint") || error.code === "23503") {
        return NextResponse.json({ 
          success: false, 
          error: `Erro de integridade: A foreign key constraint está falhando. Isso geralmente significa que a constraint antiga ainda referencia a tabela 'usuarios'. Execute o script SQL 'scripts/fix-conexoes-foreign-key.sql' no Supabase para corrigir. Detalhes: ${error.message}` 
        }, { status: 500 })
      }
      
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[Connections API] ✅ Conexão criada com sucesso:", {
      connection_id: data.id,
      empresa_id: data.id_empresa,
      membro_id: authContext.membro.id
    })
    
    // Gerar URL do webhook do Supabase Edge Function
    const getWebhookUrl = () => {
      // 1. Tentar variável de ambiente específica
      if (process.env.NEXT_PUBLIC_WEBHOOK_URL) {
        return process.env.NEXT_PUBLIC_WEBHOOK_URL
      }
      
      // 2. Usar Supabase Edge Function URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      if (supabaseUrl) {
        // Extrair project ref da URL do Supabase
        const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
        if (projectRef) {
          return `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook`
        }
      }
      
      // 3. Fallback: tentar variáveis de ambiente
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.NEXT_PUBLIC_SITE_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                     "https://scalazap.com"
      
      // Se não for Supabase, usar rota Next.js como fallback
      return `${baseUrl}/api/whatsapp/webhook`
    }
    
    // Gerar URL do webhook do Supabase Edge Function
    const getWebhookUrlForPost = () => {
      // 1. Tentar variável de ambiente específica
      if (process.env.NEXT_PUBLIC_WEBHOOK_URL) {
        return process.env.NEXT_PUBLIC_WEBHOOK_URL
      }
      
      // 2. Usar Supabase Edge Function URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      if (supabaseUrl) {
        // Extrair project ref da URL do Supabase
        const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1]
        if (projectRef) {
          return `https://${projectRef}.supabase.co/functions/v1/whatsapp-webhook`
        }
      }
      
      // 3. Fallback: tentar variáveis de ambiente
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.NEXT_PUBLIC_SITE_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                     "https://scalazap.com"
      
      // Se não for Supabase, usar rota Next.js como fallback
      return `${baseUrl}/api/whatsapp/webhook`
    }
    
    const webhookUrl = getWebhookUrlForPost()
    const webhookToken = process.env.WHATSAPP_VERIFY_TOKEN || "scalazap_verify_token_2024"
    
    console.log("[Connections API] Webhook URL gerada (Supabase Edge Function):", webhookUrl)
    
    return NextResponse.json({ 
      success: true, 
      connection: data,
      webhook: {
        url: webhookUrl,
        verify_token: webhookToken,
        required_fields: ["messages", "message_status"],
        instructions: {
          step1: "Acesse o Meta Business Suite ou Facebook Developers",
          step2: "Vá em WhatsApp → Configuration → Webhook",
          step3: `Cole a URL: ${webhookUrl}`,
          step4: `Cole o Verify Token: ${webhookToken}`,
          step5: "Marque os campos: 'messages' e 'message_status'",
          step6: "Clique em 'Verify and Save'"
        }
      }
    })
  } catch (error: any) {
    console.error("[Connections API] Erro inesperado:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Obter contexto Multi-Tenant
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      return NextResponse.json({ 
        success: false, 
        error: "Você precisa estar logado para deletar conexões." 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID obrigatório" }, { status: 400 })
    }

    // Verificar se a conexão pertence à empresa do membro (ou se é superadmin)
    const { data: connection, error: fetchError } = await supabase
      .from("conexoes")
      .select("id_empresa")
      .eq("id", id)
      .single()

    if (fetchError || !connection) {
      return NextResponse.json({ success: false, error: "Conexão não encontrada" }, { status: 404 })
    }

    // Superadmin pode deletar qualquer conexão, membro só da sua empresa
    if (!authContext.isSuperAdmin && connection.id_empresa !== authContext.empresaId) {
      return NextResponse.json({ 
        success: false, 
        error: "Você não tem permissão para deletar esta conexão." 
      }, { status: 403 })
    }

    // Deletar conexão
    const { error } = await supabase
      .from("conexoes")
      .delete()
      .eq("id", id)
      .eq("id_empresa", authContext.empresaId) // Garantir que só deleta da empresa do membro

    if (error) {
      console.error("[Connections API] Erro ao deletar conexão:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[Connections API] ✅ Conexão deletada:", id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Connections API] Erro inesperado:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
