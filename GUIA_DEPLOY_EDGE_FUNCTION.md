# 📘 Guia Completo: Deploy da Edge Function WhatsApp Webhook

## 🎯 Objetivo

Criar e fazer deploy da Edge Function do Supabase que processa webhooks do WhatsApp Business API.

## 📋 Pré-requisitos

1. **Supabase CLI instalado:**
   ```bash
   npm install -g supabase
   ```

2. **Conta no Supabase** com projeto criado

3. **Acesso ao projeto** no Supabase Dashboard

## 🚀 Passo a Passo

### 1. Login no Supabase CLI

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### 2. Linkar ao Projeto

```bash
# Obter o Project Ref do Supabase Dashboard
# Vá em Settings → General → Reference ID

supabase link --project-ref seu-project-ref
```

Onde `seu-project-ref` é o ID do projeto (ex: `sxouafgvomzgufyuzajc`).

### 3. Configurar Variáveis de Ambiente

No Supabase Dashboard:
1. Vá em **Edge Functions** → **Settings**
2. Adicione as variáveis:
   - `WHATSAPP_VERIFY_TOKEN`: `scalazap_verify_token_2024` (ou o token que você quiser)

**Nota:** `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são configuradas automaticamente.

### 4. Fazer Deploy

```bash
supabase functions deploy whatsapp-webhook
```

### 5. Verificar Deploy

Após o deploy, você verá a URL da função:

```
https://[PROJECT_REF].supabase.co/functions/v1/whatsapp-webhook
```

## 🔗 Configurar no Meta Business

1. Acesse [Meta Business Suite](https://business.facebook.com) ou [Facebook Developers](https://developers.facebook.com)

2. Vá em **WhatsApp** → **Configuration** → **Webhook**

3. Clique em **Edit** ou **Configure**

4. Preencha:
   - **Callback URL**: `https://[PROJECT_REF].supabase.co/functions/v1/whatsapp-webhook`
   - **Verify Token**: `scalazap_verify_token_2024` (ou o que você configurou)

5. Clique em **Verify and Save**

6. Após verificar, clique em **Manage** e marque:
   - ✅ `messages`
   - ✅ `message_status`

7. Salve as alterações

## ✅ Testar

1. Envie uma mensagem para o número WhatsApp conectado
2. Verifique os logs no Supabase Dashboard → Edge Functions → Logs
3. Verifique se a mensagem foi salva na tabela `mensagens`

## 🐛 Troubleshooting

### Erro: "Function not found"
- Verifique se o deploy foi concluído com sucesso
- Confirme que o nome da função está correto

### Erro: "Verification failed"
- Verifique se o `WHATSAPP_VERIFY_TOKEN` está configurado corretamente
- Confirme que o token no Meta Business é o mesmo

### Mensagens não estão sendo salvas
- Verifique os logs da Edge Function
- Confirme que `phone_number_id` existe na tabela `conexoes`
- Verifique se a empresa está ativa

## 📚 Estrutura da Função

```
supabase/functions/whatsapp-webhook/
  └── index.ts          # Código principal
```

## 🔐 Segurança

- A função usa `SUPABASE_SERVICE_ROLE_KEY` (acesso total ao banco)
- CORS está habilitado para permitir requisições da Meta
- Token de verificação protege contra requisições não autorizadas

## 📝 Logs

Os logs aparecem em tempo real no Supabase Dashboard:
- **Edge Functions** → **whatsapp-webhook** → **Logs**

## 🔄 Atualizar a Função

Após fazer alterações no código:

```bash
supabase functions deploy whatsapp-webhook
```

## 🌐 URL Dinâmica

A API de conexões (`/api/connections`) já está configurada para gerar automaticamente a URL do webhook baseada no `SUPABASE_URL` configurado.


