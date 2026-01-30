# 🔍 Verificar Configuração do Webhook no Meta

## ❌ Problema: Mensagens não aparecem no chat

Se você enviou uma mensagem mas não apareceu no chat e não há logs no Supabase, pode ser que:

1. **O Meta não está enviando eventos de mensagens**
2. **O webhook não está configurado para receber mensagens**
3. **A Edge Function não está recebendo os POSTs**

## ✅ Checklist de Verificação

### 1. Verificar Configuração do Webhook no Meta Business

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App
3. Vá em: **WhatsApp** → **Configuration** → **Webhook**
4. Verifique se está configurado:
   - ✅ **Callback URL:** `https://sxouafgvomzgufyuzajc.supabase.co/functions/v1/whatsapp-webhook`
   - ✅ **Verify Token:** `scalazap_verify_token_2024`
   - ✅ **Status:** "Verified" (verificado)

### 2. Verificar Eventos Subscritos

No mesmo lugar (Webhook), verifique se os seguintes eventos estão **MARCADOS**:

- ✅ **`messages`** - Receber mensagens de texto, mídia, etc.
- ✅ **`message_status`** - Receber atualizações de status (enviado, entregue, lido)

**IMPORTANTE:** Se `messages` não estiver marcado, o Meta **NÃO** enviará eventos de mensagens!

### 3. Verificar Logs da Edge Function

1. Acesse: **Supabase Dashboard** → **Edge Functions** → **whatsapp-webhook**
2. Vá em: **Logs**
3. Procure por:
   - `POST recebido` - Deve aparecer quando o Meta envia um evento
   - `WEBHOOK RECEBIDO` - Deve aparecer quando processa uma mensagem
   - `Mensagem salva com sucesso` - Deve aparecer quando salva no banco

### 4. Verificar Invocations

1. Acesse: **Supabase Dashboard** → **Edge Functions** → **whatsapp-webhook**
2. Vá em: **Invocations**
3. Procure por requisições POST recentes
4. Verifique:
   - Status code (deve ser 200)
   - Payload recebido
   - Erros (se houver)

### 5. Testar Manualmente

Envie uma mensagem do seu celular para o número conectado e:

1. **Aguarde 5-10 segundos**
2. **Verifique os logs da Edge Function**
3. **Verifique a tabela `mensagens` no Supabase**

## 🔧 Solução: Reconfigurar Webhook

Se o evento `messages` não estiver marcado:

1. No Meta Business, vá em: **WhatsApp** → **Configuration** → **Webhook**
2. Clique em **"Edit"** ou **"Configure"**
3. **Marque** a opção **`messages`**
4. **Marque** a opção **`message_status`** (opcional, mas recomendado)
5. Clique em **"Save"** ou **"Verify and Save"**

## 📝 Estrutura do Payload Esperado

O Meta envia mensagens neste formato:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "5511999999999",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": {
            "name": "Nome do Contato"
          },
          "wa_id": "5511999999999"
        }],
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "text": {
            "body": "Texto da mensagem"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

## ⚠️ Problemas Comuns

### Problema 1: Meta não envia POSTs
**Causa:** Evento `messages` não está subscrito
**Solução:** Marcar `messages` nas configurações do webhook

### Problema 2: POSTs chegam mas não processam
**Causa:** Estrutura do payload diferente ou erro no código
**Solução:** Verificar logs da Edge Function para ver o erro específico

### Problema 3: Mensagem salva mas não aparece no chat
**Causa:** Realtime não está funcionando ou filtro incorreto
**Solução:** Verificar se Realtime está habilitado na tabela `mensagens`

## 🧪 Teste Rápido

1. Envie uma mensagem do celular
2. Aguarde 10 segundos
3. Verifique:
   - ✅ Logs da Edge Function (deve ter `POST recebido`)
   - ✅ Tabela `mensagens` (deve ter uma nova linha)
   - ✅ Chat ao vivo (deve aparecer a mensagem)

Se nenhum desses acontecer, o problema está na configuração do webhook no Meta.


