# Guia de Configuração do WhatsApp Business API

## O QUE VOCÊ PRECISA FAZER NO FACEBOOK/META

Para usar a API Oficial do WhatsApp, você precisa seguir estes passos:

### 1. Criar uma Conta Meta for Developers
- Acesse: https://developers.facebook.com/
- Faça login com sua conta Facebook
- Crie uma conta de desenvolvedor se ainda não tiver

### 2. Criar um App Business
- No painel do Meta for Developers, clique em "Meus Apps"
- Clique em "Criar App"
- Escolha o tipo "Business"
- Dê um nome ao app (ex: "ScalaZap Production")

### 3. Adicionar o Produto WhatsApp
- No painel do seu app, clique em "Adicionar Produto"
- Procure por "WhatsApp" e clique em "Configurar"
- Siga o assistente de configuração

### 4. Obter as Credenciais Necessárias

#### Para Embedded Signup (Conexão Rápida):
1. No seu app, vá em "Configurações" → "Básico"
2. Copie o **ID do App** (NEXT_PUBLIC_FACEBOOK_APP_ID)
3. Copie o **Chave Secreta do App** (FACEBOOK_APP_SECRET)
4. Vá em WhatsApp → "Configuração" 
5. Copie o **Configuration ID** (NEXT_PUBLIC_FACEBOOK_CONFIG_ID)

#### Para Configuração Manual:
1. Vá em "WhatsApp" → "Primeiros Passos"
2. Copie o **Phone Number ID**
3. Gere um **Access Token** (temporário para testes ou permanente para produção)
4. Anote o **Webhook Verify Token** (você escolhe este valor)

### 5. Configurar Webhook
- URL do Webhook: `https://SEU_DOMINIO/api/whatsapp/webhook`
- Verify Token: (o token que você escolheu)
- Campos de Subscrição: `messages`, `message_template_status_update`

### 6. Adicionar Domínio do App
- Vá em "Configurações do App" → "Básico"
- Em "Domínios do App", adicione seu domínio (ex: `v0-apizap15-ws.vercel.app`)

## CONFIGURAÇÃO NO SCALAZAP

### Opção 1: Configuração Manual (RECOMENDADO PARA INICIAR)
Esta opção é mais simples e funciona imediatamente:

1. Acesse "Conexões" no painel
2. Clique em "+ Nova Conexão"
3. Escolha "API Oficial"
4. Selecione a aba "Configuração Manual"
5. Cole as credenciais:
   - Nome da Conexão: (escolha um nome)
   - Phone Number ID: (copiado do Facebook)
   - Access Token: (copiado do Facebook)
   - Webhook Verify Token: (o que você definiu)
6. Clique em "Conectar"

### Opção 2: Embedded Signup (Requer configuração adicional)
Antes de usar esta opção, você DEVE adicionar as variáveis de ambiente:

1. Clique no ícone de variáveis (Vars) na barra lateral do chat v0
2. Adicione:
   - `NEXT_PUBLIC_FACEBOOK_APP_ID`: ID do seu app
   - `FACEBOOK_APP_SECRET`: Chave secreta do app
   - `NEXT_PUBLIC_FACEBOOK_CONFIG_ID`: Configuration ID do WhatsApp

3. Depois de configurar, use o botão "Conectar com Facebook"

## IMPORTANTE: LIMITAÇÕES DO META

1. **Conta de Teste vs Produção**:
   - Inicialmente você terá acesso a números de teste
   - Para produção, precisa verificar sua empresa no Meta Business

2. **Aprovação de Templates**:
   - Templates devem ser aprovados pelo Meta antes de usar
   - O processo leva 24-48 horas normalmente

3. **Limites de Mensagens**:
   - Contas novas têm limites de envio
   - Limite aumenta conforme uso e qualidade

## SOLUÇÃO TEMPORÁRIA: API NÃO OFICIAL

Se você precisa testar AGORA sem toda essa configuração do Meta, você pode usar a "API Não Oficial" (WhatsApp Comum) que funciona via QR Code. Essa opção não requer nenhuma configuração com Facebook.

No painel:
1. Clique em "+ Nova Conexão"
2. Escolha "WhatsApp Comum"
3. Escaneie o QR Code com seu WhatsApp
4. Pronto! A conexão estará ativa

**ATENÇÃO**: A API Não Oficial tem riscos de bloqueio pelo WhatsApp em uso comercial intenso. Use apenas para testes.

## PRECISA DE AJUDA?

- Documentação oficial Meta: https://developers.facebook.com/docs/whatsapp
- Suporte Meta Business: https://business.facebook.com/business/help
