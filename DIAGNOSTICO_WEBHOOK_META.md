# 🔍 Diagnóstico: Webhook Teste Funciona, Mas Mensagens Reais Não Chegam

## ✅ O que está funcionando:
- Botão "Testar Webhook" funciona
- Logs aparecem no Supabase
- Edge Function está operacional

## ❌ O que não está funcionando:
- Mensagens reais do WhatsApp não geram POSTs
- Não aparecem logs nem invocations

## 🎯 Causa Provável:
O Meta não está enviando eventos de mensagens porque:
1. **Evento `messages` não está subscrito** no webhook
2. **Número está em modo de teste** e precisa de número de teste para receber
3. **Webhook não está ativo** para o número específico

## ✅ SOLUÇÃO PASSO A PASSO:

### 1. Verificar Subscrição de Eventos no Meta

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu App
3. Vá em: **WhatsApp** → **Configuration** → **Webhook**
4. Clique em **"Manage"** ou **"Edit"** ao lado do webhook
5. **VERIFIQUE se está marcado:**
   - ✅ **`messages`** - **OBRIGATÓRIO**
   - ✅ **`message_status`** - Opcional mas recomendado

**Se `messages` NÃO estiver marcado:**
- Marque a opção `messages`
- Clique em **"Save"** ou **"Verify and Save"**
- Aguarde alguns segundos

### 2. Verificar Status do Número

1. No mesmo lugar (WhatsApp → Configuration)
2. Vá em: **"Phone numbers"** ou **"Números de telefone"**
3. Verifique o status do seu número:
   - **"Production"** = Funciona com qualquer número
   - **"Test"** = Só funciona com números de teste cadastrados

**Se estiver em modo TEST:**
- Você precisa adicionar números de teste em: **WhatsApp** → **API Setup** → **"To"** (números de teste)
- OU migrar para modo Production (requer verificação do negócio)

### 3. Verificar Webhook Ativo para o Número

1. No Meta Business: **WhatsApp** → **Configuration** → **Webhook**
2. Verifique se há uma seção **"Webhook fields"** ou **"Campos do webhook"**
3. Deve mostrar:
   - ✅ `messages` - Subscribed
   - ✅ `message_status` - Subscribed (opcional)

### 4. Testar com Número de Teste (Se estiver em modo TEST)

1. Vá em: **WhatsApp** → **API Setup**
2. Na seção **"To"**, adicione seu número de celular como número de teste
3. Envie uma mensagem do número de teste para o número conectado
4. Verifique os logs

### 5. Verificar Logs do Meta (Webhook Delivery)

1. No Meta Business: **WhatsApp** → **Configuration** → **Webhook**
2. Procure por **"Recent deliveries"** ou **"Entregas recentes"**
3. Verifique se há tentativas de entrega quando você envia mensagens
4. Se houver tentativas com erro, veja o erro específico

## 🔧 Verificações Adicionais:

### Verificar se o número está conectado corretamente:

1. No seu app, vá em: **Dashboard** → **Connections**
2. Verifique se a conexão está com status **"connected"**
3. Verifique se o `phone_number_id` está correto
4. Verifique se o `waba_id` está correto

### Verificar URL do Webhook:

A URL deve ser exatamente:
```
https://sxouafgvomzgufyuzajc.supabase.co/functions/v1/whatsapp-webhook
```

**NÃO deve ter:**
- Barra no final (`/`)
- Parâmetros extras
- HTTP (deve ser HTTPS)

## 🧪 Teste Rápido:

1. **Marque `messages` no webhook** (se não estiver marcado)
2. **Aguarde 30 segundos** após marcar
3. **Envie uma mensagem** do celular
4. **Aguarde 10 segundos**
5. **Verifique os logs** no Supabase

## ⚠️ Problemas Comuns:

### Problema 1: Número em modo TEST
**Sintoma:** Teste funciona, mensagens reais não
**Solução:** Adicionar número como teste OU migrar para Production

### Problema 2: Evento não subscrito
**Sintoma:** Webhook verificado mas não recebe mensagens
**Solução:** Marcar `messages` nas configurações do webhook

### Problema 3: Webhook não ativo
**Sintoma:** Nada aparece nos logs
**Solução:** Re-verificar o webhook no Meta

## 📝 Checklist Final:

- [ ] Evento `messages` está marcado no webhook
- [ ] Webhook está "Verified" (verificado)
- [ ] Número está em modo Production OU número de teste está cadastrado
- [ ] URL do webhook está correta (sem barra no final)
- [ ] Aguardou 30 segundos após marcar `messages`
- [ ] Enviou mensagem e aguardou 10 segundos
- [ ] Verificou logs no Supabase

## 🆘 Se ainda não funcionar:

1. **Verifique "Recent deliveries"** no Meta para ver se há tentativas
2. **Verifique se há erros** nas tentativas de entrega
3. **Tente re-verificar o webhook** (desmarcar e marcar novamente)
4. **Verifique se o número está ativo** no Meta Business


