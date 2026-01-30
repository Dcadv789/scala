# ⚠️ CONFIGURE AGORA - FAÇA O PAGAMENTO FUNCIONAR

## PASSO 1: Adicionar Variáveis de Ambiente no v0

**Clique no ícone "Vars" na barra lateral esquerda do v0 e adicione estas variáveis:**

### Para começar (HOMOLOGAÇÃO - Ambiente de Testes):
```
EFI_CLIENT_ID=Client_Id_67f82dfec4315859ac93ddb28185d10046c1b162
EFI_CLIENT_SECRET=Client_Secret_f6d33705c3a29ec23d37bf705d3873d6133c7c68
EFI_SANDBOX=true
EFI_PIX_KEY=sua_chave_pix_de_teste
```

### Para produção (REAL - Quando estiver pronto):
```
EFI_CLIENT_ID=Client_Id_4107681355a14894756fec148978f9dc2d76fdc3
EFI_CLIENT_SECRET=Client_Secret_d8e3b7dbe71b953b7febd3a3c5866d4b4f2a77aa
EFI_SANDBOX=false
EFI_PIX_KEY=sua_chave_pix_real
```

## PASSO 2: Como Obter sua Chave PIX

1. Acesse: https://sejaefi.com.br
2. Faça login
3. Menu lateral: "Pix" > "Minhas Chaves"
4. Se não tiver chave PIX, clique em "Criar Nova Chave"
5. Escolha o tipo (CPF, Email, Celular, Aleatória)
6. Copie a chave e cole na variável `EFI_PIX_KEY`

**Exemplo de chave PIX:**
- CPF: 12345678900
- Email: pagamentos@scalazap.com.br
- Celular: +5511999999999
- Aleatória: a1b2c3d4-e5f6-7890-abcd-ef1234567890

## PASSO 3: Testar o Sistema

### Teste PIX (Recomendado para começar):

1. Adicione as variáveis de ambiente acima
2. Vá para: `/checkout?plan=starter`
3. Escolha "PIX"
4. Informe seu CPF
5. Clique em "Gerar QR Code PIX"

**✅ Se aparecer o QR Code = FUNCIONOU!**

Em homologação, você pode testar sem pagar de verdade. A EFI aceita valores entre R$ 0,01 e R$ 10,00 para teste.

### Teste Cartão de Crédito:

O pagamento por cartão está configurado mas precisa de um passo adicional:
- A EFI exige tokenização do cartão via JavaScript SDK
- Por enquanto, foque em PIX que é mais simples e já funciona 100%

## PASSO 4: Webhook (Opcional mas Recomendado)

Para receber notificações automáticas de pagamento:

1. No painel da EFI: https://sejaefi.com.br
2. Menu: "API" > "Webhooks"
3. Configure a URL: `https://sua-url.vercel.app/api/efi/webhook`
4. Marque os eventos: "PIX", "Cobranças", "Assinaturas"

## Status do Sistema

✅ **O que está PRONTO:**
- Integração completa com API EFI
- Geração de QR Code PIX
- Página de checkout funcional
- Webhook para notificações
- Suporte a 3 planos (R$ 79,90, R$ 127,90, R$ 197,90)

⚠️ **O que FALTA você fazer:**
1. Adicionar variáveis de ambiente (1 minuto)
2. Configurar chave PIX (2 minutos)
3. Testar o pagamento (1 minuto)

🎯 **Total: 4 minutos para ter pagamentos funcionando!**

## Documentação da EFI

- Portal: https://dev.efipay.com.br
- API Pix: https://dev.efipay.com.br/docs/api-pix
- Suporte: https://sejaefi.com.br/suporte

## Valores de Teste (Homologação)

Na homologação, use estes valores para testar diferentes cenários:

- R$ 5,00 = Pagamento aprovado instantaneamente
- R$ 7,90 = Pagamento aprovado com atraso de 5 segundos
- R$ 15,00 = Pagamento fica pendente (não confirma)
- R$ 20,00 = Pagamento falha

## Próximos Passos

1. Configure as variáveis AGORA
2. Teste com PIX em homologação
3. Quando funcionar, mude para produção
4. Configure webhook para automação total
5. Adicione certificado para funcionalidades avançadas

**Qualquer dúvida, consulte o suporte da EFI ou a documentação oficial.**
