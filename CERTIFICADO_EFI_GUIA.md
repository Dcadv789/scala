# 🔐 Guia Completo: Certificado Digital EFI

## Por que preciso de um certificado?

A API Pix da EFI usa criptografia para garantir segurança nas transações. O certificado digital é obrigatório para:
- ✅ Criar cobranças PIX
- ✅ Consultar cobranças
- ✅ Receber webhooks de pagamento
- ✅ Usar PIX Recorrente

## Passo a Passo Detalhado

### 1. Acessar o Portal EFI

1. Entre em: https://sejaefi.com.br/
2. Faça login com sua conta
3. No menu lateral, clique em **"API"**

### 2. Selecionar sua Aplicação

1. Você verá a lista de aplicações
2. Clique em **"software scalaZap"** (sua aplicação)

### 3. Gerar o Certificado

1. Dentro da aplicação, clique na aba **"Certificados"**
2. Você verá duas opções:
   - Certificado de Homologação (para testes)
   - Certificado de Produção (para uso real)

3. Clique em **"Gerar Certificado de Homologação"** primeiro

4. O sistema irá gerar um certificado `.p12`

5. **IMPORTANTE:** Uma senha será exibida. **COPIE E GUARDE** essa senha!

6. Faça o download do arquivo `.p12`

### 4. Converter o Certificado para Base64 (para v0)

Como o v0 não aceita upload de arquivos .p12 diretamente, você precisa converter para Base64:

**No Mac/Linux:**
```bash
base64 -i certificado-efi.p12 -o certificado-base64.txt
```

**No Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificado-efi.p12")) | Out-File certificado-base64.txt
```

**Online (se preferir):**
1. Acesse: https://www.base64encode.org/
2. Faça upload do arquivo .p12
3. Clique em "Encode"
4. Copie o resultado

### 5. Adicionar no v0

1. No chat do v0, clique no ícone **"Vars"** na barra lateral
2. Adicione as seguintes variáveis:

```
EFI_CERTIFICATE_BASE64=Cole_aqui_o_conteudo_do_arquivo_base64_sem_espacos_ou_quebras_de_linha
EFI_CERTIFICATE_PASSWORD=senha_que_voce_copiou_ao_gerar
```

### 6. Testar

Após configurar:
1. Vá para a página de Checkout
2. Selecione "PIX" como forma de pagamento
3. Clique em "Gerar QR Code PIX"
4. Se aparecer um QR Code, está funcionando! 🎉

## Solução de Problemas

### "Certificado inválido"
- Verifique se copiou o Base64 completo sem quebras de linha
- Confirme se a senha está correta
- Certifique-se de estar usando o certificado do ambiente correto (Homologação/Produção)

### "Não consigo gerar QR Code"
- Verifique se todas as variáveis de ambiente estão configuradas:
  - EFI_CLIENT_ID
  - EFI_CLIENT_SECRET
  - EFI_PIX_KEY
  - EFI_CERTIFICATE_BASE64
  - EFI_CERTIFICATE_PASSWORD
  - EFI_SANDBOX=true (para testes)

### "Erro ao conectar com a EFI"
- Confirme que está usando as credenciais corretas (Homologação para testes)
- Verifique sua conexão com a internet
- Tente gerar um novo certificado

## Quando usar Certificado de Produção?

Só gere o certificado de produção quando:
- ✅ Já testou tudo em homologação
- ✅ Está pronto para receber pagamentos reais
- ✅ Configurou todos os webhooks corretamente

## Dicas de Segurança

- 🔒 Nunca compartilhe o arquivo .p12 ou a senha
- 🔒 Não commite o certificado no Git/GitHub
- 🔒 Use variáveis de ambiente para armazenar credenciais
- 🔒 Rotacione os certificados periodicamente (EFI recomenda a cada 6 meses)
