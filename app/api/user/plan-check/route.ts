import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function GET(request: NextRequest) {
  try {
    console.log("═══════════════════════════════════════════════════════════")
    console.log("[Plan Check] ====== INICIANDO VERIFICAÇÃO DE PLANO ======")
    console.log("═══════════════════════════════════════════════════════════")
    console.log("[Plan Check] 📅 Timestamp:", new Date().toISOString())
    console.log("[Plan Check] 🔗 URL:", request.url)
    
    // 1. Obter contexto de autenticação (membro + empresa)
    console.log("[Plan Check] 🔍 Passo 1: Buscando contexto de autenticação...")
    const authContext = await getAuthContext(request)
    
    if (!authContext) {
      console.error("[Plan Check] ❌ ERRO: Contexto de autenticação não encontrado")
      console.log("[Plan Check] 📋 Headers recebidos:", {
        authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
        xUserId: request.headers.get("x-user-id"),
        xUserEmail: request.headers.get("x-user-email"),
        xSelectedEmpresa: request.headers.get("x-selected-empresa")
      })
      return NextResponse.json(
        { error: "Usuário não autenticado", isFreePlan: true },
        { status: 401 }
      )
    }

    const empresaId = authContext.empresaId
    console.log("[Plan Check] ✅ Passo 1 concluído: Contexto encontrado")
    console.log("[Plan Check] 📊 Dados do contexto:", {
      empresaId: empresaId,
      isSuperAdmin: authContext.isSuperAdmin,
      membroId: authContext.membro?.id
    })

    // 2. Buscar assinatura na tabela assinaturas usando id_empresa
    console.log("[Plan Check] 🔍 Passo 2: Buscando assinatura na tabela 'assinaturas'...")
    console.log("[Plan Check] 📋 Query: SELECT * FROM assinaturas WHERE id_empresa =", empresaId)
    
    // Buscar TODAS as assinaturas da empresa (pode haver múltiplas)
    const { data: assinaturas, error: assinaturasError } = await supabase
      .from("assinaturas")
      .select("id, plano_id, id_empresa, criado_em, cancelado_em, status")
      .eq("id_empresa", empresaId)
      .order("criado_em", { ascending: false })

    if (assinaturasError) {
      console.error("[Plan Check] ❌ ERRO ao buscar assinaturas:", assinaturasError)
      console.error("[Plan Check] 📋 Detalhes do erro:", {
        message: assinaturasError.message,
        code: assinaturasError.code,
        details: assinaturasError.details,
        hint: assinaturasError.hint
      })
      // Se houver erro, considerar como plano gratuito
      return NextResponse.json({
        isFreePlan: true,
        planSlug: null,
        error: assinaturasError.message,
        debug: {
          empresaId,
          errorCode: assinaturasError.code
        }
      })
    }

    console.log("[Plan Check] 📊 Total de assinaturas encontradas:", assinaturas?.length || 0)
    if (assinaturas && assinaturas.length > 0) {
      console.log("[Plan Check] 📋 Assinaturas encontradas:")
      assinaturas.forEach((a, index) => {
        console.log(`  [${index + 1}] ID: ${a.id}, Plano ID: ${a.plano_id}, Criado: ${a.criado_em}, Cancelado: ${a.cancelado_em || "Não"}, Status: ${a.status || "N/A"}`)
      })
    }

    // Filtrar assinaturas não canceladas e pegar a mais recente
    const assinaturasAtivas = assinaturas?.filter(a => !a.cancelado_em) || []
    const assinatura = assinaturasAtivas.length > 0 
      ? assinaturasAtivas[0] // Pegar a mais recente (já ordenada)
      : assinaturas?.[0] // Se não tiver ativa, pegar a mais recente mesmo cancelada

    console.log("[Plan Check] 📊 Assinaturas ativas (não canceladas):", assinaturasAtivas.length)
    if (assinatura) {
      console.log("[Plan Check] ✅ Assinatura selecionada:", {
        id: assinatura.id,
        plano_id: assinatura.plano_id,
        cancelado: !!assinatura.cancelado_em,
        status: assinatura.status
      })
    }

    if (assinaturaError) {
      console.error("[Plan Check] ❌ ERRO ao buscar assinatura:", assinaturaError)
      console.error("[Plan Check] 📋 Detalhes do erro:", {
        message: assinaturaError.message,
        code: assinaturaError.code,
        details: assinaturaError.details,
        hint: assinaturaError.hint
      })
      // Se houver erro, considerar como plano gratuito
      return NextResponse.json({
        isFreePlan: true,
        planSlug: null,
        error: assinaturaError.message,
        debug: {
          empresaId,
          errorCode: assinaturaError.code
        }
      })
    }

    // 3. Se não encontrar assinatura, considerar como plano gratuito
    if (!assinatura || !assinatura.plano_id) {
      console.log("[Plan Check] ⚠️ ATENÇÃO: Nenhuma assinatura válida encontrada")
      console.log("[Plan Check] 📋 Resultado da busca:", {
        totalAssinaturas: assinaturas?.length || 0,
        assinaturasAtivas: assinaturasAtivas.length,
        assinaturaSelecionada: !!assinatura,
        assinaturaCompleta: assinatura,
        temPlanoId: !!assinatura?.plano_id,
        empresaId: empresaId
      })
      console.log("[Plan Check] ✅ RESULTADO: isFreePlan = true (sem assinatura válida)")
      return NextResponse.json({
        isFreePlan: true,
        planSlug: null,
        debug: {
          empresaId,
          totalAssinaturas: assinaturas?.length || 0,
          assinaturasAtivas: assinaturasAtivas.length,
          assinaturaEncontrada: !!assinatura,
          planoId: assinatura?.plano_id || null
        }
      })
    }

    console.log("[Plan Check] ✅ Passo 2 concluído: Assinatura encontrada")
    console.log("[Plan Check] 📊 Dados da assinatura:", {
      id: assinatura.id,
      plano_id: assinatura.plano_id,
      id_empresa: assinatura.id_empresa,
      criado_em: assinatura.criado_em
    })

    // 4. Buscar plano na tabela planos usando plano_id
    console.log("[Plan Check] 🔍 Passo 3: Buscando plano na tabela 'planos'...")
    console.log("[Plan Check] 📋 Query: SELECT id, nome, slug FROM planos WHERE id =", assinatura.plano_id)
    
    const { data: plano, error: planoError } = await supabase
      .from("planos")
      .select("id, nome, slug")
      .eq("id", assinatura.plano_id)
      .single()

    if (planoError) {
      console.error("[Plan Check] ❌ ERRO ao buscar plano:", planoError)
      console.error("[Plan Check] 📋 Detalhes do erro:", {
        message: planoError.message,
        code: planoError.code,
        details: planoError.details,
        hint: planoError.hint,
        planoIdBuscado: assinatura.plano_id
      })
      // Se não encontrar plano, considerar como gratuito
      return NextResponse.json({
        isFreePlan: true,
        planSlug: null,
        error: planoError.message,
        debug: {
          empresaId,
          planoId: assinatura.plano_id,
          errorCode: planoError.code
        }
      })
    }

    if (!plano) {
      console.log("[Plan Check] ⚠️ ATENÇÃO: Plano não encontrado")
      console.log("[Plan Check] 📋 plano_id buscado:", assinatura.plano_id)
      console.log("[Plan Check] ✅ RESULTADO: isFreePlan = true (plano não encontrado)")
      return NextResponse.json({
        isFreePlan: true,
        planSlug: null,
        debug: {
          empresaId,
          planoId: assinatura.plano_id
        }
      })
    }

    console.log("[Plan Check] ✅ Passo 3 concluído: Plano encontrado")
    console.log("[Plan Check] 📊 Dados do plano:", {
      id: plano.id,
      nome: plano.nome,
      slug: plano.slug
    })

    // 5. Verificar se slug === "free"
    const isFreePlan = plano.slug === "free"
    const slugComparacao = `"${plano.slug}" === "free"`

    console.log("═══════════════════════════════════════════════════════════")
    console.log("[Plan Check] 📊 RESULTADO FINAL DA VERIFICAÇÃO:")
    console.log("═══════════════════════════════════════════════════════════")
    console.log("[Plan Check] 🏢 Empresa ID:", empresaId)
    console.log("[Plan Check] 📦 Plano ID:", plano.id)
    console.log("[Plan Check] 📝 Nome do Plano:", plano.nome)
    console.log("[Plan Check] 🏷️  Slug do Plano:", plano.slug)
    console.log("[Plan Check] 🔍 Comparação:", slugComparacao, "→", isFreePlan)
    console.log("[Plan Check] 🚫 É Plano Gratuito?", isFreePlan ? "SIM ✅" : "NÃO ❌")
    console.log("[Plan Check] 🔒 Deve Bloquear?", isFreePlan ? "SIM ✅" : "NÃO ❌")
    console.log("═══════════════════════════════════════════════════════════")

    return NextResponse.json({
      isFreePlan,
      planSlug: plano.slug,
      planName: plano.nome,
      debug: {
        empresaId,
        planoId: plano.id,
        slug: plano.slug,
        comparacao: slugComparacao
      }
    })

  } catch (error: any) {
    console.error("═══════════════════════════════════════════════════════════")
    console.error("[Plan Check] ❌ ERRO CRÍTICO na verificação de plano")
    console.error("═══════════════════════════════════════════════════════════")
    console.error("[Plan Check] 📋 Erro:", error)
    console.error("[Plan Check] 📋 Stack:", error.stack)
    console.error("[Plan Check] ✅ RESULTADO: isFreePlan = true (erro - bloqueando por segurança)")
    return NextResponse.json(
      { 
        error: error.message || "Erro ao verificar plano",
        isFreePlan: true, // Em caso de erro, considerar como gratuito por segurança
        debug: {
          errorMessage: error.message,
          errorStack: error.stack
        }
      },
      { status: 500 }
    )
  }
}

