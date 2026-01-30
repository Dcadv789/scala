# Configuração da Integração EFI Bank

## O que é necessário

Para integrar o ScalaZap com a EFI Bank (antiga Gerencianet) e receber pagamentos recorrentes, você precisa:

### 1. Conta na EFI Bank
- Acesse https://sejaefi.com.br
- Crie uma conta empresarial
- Complete o processo de verificação

### 2. Credenciais da API
Após criar a conta, obtenha suas credenciais:

**No Painel EFI:**
1. Acesse "Integrações" > "API"
2. Copie seu `Client ID`
3. Copie seu `Client Secret`
4. Escolha entre Produção ou Sandbox (teste)

**✅ Suas Credenciais (Já Criadas!)**

Você já possui uma aplicação EFI ativa chamada **"software scalaZap"** com credenciais prontas para uso.

### Credenciais de Homologação (Para Testes)

```
EFI_CLIENT_ID=Client_Id_67f82dfec4315859ac93ddb28185d10046c1b162
EFI_CLIENT_SECRET=Client_Secret_f6d33705c3a29ec23d37bf705d3873d6133c7c68
EFI_SANDBOX=true
```

### Credenciais de Produção (Para Uso Real)

```
EFI_CLIENT_ID=Client_Id_4107681355a14894756fec148978f9dc2d76fdc3
EFI_CLIENT_SECRET=Client_Secret_d8e3b7dbe71b953b7febd3a3c5866d4b4f2a77aa
EFI_SANDBOX=false
```

**⚠️ IMPORTANTE:** Comece sempre com as credenciais de Homologação para testar!

### 3. Configurar Variáveis de Ambiente

Adicione no v0 (seção **Vars** da barra lateral):

```
EFI_CLIENT_ID=seu_client_id_aqui
EFI_CLIENT_SECRET=seu_client_secret_aqui
EFI_SANDBOX=false
```

**Importante:** Use `EFI_SANDBOX=true` para testes, depois mude para `false` em produção.

### 4. Criar Planos de Assinatura

Você pode criar os planos diretamente no painel da EFI ou via API:

**Plano Básico:**
- Nome: Plano Básico ScalaZap
- Valor: R$ 79,90
- Periodicidade: Mensal
- Repetições: Ilimitado

**Plano Professional:**
- Nome: Plano Professional ScalaZap
- Valor: R$ 127,90
- Periodicidade: Mensal
- Repetições: Ilimitado

**Plano Ilimitado:**
- Nome: Plano Ilimitado ScalaZap
- Valor: R$ 197,90
- Periodicidade: Mensal
- Repetições: Ilimitado

### 5. Configurar Webhook

No painel EFI, configure a URL do webhook para receber notificações:

```
https://seu-dominio.vercel.app/api/efi/webhook
```

Marque as notificações:
- ✅ Assinaturas (subscription)
- ✅ Cobranças (charge)
- ✅ PIX (se usar)

### 6. Formas de Pagamento Suportadas

A EFI suporta:
- **Cartão de Crédito:** Cobrança automática mensal
- **Boleto Bancário:** Cliente recebe boleto 10 dias antes do vencimento
- **PIX:** Pagamento instantâneo (requer configuração adicional)

### 7. Fluxo de Assinatura

1. Cliente seleciona um plano na página de preços
2. Cliente preenche dados pessoais no cadastro
3. Sistema cria assinatura na EFI
4. Cliente escolhe forma de pagamento (cartão ou boleto)
5. Sistema processa pagamento via EFI
6. Webhook notifica sobre status do pagamento
7. Sistema ativa a conta do cliente

### 8. Teste a Integração

Use o modo Sandbox (teste) primeiro:
1. Configure `EFI_SANDBOX=true`
2. Use cartões de teste da EFI
3. Verifique se webhooks são recebidos
4. Teste cancelamento de assinatura

**Cartões de Teste EFI:**
- Aprovado: 4012001037141112
- Negado: 4012001037167778

## Como Configurar PIX na EFI

### 1. Obter Chave PIX

No painel da EFI Bank:
1. Acesse "PIX" > "Minhas Chaves"
2. Crie uma chave PIX (pode ser email, telefone, CPF/CNPJ ou chave aleatória)
3. Copie sua chave PIX

### 2. Obter Certificado PIX

**🔴 ATENÇÃO: Certificado Obrigatório para PIX!**

Sua aplicação já está criada, mas você precisa gerar o certificado agora:

1. Acesse: https://sejaefi.com.br
2. Faça login
3. Vá em "API" > Selecione "software scalaZap"
4. Clique na aba "Certificados"
5. Clique em **"Gerar Certificado de Homologação"**
6. **COPIE E GUARDE A SENHA** que aparecerá
7. Faça download do arquivo `.p12`

### 3. Configurar Variáveis de Ambiente PIX

Adicione estas variáveis no v0 (clique em "Vars" na barra lateral do chat):

```
EFI_CLIENT_ID=Client_Id_67f82dfec4315859ac93ddb28185d10046c1b162
EFI_CLIENT_SECRET=Client_Secret_f6d33705c3a29ec23d37bf705d3873d6133c7c68
EFI_SANDBOX=true
EFI_PIX_KEY=sua_chave_pix_aqui
EFI_CERTIFICATE_BASE64=cole_aqui_o_certificado_convertido_para_base64
EFI_CERTIFICATE_PASSWORD=senha_do_certificado_que_voce_copiou
```

**Como converter o certificado para Base64:**
- Consulte o arquivo `CERTIFICADO_EFI_GUIA.md` para instruções detalhadas

### 4. Tipos de Pagamento PIX Disponíveis

#### PIX Cobrança Imediata (Pix Cob)
- Cliente escaneia QR Code
- Pagamento instantâneo
- Confirmação via webhook
- Ideal para: Pagamentos únicos, primeira mensalidade

**Como funciona:**
1. Sistema gera QR Code PIX
2. Cliente escaneia e paga
3. Pagamento confirmado em segundos
4. Webhook notifica o sistema
5. Conta ativada automaticamente

#### PIX Recorrente (via Open Finance)
- Débito automático mensal
- Cliente autoriza uma única vez
- Cobranças futuras automáticas
- Ideal para: Assinaturas mensais

**Como funciona:**
1. Cliente autoriza débito recorrente
2. Primeiro pagamento via PIX
3. Pagamentos seguintes automáticos
4. Debitado direto da conta do cliente

### 5. Configurar Webhook PIX

No painel EFI, configure o webhook para PIX:

**URL do Webhook:**
```
https://seu-dominio.vercel.app/api/efi/webhook
```

**Eventos a marcar:**
- ✅ pix (pagamentos recebidos)
- ✅ pix.recebiveis (confirmação de recebimento)

### 6. Escopos Necessários na API

Ao criar sua aplicação na EFI, ative os seguintes escopos:

**Para PIX Cobrança:**
- `cob.write` - Criar cobranças
- `cob.read` - Consultar cobranças
- `pix.read` - Consultar Pix recebidos
- `webhook.read` - Ler webhooks
- `webhook.write` - Configurar webhooks

**Para PIX Recorrente (Open Finance):**
- `gn.opb.payment.pix.send` - Iniciar pagamentos recorrentes

### 7. Testar PIX no Sandbox

**Ambiente de Teste:**
1. Configure `EFI_SANDBOX=true`
2. Use a chave PIX de teste da EFI
3. Gere QR Codes de teste

**Valores para teste:**
- R$ 0,01 a R$ 10,00: Pagamento confirmado automaticamente
- Acima de R$ 10,00: Pagamento fica pendente (não confirmado)

### 8. Formas de Pagamento - Comparação

| Método | Setup | Conversão | Taxa EFI | Recomendado |
|--------|-------|-----------|----------|-------------|
| **PIX Imediato** | Simples | Alta | ~0,99% | ✅ Primeira cobrança |
| **PIX Recorrente** | Médio | Média | ~1,5% | ⚠️ Assinaturas |
| **Cartão** | Médio | Média | ~3,99% | ✅ Assinaturas |
| **Boleto** | Simples | Baixa | R$ 2,90 | ❌ Pouco usado |

### 9. Recomendação de Implementação

**Melhor estratégia para ScalaZap:**

1. **Primeira cobrança:** PIX Imediato
   - Cliente paga na hora
   - Ativação instantânea
   - Alta conversão

2. **Renovações:** Cartão de Crédito
   - Débito automático confiável
   - Cliente não precisa lembrar
   - Taxa aceitável (3,99%)

3. **Alternativa:** PIX Recorrente (para quem prefere)
   - Sem uso de cartão
   - Taxa menor
   - Requer Open Finance

### 10. Próximos Passos

1. ✅ Configure credenciais EFI
2. ✅ Obtenha chave PIX
3. ✅ Baixe certificado
4. ✅ Configure variáveis de ambiente
5. ✅ Teste no Sandbox
6. ✅ Configure webhook
7. ✅ Ative modo produção

**Dúvidas?** Contate o suporte EFI: suporte@sejaefi.com.br

### 11. Documentação Oficial

- API: https://dev.efipay.com.br/docs
- Assinaturas: https://dev.efipay.com.br/docs/api-cobrancas/assinatura
- SDKs: https://dev.efipay.com.br/docs/sdk/node

### 12. Suporte

- Email: suporte@sejaefi.com.br
- Telefone: 0800 007 4815
- Chat: Disponível no painel EFI

## 📋 Checklist de Configuração

- [ ] Adicionar credenciais de Homologação nas variáveis de ambiente do v0
- [ ] Gerar certificado PIX de Homologação
- [ ] Converter certificado para Base64
- [ ] Adicionar certificado nas variáveis de ambiente
- [ ] Criar chave PIX no painel EFI
- [ ] Adicionar chave PIX nas variáveis de ambiente
- [ ] Testar geração de QR Code PIX
- [ ] Testar pagamento em ambiente de homologação
- [ ] Configurar webhook para receber notificações
- [ ] Após todos os testes, migrar para credenciais de Produção
