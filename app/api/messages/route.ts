import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Função para obter o usuário autenticado
async function getAuthUser(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value ||
      cookieStore.get("supabase-auth-token")?.value
    
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken)
      return user
    }
    
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7))
      return user
    }
    
    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    // Se nao autenticado, retornar vazio (seguranca)
    if (!user) {
      return NextResponse.json({ success: true, conversations: [], totalMessages: 0 })
    }
    
    // Buscar conexoes do usuario para filtrar mensagens
    const { data: userConnections } = await supabase
      .from("conexoes")
      .select("id_numero_telefone")
      .eq("id_usuario", user.id)
    
    const phoneNumberIds = userConnections?.map(c => c.phone_number_id).filter(Boolean) || []
    
    if (phoneNumberIds.length === 0) {
      return NextResponse.json({ success: true, conversations: [], totalMessages: 0 })
    }
    
    // Buscar mensagens apenas das conexoes do usuario
    const { data: messages, error } = await supabase
      .from("mensagens_webhook")
      .select("*")
      .in("id_numero_telefone", phoneNumberIds)
      .order("data_hora", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
