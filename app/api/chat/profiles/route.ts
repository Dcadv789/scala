import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar perfis disponíveis para o chat
export async function GET(request: NextRequest) {
  try {
    console.log("[Chat Profiles] ====== INICIANDO GET /api/chat/profiles ======")
    console.log("[Chat Profiles] Headers recebidos:", {
      authorization: request.headers.get("authorization") ? "Presente" : "Ausente",
      xUserId: request.headers.get("x-user-id"),
      xUserEmail: request.headers.get("x-user-email"),
      xSelectedEmpresa: request.headers.get("x-selected-empresa")
    })
    
    // Tentar obter empresaId diretamente do header como fallback
    let empresaId: string | null = null
    let isDono = false
    let perfilIdAtual: string | null = null
    let membroAtual: any = null
    
    const authContext = await getAuthContext(request)
    
    if (authContext) {
      empresaId = authContext.empresaId
      membroAtual = authContext.membro
      
      console.log("[Chat Profiles] ✅ AuthContext encontrado:", {
        membroId: membroAtual.id,
        empresaId: empresaId,
        membroIdUsuario: membroAtual.id_usuario
      })
      
      // Obter id_perfil do membro atual
      // A tabela membros tem id_perfil que referencia perfis.id
      const { data: membroComPerfil, error: membroError } = await supabase
        .from("membros")
        .select("id_perfil, cargo")
        .eq("id", membroAtual.id)
        .maybeSingle()
      
      console.log("[Chat Profiles] 🔍 RESULTADO DA BUSCA POR ID:", {
        membroId: membroAtual.id,
        encontrou: !!membroComPerfil,
        membroComPerfil_completo: JSON.stringify(membroComPerfil, null, 2),
        tem_id_perfil: !!membroComPerfil?.id_perfil,
        tem_cargo: !!membroComPerfil?.cargo,
        membroError: membroError?.message
      })
      
      if (membroComPerfil && membroComPerfil.id_perfil) {
        perfilIdAtual = membroComPerfil.id_perfil
        
        console.log("[Chat Profiles] ====== INICIANDO VALIDAÇÃO DE CARGO ======")
        console.log("[Chat Profiles] 1️⃣ Valor BRUTO do cargo obtido:", {
          cargo_raw: membroComPerfil.cargo,
          cargo_type: typeof membroComPerfil.cargo,
          cargo_json: JSON.stringify(membroComPerfil.cargo),
          cargo_length: membroComPerfil.cargo?.length,
          cargo_is_null: membroComPerfil.cargo === null,
          cargo_is_undefined: membroComPerfil.cargo === undefined
        })
        
        // Usar o cargo já obtido na primeira query (não precisa buscar novamente)
        const cargoValue = membroComPerfil.cargo
        const cargoTrimmed = cargoValue?.trim()
        
        console.log("[Chat Profiles] 2️⃣ Após aplicar trim:", {
          cargo_antes_trim: `[${cargoValue}]`,
          cargo_depois_trim: `[${cargoTrimmed}]`,
          mudou_algo: cargoValue !== cargoTrimmed
        })
        
        console.log("[Chat Profiles] 3️⃣ Códigos ASCII de cada caractere:")
        if (cargoValue) {
          const chars = Array.from(cargoValue as string)
          chars.forEach((char: string, index: number) => {
            console.log(`  Posição ${index}: '${char}' = ASCII ${char.charCodeAt(0)} (${char.charCodeAt(0) === 32 ? 'ESPAÇO' : char.charCodeAt(0) === 10 ? 'LINE BREAK' : char.charCodeAt(0) === 13 ? 'CARRIAGE RETURN' : 'normal'})`)
          })
        }
        
        console.log("[Chat Profiles] 4️⃣ Comparação com 'dono':")
        console.log("  String esperada 'dono' tem códigos ASCII:", Array.from('dono').map((c: string) => c.charCodeAt(0)))
        console.log("  String recebida códigos ASCII:", cargoValue ? Array.from(cargoValue as string).map((c: string) => c.charCodeAt(0)) : null)
        
        // Várias formas de comparação
        const comparacao1 = cargoTrimmed === 'dono'
        const comparacao2 = cargoTrimmed?.toLowerCase() === 'dono'
        const comparacao3 = String(cargoTrimmed) === 'dono'
        const comparacao4 = cargoValue === 'dono'
        
        isDono = comparacao1
        
        console.log("[Chat Profiles] 5️⃣ RESULTADOS DAS COMPARAÇÕES:", {
          'cargoTrimmed === "dono"': comparacao1,
          'cargoTrimmed?.toLowerCase() === "dono"': comparacao2,
          'String(cargoTrimmed) === "dono"': comparacao3,
          'cargoValue === "dono"': comparacao4,
          'RESULTADO FINAL isDono': isDono
        })
        
        console.log("[Chat Profiles] ====== FIM VALIDAÇÃO DE CARGO ======")
        console.log("[Chat Profiles] ✅ Perfil ID e cargo obtidos:", {
          id_perfil: perfilIdAtual,
          cargo_original: cargoValue,
          cargo_trimmed: cargoTrimmed,
          isDono: isDono
        })
      } else {
        // Fallback: buscar perfil usando id_usuario se não tiver id_perfil
        if (membroAtual.id_usuario) {
          console.log("[Chat Profiles] Tentando buscar perfil via id_usuario:", membroAtual.id_usuario)
          const { data: perfilData, error: perfilError } = await supabase
            .from("perfis")
            .select("id")
            .eq("id", membroAtual.id_usuario)
            .maybeSingle()
          
          console.log("[Chat Profiles] Busca de perfil via id_usuario:", {
            id_usuario: membroAtual.id_usuario,
            perfilData: perfilData,
            perfilError: perfilError?.message
          })
          
          if (perfilData) {
            perfilIdAtual = perfilData.id
            console.log("[Chat Profiles] ✅ Perfil ID obtido via id_usuario:", perfilIdAtual)
            
            // Buscar membro usando id_perfil para obter o cargo
            const { data: membroPorPerfil, error: membroPorPerfilError } = await supabase
              .from("membros")
              .select("cargo, id_perfil")
              .eq("id_perfil", perfilIdAtual)
              .eq("id_empresa", empresaId)
              .maybeSingle()  // Removido filtro ativo que pode estar causando falha
            
            console.log("[Chat Profiles] Busca de membro por id_perfil (fallback):", {
              id_perfil: perfilIdAtual,
              empresaId: empresaId,
              membroPorPerfil: membroPorPerfil,
              membroPorPerfilError: membroPorPerfilError?.message
            })
            
            if (membroPorPerfil) {
              const cargoValue = membroPorPerfil.cargo
              isDono = cargoValue === 'dono'
              console.log("[Chat Profiles] Cargo obtido (fallback):", {
                cargo: cargoValue,
                isDono: isDono,
                tipo_cargo: typeof cargoValue
              })
            } else {
              console.warn("[Chat Profiles] ⚠️ Membro não encontrado por id_perfil (fallback)")
              isDono = false
            }
          } else {
            console.error("[Chat Profiles] ❌ Perfil não encontrado via id_usuario")
            isDono = false
          }
        } else {
          console.error("[Chat Profiles] ❌ Não foi possível obter perfil: membro sem id_perfil e sem id_usuario")
          isDono = false
        }
      }
      
      console.log("[Chat Profiles] ====================================")
      console.log("[Chat Profiles] 📊 RESUMO FINAL DA VALIDAÇÃO isDono")
      console.log("[Chat Profiles] ====================================")
      console.log("[Chat Profiles] empresaId:", empresaId)
      console.log("[Chat Profiles] perfilIdAtual:", perfilIdAtual)
      console.log("[Chat Profiles] cargo do membro:", membroComPerfil?.cargo)
      console.log("[Chat Profiles] tipo do cargo:", typeof membroComPerfil?.cargo)
      console.log("[Chat Profiles] isDono FINAL:", isDono)
      console.log("[Chat Profiles] tipo de isDono:", typeof isDono)
      console.log("[Chat Profiles] isDono === true?", isDono === true)
      console.log("[Chat Profiles] isDono === false?", isDono === false)
      console.log("[Chat Profiles] ====================================")
    } else {
      console.error("[Chat Profiles] ⚠️ AuthContext não encontrado, tentando fallback...")
      
      // Fallback: usar empresa do header diretamente
      const selectedEmpresaId = request.headers.get("x-selected-empresa")
      if (selectedEmpresaId) {
        empresaId = selectedEmpresaId
        console.log("[Chat Profiles] ✅ Usando empresa do header (fallback):", empresaId)
        
        // IMPORTANTE: Mesmo no fallback, precisamos verificar se é dono!
        // Buscar membro usando x-user-id para verificar o cargo
        const xUserId = request.headers.get("x-user-id")
        if (xUserId) {
          console.log("[Chat Profiles] 🔍 FALLBACK: Buscando membro para verificar cargo...")
          const { data: membroFallback, error: membroFallbackError } = await supabase
            .from("membros")
            .select("cargo, id_perfil")
            .eq("id_perfil", xUserId)
            .eq("id_empresa", empresaId)
            .maybeSingle()
          
          console.log("[Chat Profiles] 🔍 FALLBACK: Resultado da busca:", {
            encontrado: !!membroFallback,
            membroFallback: membroFallback,
            erro: membroFallbackError?.message
          })
          
          if (membroFallback) {
            const cargoValue = membroFallback.cargo
            const cargoTrimmed = cargoValue?.trim()
            isDono = cargoTrimmed === 'dono'
            perfilIdAtual = membroFallback.id_perfil
            
            console.log("[Chat Profiles] 🔍 FALLBACK: Cargo encontrado:", {
              cargo: cargoValue,
              cargo_trimmed: cargoTrimmed,
              isDono: isDono
            })
          } else {
            console.warn("[Chat Profiles] ⚠️ FALLBACK: Membro não encontrado, isDono permanece false")
          }
        }
      } else {
        console.error("[Chat Profiles] ❌ Nenhuma empresa encontrada")
        return NextResponse.json(
          { success: false, error: "Não autenticado - empresa não identificada" },
          { status: 401 }
        )
      }
    }
    
    if (!empresaId) {
      console.error("[Chat Profiles] ❌ empresaId não encontrado")
      return NextResponse.json(
        { success: false, error: "Empresa não identificada" },
        { status: 400 }
      )
    }

    // Se for dono, buscar todos os perfis da empresa
    // Se não for, buscar apenas o perfil do usuário atual
    let query = supabase
      .from("perfis")
      .select("id, nome_completo, email")
      .order("nome_completo", { ascending: true })

    // Obter x-user-id do header (ID do usuário autenticado = id_perfil na tabela membros)
    const xUserId = request.headers.get("x-user-id")
    console.log("[Chat Profiles] X-User-Id do header:", xUserId)
    
    if (isDono) {
      // Dono: buscar todos os perfis que têm membros na empresa
      console.log("[Chat Profiles] 👑 DONO - buscando todos os perfis da empresa:", empresaId)
      
      // Buscar todos os membros ativos da empresa
      const { data: membrosEmpresa, error: membrosError } = await supabase
        .from("membros")
        .select("id_perfil")
        .eq("id_empresa", empresaId)
        .eq("ativo", "TRUE") // PostgreSQL usa TRUE em maiúsculas
      
      console.log("[Chat Profiles] Membros da empresa encontrados:", {
        total: membrosEmpresa?.length || 0,
        membros: membrosEmpresa,
        error: membrosError?.message
      })
      
      if (membrosError) {
        console.error("[Chat Profiles] ❌ Erro ao buscar membros:", membrosError)
        return NextResponse.json(
          { success: false, error: membrosError.message },
          { status: 500 }
        )
      }
      
      if (membrosEmpresa && membrosEmpresa.length > 0) {
        // Filtrar apenas membros com id_perfil válido
        const perfisIds = [...new Set(membrosEmpresa
          .map((m: any) => m.id_perfil)
          .filter((id: any) => id !== null && id !== undefined))]
        
        console.log("[Chat Profiles] IDs de perfis únicos encontrados:", perfisIds)
        
        if (perfisIds.length > 0) {
          query = query.in("id", perfisIds)
          console.log("[Chat Profiles] ✅ Filtrando perfis por IDs:", perfisIds)
        } else {
          console.warn("[Chat Profiles] ⚠️ Nenhum id_perfil válido encontrado nos membros")
          return NextResponse.json({
            success: true,
            perfis: []
          })
        }
      } else {
        console.log("[Chat Profiles] ⚠️ Nenhum membro ativo encontrado na empresa")
        return NextResponse.json({
          success: true,
          perfis: []
        })
      }
    } else {
      // Usuário comum: buscar apenas o próprio perfil
      // O perfil do usuário é identificado pelo x-user-id que corresponde ao id_perfil na tabela membros
      if (xUserId) {
        // Verificar se existe um membro com id_perfil = xUserId e id_empresa = empresaId
        const { data: membroUsuario, error: membroError } = await supabase
          .from("membros")
          .select("id_perfil")
          .eq("id_empresa", empresaId)
          .eq("id_perfil", xUserId)
          .eq("ativo", "TRUE")
          .maybeSingle()
        
        console.log("[Chat Profiles] Busca de membro do usuário:", {
          xUserId,
          empresaId,
          membroUsuario,
          membroError: membroError?.message
        })
        
        if (membroUsuario && membroUsuario.id_perfil) {
          perfilIdAtual = membroUsuario.id_perfil
          console.log("[Chat Profiles] ✅ Perfil ID encontrado via x-user-id:", perfilIdAtual)
        } else {
          console.warn("[Chat Profiles] ⚠️ Membro não encontrado com id_perfil = x-user-id")
        }
      }
      
      if (!perfilIdAtual) {
        console.error("[Chat Profiles] ❌ Perfil ID não encontrado para usuário comum")
        console.error("[Chat Profiles] Detalhes:", {
          xUserId,
          empresaId,
          membroId: membroAtual?.id,
          membroIdUsuario: membroAtual?.id_usuario,
          membroCargo: membroAtual?.cargo
        })
        return NextResponse.json(
          { 
            success: false, 
            error: "Perfil não identificado. Verifique se o membro tem id_perfil correspondente ao x-user-id.",
            debug: {
              xUserId,
              empresaId,
              membroId: membroAtual?.id,
              membroIdUsuario: membroAtual?.id_usuario,
              membroCargo: membroAtual?.cargo
            }
          },
          { status: 400 }
        )
      }
      query = query.eq("id", perfilIdAtual)
      console.log("[Chat Profiles] 👤 Usuário comum - buscando apenas perfil:", perfilIdAtual)
    }

    const { data: perfis, error: perfisError } = await query

    if (perfisError) {
      console.error("[Chat Profiles] ❌ Erro ao buscar perfis:", perfisError)
      return NextResponse.json(
        { success: false, error: perfisError.message },
        { status: 500 }
      )
    }
    
    console.log("[Chat Profiles] ✅ Perfis encontrados:", perfis?.length || 0)

    console.log("[Chat Profiles] ✅ Perfis encontrados:", {
      total: perfis?.length || 0,
      perfis: perfis?.map((p: any) => ({ id: p.id, nome: p.nome_completo, email: p.email }))
    })
    
    console.log("[Chat Profiles] ========================================")
    console.log("[Chat Profiles] 📤 RESPOSTA FINAL QUE SERÁ ENVIADA")
    console.log("[Chat Profiles] ========================================")
    console.log("[Chat Profiles] success: true")
    console.log("[Chat Profiles] perfisCount:", perfis?.length || 0)
    console.log("[Chat Profiles] isDono ANTES do return:", isDono)
    console.log("[Chat Profiles] tipo de isDono:", typeof isDono)
    console.log("[Chat Profiles] isDono em JSON:", JSON.stringify(isDono))
    console.log("[Chat Profiles] isDono === true?", isDono === true)
    console.log("[Chat Profiles] isDono === false?", isDono === false)
    console.log("[Chat Profiles] empresaId:", empresaId)
    console.log("[Chat Profiles] perfilIdAtual:", perfilIdAtual)
    
    // Garantir que isDono seja explicitamente um boolean
    const isDonoFinal = Boolean(isDono)
    console.log("[Chat Profiles] isDonoFinal (após Boolean()):", isDonoFinal)
    console.log("[Chat Profiles] tipo de isDonoFinal:", typeof isDonoFinal)
    console.log("[Chat Profiles] isDonoFinal === true?", isDonoFinal === true)
    
    const respostaFinal = {
      success: true,
      perfis: perfis || [],
      isDono: isDonoFinal
    }
    
    console.log("[Chat Profiles] Objeto respostaFinal:", JSON.stringify(respostaFinal, null, 2))
    console.log("[Chat Profiles] respostaFinal.isDono:", respostaFinal.isDono)
    console.log("[Chat Profiles] tipo de respostaFinal.isDono:", typeof respostaFinal.isDono)
    console.log("[Chat Profiles] ========================================")

    return NextResponse.json(respostaFinal)
  } catch (error: any) {
    console.error("[Chat Profiles] Erro:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

