# 🔐 Configuração do Supabase - ScalaZap

## 📋 Credenciais Necessárias

Para conectar o projeto ao Supabase, você precisa fornecer **4 variáveis de ambiente**:

### 1. **SUPABASE_URL** (Server-side)
- **O que é:** URL do seu projeto Supabase
- **Formato:** `https://xxxxxxxxxxxxx.supabase.co`
- **Onde encontrar:** 
  1. Acesse https://supabase.com/dashboard
  2. Selecione seu projeto
  3. Vá em **Settings** > **API**
  4. Copie o campo **Project URL**

### 2. **SUPABASE_SERVICE_ROLE_KEY** (Server-side)
- **O que é:** Chave de serviço com permissões totais (usada no backend)
- **⚠️ IMPORTANTE:** Esta chave tem acesso total ao banco. **NUNCA** exponha no frontend!
- **Onde encontrar:**
  1. No mesmo lugar: **Settings** > **API**
  2. Copie o campo **service_role** (secret key)
  3. ⚠️ É a chave que começa com `eyJ...` e é muito longa

### 3. **NEXT_PUBLIC_SUPABASE_URL** (Client-side)
- **O que é:** Mesma URL do projeto (mas com prefixo NEXT_PUBLIC_)
- **Valor:** Mesmo valor de `SUPABASE_URL`
- **Formato:** `https://xxxxxxxxxxxxx.supabase.co`

### 4. **NEXT_PUBLIC_SUPABASE_ANON_KEY** (Client-side)
- **O que é:** Chave pública anônima (segura para usar no frontend)
- **Onde encontrar:**
  1. **Settings** > **API**
  2. Copie o campo **anon** `public` key
  3. Esta chave é segura para usar no navegador

---

## 📝 Exemplo de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase - Server-side (Backend)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldS1wcm9qZXRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYzODk2NzY5MCwiZXhwIjoxOTU0NTQzNjkwfQ.sua-chave-aqui

# Supabase - Client-side (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldS1wcm9qZXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Mzg5Njc2OTAsImV4cCI6MTk1NDU0MzY5MH0.sua-chave-anon-aqui
```

---

## 🔍 Onde Cada Variável é Usada

### Server-side (Backend/API Routes)
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Usado em:
  - `/api/auth/login`
  - `/api/campaigns`
  - `/api/connections`
  - `/api/messages`
  - `/api/admin/*`
  - `lib/supabase/server.ts`
  - `lib/api-auth.ts`

### Client-side (Frontend/Browser)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Usado em:
  - `components/auth/register-form.tsx`
  - `components/dashboard/payment-pending-banner.tsx`
  - `lib/supabase-browser.ts`

---

## 📸 Como Obter as Credenciais (Passo a Passo)

1. **Acesse o Dashboard do Supabase:**
   - https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione ou Crie um Projeto:**
   - Se não tiver projeto, clique em "New Project"
   - Preencha nome, senha do banco, região

3. **Acesse as Configurações da API:**
   - No menu lateral, clique em **Settings** (⚙️)
   - Clique em **API**

4. **Copie as Credenciais:**
   - **Project URL** → `SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ Clique em "Reveal" para ver esta chave

---

## ✅ Verificação

Após configurar, o sistema usará o Supabase para:
- ✅ Autenticação de usuários
- ✅ Armazenamento de campanhas
- ✅ Gerenciamento de conexões WhatsApp
- ✅ Histórico de mensagens
- ✅ Dados de usuários e configurações

---

## 🔒 Segurança

- ✅ **SUPABASE_SERVICE_ROLE_KEY**: NUNCA exponha no frontend ou no código público
- ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Segura para usar no navegador (tem permissões limitadas)
- ✅ Use `.env.local` para desenvolvimento (já está no .gitignore)
- ✅ Configure as variáveis no Vercel/plataforma de deploy para produção

---

## 🆘 Problemas Comuns

### Erro: "Supabase environment variables not configured"
- **Solução:** Verifique se todas as 4 variáveis estão no `.env.local`

### Erro: "Invalid API key"
- **Solução:** Verifique se copiou as chaves completas (são muito longas)

### Erro: "Failed to fetch" no frontend
- **Solução:** Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas

---

## 📞 Próximos Passos

Após configurar as variáveis:
1. Reinicie o servidor de desenvolvimento (`npm run dev`)
2. Teste o login em `/login`
3. Teste o registro em `/register`
4. Verifique se as campanhas estão sendo salvas


