# 🔌 Guia Completo: Como Conectar o WhatsApp no ScalaZap

## ⚠️ IMPORTANTE: Entenda as Limitações do v0

O ScalaZap está rodando no **v0** (ambiente de frontend apenas). Isso significa que:

- ✅ **Funciona:** Enviar mensagens via API Oficial do WhatsApp
- ❌ **NÃO Funciona:** Receber mensagens (precisa de servidor backend rodando 24/7)
- ❌ **NÃO Funciona:** Embedded Signup real (precisa de app configurado no Meta)
- ❌ **NÃO Funciona:** WhatsApp Comum via Baileys (precisa de servidor Node.js)

---

## 📋 Método 1: API Oficial Manual (RECOMENDADO)

Este é o **ÚNICO método que funciona parcialmente** no v0. Você consegue **ENVIAR** mensagens, mas **NÃO RECEBER**.

### Pré-requisitos

1. **Conta Meta Business** criada em https://business.facebook.com
2. **App criado** no Meta for Developers https://developers.facebook.com
3. **WhatsApp Business API** adicionado ao seu app
4. **Número de telefone** verificado no WhatsApp Manager

### Passo a Passo Detalhado

#### 1. Criar App no Meta for Developers

```
1. Acesse: https://developers.facebook.com/apps
2. Clique em "Create App" (Criar App)
3. Selecione tipo: "Business"
4. Preencha:
   - Nome do app: "ScalaZap Messaging"
   - Email de contato: seu@email.com
   - Business Account: selecione sua conta business
5. Clique em "Create App"
```

#### 2. Adicionar WhatsApp Product

```
1. No dashboard do seu app, procure "WhatsApp"
2. Clique em "Set up" (Configurar)
3. Selecione ou crie uma WhatsApp Business Account (WABA)
4. Adicione um número de telefone (pode usar o número de teste fornecido)
```

#### 3. Obter as Credenciais

**A. Phone Number ID:**
```
1. Acesse: https://business.facebook.com/wa/manage/phone-numbers
2. Clique no seu número de telefone
3. Copie o "Phone number ID" (formato: 123456789012345)
```

**B. Access Token (Temporário para testes):**
```
1. No dashboard do app, vá em "WhatsApp" → "API Setup"
2. Você verá um "Temporary access token"
3. Copie este token (válido por 24 horas)
```

**C. Access Token Permanente (Produção):**
```
1. Acesse: https://business.facebook.com/settings/system-users
2. Clique em "Add" para criar um System User
3. Dê permissão de "Admin"
4. Clique no System User criado
5. Clique em "Generate New Token"
6. Selecione seu app
7. Marque as permissões:
   - whatsapp_business_management
   - whatsapp_business_messaging
8. Clique em "Generate Token"
9. COPIE E SALVE este token (não aparecerá novamente!)
```

**D. WABA ID:**
```
1. Acesse: https://business.facebook.com/wa/manage/home
2. Na URL você verá algo como: /wa/manage/home/?waba_id=123456789098765
3. O número após "waba_id=" é seu WABA ID
```

#### 4. Conectar no ScalaZap

```
1. Acesse o ScalaZap → Conexões
2. Vá na aba "API Oficial - Configuração Manual"
3. Preencha:
   - Phone Number ID: cole o ID obtido
   - Access Token: cole o token permanente
   - WABA ID: cole o WABA ID
4. Clique em "Validar e Conectar"
5. Se válido, aparecerá o Webhook URL e Verify Token
```

#### 5. Testar o Envio

```javascript
// O sistema já valida ao conectar
// Para testar envio real:
1. Vá em "Campanhas"
2. Crie uma nova campanha
3. Adicione um número de teste
4. Envie uma mensagem
```

---

## 🚫 Método 2: Coexistência com Facebook (NÃO FUNCIONA NO V0)

Este método **REQUER**:
- App configurado no Meta com Embedded Signup
- `NEXT_PUBLIC_FACEBOOK_APP_ID` configurado
- `NEXT_PUBLIC_FACEBOOK_CONFIG_ID` configurado
- Domínio verificado no Meta
- Backend para processar OAuth

**Status:** ❌ Não funcional no v0 (apenas frontend)

---

## 🚫 Método 3: WhatsApp Comum via QR Code (NÃO FUNCIONA NO V0)

Este método **REQUER**:
- Servidor Node.js rodando 24/7
- Biblioteca Baileys instalada
- WebSocket connection permanente
- Sessão ativa do WhatsApp

**Status:** ❌ Não funcional no v0 (apenas frontend)

---

## ✅ O Que Você PODE Fazer Agora

### Com API Oficial Conectada:

1. **Enviar mensagens de texto**
   - Via campanhas
   - Via chat (simulado)
   
2. **Enviar templates aprovados**
   - Criar templates
   - Submeter para aprovação Meta
   - Usar em campanhas

3. **Enviar mídias**
   - Imagens
   - Vídeos
   - Documentos

### O Que NÃO Funciona:

1. ❌ Receber mensagens (precisa webhook em servidor real)
2. ❌ Chat em tempo real (precisa webhooks)
3. ❌ Notificações de status de entrega
4. ❌ Respostas automáticas

---

## 🔧 Troubleshooting

### Erro: "Invalid OAuth access token"
- **Solução:** Token expirou ou está incorreto. Gere um novo token permanente.

### Erro: "Phone number not registered"
- **Solução:** Verifique se o Phone Number ID está correto e o número está verificado no WhatsApp Manager.

### Erro: "Missing permissions"
- **Solução:** Ao gerar o token, certifique-se de marcar as permissões corretas:
  - whatsapp_business_management
  - whatsapp_business_messaging

### "Validar e Conectar" não faz nada
- **Solução:** Abra o Console do navegador (F12) e veja os logs detalhados do erro.

### Webhook não recebe mensagens
- **Solução:** Isso é esperado no v0. Webhooks só funcionam em servidor real com URL pública HTTPS.

---

## 📚 Links Úteis

- Meta for Developers: https://developers.facebook.com
- WhatsApp Manager: https://business.facebook.com/wa/manage
- Graph API Explorer: https://developers.facebook.com/tools/explorer
- System Users: https://business.facebook.com/settings/system-users
- Documentação Oficial: https://developers.facebook.com/docs/whatsapp/cloud-api

---

## 🎯 Próximos Passos Para Produção

Para colocar o ScalaZap em produção real com todas as funcionalidades:

1. **Deploy em servidor real:**
   - Vercel, AWS, Digital Ocean, etc.
   - Com backend Next.js rodando

2. **Configurar variáveis de ambiente:**
   ```
   NEXT_PUBLIC_FACEBOOK_APP_ID=seu_app_id
   FACEBOOK_APP_SECRET=seu_app_secret
   NEXT_PUBLIC_FACEBOOK_CONFIG_ID=seu_config_id
   ```

3. **Configurar domínio:**
   - Domínio próprio com HTTPS
   - Verificar domínio no Meta Business

4. **Configurar webhooks:**
   - URL: https://seudominio.com/api/whatsapp/webhook
   - Configurar no WhatsApp Manager
   - Receber mensagens em tempo real

5. **Adicionar banco de dados:**
   - Supabase, PostgreSQL, etc.
   - Armazenar mensagens, campanhas, etc.

---

**Dúvidas?** Abra o console do navegador (F12) e veja os logs detalhados!
