import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER"
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT"
  text?: string
  example?: {
    header_text?: string[]
    body_text?: string[][]
  }
}

interface TemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"
  text: string
  url?: string
  phone_number?: string
}

interface CreateTemplateRequest {
  action: "sync" | "create"
  id_empresa: string
  nome?: string
  categoria?: "MARKETING" | "UTILITY" | "AUTHENTICATION"
  idioma?: string
  componentes?: {
    header?: TemplateComponent
    body?: TemplateComponent
    footer?: TemplateComponent
    buttons?: TemplateButton[]
  }
}

serve(async (req) => {
  console.log("=".repeat(50))
  console.log(`[Templates Manager] ${req.method} recebido em: ${new Date().toISOString()}`)
  console.log("=".repeat(50))

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[Templates Manager] ERRO: Variáveis de ambiente não configuradas")
      return new Response(
        JSON.stringify({ success: false, error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Método não permitido" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body: CreateTemplateRequest = await req.json()
    const { action, id_empresa } = body

    if (!action || !id_empresa) {
      return new Response(
        JSON.stringify({ success: false, error: "action e id_empresa são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id_empresa)) {
      return new Response(
        JSON.stringify({ success: false, error: "id_empresa deve ser um UUID válido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("id, nome")
      .eq("id", id_empresa)
      .single()

    if (empresaError || !empresa) {
      console.error("[Templates Manager] Empresa não encontrada:", id_empresa, empresaError)
      return new Response(
        JSON.stringify({ success: false, error: "Empresa não encontrada. Verifique o id_empresa." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("[Templates Manager] Ação solicitada:", action)
    console.log("[Templates Manager] ID Empresa:", id_empresa)
    console.log("[Templates Manager] Empresa encontrada:", empresa.nome)

    console.log("[Templates Manager] Buscando conexão da empresa...")
    let { data: conexao, error: conexaoError } = await supabase
      .from("conexoes")
      .select("id_waba, token_acesso, id_numero_telefone, status")
      .eq("id_empresa", id_empresa)
      .in("status", ["connected", "active"])
      .single()

    if (conexaoError || !conexao) {
      console.log("[Templates Manager] Tentando buscar qualquer conexão da empresa...")
      const { data: conexaoFallback, error: conexaoFallbackError } = await supabase
        .from("conexoes")
        .select("id_waba, token_acesso, id_numero_telefone, status")
        .eq("id_empresa", id_empresa)
        .single()
      
      if (conexaoFallback && conexaoFallback.id_waba && conexaoFallback.token_acesso) {
        console.log("[Templates Manager] ✅ Usando conexão encontrada (status:", conexaoFallback.status, ")")
        conexao = conexaoFallback
        conexaoError = null
      } else {
        console.error("[Templates Manager] Erro ao buscar conexão:", conexaoError || conexaoFallbackError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Conexão não encontrada ou não possui id_waba/token_acesso configurados" 
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    if (!conexao || !conexao.id_waba || !conexao.token_acesso) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Conexão não possui id_waba ou token_acesso configurados" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("[Templates Manager] ✅ Conexão encontrada:", {
      id_waba: conexao.id_waba,
      has_token: !!conexao.token_acesso
    })

    if (action === "sync") {
      console.log("[Templates Manager] ====== INICIANDO SINCRONIZAÇÃO ======")
      
      try {
        const metaUrl = `https://graph.facebook.com/v18.0/${conexao.id_waba}/message_templates?access_token=${conexao.token_acesso}`
        console.log("[Templates Manager] Chamando API da Meta:", metaUrl.replace(conexao.token_acesso, "***TOKEN***"))
        
        const response = await fetch(metaUrl)
        const data = await response.json()

        if (!response.ok || data.error) {
          console.error("[Templates Manager] Erro na API da Meta:", data.error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: data.error?.message || "Erro ao buscar templates da Meta" 
            }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        const templates = data.data || []
        console.log("[Templates Manager] Templates encontrados na Meta:", templates.length)

        let sincronizados = 0
        let atualizados = 0
        let criados = 0

        for (const template of templates) {
          console.log("[Templates Manager] Processando template:", template.name, "ID:", template.id)

          const componentes: any = {
            header: template.components?.find((c: any) => c.type === "HEADER") || null,
            body: template.components?.find((c: any) => c.type === "BODY") || null,
            footer: template.components?.find((c: any) => c.type === "FOOTER") || null,
            buttons: template.components?.filter((c: any) => c.type === "BUTTONS") || []
          }

          const { data: templateExistente, error: checkError } = await supabase
            .from("modelos")
            .select("id")
            .eq("id_meta", template.id)
            .maybeSingle()

          if (checkError && checkError.code !== "PGRST116") {
            console.error("[Templates Manager] Erro ao verificar template existente:", checkError)
          }

          if (!template.name) {
            console.error("[Templates Manager] ⚠️ Template sem nome, pulando...")
            continue
          }

          if (!id_empresa) {
            console.error("[Templates Manager] ⚠️ id_empresa não fornecido, pulando template:", template.name)
            continue
          }

          const templateData: any = {
            id_meta: template.id || null,
            id_empresa: id_empresa,
            nome: template.name,
            idioma: template.language || "pt_BR",
            categoria: template.category || "MARKETING",
            componentes: componentes || {},
            status: template.status || "PENDING",
            atualizado_em: new Date().toISOString()
          }

          if (template.rejection_reason) {
            templateData.motivo_rejeicao = template.rejection_reason
          }

          console.log("[Templates Manager] Template data preparado:", {
            id_meta: templateData.id_meta,
            id_empresa: templateData.id_empresa,
            nome: templateData.nome,
            status: templateData.status,
            categoria: templateData.categoria,
            idioma: templateData.idioma,
            has_componentes: !!templateData.componentes
          })

          let updateError: any = null
          let insertError: any = null

          if (templateExistente) {
            console.log("[Templates Manager] Template já existe (ID:", templateExistente.id, "), atualizando...")
            const updateResult = await supabase
              .from("modelos")
              .update(templateData)
              .eq("id_meta", template.id)
              .select()

            updateError = updateResult.error

            if (updateError) {
              console.error("[Templates Manager] ❌ Erro ao atualizar template:", updateError)
              console.error("[Templates Manager] Detalhes do erro:", JSON.stringify(updateError, null, 2))
            } else {
              atualizados++
              sincronizados++
              console.log("[Templates Manager] ✅ Template atualizado com sucesso:", template.name)
              console.log("[Templates Manager] Template atualizado no banco:", updateResult.data)
            }
          } else {
            console.log("[Templates Manager] Template não existe, criando novo...")
            templateData.criado_em = new Date().toISOString()
            
            console.log("[Templates Manager] Dados para INSERT:", JSON.stringify(templateData, null, 2))
            
            const insertResult = await supabase
              .from("modelos")
              .insert(templateData)
              .select()

            insertError = insertResult.error

            if (insertError) {
              console.error("[Templates Manager] ❌ Erro ao criar template:", insertError)
              console.error("[Templates Manager] Detalhes do erro:", JSON.stringify(insertError, null, 2))
              console.error("[Templates Manager] Dados que tentaram ser inseridos:", JSON.stringify(templateData, null, 2))
            } else {
              criados++
              sincronizados++
              console.log("[Templates Manager] ✅ Template criado com sucesso:", template.name)
              console.log("[Templates Manager] Template inserido no banco:", insertResult.data)
            }
          }
        }

        console.log("[Templates Manager] ====== SINCRONIZAÇÃO CONCLUÍDA ======")
        console.log("[Templates Manager] Total processado:", sincronizados)
        console.log("[Templates Manager] Criados:", criados)
        console.log("[Templates Manager] Atualizados:", atualizados)

        return new Response(
          JSON.stringify({
            success: true,
            message: "Sincronização concluída",
            total: sincronizados,
            criados,
            atualizados
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      } catch (error: any) {
        console.error("[Templates Manager] Erro inesperado na sincronização:", error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || "Erro ao sincronizar templates" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    if (action === "create") {
      console.log("[Templates Manager] ====== CRIANDO NOVO TEMPLATE ======")
      
      const { nome, categoria, idioma, componentes } = body

      if (!nome || !categoria || !idioma || !componentes) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "nome, categoria, idioma e componentes são obrigatórios" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      let nomeSanitizado = nome
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")

      if (!nomeSanitizado || nomeSanitizado.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Nome do template inválido após sanitização" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      console.log("[Templates Manager] Nome original:", nome)
      console.log("[Templates Manager] Nome sanitizado:", nomeSanitizado)

      const categoriaUpper = categoria.toUpperCase()
      if (!["MARKETING", "UTILITY", "AUTHENTICATION"].includes(categoriaUpper)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Categoria inválida. Use: MARKETING, UTILITY ou AUTHENTICATION" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // ============================================
      // VALIDAÇÃO 4: BODY OBRIGATÓRIO (CRÍTICO)
      // ============================================
      if (!componentes.body || !componentes.body.text) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "ERRO: O componente BODY é obrigatório e deve conter o campo 'text'." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const bodyText = componentes.body.text
      
      // Validação crítica: texto não pode estar vazio
      if (!bodyText || typeof bodyText !== "string" || bodyText.trim().length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "ERRO: O texto da mensagem (Body) é obrigatório e não pode estar vazio." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      const variaveisRegex = /\{\{([^}]+)\}\}/g
      const variaveisEncontradas: string[] = []
      let match
      while ((match = variaveisRegex.exec(bodyText)) !== null) {
        variaveisEncontradas.push(match[1].trim())
      }

      const variaveisInvalidas = variaveisEncontradas.filter(v => !/^\d+$/.test(v))
      if (variaveisInvalidas.length > 0) {
        console.log("[Templates Manager] ⚠️ Variáveis com nomes encontradas, convertendo para números...")
        let bodyTextCorrigido = bodyText
        let contador = 1
        const variaveisUnicas = [...new Set(variaveisInvalidas)]
        
        variaveisUnicas.forEach(variavel => {
          const regex = new RegExp(`\\{\\{${variavel}\\}\\}`, "g")
          bodyTextCorrigido = bodyTextCorrigido.replace(regex, `{{${contador}}}`)
          contador++
        })
        
        componentes.body.text = bodyTextCorrigido
        console.log("[Templates Manager] Body corrigido:", bodyTextCorrigido)
      }

      if (componentes.buttons && componentes.buttons.length > 0) {
        for (let i = 0; i < componentes.buttons.length; i++) {
          const button = componentes.buttons[i]
          
          if (!["QUICK_REPLY", "URL", "PHONE_NUMBER"].includes(button.type)) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Botão ${i + 1}: Tipo inválido. Use: QUICK_REPLY, URL ou PHONE_NUMBER` 
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
          }

          if (!button.text || button.text.trim().length === 0) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Botão ${i + 1}: Texto é obrigatório` 
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
          }

          if (button.text.length > 25) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Botão ${i + 1}: Texto deve ter no máximo 25 caracteres` 
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
          }

          if (button.type === "URL") {
            if (!button.url || button.url.trim().length === 0) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Botão ${i + 1}: URL é obrigatória para botões do tipo URL` 
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              )
            }

            const urlTrimmed = button.url.trim()
            if (!urlTrimmed.startsWith("http://") && !urlTrimmed.startsWith("https://")) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Botão ${i + 1}: URL deve começar com http:// ou https://` 
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              )
            }
          }

          if (button.type === "PHONE_NUMBER") {
            if (!button.phone_number || button.phone_number.trim().length === 0) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Botão ${i + 1}: phone_number é obrigatório para botões do tipo PHONE_NUMBER` 
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              )
            }

            const phoneTrimmed = button.phone_number.trim()
            if (!phoneTrimmed.startsWith("+")) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Botão ${i + 1}: phone_number deve começar com + e incluir DDI (ex: +5511999999999)` 
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              )
            }
          }
        }
      }

      const metaComponents: any[] = []

      if (componentes.header && componentes.header.format && componentes.header.format !== "none" && componentes.header.format !== "NONE") {
        const headerComp: any = {
          type: "HEADER",
          format: componentes.header.format.toUpperCase()
        }
        
        if (componentes.header.format.toUpperCase() === "TEXT" && componentes.header.text && componentes.header.text.trim() !== "") {
          headerComp.text = componentes.header.text.trim()
        }
        
        if (componentes.header.example) {
          headerComp.example = componentes.header.example
        }
        
        metaComponents.push(headerComp)
      }

      // Validação dupla do BODY antes de adicionar ao array
      // (já validado antes, mas garantindo aqui também)
      const bodyTextFinal = componentes.body?.text?.trim() || ""
      if (!bodyTextFinal || bodyTextFinal.length === 0) {
        console.error("[Templates Manager] ❌ ERRO: Body text está vazio ao tentar montar array!")
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "ERRO: O texto da mensagem (Body) é obrigatório e não pode estar vazio." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const bodyComp: any = {
        type: "BODY",
        text: bodyTextFinal
      }
      
      if (componentes.body.example) {
        bodyComp.example = componentes.body.example
      }
      
      metaComponents.push(bodyComp)

      if (componentes.footer && componentes.footer.text && componentes.footer.text.trim() !== "") {
        metaComponents.push({
          type: "FOOTER",
          text: componentes.footer.text.trim()
        })
      }

      if (componentes.buttons && Array.isArray(componentes.buttons) && componentes.buttons.length > 0) {
        const buttonsArray: any[] = []
        
        componentes.buttons.forEach((button: TemplateButton) => {
          if (!button.type || !button.text || button.text.trim() === "") {
            console.warn("[Templates Manager] Botão inválido ignorado:", button)
            return
          }

          const buttonObj: any = {
            type: button.type,
            text: button.text.trim()
          }

          if (button.type === "URL" && button.url && button.url.trim() !== "") {
            buttonObj.url = button.url.trim()
          } else if (button.type === "PHONE_NUMBER" && button.phone_number && button.phone_number.trim() !== "") {
            buttonObj.phone_number = button.phone_number.trim()
          }

          buttonsArray.push(buttonObj)
        })

        if (buttonsArray.length > 0) {
          metaComponents.push({
            type: "BUTTONS",
            buttons: buttonsArray
          })
        }
      }

      // ============================================
      // VALIDAÇÃO CRÍTICA: ARRAY DE COMPONENTES NÃO PODE ESTAR VAZIO
      // ============================================
      if (metaComponents.length === 0) {
        console.error("[Templates Manager] ❌ ERRO FATAL: Array de componentes está vazio!")
        console.error("[Templates Manager] Componentes recebidos:", JSON.stringify(componentes, null, 2))
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "ERRO FATAL: O array de componentes está vazio. O template precisa ter pelo menos um componente BODY com texto." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      // Verificar se há pelo menos um componente BODY válido
      const hasBody = metaComponents.some((comp: any) => comp.type === "BODY" && comp.text && comp.text.trim().length > 0)
      if (!hasBody) {
        console.error("[Templates Manager] ❌ ERRO: Nenhum componente BODY válido encontrado!")
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "ERRO: O componente BODY é obrigatório e deve conter texto não vazio." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const metaPayload = {
        name: nomeSanitizado,
        language: idioma,
        category: categoriaUpper,
        components: metaComponents
      }

      console.log("[Templates Manager] Payload para Meta (SEM CREDENCIAIS):", JSON.stringify(metaPayload, null, 2))
      console.log("[Templates Manager] ✅ Validação: Array de componentes tem", metaComponents.length, "item(ns)")

      try {
        const metaUrl = `https://graph.facebook.com/v18.0/${conexao.id_waba}/message_templates?access_token=${conexao.token_acesso}`
        console.log("[Templates Manager] Enviando para Meta API...")
        console.log("[Templates Manager] URL:", metaUrl.replace(conexao.token_acesso, "***TOKEN***"))

        const response = await fetch(metaUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(metaPayload)
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          console.error("[Templates Manager] Erro na API da Meta:", data.error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: data.error?.message || "Erro ao criar template na Meta",
              details: data.error,
              payload_sent: metaPayload
            }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        console.log("[Templates Manager] ✅ Template criado na Meta! ID:", data.id)

        const templateData = {
          id_meta: data.id,
          id_empresa: id_empresa,
          nome: nomeSanitizado,
          idioma: idioma,
          categoria: categoriaUpper,
          componentes: componentes,
          status: "PENDING",
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }

        const { data: novoTemplate, error: insertError } = await supabase
          .from("modelos")
          .insert(templateData)
          .select()
          .single()

        if (insertError) {
          console.error("[Templates Manager] Erro ao salvar template no banco:", insertError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Template criado na Meta mas falhou ao salvar no banco",
              meta_id: data.id
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }

        console.log("[Templates Manager] ✅ Template salvo no banco! ID:", novoTemplate.id)

        return new Response(
          JSON.stringify({
            success: true,
            message: "Template criado com sucesso",
            template: novoTemplate,
            meta_id: data.id
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

      } catch (error: any) {
        console.error("[Templates Manager] Erro inesperado ao criar template:", error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || "Erro ao criar template" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação não reconhecida. Use 'sync' ou 'create'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    console.error("[Templates Manager] ERRO INESPERADO:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
