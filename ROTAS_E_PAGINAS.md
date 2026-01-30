# 📋 Mapa Completo de Rotas e Páginas - ScalaZap

## 🌐 Páginas Públicas

### Landing Page
- **`/`** - Página inicial (Landing page com hero, recursos, planos, etc.)

### Autenticação
- **`/login`** - Página de login
- **`/register`** - Página de registro
  - `loading.tsx` - Estado de carregamento

### Checkout
- **`/checkout`** - Página de checkout/pagamento
  - `loading.tsx` - Estado de carregamento

---

## 👤 Dashboard do Usuário (`/dashboard`)

### Página Principal
- **`/dashboard`** - Dashboard principal (visão geral, estatísticas)

### Campanhas e Mensagens
- **`/dashboard/campaigns`** - Gerenciamento de campanhas
- **`/dashboard/messages`** - Mensagens enviadas/recebidas
  - `loading.tsx` - Estado de carregamento
- **`/dashboard/templates`** - Templates de mensagens WhatsApp

### Conexões e Contatos
- **`/dashboard/connections`** - Gerenciar conexões WhatsApp
- **`/dashboard/contacts`** - Gerenciar contatos
  - `loading.tsx` - Estado de carregamento

### Chat e Comunicação
- **`/dashboard/chat`** - Chat em tempo real
  - `loading.tsx` - Estado de carregamento
- **`/dashboard/chatbot`** - Configuração de chatbot
  - `loading.tsx` - Estado de carregamento

### Análises e Relatórios
- **`/dashboard/analytics`** - Analytics e métricas
- **`/dashboard/webhook-status`** - Status dos webhooks

### Configurações e Utilitários
- **`/dashboard/settings`** - Configurações do usuário
- **`/dashboard/tutorials`** - Tutoriais e guias
- **`/dashboard/download`** - Downloads
- **`/dashboard/warming`** - Aquecimento de números
- **`/dashboard/diagnostico`** - Diagnóstico do sistema
- **`/dashboard/efi-test`** - Teste de integração EFI
- **`/dashboard/scalavoice`** - Integração ScalaVoice

---

## 🔐 Dashboard Admin (`/admin`)

- **`/admin`** - Página inicial do admin
- **`/admin/login`** - Login do admin
- **`/admin/dashboard`** - Dashboard administrativo
  - `loading.tsx` - Estado de carregamento

---

## 👑 Dashboard Super Admin (`/superadmin`)

### Autenticação
- **`/superadmin/login`** - Login do super admin

### Dashboard Principal (`/superadmin/(dashboard)`)
- **`/superadmin`** - Dashboard principal do super admin
- **`/superadmin/analytics`** - Analytics avançado
- **`/superadmin/users`** - Gerenciamento de usuários
  - `loading.tsx` - Estado de carregamento
- **`/superadmin/connections`** - Gerenciar todas as conexões
  - `loading.tsx` - Estado de carregamento
- **`/superadmin/webhooks`** - Gerenciar webhooks
  - `loading.tsx` - Estado de carregamento
- **`/superadmin/integrations`** - Integrações do sistema
- **`/superadmin/pixels`** - Gerenciar pixels de rastreamento
  - `loading.tsx` - Estado de carregamento
- **`/superadmin/carts`** - Carrinhos abandonados
  - `loading.tsx` - Estado de carregamento
- **`/superadmin/revenue`** - Receita e faturamento
  - `loading.tsx` - Estado de carregamento
- **`/superadmin/notifications`** - Notificações do sistema
- **`/superadmin/settings`** - Configurações gerais

---

## 🔌 Rotas de API

### Autenticação (`/api/auth`)
- **`POST /api/auth/login`** - Login de usuário
- **`GET /api/auth/check-status`** - Verificar status de autenticação

### Campanhas (`/api/campaigns`)
- **`GET /api/campaigns`** - Listar campanhas
- **`POST /api/campaigns`** - Criar campanha
- **`DELETE /api/campaigns`** - Excluir campanha
- **`POST /api/campaigns/start`** - Iniciar campanha
- **`POST /api/campaigns/send`** - Enviar campanha

### Conexões (`/api/connections`)
- **`GET /api/connections`** - Listar conexões
- **`POST /api/connections`** - Criar conexão
- **`PUT /api/connections/update`** - Atualizar conexão

### Contatos (`/api/contacts`)
- **`GET /api/contacts`** - Listar contatos
- **`POST /api/contacts`** - Criar contato

### Mensagens (`/api/messages`)
- **`GET /api/messages`** - Listar mensagens
- **`POST /api/messages`** - Criar mensagem
- **`POST /api/messages/send`** - Enviar mensagem
- **`DELETE /api/messages/clear`** - Limpar mensagens

### WhatsApp (`/api/whatsapp`)
- **`POST /api/whatsapp/send`** - Enviar mensagem WhatsApp
- **`POST /api/whatsapp/send-message`** - Enviar mensagem (alternativo)
- **`POST /api/whatsapp/bulk-send`** - Envio em massa
- **`GET /api/whatsapp/messages`** - Listar mensagens
- **`POST /api/whatsapp/fetch-messages`** - Buscar mensagens
- **`GET /api/whatsapp/templates`** - Listar templates
- **`POST /api/whatsapp/templates`** - Criar template
- **`POST /api/whatsapp/generate-qr`** - Gerar QR Code
- **`POST /api/whatsapp/check-qr-status`** - Verificar status do QR
- **`POST /api/whatsapp/validate`** - Validar conexão
- **`GET /api/whatsapp/validate-test`** - Teste de validação
- **`POST /api/whatsapp/validate-test`** - Teste de validação (POST)
- **`POST /api/whatsapp/test-connection`** - Testar conexão
- **`POST /api/whatsapp/test-official`** - Testar API oficial
- **`POST /api/whatsapp/upload-media`** - Upload de mídia
- **`GET /api/whatsapp/webhook`** - Webhook WhatsApp (GET - verificação)
- **`POST /api/whatsapp/webhook`** - Webhook WhatsApp (POST - receber mensagens)
- **`POST /api/whatsapp/webhook-test`** - Teste de webhook
- **`GET /api/whatsapp/debug`** - Debug do WhatsApp
- **`POST /api/whatsapp/simulate`** - Simular envio

### EFI / Gerencianet (`/api/efi`)
- **`POST /api/efi/create-pix-charge`** - Criar cobrança PIX
- **`POST /api/efi/create-card-payment`** - Criar pagamento com cartão
- **`POST /api/efi/create-subscription`** - Criar assinatura
- **`GET /api/efi/webhook`** - Webhook EFI (GET)
- **`POST /api/efi/webhook`** - Webhook EFI (POST)
- **`POST /api/efi/test-connection`** - Testar conexão EFI

### Pagarme (`/api/pagarme`)
- **`POST /api/pagarme/webhook`** - Webhook Pagarme

### Facebook (`/api/facebook`)
- **`POST /api/facebook/exchange-token`** - Trocar token do Facebook
- **`POST /api/facebook-conversions`** - Enviar conversões para Facebook

### Pixels (`/api/pixels`)
- **`POST /api/pixels/track`** - Rastrear evento

### Webhooks (`/api/webhooks`)
- **`POST /api/webhooks/kirvano`** - Webhook Kirvano
- **`GET /api/webhook-status`** - Status dos webhooks
- **`POST /api/webhook-raw`** - Webhook raw (dados brutos)
- **`POST /api/webhook-diagnostic`** - Diagnóstico de webhook

### Admin (`/api/admin`)
- **`GET /api/admin/stats`** - Estatísticas administrativas
- **`GET /api/admin/users`** - Listar usuários
- **`POST /api/admin/users`** - Criar usuário
- **`GET /api/admin/webhooks`** - Listar webhooks
- **`GET /api/admin/webhook-logs`** - Logs de webhooks

### Leads (`/api/leads`)
- **`GET /api/leads`** - Listar leads
- **`POST /api/leads`** - Criar lead

### Assinatura (`/api/subscription`)
- **`GET /api/subscription/status`** - Status da assinatura

### Testes (`/api/test-*`)
- **`GET /api/test-messages`** - Teste de mensagens
- **`POST /api/test-whatsapp`** - Teste WhatsApp

---

## 📊 Resumo

### Total de Páginas: 37
- Públicas: 4
- Dashboard Usuário: 17
- Admin: 3
- Super Admin: 13

### Total de Rotas de API: 49
- Autenticação: 2
- Campanhas: 5
- Conexões: 3
- Contatos: 2
- Mensagens: 4
- WhatsApp: 17
- EFI: 5
- Pagarme: 1
- Facebook: 2
- Pixels: 1
- Webhooks: 4
- Admin: 4
- Leads: 2
- Assinatura: 1
- Testes: 2

---

## 🔍 Observações

- Todas as rotas de API retornam JSON
- As rotas de webhook geralmente aceitam GET (verificação) e POST (dados)
- Algumas páginas têm estados de loading (`loading.tsx`)
- O dashboard do superadmin usa agrupamento `(dashboard)` para layout compartilhado

