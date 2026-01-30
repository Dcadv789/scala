import { sql } from "./db"

export interface Employee {
  id: number
  name: string
  email: string
  phone?: string
  role: "admin_master" | "vendedor"
  username: string
  is_active: boolean
  leads_assigned: number
  created_at: Date
  updated_at: Date
}

export async function getAllEmployees() {
  const result = await sql`
    SELECT id, nome, email, telefone, perfil, nome_usuario, ativo, leads_atribuidos, criado_em, atualizado_em
    FROM funcionarios
    ORDER BY criado_em DESC
  `
  return result
}

export async function getActiveVendedores() {
  const result = await sql`
    SELECT id, name, email, leads_assigned
    FROM funcionarios
    WHERE role = 'vendedor' AND is_active = true
    ORDER BY leads_assigned ASC, created_at ASC
  `
  return result
}

export async function createEmployee(data: {
  name: string
  email: string
  phone?: string
  role: "admin_master" | "vendedor"
  username: string
  password_hash: string
}) {
  const result = await sql`
    INSERT INTO funcionarios (nome, email, telefone, perfil, nome_usuario, hash_senha)
    VALUES (${data.name}, ${data.email}, ${data.phone || null}, ${data.role}, ${data.username}, ${data.password_hash})
    RETURNING *
  `
  return result[0]
}

export async function updateEmployee(
  id: number,
  data: {
    name?: string
    email?: string
    phone?: string
    is_active?: boolean
  },
) {
  const result = await sql`
    UPDATE funcionarios
    SET 
      nome = COALESCE(${data.name}, nome),
      email = COALESCE(${data.email}, email),
      telefone = COALESCE(${data.phone}, telefone),
      ativo = COALESCE(${data.is_active}, ativo),
      atualizado_em = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0]
}

export async function deleteEmployee(id: number) {
  await sql`DELETE FROM funcionarios WHERE id = ${id}`
}

export async function getNextVendedor() {
  // Pega o vendedor ativo com menos leads atribuídos
  const result = await sql`
    SELECT id, nome
    FROM funcionarios
    WHERE perfil = 'vendedor' AND ativo = true
    ORDER BY leads_atribuidos ASC, criado_em ASC
    LIMIT 1
  `
  return result[0] || null
}

export async function assignLeadToVendedor(leadId: number, vendedorId: number) {
  // Atribui lead ao vendedor e incrementa contador
  await sql`
    UPDATE leads
    SET atribuido_para = ${vendedorId}, atribuido_em = NOW()
    WHERE id = ${leadId}
  `

  await sql`
    UPDATE funcionarios
    SET leads_atribuidos = leads_atribuidos + 1
    WHERE id = ${vendedorId}
  `
}

export async function getEmployeeByUsername(username: string) {
  const result = await sql`
    SELECT * FROM funcionarios WHERE nome_usuario = ${username}
  `
  return result[0] || null
}
