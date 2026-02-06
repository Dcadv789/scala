import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    
    // Se nao autenticado, retornar vazio (seguranca)
    if (!authContext) {
      return NextResponse.json({ success: true, conversations: [], totalMessages: 0 })
    }
    
    // Buscar conexoes da empresa para filtrar mensagens
    console.log("[Messages API] ====== Buscando mensagens ======")
    console.log("[Messages API] Empresa ID:", authContext.empresaId)
    
    const { data: userConnections, error: connectionsError } = await supabase
      .from("conexoes")
      .select("id_numero_telefone")
      .eq("id_empresa", authContext.empresaId)
    
    if (connectionsError) {
      console.error("[Messages API] ❌ Erro ao buscar conexões:", connectionsError)
      return NextResponse.json({ error: connectionsError.message }, { status: 500 })
    }
    
    console.log("[Messages API] 📊 Conexões encontradas:", userConnections?.length || 0)
    console.log("[Messages API] 📋 Dados das conexões:", userConnections)
    
    // CORREÇÃO: Usar id_numero_telefone (não phone_number_id)
    const phoneNumberIds = userConnections?.map(c => c.id_numero_telefone).filter(Boolean) || []
    
    console.log("[Messages API] 📞 Phone Number IDs extraídos:", phoneNumberIds)
    
    if (phoneNumberIds.length === 0) {
      console.warn("[Messages API] ⚠️ Nenhum phone_number_id encontrado para a empresa")
      return NextResponse.json({ success: true, conversations: [], totalMessages: 0 })
    }
    
    // Buscar mensagens apenas das conexoes do usuario
    console.log("[Messages API] 🔍 Buscando mensagens com filtro:", { phoneNumberIds })
    const { data: messages, error } = await supabase
      .from("mensagens_webhook")
      .select("*")
      .in("id_numero_telefone", phoneNumberIds)
      .order("data_hora", { ascending: true })
    
    console.log("[Messages API] 📨 Mensagens encontradas:", messages?.length || 0)

    if (error) {
      console.error("[Messages API] ❌ Erro ao buscar mensagens:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log("[Messages API] ✅ Mensagens carregadas com sucesso")

    // Agrupar mensagens por contato
    const conversationsMap = new Map<string, any>()

    for (const msg of messages || []) {
      // Para mensagens enviadas (is_from_me), usar to_number como chave
      // Para mensagens recebidas, usar from_number
      const contactNumber = msg.e_de_mim ? msg.numero_destinatario : msg.numero_remetente
      if (!contactNumber) continue
      
      if (!conversationsMap.has(contactNumber)) {
        conversationsMap.set(contactNumber, {
          id: contactNumber,
          contactName: msg.e_de_mim ? contactNumber : (msg.nome_contato || contactNumber),
          contactPhone: contactNumber,
          lastMessage: msg.texto_mensagem,
          lastMessageTime: msg.data_hora,
          unreadCount: 0,
          status: "active",
          messages: []
        })
      }
      
      const conv = conversationsMap.get(contactNumber)
      
      // Atualizar nome do contato se for mensagem recebida
      if (!msg.e_de_mim && msg.nome_contato) {
        conv.contactName = msg.nome_contato
      }
      
      conv.messages.push({
        id: msg.id,
        text: msg.texto_mensagem,
        type: msg.tipo_mensagem,
        mediaUrl: msg.url_midia,
        timestamp: msg.data_hora,
        sender: msg.e_de_mim ? "me" : "contact",
        status: "delivered"
      })
      
      // Atualizar última mensagem
      if (new Date(msg.data_hora) > new Date(conv.lastMessageTime)) {
        conv.lastMessage = msg.texto_mensagem
        conv.lastMessageTime = msg.data_hora
      }
      
      // Contador de não lidas (apenas mensagens recebidas)
      if (!msg.processado && !msg.e_de_mim) {
        conv.unreadCount++
      }
    }

    const conversations = Array.from(conversationsMap.values())
    
    // Ordenar por última mensagem (mais recente primeiro)
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )

    return NextResponse.json({ 
      success: true, 
      conversations,
      totalMessages: messages?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
