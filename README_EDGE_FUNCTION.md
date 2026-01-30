# 🚀 Supabase Edge Function: WhatsApp Webhook

Esta Edge Function processa webhooks do WhatsApp Business API (Meta) e salva mensagens no banco de dados.

## 📋 Estrutura

```
supabase/
  functions/
    whatsapp-webhook/
      index.ts          # Código principal da função
  config.toml           # Configuração do Supabase
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Configure no Supabase Dashboard → Edge Functions → Settings:

- `SUPABASE_URL`: URL do seu projeto (já configurada automaticamente)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (já configurada automaticamente)
- `WHATSAPP_VERIFY_TOKEN`: Token de verificação do webhook (opcional, padrão: `scalazap_verify_token_2024`)

### 2. Deploy da Função

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-ref

# Fazer deploy
supabase functions deploy whatsapp-webhook
```

## 🌐 URL do Webhook

Após o deploy, a URL será:

```
https://[PROJECT_REF].supabase.co/functions/v1/whatsapp-webhook
```

Onde `[PROJECT_REF]` é o ID do seu projeto Supabase.

## 📝 Como Funciona

### GET - Verificação da Meta

Quando você configura o webhook no Meta Business, a Meta envia uma requisição GET para verificar:

- Parâmetros: `hub.mode`, `hub.verify_token`, `hub.challenge`
- Validação: Compara `hub.verify_token` com `WHATSAPP_VERIFY_TOKEN`
- Retorno: Se válido, retorna `hub.challenge` (status 200)

### POST - Recebimento de Mensagens

Quando uma mensagem chega, a Meta envia um POST com:

1. **Identificação da Empresa:**
   - Extrai `metadata.phone_number_id` do payload
   - Busca na tabela `conexoes` para encontrar `id_empresa`

2. **Tratamento de Contato:**
   - Verifica se o telefone existe em `contatos` para aquela empresa
   - Se não existir, cria novo contato
   - Atualiza `ultima_mensagem_em` e `atualizado_em`

3. **Salvar Mensagem:**
   - Insere na tabela `mensagens` com:
     - `id_empresa`: Empresa identificada
     - `id_contato`: Contato encontrado/criado
     - `conteudo`: Texto da mensagem
     - `direcao`: 'entrada'
     - `status`: 'recebido'
     - `tipo_midia`: Tipo da mídia (text, image, audio, video, document)
     - `url_midia`: URL da mídia (se houver)

## 🔐 Segurança

- A função usa `SUPABASE_SERVICE_ROLE_KEY` para ter acesso total ao banco
- CORS está habilitado para permitir requisições da Meta
- O token de verificação protege contra requisições não autorizadas

## 🐛 Debug

Os logs aparecem no Supabase Dashboard → Edge Functions → Logs

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Meta WhatsApp Webhook Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)


