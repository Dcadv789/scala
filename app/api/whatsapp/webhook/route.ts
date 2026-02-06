import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar Supabase com verificacao
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[Webhook] ERRO CRITICO: Variaveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao configuradas!")
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "")

// GET - Verificacao do webhook pelo Facebook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("[Webhook GET] Verificacao recebida:", { mode, token, challenge: challenge?.substring(0, 20) })

  if (!challenge) {
    return new Response("Missing challenge", { status: 400 })
  }

  // Validar token - deve ser exatamente "scalazap_verify_token_2024" ou começar com "scalazap"
  const validToken = "scalazap_verify_token_2024"
  const isValidToken = token === validToken || (token && token.startsWith("scalazap"))
  
  if (mode === "subscribe" && isValidToken) {
    console.log("[Webhook GET] ✅ Verificação APROVADA")
    console.log("[Webhook GET] Token recebido:", token?.substring(0, 20) + "...")
    console.log("[Webhook GET] Challenge:", challenge?.substring(0, 20) + "...")
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } })
  }

  console.log("[Webhook GET] ❌ Verificação REJEITADA")
  console.log("[Webhook GET] Motivo:", {
    mode,
    hasToken: !!token,
    tokenMatch: token === validToken,
    tokenStartsWith: token?.startsWith("scalazap")
  })
  return new Response("Forbidden", { status: 403 })
}

// POST - Receber mensagens do WhatsApp
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    
    console.log("[Webhook POST] ====== WEBHOOK RECEBIDO ======")
    console.log("[Webhook POST] Payload:", JSON.stringify(body, null, 2))
    
    // SEMPRE salvar o log bruto primeiro
    const { error: logError } =     await supabase.from("logs_webhook_whatsapp").insert({
      dados: body,
      origem: "whatsapp_post",
      criado_em: new Date().toISOString()
    })
    
    if (logError) {
      console.error("[Webhook POST] ERRO ao salvar log:", logError.message)
    } else {
      console.log("[Webhook POST] Log salvo com sucesso")
    }

    // Verificar se tem mensagens
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages
    
    console.log("[Webhook POST] Entry:", !!entry)
    console.log("[Webhook POST] Changes:", !!changes)
    console.log("[Webhook POST] Value:", !!value)
    console.log("[Webhook POST] Messages:", messages?.length || 0)

    if (messages && messages.length > 0) {
      const contacts = value.contacts || []
      const phoneNumberId = value.metadata?.phone_number_id || "unknown"
      
      console.log("[Webhook POST] ====== PROCESSANDO MENSAGENS ======")
      console.log("[Webhook POST] 📞 Phone Number ID recebido do webhook:", phoneNumberId)
      console.log("[Webhook POST] 📋 Metadata completa:", JSON.stringify(value.metadata, null, 2))
      console.log("[Webhook POST] 👥 Contacts recebidos:", contacts.length)

      // 1. Identificar a empresa pelo phone_number_id na tabela conexoes
      console.log("[Webhook POST] 🔍 Buscando conexão no banco com id_numero_telefone:", phoneNumberId)
      const { data: conexao, error: conexaoError } = await supabase
        .from("conexoes")
        .select("id_empresa, id, id_numero_telefone, nome")
        .eq("id_numero_telefone", phoneNumberId)
        .eq("status", "connected")
        .single()

      if (conexaoError) {
        console.error("[Webhook POST] ❌ ERRO ao buscar conexão:", conexaoError.message)
        console.error("[Webhook POST] 📋 Detalhes do erro:", conexaoError)
        
        // Tentar buscar sem filtro de status para debug
        const { data: conexaoSemStatus } = await supabase
          .from("conexoes")
          .select("id_empresa, id, id_numero_telefone, nome, status")
          .eq("id_numero_telefone", phoneNumberId)
          .maybeSingle()
        
        if (conexaoSemStatus) {
          console.log("[Webhook POST] ⚠️ Conexão encontrada mas com status diferente:", conexaoSemStatus.status)
        } else {
          console.error("[Webhook POST] ❌ Nenhuma conexão encontrada com id_numero_telefone:", phoneNumberId)
          // Listar todas as conexões para debug
          const { data: todasConexoes } = await supabase
            .from("conexoes")
            .select("id, id_numero_telefone, nome, status")
            .limit(10)
          console.log("[Webhook POST] 📋 Primeiras 10 conexões no banco:", todasConexoes)
        }
      } else if (conexao) {
        console.log("[Webhook POST] ✅ Conexão encontrada:", {
          id: conexao.id,
          nome: conexao.nome,
          id_numero_telefone: conexao.id_numero_telefone,
          id_empresa: conexao.id_empresa
        })
      } else {
        console.error("[Webhook POST] ❌ Conexão não encontrada para phone_number_id:", phoneNumberId)
      }

      let idEmpresa = conexao?.id_empresa
      let idConexao = conexao?.id

      console.log("[Webhook POST] 🏢 Empresa identificada:", idEmpresa)
      console.log("[Webhook POST] 🔗 ID da conexão:", idConexao)
      
      // Validação: Se não encontrou conexão, tentar buscar por qualquer status
      if (!conexao && phoneNumberId !== "unknown") {
        console.log("[Webhook POST] ⚠️ Conexão não encontrada com status 'connected', tentando buscar sem filtro de status...")
        const { data: conexaoQualquerStatus } = await supabase
          .from("conexoes")
          .select("id_empresa, id, id_numero_telefone, nome, status")
          .eq("id_numero_telefone", phoneNumberId)
          .maybeSingle()
        
        if (conexaoQualquerStatus) {
          console.log("[Webhook POST] ✅ Conexão encontrada (status:", conexaoQualquerStatus.status, "):", conexaoQualquerStatus.id)
          // Usar esta conexão mesmo que não esteja com status "connected"
          if (!idEmpresa) {
            idEmpresa = conexaoQualquerStatus.id_empresa
            console.log("[Webhook POST] 🔄 Usando empresa da conexão encontrada (fallback):", idEmpresa)
          }
          if (!idConexao) {
            idConexao = conexaoQualquerStatus.id
            console.log("[Webhook POST] 🔄 Usando ID da conexão encontrada (fallback):", idConexao)
          }
        }
      }

      for (const message of messages) {
        const contact = contacts.find((c: any) => c.wa_id === message.from)
        const contactName = contact?.profile?.name || message.from
        const phoneNumber = message.from.replace(/\D/g, "") // Limpar número
        
        let text = ""
        let msgType: "text" | "image" | "audio" | "video" | "document" = "text"
        let mediaUrl: string | null = null
        
        if (message.type === "text") {
          text = message.text?.body || ""
        } else if (message.type === "image") {
          text = message.image?.caption || "[Imagem]"
          msgType = "image"
          mediaUrl = message.image?.id ? `https://graph.facebook.com/v18.0/${message.image.id}` : null
        } else if (message.type === "audio") {
          text = "[Audio]"
          msgType = "audio"
          mediaUrl = message.audio?.id ? `https://graph.facebook.com/v18.0/${message.audio.id}` : null
        } else if (message.type === "video") {
          text = message.video?.caption || "[Video]"
          msgType = "video"
          mediaUrl = message.video?.id ? `https://graph.facebook.com/v18.0/${message.video.id}` : null
        } else if (message.type === "document") {
          text = message.document?.filename || "[Documento]"
          msgType = "document"
          mediaUrl = message.document?.id ? `https://graph.facebook.com/v18.0/${message.document.id}` : null
        } else {
          text = `[${message.type || "Mensagem"}]`
        }

        console.log("[Webhook POST] Processando mensagem:", {
          id: message.id,
          from: message.from,
          contact: contactName,
          text: text.substring(0, 50),
          type: msgType,
          empresa: idEmpresa
        })

        // 2. Criar ou atualizar contato na tabela contatos
        let idContato: string | null = null

        if (idEmpresa) {
          // Buscar contato existente
          const { data: contatoExistente } = await supabase
            .from("contatos")
            .select("id, nome")
            .eq("telefone", phoneNumber)
            .eq("id_empresa", idEmpresa)
            .single()

          if (contatoExistente) {
            idContato = contatoExistente.id
            // Atualizar ultima_mensagem_em
            await supabase
              .from("contatos")
              .update({ 
                atualizado_em: new Date().toISOString(),
                nome: contactName || contatoExistente.nome
              })
              .eq("id", idContato)
          } else {
            // Criar novo contato
            const { data: novoContato, error: contatoError } = await supabase
              .from("contatos")
              .insert({
                nome: contactName,
                telefone: phoneNumber,
                id_empresa: idEmpresa,
                status: "active",
                criado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
              })
              .select("id")
              .single()

            if (contatoError) {
              console.error("[Webhook POST] ERRO ao criar contato:", contatoError.message)
            } else {
              idContato = novoContato.id
              console.log("[Webhook POST] Contato criado:", idContato)
            }
          }
        }

        // 3. Salvar mensagem na tabela mensagens (principal)
        console.log("[Webhook POST] 💾 Salvando mensagem na tabela 'mensagens'...")
        const mensagemData = {
          id: message.id,
          id_empresa: idEmpresa || null,
          id_contato: idContato,
          id_conexao: idConexao || null,
          direcao: "entrada",
          status: "recebido",
          tipo_midia: msgType,
          conteudo: text,
          url_midia: mediaUrl,
          id_mensagem_whatsapp: message.id,
          criado_em: new Date(Number(message.timestamp) * 1000).toISOString(),
          atualizado_em: new Date().toISOString()
        }
        
        console.log("[Webhook POST] 📋 Dados da mensagem a salvar:", {
          id: mensagemData.id,
          id_empresa: mensagemData.id_empresa,
          id_contato: mensagemData.id_contato,
          id_conexao: mensagemData.id_conexao,
          tipo_midia: mensagemData.tipo_midia,
          conteudo_preview: mensagemData.conteudo.substring(0, 50)
        })
        
        const { error: msgError } = await supabase.from("mensagens").insert(mensagemData)

        if (msgError) {
          console.error("[Webhook POST] ❌ ERRO ao salvar mensagem na tabela 'mensagens':", msgError.message)
          console.error("[Webhook POST] 📋 Detalhes do erro:", msgError.details)
          console.error("[Webhook POST] 📋 Código do erro:", msgError.code)
        } else {
          console.log("[Webhook POST] ✅ Mensagem salva com sucesso na tabela 'mensagens':", message.id)
        }

        // 4. Também salvar na mensagens_webhook para compatibilidade
        console.log("[Webhook POST] 💾 Salvando mensagem na tabela 'mensagens_webhook' (compatibilidade)...")
        try {
          const webhookData = {
            id: message.id,
            numero_remetente: message.from,
            numero_destinatario: value.metadata?.display_phone_number || phoneNumberId,
            nome_contato: contactName,
            texto_mensagem: text,
            tipo_mensagem: msgType,
            id_numero_telefone: phoneNumberId,
            data_hora: new Date(Number(message.timestamp) * 1000).toISOString(),
            e_de_mim: false,
            processado: false,
            respondido: false,
            id_empresa: idEmpresa || null
          }
          
          console.log("[Webhook POST] 📋 Dados para mensagens_webhook:", {
            id: webhookData.id,
            id_numero_telefone: webhookData.id_numero_telefone,
            id_empresa: webhookData.id_empresa,
            numero_remetente: webhookData.numero_remetente
          })
          
          const { error: webhookError } = await supabase.from("mensagens_webhook").insert(webhookData)
          
          if (webhookError) {
            console.error("[Webhook POST] ❌ ERRO ao salvar em mensagens_webhook:", webhookError.message)
          } else {
            console.log("[Webhook POST] ✅ Mensagem salva com sucesso na tabela 'mensagens_webhook':", message.id)
          }
        } catch (e: any) {
          console.error("[Webhook POST] ❌ Exceção ao salvar em mensagens_webhook:", e.message)
        }
      }
    } else {
      console.log("[Webhook POST] Nenhuma mensagem no payload (pode ser status update)")
    }

    const elapsed = Date.now() - startTime
    console.log("[Webhook POST] Processamento concluido em", elapsed, "ms")
    console.log("[Webhook POST] ====== FIM ======")

    return new Response("EVENT_RECEIVED", { status: 200, headers: { "Content-Type": "text/plain" } })
  } catch (error: any) {
    console.error("[Webhook POST] ERRO CRITICO:", error.message)
    return new Response("EVENT_RECEIVED", { status: 200 })
  }
}
