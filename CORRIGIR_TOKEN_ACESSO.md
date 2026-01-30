# 🔧 Como Corrigir o Access Token Inválido

## ❌ Problema Identificado

O Access Token salvo na conexão está **inválido ou expirado**. Isso impede:
- Verificação do webhook via API do Meta
- Verificação do status do número
- Possivelmente o recebimento de mensagens reais

## ✅ SOLUÇÃO: Gerar Novo Token Permanente

### Passo 1: Acessar Meta Business Settings

1. Acesse: https://business.facebook.com/settings/system-users
2. OU: https://developers.facebook.com/apps/ → Seu App → WhatsApp → Configuration

### Passo 2: Criar ou Usar System User

1. Vá em **"System Users"** ou **"Usuários do Sistema"**
2. Se não tiver um, clique em **"Add"** ou **"Adicionar"**
3. Dê um nome (ex: "WhatsApp API User")
4. Selecione **"Admin"** como role
5. Clique em **"Create System User"**

### Passo 3: Gerar Token Permanente

1. Clique no System User criado
2. Vá em **"Generate New Token"** ou **"Gerar Novo Token"**
3. Selecione seu App do WhatsApp
4. **Marque as permissões:**
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
5. Selecione **"Never"** ou **"Nunca"** para expiração (token permanente)
6. Clique em **"Generate Token"**
7. **COPIE O TOKEN** (você só verá ele uma vez!)

### Passo 4: Atualizar Token na Conexão

1. No seu app, vá em: **Dashboard** → **Connections**
2. Encontre a conexão
3. Você precisará **atualizar o token** na conexão

**Opção A - Se houver botão de editar:**
- Clique em editar
- Cole o novo token
- Salve

**Opção B - Se não houver botão:**
- Você pode precisar criar uma nova conexão com o novo token
- OU atualizar diretamente no banco de dados

## 🔍 Verificar se Funcionou

Após atualizar o token:

1. Clique em **"Verificar Config"** novamente
2. Deve aparecer:
   - ✅ **Access Token Status**: Token válido
   - ✅ **Webhook Subscription**: Webhook está subscrito
   - ✅ **Phone Number Status**: Número verificado

## ⚠️ IMPORTANTE

- **Tokens temporários expiram** em 1-2 horas
- **Tokens permanentes não expiram** (mas podem ser revogados manualmente)
- **Sempre use tokens permanentes** para produção
- **Guarde o token em local seguro** - você só vê ele uma vez!

## 📝 Nota sobre Webhooks de Teste

Os webhooks que você viu com `phone_number_id: "123456123"` são do botão **"Testar Webhook"** do Meta. Eles são apenas para teste e não são mensagens reais.

**Mensagens reais terão:**
- `phone_number_id`: O ID real da sua conexão (não "123456123")
- `from`: Número real do remetente
- `text.body`: Texto real da mensagem

Quando uma mensagem real chegar, ela será processada normalmente pela Edge Function.


