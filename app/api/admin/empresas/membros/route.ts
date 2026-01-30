import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET - Listar membros de uma empresa específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get("empresa_id")

    if (!empresaId) {
      return NextResponse.json(
        { error: "empresa_id é obrigatório" },
        { status: 400 }
      )
    }

    const { data: membros, error } = await supabase
      .from("membros")
      .select("*")
      .eq("id_empresa", empresaId)
      .order("criado_em", { ascending: false })

    if (error) {
      console.error("Error fetching membros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      membros: membros || [],
      total: membros?.length || 0
    })
  } catch (error: any) {
    console.error("Error in GET /api/admin/empresas/membros:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Adicionar membro a uma empresa
export async function POST(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Admin Membros] Variáveis de ambiente não configuradas")
      return NextResponse.json(
        { error: "Configuração do servidor incompleta" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { id_empresa, nome, email, cargo, id_usuario } = body

    if (!id_empresa || !nome || !email) {
      return NextResponse.json(
        { error: "id_empresa, nome e email são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se já existe um membro com este email nesta empresa
    const { data: membroExistente } = await supabase
      .from("membros")
      .select("id")
      .eq("email", email)
      .eq("id_empresa", id_empresa)
      .single()

    if (membroExistente) {
      return NextResponse.json(
        { error: "Já existe um membro com este email nesta empresa" },
        { status: 400 }
      )
    }

    let userId = id_usuario

    // Se não foi fornecido id_usuario, criar usuário no Supabase Auth
    if (!userId) {
      // Primeiro, verificar se o usuário já existe no Auth
      console.log("[Admin Membros] Verificando se usuário já existe no Auth:", email)
      
      // Testar se temos acesso ao admin API
      const { data: testList, error: testError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
      
      if (testError) {
        console.error("[Admin Membros] ERRO ao acessar Admin API:", testError)
        return NextResponse.json(
          { 
            error: `Erro de configuração: Não foi possível acessar o Supabase Auth Admin API. Verifique se a SUPABASE_SERVICE_ROLE_KEY está correta e tem permissões de admin. Erro: ${testError.message}` 
          },
          { status: 500 }
        )
      }
      
      const { data: usersList, error: listError } = await supabase.auth.admin.listUsers()
      
      if (!listError && usersList?.users) {
        const existingUser = usersList.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
        if (existingUser) {
          // Usar o ID exato do Supabase Auth (auth.users.id)
          userId = existingUser.id
          console.log("[Admin Membros] ✅ Usuário já existe no Supabase Auth")
          console.log("[Admin Membros] ID do Auth (auth.users.id):", userId)
          console.log("[Admin Membros] Este ID será usado como id_usuario na tabela membros")
        }
      } else if (listError) {
        console.error("[Admin Membros] Erro ao listar usuários:", listError)
        return NextResponse.json(
          { 
            error: `Erro ao verificar usuários existentes: ${listError.message}. Verifique as permissões do Service Role Key.` 
          },
          { status: 500 }
        )
      }

      // Se não encontrou usuário existente, criar novo
      if (!userId) {
        // Gerar senha temporária forte (mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial)
        const generatePassword = () => {
          const length = 16
          const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
          let password = ""
          // Garantir pelo menos um de cada tipo
          password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)] // Maiúscula
          password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] // Minúscula
          password += "0123456789"[Math.floor(Math.random() * 10)] // Número
          password += "!@#$%^&*"[Math.floor(Math.random() * 8)] // Especial
          // Preencher o resto
          for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)]
          }
          // Embaralhar
          return password.split('').sort(() => Math.random() - 0.5).join('')
        }
        
        const tempPassword = generatePassword()
        console.log("[Admin Membros] Tentando criar novo usuário no Auth:", email)
        
        // Tentar criar usuário no Supabase Auth
        console.log("[Admin Membros] Tentando criar usuário no Auth com email:", email.toLowerCase().trim())
        
        const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          password: tempPassword,
          email_confirm: true, // Confirmar email automaticamente
          user_metadata: {
            name: nome,
            full_name: nome
          },
          app_metadata: {
            provider: 'email'
          }
        })
        
        console.log("[Admin Membros] Resposta do createUser:", {
          hasUser: !!newUser?.user,
          hasError: !!authError,
          errorMessage: authError?.message,
          errorStatus: authError?.status
        })

        if (authError) {
          console.error("[Admin Membros] ERRO ao criar usuário no Auth:", {
            message: authError.message,
            status: authError.status,
            name: authError.name,
            fullError: JSON.stringify(authError, null, 2)
          })
          
          // Se o erro for de usuário já existente, tentar buscar novamente
          const isUserExistsError = 
            authError.message?.toLowerCase().includes("already registered") || 
            authError.message?.toLowerCase().includes("already exists") ||
            authError.message?.toLowerCase().includes("user already registered") ||
            authError.message?.toLowerCase().includes("email already registered")
          
          if (isUserExistsError) {
            console.log("[Admin Membros] Usuário já existe, buscando ID...")
            
            // Buscar usuário existente novamente
            const { data: usersList2, error: listError2 } = await supabase.auth.admin.listUsers()
            
            if (!listError2 && usersList2?.users) {
              const existingUser2 = usersList2.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
              if (existingUser2) {
                userId = existingUser2.id
                console.log("[Admin Membros] ✅ Usuário encontrado após erro, usando ID:", userId)
              } else {
                return NextResponse.json(
                  { error: "Usuário já existe mas não foi possível localizá-lo. Tente novamente." },
                  { status: 500 }
                )
              }
            } else {
              return NextResponse.json(
                { error: `Falha ao verificar usuário existente: ${listError2?.message || authError.message}` },
                { status: 500 }
              )
            }
          } else {
            // Outro tipo de erro - NÃO criar membro
            console.error("[Admin Membros] ❌ Erro não relacionado a usuário existente. NÃO criando membro.")
            
            // Verificar se é erro de configuração
            if (authError.message?.includes("Database error") || authError.message?.includes("service_role")) {
              return NextResponse.json(
                { 
                  error: `Erro de configuração do Supabase Auth: ${authError.message}. Verifique se a SUPABASE_SERVICE_ROLE_KEY está correta e tem permissões de admin no Supabase Dashboard > Settings > API.` 
                },
                { status: 500 }
              )
            }
            
            return NextResponse.json(
              { 
                error: `Falha ao criar usuário no sistema de autenticação: ${authError.message || "Erro desconhecido"}. O membro não pode ser criado sem login e senha.` 
              },
              { status: 500 }
            )
          }
        } else if (newUser?.user) {
          // Usar o ID exato do Supabase Auth (auth.users.id)
          userId = newUser.user.id
          console.log("[Admin Membros] ✅ Usuário criado com sucesso no Auth.")
          console.log("[Admin Membros] ID do Auth (auth.users.id):", userId)
          console.log("[Admin Membros] Email:", newUser.user.email)
          console.log("[Admin Membros] Este ID será usado como id_usuario na tabela membros")
        } else {
          console.error("[Admin Membros] ❌ Resposta inválida do createUser:", { newUser, authError })
          return NextResponse.json(
            { error: "Falha ao criar usuário: resposta inválida do servidor de autenticação" },
            { status: 500 }
          )
        }
      }
    }
    
    // CRÍTICO: Garantir que temos um userId (ID do Supabase Auth) antes de criar o membro
    // O membro PRECISA ter um usuário no Auth para fazer login
    // O id_usuario na tabela membros DEVE ser o mesmo ID do auth.users
    if (!userId) {
      console.error("[Admin Membros] ERRO CRÍTICO: Tentativa de criar membro sem userId do Auth")
      return NextResponse.json(
        { 
          error: "Não foi possível criar ou localizar o usuário no sistema de autenticação. O membro não pode ser criado sem login e senha. Verifique as configurações do Supabase Auth e as permissões do Service Role Key." 
        },
        { status: 500 }
      )
    }
    
    // Validar que o userId é um UUID válido (formato do Supabase Auth)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      console.error("[Admin Membros] ERRO: userId não é um UUID válido:", userId)
      return NextResponse.json(
        { 
          error: "ID do usuário inválido. O ID deve ser um UUID válido do Supabase Auth." 
        },
        { status: 500 }
      )
    }
    
    console.log("[Admin Membros] ✅ Prosseguindo com criação do membro.")
    console.log("[Admin Membros] id_usuario (mesmo ID do Supabase Auth):", userId)

    // Criar membro na tabela membros
    // IMPORTANTE: id_usuario DEVE ser o mesmo ID do Supabase Auth (auth.users.id)
    console.log("[Admin Membros] Criando membro na tabela membros...")
    console.log("[Admin Membros] id_usuario (ID do Supabase Auth):", userId)
    console.log("[Admin Membros] Este ID é o mesmo de auth.users.id e será usado para login")
    
    const { data: membro, error } = await supabase
      .from("membros")
      .insert({
        id_empresa,
        nome,
        email: email.toLowerCase().trim(),
        cargo: cargo || "membro",
        id_usuario: userId, // MESMO ID do Supabase Auth (auth.users.id) - usado para login
        eh_superadmin: false,
        ativo: true
      })
      .select()
      .single()

    if (error) {
      console.error("[Admin Membros] Erro ao criar membro na tabela:", error)
      
      // Se falhar ao criar membro, tentar remover o usuário criado no Auth (rollback)
      if (userId && !id_usuario) {
        console.log("[Admin Membros] Tentando fazer rollback - removendo usuário do Auth:", userId)
        try {
          await supabase.auth.admin.deleteUser(userId)
          console.log("[Admin Membros] Rollback concluído - usuário removido do Auth")
        } catch (rollbackError) {
          console.error("[Admin Membros] Erro ao fazer rollback:", rollbackError)
        }
      }
      
      return NextResponse.json({ 
        error: `Falha ao criar membro: ${error.message}` 
      }, { status: 500 })
    }

    console.log("[Admin Membros] ✅ Membro criado com sucesso!")
    console.log("[Admin Membros] ID do membro:", membro.id)
    console.log("[Admin Membros] id_usuario (mesmo ID do Supabase Auth):", membro.id_usuario)
    console.log("[Admin Membros] Verificação: id_usuario === auth.users.id:", membro.id_usuario === userId)
    
    // Validação final: garantir que o id_usuario salvo é o mesmo do Auth
    if (membro.id_usuario !== userId) {
      console.error("[Admin Membros] ⚠️ ATENÇÃO: id_usuario salvo não corresponde ao ID do Auth!")
      console.error("[Admin Membros] ID do Auth:", userId)
      console.error("[Admin Membros] ID salvo no membro:", membro.id_usuario)
    } else {
      console.log("[Admin Membros] ✅ Confirmação: id_usuario está correto e corresponde ao Supabase Auth")
    }

    return NextResponse.json({
      success: true,
      membro,
      message: "Membro criado com sucesso. Um usuário foi criado no sistema de autenticação com login e senha. O id_usuario corresponde ao ID do Supabase Auth.",
      auth_user_id: userId // Retornar o ID do Auth para confirmação
    })
  } catch (error: any) {
    console.error("[Admin Membros] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar membro
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const { data: membro, error } = await supabase
      .from("membros")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating membro:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      membro
    })
  } catch (error: any) {
    console.error("Error in PUT /api/admin/empresas/membros:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remover membro
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase
      .from("membros")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting membro:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/empresas/membros:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

