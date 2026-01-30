# 🏢 Migração para Arquitetura Multi-Tenant (SaaS)

Este documento descreve a migração completa do sistema para arquitetura Multi-Tenant, onde **Empresas** detêm os dados e **Membros** são usuários que pertencem a empresas.

## 📋 Estrutura Nova

### Tabelas Principais

1. **`empresas`** - Representa uma empresa contratante
   - `id` (UUID)
   - `nome`, `documento`, `email`, `telefone`
   - `plano_atual`, `status_assinatura`
   - `limite_conexoes`, `limite_mensagens_mes`, etc.

2. **`membros`** - Representa um usuário/membro de uma empresa
   - `id` (UUID)
   - `id_usuario` (FK para auth.users ou email)
   - `id_empresa` (FK para empresas)
   - `nome`, `email`, `cargo`
   - `eh_superadmin` (boolean) - Se true, pode ver dados de todas as empresas
   - `ativo` (boolean)

### Todas as Tabelas de Dados Agora Têm `id_empresa`

- `conexoes`
- `contatos`
- `campanhas`
- `mensagens_webhook`
- `funis`
- `etiquetas`
- `pagamentos`
- `assinaturas`
- E todas as outras...

## 🚀 Como Executar a Migração

### 1. Execute o Script SQL

```bash
# No Supabase SQL Editor, execute:
scripts/migration-multi-tenant-completa.sql
```

Este script:
- ✅ Cria as tabelas `empresas` e `membros`
- ✅ Migra dados de `usuarios` para `empresas` e `membros`
- ✅ Adiciona `id_empresa` em todas as tabelas de dados
- ✅ Preenche `id_empresa` baseado no dono atual

### 2. Atualize o Código

O código já foi atualizado com:
- ✅ Tipos TypeScript em `lib/types/multi-tenant.ts`
- ✅ Funções de autenticação em `lib/api-auth-multi-tenant.ts`
- ✅ Exemplo de API atualizada em `app/api/contacts/route.ts`

## 🔐 Regras de Visibilidade

### Superadmin (`eh_superadmin = true`)
- ✅ Pode ver dados de **TODAS** as empresas
- ✅ Não tem filtro `id_empresa` nas queries
- ✅ Acesso total ao sistema

### Membro Normal (`eh_superadmin = false`)
- ✅ Só pode ver dados da **sua própria empresa**
- ✅ Todas as queries são filtradas por `id_empresa`
- ✅ Não pode acessar dados de outras empresas

## 💻 Como Usar no Código

### 1. Obter Contexto de Autenticação

```typescript
import { getAuthContext, getEmpresaFilter } from "@/lib/api-auth-multi-tenant"

export async function GET(request: NextRequest) {
  // Obter contexto completo
  const authContext = await getAuthContext(request)
  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  
  // Verificar se é superadmin
  if (authContext.isSuperAdmin) {
    // Pode ver tudo
  }
  
  // Obter ID da empresa
  const empresaId = authContext.empresaId
}
```

### 2. Aplicar Filtro Multi-Tenant em Queries

```typescript
import { getEmpresaFilter } from "@/lib/api-auth-multi-tenant"

export async function GET(request: NextRequest) {
  const empresaFilter = await getEmpresaFilter(request)
  
  let query = supabase
    .from("contatos")
    .select("*")
  
  // Aplicar filtro (vazio se superadmin, { id_empresa: string } se membro)
  if ('id_empresa' in empresaFilter && empresaFilter.id_empresa) {
    query = query.eq("id_empresa", empresaFilter.id_empresa)
  }
  
  const { data } = await query
}
```

### 3. Criar Dados com `id_empresa`

```typescript
import { getAuthContext } from "@/lib/api-auth-multi-tenant"

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  
  const body = await request.json()
  
  const { data } = await supabase
    .from("contatos")
    .insert({
      ...body,
      id_empresa: authContext.empresaId // Sempre incluir id_empresa
    })
}
```

### 4. Verificar Permissão de Acesso

```typescript
import { canAccessEmpresa } from "@/lib/api-auth-multi-tenant"

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresa_id")
  
  if (empresaId && !await canAccessEmpresa(request, empresaId)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
}
```

## 📝 Checklist de Migração

- [x] Script SQL criado
- [x] Tipos TypeScript criados
- [x] Funções de autenticação criadas
- [x] Exemplo de API atualizada (contacts)
- [ ] Atualizar todas as outras APIs
- [ ] Atualizar frontend para usar nova estrutura
- [ ] Testar login e autenticação
- [ ] Testar isolamento de dados entre empresas
- [ ] Testar acesso de superadmin

## 🔄 Próximos Passos

1. **Atualizar todas as APIs** para usar `getAuthContext` e `getEmpresaFilter`
2. **Atualizar frontend** para carregar dados do membro e empresa
3. **Criar interface de gerenciamento de membros** (adicionar/remover membros da empresa)
4. **Implementar troca de empresa** (se um membro pertencer a múltiplas empresas)

## ⚠️ Notas Importantes

- A tabela `usuarios` ainda existe para compatibilidade, mas não deve ser usada para novos dados
- Use sempre `membros` e `empresas` para novas funcionalidades
- O campo `id_usuario` em `membros` pode ser UUID do Supabase Auth ou email/username
- Superadmins são criados manualmente na tabela `membros` com `eh_superadmin = true`


