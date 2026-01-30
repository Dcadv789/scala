import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

serve(async (req) => {
  console.log("=".repeat(50))
  console.log(`[Webhook] ${req.method} recebido em: ${new Date().toISOString()}`)
  console.log(`[Webhook] URL: ${req.url}`)
  console.log("=".repeat(50))
  
  if (req.method === "OPTIONS") {
    console.log("[Webhook] OPTIONS request - retornando OK")
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[Webhook] ERRO: Variáveis de ambiente não configuradas")
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === "GET") {
      console.log("[Webhook GET] ====== REQUISIÇÃO DE VERIFICAÇÃO RECEBIDA ======")
      console.log("[Webhook GET] URL completa:", req.url)
      
      const url = new URL(req.url)
      const mode = url.searchParams.get("hub.mode")
      const token = url.searchParams.get("hub.verify_token")
      const challenge = url.searchParams.get("hub.challenge")

      console.log("[Webhook GET] Parâmetros extraídos:", { 
        mode, 
        token: token ? `${token.substring(0, 20)}... (length: ${token.length})` : "null",
        challenge: challenge ? `${challenge.substring(0, 20)}... (length: ${challenge.length})` : "null"
      })

      if (!mode) {
        console.log("[Webhook GET] ❌ ERRO: hub.mode não encontrado")
        return new Response("Missing hub.mode parameter", { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/plain; charset=utf-8"
          } 
        })
      }

      if (!challenge) {
        console.log("[Webhook GET] ❌ ERRO: hub.challenge não encontrado")
        return new Response("Missing hub.challenge parameter", { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/plain; charset=utf-8"
          } 
        })
      }

      if (!token) {
        console.log("[Webhook GET] ❌ ERRO: hub.verify_token não encontrado")
        return new Response("Missing hub.verify_token parameter", { 
          status: 403, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/plain; charset=utf-8"
          } 
        })
      }

      const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "scalazap_verify_token_2024"
      
      console.log("[Webhook GET] Token esperado:", verifyToken.substring(0, 20) + "...")
      console.log("[Webhook GET] Token recebido:", token.substring(0, 20) + "...")
      console.log("[Webhook GET] Tokens são iguais?", token === verifyToken)
      console.log("[Webhook GET] Token começa com 'scalazap'?", token.startsWith("scalazap"))
      
      const isValidToken = token === verifyToken || (token && token.startsWith("scalazap"))
      const isValidMode = mode === "subscribe"

      console.log("[Webhook GET] Validações:", {
        isValidToken,
        isValidMode,
        mode,
        tokenMatch: token === verifyToken,
        tokenStartsWithScalazap: token.startsWith("scalazap")
      })

      if (isValidMode && isValidToken) {
        console.log("[Webhook GET] ✅ VERIFICAÇÃO APROVADA")
        console.log("[Webhook GET] Retornando challenge:", challenge.substring(0, 30) + "...")
        
        return new Response(challenge, { 
          status: 200, 
          headers: { 
            "Content-Type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          } 
        })
      }

      console.log("[Webhook GET] ❌ VERIFICAÇÃO REJEITADA")
      console.log("[Webhook GET] Motivo:", {
        modeValid: isValidMode,
        tokenValid: isValidToken,
        mode,
        tokenReceived: token.substring(0, 20) + "...",
        tokenExpected: verifyToken.substring(0, 20) + "..."
      })
      
      return new Response("Forbidden - Invalid verify token or mode", { 
        status: 403, 
        headers: { 
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        } 
      })
    }

    if (req.method === "POST") {
      console.log("[Webhook POST] ====== INICIANDO PROCESSAMENTO POST ======")
      
      let bodyText: string
      try {
        bodyText = await req.text()
        console.log("[Webhook POST] Body recebido (primeiros 500 chars):", bodyText.substring(0, 500))
      } catch (readError) {
        console.error("[Webhook POST] ERRO ao ler body:", readError)
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }
      
      let body: any
      try {
        body = JSON.parse(bodyText)
        console.log("[Webhook POST] JSON parseado com sucesso")
      } catch (parseError) {
        console.error("[Webhook POST] ERRO ao fazer parse do JSON:", parseError)
        console.error("[Webhook POST] Body que falhou:", bodyText.substring(0, 200))
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }
      
      console.log("[Webhook POST] ====== WEBHOOK RECEBIDO ======")
      console.log("[Webhook POST] Payload completo:", JSON.stringify(body, null, 2))

      console.log("[Webhook POST] Estrutura do payload:")
      console.log("  - body.entry existe?", !!body.entry)
      console.log("  - body.entry[0] existe?", !!body.entry?.[0])
      
      const entry = body.entry?.[0]
      console.log("  - entry.changes existe?", !!entry?.changes)
      console.log("  - entry.changes[0] existe?", !!entry?.changes?.[0])
      
      const changes = entry?.changes?.[0]
      console.log("  - changes.value existe?", !!changes?.value)
      
      const value = changes?.value
      const messages = value?.messages || []
      const contacts = value?.contacts || []
      const phoneNumberId = value?.metadata?.phone_number_id

      console.log("[Webhook POST] Phone Number ID recebido:", phoneNumberId)
      console.log("[Webhook POST] Messages count:", messages.length)
      console.log("[Webhook POST] Contacts count:", contacts.length)
      
      if (phoneNumberId === "123456123" || phoneNumberId === "0") {
        console.log("[Webhook POST] ⚠️ WEBHOOK DE TESTE DETECTADO (phone_number_id: " + phoneNumberId + ")")
        console.log("[Webhook POST] Este é um webhook de teste do Meta, não uma mensagem real.")
        console.log("[Webhook POST] Mensagens reais terão um phone_number_id diferente (o ID real da sua conexão).")
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }
      
      const field = changes?.field
      if (field === "message_template_status_update") {
        console.log("[Webhook POST] ====== EVENTO DE STATUS DE TEMPLATE DETECTADO ======")
        console.log("[Webhook POST] Processando atualização de status de template...")
        console.log("[Webhook POST] Payload completo do evento:", JSON.stringify(value, null, 2))
        
        const templateId = value?.message_template_id
        const event = value?.event
        const reason = value?.reason
        
        console.log("[Webhook POST] Dados extraídos:", {
          message_template_id: templateId,
          event: event,
          reason: reason
        })
        
        if (!templateId) {
          console.log("[Webhook POST] ⚠️ Template ID não encontrado no payload")
          console.log("[Webhook POST] Payload completo:", JSON.stringify(value, null, 2))
          return new Response("OK", { 
            status: 200, 
            headers: corsHeaders 
          })
        }
        
        if (!event) {
          console.log("[Webhook POST] ⚠️ Evento (status) não encontrado no payload")
          return new Response("OK", { 
            status: 200, 
            headers: corsHeaders 
          })
        }
        
        const updateData: any = {
          status: event.toUpperCase(),
          atualizado_em: new Date().toISOString()
        }
        
        if (event.toUpperCase() === "REJECTED" && reason) {
          updateData.motivo_rejeicao = reason
          console.log("[Webhook POST] Motivo da rejeição:", reason)
        } else {
          updateData.motivo_rejeicao = null
        }
        
        console.log("[Webhook POST] Dados que serão atualizados:", JSON.stringify(updateData, null, 2))
        console.log("[Webhook POST] Buscando template com id_meta:", templateId)
        
        const { data: updatedTemplate, error: updateError } = await supabase
          .from("modelos")
          .update(updateData)
          .eq("id_meta", String(templateId))
          .select("id, nome, status, motivo_rejeicao")
        
        if (updateError) {
          console.error("[Webhook POST] ❌ Erro ao atualizar status do template:", updateError)
          console.error("[Webhook POST] Detalhes do erro:", JSON.stringify(updateError, null, 2))
        } else {
          if (updatedTemplate && updatedTemplate.length > 0) {
            console.log("[Webhook POST] ✅ Status do template atualizado com sucesso!")
            console.log("[Webhook POST] Template atualizado:", {
              id: updatedTemplate[0].id,
              nome: updatedTemplate[0].nome,
              status: updatedTemplate[0].status,
              motivo_rejeicao: updatedTemplate[0].motivo_rejeicao
            })
          } else {
            console.log("[Webhook POST] ⚠️ Nenhum template encontrado com id_meta:", templateId)
            console.log("[Webhook POST] Isso pode significar que o template ainda não foi sincronizado do Meta.")
          }
        }
        
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }
      
      if (messages.length === 0) {
        console.log("[Webhook POST] ⚠️ Nenhuma mensagem encontrada no payload")
        console.log("[Webhook POST] Tipo de evento pode ser:", changes?.field || "desconhecido")
        console.log("[Webhook POST] Payload completo para análise:", JSON.stringify(body, null, 2))
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }

      if (!phoneNumberId) {
        console.error("[Webhook POST] ERRO: phone_number_id não encontrado no payload")
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }

      console.log("[Webhook POST] ====== BUSCANDO CONEXÃO ======")
      console.log("[Webhook POST] phone_number_id recebido:", phoneNumberId)
      console.log("[Webhook POST] Tipo do phone_number_id:", typeof phoneNumberId)
      console.log("[Webhook POST] Tamanho:", phoneNumberId?.length)
      
      let { data: conexao, error: conexaoError } = await supabase
        .from("conexoes")
        .select("id_empresa, id, id_numero_telefone, status, nome")
        .eq("id_numero_telefone", String(phoneNumberId))
        .single()

      console.log("[Webhook POST] Primeira busca (string):", {
        encontrou: !!conexao,
        erro: conexaoError?.message,
        conexao_id: conexao?.id,
        conexao_phone_id: conexao?.id_numero_telefone,
        conexao_status: conexao?.status
      })

        if (conexaoError || !conexao) {
          console.log("[Webhook POST] Tentando busca sem filtro de status...")
          const { data: conexao2, error: conexaoError2 } = await supabase
            .from("conexoes")
            .select("id_empresa, id, id_numero_telefone, status, nome, email_usuario, id_usuario, token_acesso")
            .eq("id_numero_telefone", String(phoneNumberId))
            .single()

        if (conexao2) {
          conexao = conexao2
          conexaoError = null
          console.log("[Webhook POST] ✅ Encontrado sem filtro de status:", conexao2)
        } else {
          console.log("[Webhook POST] Não encontrado sem filtro de status:", conexaoError2?.message)
        }
      }

      if (conexaoError || !conexao) {
        console.log("[Webhook POST] Listando TODAS as conexões para debug...")
        const { data: todasConexoes, error: todasError } = await supabase
          .from("conexoes")
          .select("id, id_numero_telefone, status, nome, id_empresa, email_usuario")
          .limit(10)

        console.log("[Webhook POST] Conexões encontradas no banco:", todasConexoes)
        console.log("[Webhook POST] Comparando phone_number_id:")
        todasConexoes?.forEach((c: any) => {
          console.log(`  - Conexão ${c.id}: id_numero_telefone="${c.id_numero_telefone}" (tipo: ${typeof c.id_numero_telefone}) vs recebido="${phoneNumberId}" (tipo: ${typeof phoneNumberId})`)
          console.log(`    São iguais? ${String(c.id_numero_telefone) === String(phoneNumberId)}`)
        })
      }

      if (conexaoError || !conexao || !conexao.id_empresa) {
        console.error("[Webhook POST] ❌ ERRO: Empresa não encontrada para phone_number_id:", phoneNumberId)
        console.error("[Webhook POST] Erro detalhado:", conexaoError)
        console.error("[Webhook POST] Isso significa que o phone_number_id do webhook não corresponde a nenhuma conexão no banco.")
        console.error("[Webhook POST] Verifique se o phone_number_id está correto na tabela conexoes.")
        return new Response("OK", { 
          status: 200, 
          headers: corsHeaders 
        })
      }

      console.log("[Webhook POST] ✅ Conexão encontrada:", {
        id: conexao.id,
        nome: conexao.nome,
        id_empresa: conexao.id_empresa,
        id_numero_telefone: conexao.id_numero_telefone,
        status: conexao.status
      })

      const idEmpresa = conexao.id_empresa
      console.log("[Webhook POST] ✅ Empresa identificada:", idEmpresa)

      const emailUsuario = conexao.email_usuario || null
      
      if (emailUsuario) {
        console.log("[Webhook POST] Email do usuário encontrado:", emailUsuario)
      } else {
        console.log("[Webhook POST] ⚠️ email_usuario não encontrado na conexão (opcional, continuando...)")
      }

      for (const message of messages) {
        const contact = contacts.find((c: any) => c.wa_id === message.from)
        const contactName = contact?.profile?.name || message.from
        const phoneNumber = message.from.replace(/\D/g, "")
        
        let fotoPerfil: string | null = null
        console.log("[Webhook POST] ====== INICIANDO BUSCA DE FOTO DE PERFIL ======")
        console.log("[Webhook POST] Verificando condições para buscar foto:")
        console.log("[Webhook POST]   - conexao.token_acesso existe?", !!conexao.token_acesso)
        console.log("[Webhook POST]   - conexao.id_numero_telefone:", conexao.id_numero_telefone)
        console.log("[Webhook POST]   - message.from (wa_id):", message.from)
        
        try {
          if (conexao.token_acesso && conexao.id_numero_telefone && message.from) {
            const profileUrl = `https://graph.facebook.com/v18.0/${conexao.id_numero_telefone}/contacts/${message.from}?fields=profile_picture_url&access_token=${conexao.token_acesso}`
            console.log("[Webhook POST] 📸 URL da API para buscar foto:", profileUrl.replace(conexao.token_acesso, "***TOKEN***"))
            console.log("[Webhook POST] 📸 Fazendo requisição para Meta Graph API...")
            
            const profileResponse = await fetch(profileUrl)
            console.log("[Webhook POST] 📸 Resposta da API - Status:", profileResponse.status, profileResponse.statusText)
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              console.log("[Webhook POST] 📸 Dados retornados pela API:", JSON.stringify(profileData, null, 2))
              
              if (profileData.profile_picture_url) {
                fotoPerfil = profileData.profile_picture_url
                console.log("[Webhook POST] ✅ FOTO DE PERFIL ENCONTRADA!")
                console.log("[Webhook POST] ✅ URL da foto:", fotoPerfil)
              } else {
                console.log("[Webhook POST] ⚠️ Foto de perfil NÃO disponível na resposta da API")
                console.log("[Webhook POST] ⚠️ Campos retornados:", Object.keys(profileData))
                if (profileData.error) {
                  console.log("[Webhook POST] ⚠️ Erro da API:", JSON.stringify(profileData.error, null, 2))
                }
              }
            } else {
              const errorData = await profileResponse.json().catch(() => ({}))
              console.log("[Webhook POST] ❌ ERRO ao buscar foto de perfil - Status:", profileResponse.status)
              console.log("[Webhook POST] ❌ Detalhes do erro:", JSON.stringify(errorData, null, 2))
            }
          } else {
            console.log("[Webhook POST] ⚠️ Condições não atendidas para buscar foto:")
            if (!conexao.token_acesso) console.log("[Webhook POST]   - ❌ token_acesso não encontrado")
            if (!conexao.id_numero_telefone) console.log("[Webhook POST]   - ❌ id_numero_telefone não encontrado")
            if (!message.from) console.log("[Webhook POST]   - ❌ message.from não encontrado")
          }
        } catch (fotoError: any) {
          console.log("[Webhook POST] ❌ EXCEÇÃO ao buscar foto de perfil:")
          console.log("[Webhook POST] ❌ Tipo do erro:", fotoError?.constructor?.name)
          console.log("[Webhook POST] ❌ Mensagem:", fotoError?.message)
          console.log("[Webhook POST] ❌ Stack:", fotoError?.stack)
        }
        
        console.log("[Webhook POST] ====== RESULTADO DA BUSCA DE FOTO ======")
        console.log("[Webhook POST] Foto encontrada?", !!fotoPerfil)
        if (fotoPerfil) {
          console.log("[Webhook POST] ✅ URL da foto que será salva:", fotoPerfil)
        } else {
          console.log("[Webhook POST] ⚠️ Nenhuma foto será salva (será null)")
        }

        console.log("[Webhook POST] Processando mensagem:", {
          message_id: message.id,
          from: message.from,
          contact_name: contactName,
          type: message.type
        })

        let conteudo = ""
        let tipoMidia: "text" | "image" | "audio" | "video" | "document" = "text"
        let urlMidia: string | null = null

        if (message.type === "text") {
          conteudo = message.text?.body || ""
          tipoMidia = "text"
        } else if (message.type === "image") {
          conteudo = message.image?.caption || "[Imagem]"
          tipoMidia = "image"
          urlMidia = message.image?.id ? `https://graph.facebook.com/v18.0/${message.image.id}` : null
        } else if (message.type === "audio") {
          conteudo = "[Áudio]"
          tipoMidia = "audio"
          urlMidia = message.audio?.id ? `https://graph.facebook.com/v18.0/${message.audio.id}` : null
        } else if (message.type === "video") {
          conteudo = message.video?.caption || "[Vídeo]"
          tipoMidia = "video"
          urlMidia = message.video?.id ? `https://graph.facebook.com/v18.0/${message.video.id}` : null
        } else if (message.type === "document") {
          conteudo = message.document?.filename || "[Documento]"
          tipoMidia = "document"
          urlMidia = message.document?.id ? `https://graph.facebook.com/v18.0/${message.document.id}` : null
        } else {
          conteudo = `[${message.type || "Mensagem"}]`
        }

        let idContato: string | null = null

        console.log("[Webhook POST] Buscando contato existente:", {
          telefone: phoneNumber,
          id_empresa: idEmpresa
        })

        const { data: contatoExistente, error: contatoError } = await supabase
          .from("contatos")
          .select("id, nome, telefone, id_empresa")
          .eq("telefone", phoneNumber)
          .eq("id_empresa", idEmpresa)
          .single()

        if (contatoExistente) {
          idContato = contatoExistente.id
          console.log("[Webhook POST] ✅ Contato existente encontrado:", {
            id: idContato,
            nome: contatoExistente.nome,
            telefone: contatoExistente.telefone
          })
          
          console.log("[Webhook POST] ====== ATUALIZANDO CONTATO EXISTENTE ======")
          const updateData: any = {
            atualizado_em: new Date().toISOString(),
            nome: contactName || contatoExistente.nome
          }
          
          if (fotoPerfil) {
            console.log("[Webhook POST] 📸 Adicionando foto de perfil ao updateData")
            updateData.url_foto_perfil = fotoPerfil
            console.log("[Webhook POST] 📸 Foto que será salva:", fotoPerfil)
          } else {
            console.log("[Webhook POST] ⚠️ Nenhuma foto para salvar (fotoPerfil é null)")
          }
          
          console.log("[Webhook POST] Dados que serão atualizados:", JSON.stringify(updateData, null, 2))
          const { error: updateError } = await supabase
            .from("contatos")
            .update(updateData)
            .eq("id", idContato)
          
          if (updateError) {
            console.error("[Webhook POST] ❌ ERRO ao atualizar contato:", updateError)
            console.error("[Webhook POST] ❌ Detalhes:", JSON.stringify(updateError, null, 2))
          } else {
            console.log("[Webhook POST] ✅ Contato atualizado com sucesso")
            if (fotoPerfil) {
              console.log("[Webhook POST] ✅ Foto de perfil SALVA no banco de dados")
            } else {
              console.log("[Webhook POST] ⚠️ Foto de perfil NÃO foi salva (não havia foto)")
            }
          }

          if (updateError) {
            console.error("[Webhook POST] Erro ao atualizar contato:", updateError)
          } else {
            console.log("[Webhook POST] ✅ Contato atualizado com sucesso")
          }
        } else {
          console.log("[Webhook POST] Criando novo contato:", {
            id_empresa: idEmpresa,
            nome: contactName || phoneNumber,
            telefone: phoneNumber
          })

          console.log("[Webhook POST] ====== CRIANDO NOVO CONTATO ======")
          const dadosContato: any = {
            id_empresa: idEmpresa,
            nome: contactName || phoneNumber,
            telefone: phoneNumber,
            status: "active",
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          }

          if (emailUsuario) {
            dadosContato.email_usuario = emailUsuario
            console.log("[Webhook POST] Email do usuário adicionado:", emailUsuario)
          }
          
          if (fotoPerfil) {
            console.log("[Webhook POST] 📸 Adicionando foto de perfil aos dados do contato")
            dadosContato.url_foto_perfil = fotoPerfil
            console.log("[Webhook POST] 📸 Foto que será salva:", fotoPerfil)
          } else {
            console.log("[Webhook POST] ⚠️ Nenhuma foto para adicionar aos dados (fotoPerfil é null)")
          }
          
          console.log("[Webhook POST] Dados completos do contato que será criado:", JSON.stringify(dadosContato, null, 2))

          const { data: novoContato, error: novoContatoError } = await supabase
            .from("contatos")
            .insert(dadosContato)
            .select("id, nome, telefone, id_empresa, email_usuario")
            .single()

          if (novoContatoError) {
            console.error("[Webhook POST] ❌ ERRO ao criar contato:", novoContatoError)
            console.error("[Webhook POST] Detalhes do erro:", {
              message: novoContatoError.message,
              code: novoContatoError.code,
              details: novoContatoError.details,
              hint: novoContatoError.hint
            })
            continue
          }

          if (!novoContato) {
            console.error("[Webhook POST] ❌ Contato não foi criado (retorno vazio)")
            continue
          }

          idContato = novoContato.id
          console.log("[Webhook POST] ✅ Novo contato criado com sucesso!")
          console.log("[Webhook POST] ✅ Dados do contato criado:", {
            id: idContato,
            nome: novoContato.nome,
            telefone: novoContato.telefone,
            id_empresa: novoContato.id_empresa,
            url_foto_perfil: novoContato.url_foto_perfil || "null"
          })
          if (novoContato.url_foto_perfil) {
            console.log("[Webhook POST] ✅ Foto de perfil SALVA no banco de dados!")
            console.log("[Webhook POST] ✅ URL da foto salva:", novoContato.url_foto_perfil)
          } else {
            console.log("[Webhook POST] ⚠️ Foto de perfil NÃO foi salva (campo está null)")
          }
        }

        const { error: mensagemError } = await supabase
          .from("mensagens")
          .insert({
            id_empresa: idEmpresa,
            id_contato: idContato,
            id_conexao: conexao.id,
            conteudo: conteudo,
            direcao: "entrada",
            status: "recebido",
            tipo_midia: tipoMidia,
            url_midia: urlMidia,
            criado_em: new Date().toISOString()
          })

        if (mensagemError) {
          console.error("[Webhook POST] ERRO ao salvar mensagem:", mensagemError)
        } else {
          console.log("[Webhook POST] ✅ Mensagem salva com sucesso")
        }
      }

      console.log("[Webhook POST] ✅ Processamento concluído")
      return new Response("OK", { 
        status: 200, 
        headers: corsHeaders 
      })
    }

    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error("[Webhook] ERRO INESPERADO:", error)
    return new Response("OK", { 
      status: 200, 
      headers: corsHeaders 
    })
  }
})


