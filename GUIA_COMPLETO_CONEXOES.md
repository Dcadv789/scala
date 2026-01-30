# Guia Completo de Conexões WhatsApp - ScalaZap

## 📋 Resumo dos Métodos de Conexão

O ScalaZap suporta **3 métodos** de conexão com WhatsApp:

### 1️⃣ API Oficial - Configuração Manual
**Para quem já tem:** Conta Meta Business, WABA criada, Phone Number ID e Access Token

**Como funciona:**
- Você já configurou tudo no Meta Business Suite
- Apenas insere as credenciais no ScalaZap
- Requer configuração técnica prévia no Meta

**Requisitos:**
- Phone Number ID (encontrado no WhatsApp Manager)
- Access Token permanente (gerado via System User)
- Webhook Token (você define)
- Business Account ID

---

### 2️⃣ Coexistência - Conexão Simplificada com Facebook
**Para quem quer:** Usar WhatsApp Business App + Cloud API no mesmo número

**Como funciona:**
1. Você clica em "Conectar com Facebook"
2. Faz login com sua conta do Facebook
3. O Meta cria automaticamente uma WABA para você
4. Você escaneia um QR Code no WhatsApp Business App
5. Pronto! O número está conectado em modo coexistência

**Vantagens:**
- ✅ Não precisa migrar do WhatsApp Business App
- ✅ Continua usando o app normalmente
- ✅ Mensagens sincronizadas entre App e API
- ✅ Configuração em menos de 5 minutos
- ✅ Não precisa conhecimento técnico

**Requisitos:**
- WhatsApp Business App versão 2.24.17 ou superior
- Conta do Facebook
- Número de telefone verificado

---

### 3️⃣ WhatsApp Comum - Sem API Oficial
**Para quem quer:** Conectar número pessoal ou sem conta Meta Business

**Como funciona:**
1. Escaneia QR Code (como WhatsApp Web)
2. Conecta via protocolo não-oficial (Baileys)
3. Usa o WhatsApp normalmente no celular

**Vantagens:**
- ✅ Não precisa de conta Meta Business
- ✅ Funciona com número pessoal
- ✅ Configuração instantânea
- ✅ Gratuito (sem custos da Meta)

**Limitações:**
- ⚠️ Não é oficial (pode ter instabilidade)
- ⚠️ Risco de bloqueio se usar para spam
- ⚠️ Limite de mensagens por hora (não documentado)

---

## 🔧 Como Implementar no ScalaZap

### Para Desenvolvedores

#### Método 1: API Oficial Manual
```typescript
// Já implementado em lib/whatsapp-api.ts
const connection = {
  type: 'official',
  phoneNumberId: '123456789',
  accessToken: 'EAAG...',
  businessAccountId: '987654321'
}
```

#### Método 2: Embedded Signup (Coexistência)
```typescript
// Requer Facebook SDK + App ID + Config ID
// Fluxo implementado com Facebook Login
FB.login((response) => {
  // Captura WABA ID, Phone Number ID, Token
}, {
  scope: 'whatsapp_business_management,whatsapp_business_messaging',
  extras: {
    setup: {
      // ... configuração do embedded signup
    }
  }
});
```

#### Método 3: Baileys (Não Oficial)
```typescript
// Requer biblioteca @whiskeysockets/baileys
import makeWASocket from '@whiskeysockets/baileys'

const sock = makeWASocket({
  printQRInTerminal: true,
  // ... configurações
})

// Gera QR Code para scan
sock.ev.on('connection.update', (update) => {
  const { qr } = update
  // Exibir QR para usuário
})
```

---

## 🎯 Qual Método Recomendar para o Cliente?

| Critério | API Manual | Coexistência | Baileys |
|----------|-----------|--------------|---------|
| **Facilidade** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Estabilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Custo** | 💰💰 | 💰💰 | Grátis |
| **Suporte** | Oficial | Oficial | Comunidade |
| **Volume** | Alto | Alto | Médio |

**Recomendação:**
- **Pequenas empresas:** Coexistência (fácil + oficial)
- **Médias/Grandes:** API Manual (controle total)
- **Testes/Baixo volume:** Baileys (gratuito)

---

## 📞 Suporte

Para dúvidas sobre implementação, consulte:
- [Meta WhatsApp Business Docs](https://developers.facebook.com/docs/whatsapp)
- [Embedded Signup Guide](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Baileys Documentation](https://baileys.wiki/)
