# 🔧 Troubleshooting: Webhook Meta não valida

## ❌ Erro: "Não foi possível validar a URL de callback ou o token de verificação"

### 🔍 Checklist de Verificação

#### 1. **URL do Webhook está correta?**
- ✅ Formato: `https://[PROJECT_REF].supabase.co/functions/v1/whatsapp-webhook`
- ✅ Substitua `[PROJECT_REF]` pelo ID do seu projeto Supabase
- ✅ Exemplo: `https://sxouafgvomzgufyuzajc.supabase.co/functions/v1/whatsapp-webhook`
- ❌ NÃO use `http://` (deve ser HTTPS)
- ❌ NÃO adicione `/` no final

#### 2. **Token de Verificação está correto?**
- ✅ Token padrão: `scalazap_verify_token_2024`
- ✅ Deve ser EXATAMENTE igual (case-sensitive)
- ❌ Não adicione espaços antes ou depois
- ❌ Não use aspas

#### 3. **Edge Function está deployada?**
- ✅ Verifique no Supabase Dashboard → Edge Functions
- ✅ A função `whatsapp-webhook` deve estar listada
- ✅ Status deve ser "Active" ou "Deployed"

#### 4. **Variáveis de Ambiente configuradas?**
No Supabase Dashboard → Edge Functions → Settings → Secrets:
- ✅ `WHATSAPP_VERIFY_TOKEN` = `scalazap_verify_token_2024` (opcional, padrão já funciona)
- ✅ `SUPABASE_URL` (já configurada automaticamente)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (já configurada automaticamente)

#### 5. **Logs da Edge Function**
Verifique os logs no Supabase Dashboard → Edge Functions → whatsapp-webhook → Logs:
- ✅ Deve aparecer "REQUISIÇÃO DE VERIFICAÇÃO RECEBIDA"
- ✅ Deve mostrar os parâmetros recebidos
- ✅ Deve mostrar se o token foi validado

### 🐛 Problemas Comuns e Soluções

#### Problema 1: "Missing challenge"
**Causa:** Meta não está enviando o parâmetro `hub.challenge`
**Solução:** Verifique se está usando a URL correta e se o Meta está fazendo a requisição GET corretamente

#### Problema 2: "Forbidden - Invalid verify token"
**Causa:** Token não corresponde
**Solução:**
1. Verifique se o token no Meta Business é exatamente `scalazap_verify_token_2024`
2. Verifique se não há espaços extras
3. Verifique se a variável de ambiente `WHATSAPP_VERIFY_TOKEN` está configurada corretamente

#### Problema 3: "Missing hub.mode"
**Causa:** Meta não está enviando o parâmetro `hub.mode`
**Solução:** Verifique se está configurando o webhook corretamente no Meta Business

#### Problema 4: Webhook não responde
**Causa:** Edge Function não está acessível ou não está deployada
**Solução:**
1. Verifique se a Edge Function está deployada
2. Teste a URL manualmente no navegador (deve retornar erro 400, mas deve responder)
3. Verifique os logs da Edge Function

### 🧪 Teste Manual

Teste a URL do webhook manualmente no navegador:

```
https://[PROJECT_REF].supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=scalazap_verify_token_2024&hub.challenge=test123
```

**Resultado esperado:**
- ✅ Deve retornar `test123` (o challenge)
- ❌ Se retornar erro, verifique os logs da Edge Function

### 📝 Configuração no Meta Business

1. **Acesse:** https://developers.facebook.com/apps/
2. **Selecione seu App**
3. **Vá em:** WhatsApp → Configuration → Webhook
4. **Clique em:** "Edit" ou "Configure"
5. **Preencha:**
   - **Callback URL:** `https://[PROJECT_REF].supabase.co/functions/v1/whatsapp-webhook`
   - **Verify Token:** `scalazap_verify_token_2024`
6. **Clique em:** "Verify and Save"
7. **Após verificar, marque:**
   - ✅ `messages`
   - ✅ `message_status`

### 🔍 Verificar Logs

1. **No Supabase Dashboard:**
   - Edge Functions → whatsapp-webhook → Logs
   - Procure por requisições GET
   - Veja os parâmetros recebidos

2. **O que procurar nos logs:**
   - `REQUISIÇÃO DE VERIFICAÇÃO RECEBIDA`
   - `Parâmetros extraídos`
   - `Token esperado` vs `Token recebido`
   - `VERIFICAÇÃO APROVADA` ou `VERIFICAÇÃO REJEITADA`

### ✅ Código da Edge Function

O código completo está em: `EDGE_FUNCTION_CODIGO_COMPLETO.txt`

Copie e cole no Supabase Dashboard → Edge Functions → whatsapp-webhook → index.ts


