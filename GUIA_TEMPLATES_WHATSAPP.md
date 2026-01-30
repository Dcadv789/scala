# 📋 Guia de Implementação - Gestão de Templates WhatsApp

Este guia documenta a implementação completa do módulo de **Gestão de Modelos (Templates)** para WhatsApp Business API.

## 📦 Arquivos Criados

### 1. **SQL Migration** - `scripts/update-modelos-table.sql`
Atualiza a tabela `modelos` para suportar a estrutura completa da Meta API:
- `id_meta`: ID do template gerado pelo Facebook
- `idioma`: Código do idioma (ex: 'pt_BR', 'en_US')
- `categoria`: MARKETING, UTILITY, AUTHENTICATION
- `componentes`: JSONB com estrutura completa (HEADER, BODY, FOOTER, BUTTONS)
- `status`: APPROVED, REJECTED, PENDING, PAUSED, PENDING_DELETION
- `motivo_rejeicao`: Texto explicativo quando REJECTED
- `id_empresa`: FK para empresas (Multi-Tenant)

### 2. **Edge Function** - `supabase/functions/templates-manager/index.ts`
Edge Function com duas ações principais:

#### **Ação A: Sincronizar (SYNC)**
```typescript
POST /templates/sync
Body: {
  action: "sync",
  id_empresa: "uuid-da-empresa"
}
```

**Funcionalidade:**
- Busca `id_waba` e `token_acesso` na tabela `conexoes`
- Chama API da Meta: `GET /{id_waba}/message_templates`
- Faz UPSERT de cada template na tabela `modelos`
- Retorna estatísticas (criados, atualizados, total)

#### **Ação B: Criar Novo (CREATE)**
```typescript
POST /templates/create
Body: {
  action: "create",
  id_empresa: "uuid-da-empresa",
  nome: "nome_do_template", // Apenas minúsculas, números e underscore
  categoria: "MARKETING" | "UTILITY" | "AUTHENTICATION",
  idioma: "pt_BR",
  componentes: {
    header?: { type: "HEADER", format: "TEXT" | "IMAGE", text: "...", example: {...} },
    body: { type: "BODY", text: "...", example: {...} },
    footer?: { type: "FOOTER", text: "..." },
    buttons?: [
      { type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER", text: "...", url?: "...", phone_number?: "..." }
    ]
  }
}
```

**Funcionalidade:**
- Valida formato do nome (regex: `/^[a-z0-9_]+$/`)
- Monta estrutura para Meta API
- Cria template via `POST /{id_waba}/message_templates`
- Salva no banco com status `PENDING`
- Retorna template criado com `id_meta`

### 3. **Webhook Atualizado** - `supabase/functions/whatsapp-webhook/index.ts`
Adicionado tratamento para evento `message_template_status_update`:
- Detecta quando Meta aprova/rejeita template
- Atualiza automaticamente `status` e `motivo_rejeicao` na tabela `modelos`
- Funciona automaticamente (não precisa polling)

## 🚀 Como Usar

### **Passo 1: Executar SQL Migration**
```sql
-- Execute no Supabase SQL Editor
\i scripts/update-modelos-table.sql
```

### **Passo 2: Deploy da Edge Function**
```bash
# No diretório do projeto
supabase functions deploy templates-manager
```

### **Passo 3: Configurar Variáveis de Ambiente**
No Supabase Dashboard → Edge Functions → templates-manager:
- `SUPABASE_URL`: Já configurado
- `SUPABASE_SERVICE_ROLE_KEY`: Já configurado

### **Passo 4: Atualizar Webhook (se necessário)**
```bash
supabase functions deploy whatsapp-webhook
```

## 📱 Frontend - Estrutura Sugerida

### **1. Página de Listagem** (`app/dashboard/templates/page.tsx`)

```typescript
// Exemplo de estrutura
const TemplatesPage = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)

  // Badges de status
  const getStatusBadge = (status: string) => {
    const badges = {
      APPROVED: { color: "green", label: "Aprovado" },
      PENDING: { color: "yellow", label: "Pendente" },
      REJECTED: { color: "red", label: "Rejeitado" },
      PAUSED: { color: "gray", label: "Pausado" }
    }
    return badges[status] || badges.PENDING
  }

  // Sincronizar templates
  const handleSync = async () => {
    const response = await fetch('/api/templates/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'sync', id_empresa: empresaId })
    })
    // Atualizar lista
  }

  return (
    <div>
      <Button onClick={handleSync}>Sincronizar Templates</Button>
      <Table>
        {templates.map(template => (
          <tr key={template.id}>
            <td>{template.nome}</td>
            <td><Badge color={getStatusBadge(template.status).color}>
              {getStatusBadge(template.status).label}
            </Badge></td>
            <td>{template.categoria}</td>
            <td>{template.idioma}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
```

### **2. Formulário de Criação** (`app/dashboard/templates/create/page.tsx`)

```typescript
const CreateTemplateForm = () => {
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "MARKETING",
    idioma: "pt_BR",
    componentes: {
      header: null,
      body: { text: "", example: { body_text: [[]] } },
      footer: null,
      buttons: []
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/templates/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        id_empresa: empresaId,
        ...formData
      })
    })
    // Redirecionar ou mostrar sucesso
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        label="Nome do Template"
        value={formData.nome}
        onChange={(e) => setFormData({...formData, nome: e.target.value})}
        placeholder="ex: boas_vindas_cliente"
        pattern="[a-z0-9_]+"
      />
      <Select label="Categoria" value={formData.categoria}>
        <option value="MARKETING">Marketing</option>
        <option value="UTILITY">Utilitário</option>
        <option value="AUTHENTICATION">Autenticação</option>
      </Select>
      <Textarea 
        label="Corpo da Mensagem"
        value={formData.componentes.body.text}
        onChange={(e) => setFormData({
          ...formData,
          componentes: {
            ...formData.componentes,
            body: { ...formData.componentes.body, text: e.target.value }
          }
        })}
        placeholder="Olá {{1}}, bem-vindo!"
      />
      <Button type="submit">Criar Template</Button>
    </form>
  )
}
```

### **3. API Routes (Next.js)**

```typescript
// app/api/templates/sync/route.ts
export async function POST(req: Request) {
  const { id_empresa } = await req.json()
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/templates-manager`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'sync', id_empresa })
    }
  )
  
  return NextResponse.json(await response.json())
}

// app/api/templates/create/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/templates-manager`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  )
  
  return NextResponse.json(await response.json())
}
```

## 🔍 Estrutura de Componentes (JSON)

### **Exemplo Completo:**

```json
{
  "componentes": {
    "header": {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Bem-vindo, {{1}}!",
      "example": {
        "header_text": ["João Silva"]
      }
    },
    "body": {
      "type": "BODY",
      "text": "Olá {{1}}, sua conta foi criada com sucesso! Seu código de acesso é: {{2}}",
      "example": {
        "body_text": [["João Silva", "ABC123"]]
      }
    },
    "footer": {
      "type": "FOOTER",
      "text": "Equipe ScalaZap"
    },
    "buttons": [
      {
        "type": "QUICK_REPLY",
        "text": "Confirmar"
      },
      {
        "type": "URL",
        "text": "Acessar Portal",
        "url": "https://exemplo.com/portal"
      }
    ]
  }
}
```

## ⚠️ Regras Importantes

1. **Nome do Template:**
   - Apenas letras minúsculas, números e underscore
   - Não pode começar com número
   - Máximo 512 caracteres

2. **Status:**
   - `PENDING`: Enviado para aprovação (pode levar 1 min a 24h)
   - `APPROVED`: Aprovado pela Meta, pode ser usado
   - `REJECTED`: Rejeitado (ver `motivo_rejeicao`)
   - `PAUSED`: Pausado pela Meta
   - `PENDING_DELETION`: Aguardando exclusão

3. **Categorias:**
   - `MARKETING`: Promoções, ofertas (janela de 24h)
   - `UTILITY`: Transacionais (sem janela)
   - `AUTHENTICATION`: Códigos OTP (sem janela)

4. **Variáveis:**
   - Use `{{1}}`, `{{2}}`, etc. no texto
   - Defina exemplos em `example.body_text` ou `example.header_text`

## 🐛 Troubleshooting

### **Erro: "Conexão não encontrada"**
- Verifique se existe uma conexão ativa (`status = 'connected'`) para a empresa
- Verifique se `id_waba` e `token_acesso` estão preenchidos

### **Erro: "Invalid template name"**
- Nome deve conter apenas: `a-z`, `0-9`, `_`
- Não pode ter espaços ou caracteres especiais

### **Template não atualiza status automaticamente**
- Verifique se o webhook está configurado corretamente na Meta
- Verifique logs da Edge Function `whatsapp-webhook`

### **Sincronização não retorna templates**
- Verifique se o `token_acesso` está válido
- Verifique se o `id_waba` está correto
- Verifique logs da Edge Function `templates-manager`

## 📚 Referências

- [Meta WhatsApp Business API - Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Template Components](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/components)
- [Template Status Updates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/status-updates)


