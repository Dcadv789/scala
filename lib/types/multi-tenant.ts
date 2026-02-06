// =============================================
// TIPOS MULTI-TENANT (SaaS)
// =============================================

export interface Empresa {
  id: string
  nome: string
  documento?: string
  email?: string
  telefone?: string
  plano_atual: string
  status_assinatura: 'pending' | 'active' | 'cancelled' | 'expired' | 'suspended'
  limite_conexoes: number
  limite_mensagens_mes: number
  limite_campanhas_mes: number
  limite_contatos: number
  criado_em: Date
  atualizado_em: Date
}

export interface Membro {
  id: string
  id_perfil: string // FK para perfis.id (que é o mesmo que auth.users.id)
  id_empresa: string
  nome: string
  email: string
  cargo: 'dono' | 'admin' | 'membro' | 'visualizador'
  eh_superadmin: boolean
  ativo: boolean
  ultimo_acesso?: Date
  criado_em: Date
  atualizado_em: Date
}

export interface MembroComEmpresa extends Membro {
  empresa: Empresa
}

// Contexto de autenticação Multi-Tenant
export interface AuthContext {
  membro: MembroComEmpresa
  isSuperAdmin: boolean
  canViewAll: boolean // Se pode ver dados de todas as empresas
  empresaId: string // ID da empresa do membro
}

// Helper para verificar permissões
export function canAccessEmpresa(authContext: AuthContext, empresaId: string): boolean {
  // Superadmin pode acessar qualquer empresa
  if (authContext.isSuperAdmin) {
    return true
  }
  
  // Membro só pode acessar sua própria empresa
  return authContext.empresaId === empresaId
}

// Helper para obter filtro de empresa para queries
export function getEmpresaFilter(authContext: AuthContext): { id_empresa?: string } | {} {
  // Superadmin não tem filtro (vê tudo)
  if (authContext.isSuperAdmin) {
    return {}
  }
  
  // Membro só vê dados da sua empresa
  return { id_empresa: authContext.empresaId }
}


