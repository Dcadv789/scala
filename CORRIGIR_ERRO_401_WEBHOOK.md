# 🔧 CORRIGIR ERRO 401 - Webhook Meta

## ❌ Problema
A Edge Function está retornando **401 Unauthorized** porque está exigindo autenticação JWT, mas o Meta não envia token.

## ✅ SOLUÇÃO: Desabilitar JWT na Edge Function

### Passo 1: Acessar Configurações da Edge Function

1. Acesse: **Supabase Dashboard** → **Edge Functions**
2. Clique na função: **`whatsapp-webhook`**
3. Clique na aba: **Settings** (ou **Configurações**)

### Passo 2: Desabilitar Verificação JWT

Na seção **"Authentication"** ou **"JWT Verification"**:

- ✅ **Desmarque** a opção **"Verify JWT"** ou **"Require Authentication"**
- ✅ Ou configure: **`verify_jwt = false`**

**IMPORTANTE:** Se não houver essa opção nas Settings, você precisa configurar via código ou via CLI.

### Passo 3: Alternativa - Configurar via Dashboard

Se não encontrar a opção nas Settings:

1. Vá em: **Edge Functions** → **whatsapp-webhook** → **Settings**
2. Procure por: **"Function Configuration"** ou **"Advanced Settings"**
3. Adicione na configuração:
   ```json
   {
     "verify_jwt": false
   }
   ```

### Passo 4: Alternativa - Usar Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# No diretório do projeto
supabase functions deploy whatsapp-webhook --no-verify-jwt
```

### Passo 5: Verificar se Funcionou

1. Teste a URL no navegador:
   ```
   https://sxouafgvomzgufyuzajc.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=scalazap_verify_token_2024&hub.challenge=test123
   ```

2. **Resultado esperado:** Deve retornar `test123` (não mais 401)

3. Verifique os logs:
   - **Edge Functions** → **whatsapp-webhook** → **Logs**
   - Deve aparecer: `REQUISIÇÃO DE VERIFICAÇÃO RECEBIDA`

## 🔍 Verificação no Dashboard

Após desabilitar JWT, você deve ver nos **Invocations**:
- Status: **200** (não mais 401)
- Response: O challenge retornado

## ⚠️ IMPORTANTE

- A Edge Function **NÃO** deve exigir autenticação para webhooks públicos
- O Meta **NÃO** envia token JWT
- A segurança é garantida pelo `hub.verify_token` (não pelo JWT)

## 📝 Nota sobre Segurança

Desabilitar JWT é **SEGURO** para webhooks porque:
- ✅ A validação é feita pelo `hub.verify_token` (token secreto)
- ✅ Apenas quem conhece o token pode verificar o webhook
- ✅ O Meta valida o token antes de enviar eventos


