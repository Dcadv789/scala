import { sql } from "@/lib/db"

export interface Employee {
  id: number
  username: string
  full_name: string
  email: string
  role: "admin" | "vendedor"
  is_active: boolean
  leads_assigned: number
  created_at: Date
  updated_at: Date
}

export async function getAllEmployees(): Promise<Employee[]> {
  const result = await sql`
    SELECT id, nome_usuario, nome_completo, email, perfil, ativo, leads_atribuidos, criado_em, atualizado_em
    FROM funcionarios
    ORDER BY created_at DESC
  `
  return result.rows as Employee[]
}

export async function getActiveVendedores(): Promise<Employee[]> {
  const result = await sql`
    SELECT id, nome_usuario, nome_completo, email, perfil, ativo, leads_atribuidos, criado_em, atualizado_em
    FROM funcionarios
    WHERE perfil = 'vendedor' AND ativo = true
    ORDER BY leads_atribuidos ASC, criado_em ASC
  `
  return result.rows as Employee[]
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  const result = await sql`
    SELECT id, nome_usuario, nome_completo, email, perfil, ativo, leads_atribuidos, criado_em, atualizado_em
    FROM funcionarios
    WHERE id = ${id}
  `
  return (result.rows[0] as Employee) || null
}

export async function createEmployee(data: {
  username: string
  password_hash: string
  full_name: string
  email: string
  role: "admin" | "vendedor"
}): Promise<Employee> {
  const result = await sql`
    INSERT INTO funcionarios (nome_usuario, hash_senha, nome_completo, email, perfil, ativo, leads_atribuidos)
    VALUES (${data.username}, ${data.password_hash}, ${data.full_name}, ${data.email}, ${data.role}, true, 0)
    RETURNING id, nome_usuario, nome_completo, email, perfil, ativo, leads_atribuidos, criado_em, atualizado_em
  `
  return result.rows[0] as Employee
}

export async function updateEmployee(
  id: number,
  data: {
    full_name?: string
    email?: string
    role?: "admin" | "vendedor"
    is_active?: boolean
  },
): Promise<Employee> {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.full_name !== undefined) {
    updates.push(`nome_completo = $${paramIndex++}`)
    values.push(data.full_name)
  }
  if (data.email !== undefined) {
    updates.push(`email = $${paramIndex++}`)
    values.push(data.email)
  }
  if (data.role !== undefined) {
    updates.push(`perfil = $${paramIndex++}`)
    values.push(data.role)
  }
  if (data.is_active !== undefined) {
    updates.push(`ativo = $${paramIndex++}`)
    values.push(data.is_active)
  }

  updates.push(`atualizado_em = CURRENT_TIMESTAMP`)
  values.push(id)

  const result = await sql.unsafe(
    `
    UPDATE funcionarios
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, nome_usuario, nome_completo, email, perfil, ativo, leads_atribuidos, criado_em, atualizado_em
  `,
    values,
  )

  return result.rows[0] as Employee
}

export async function deleteEmployee(id: number): Promise<void> {
  await sql`DELETE FROM funcionarios WHERE id = ${id}`
}

export async function assignLeadToNextVendedor(leadId: number): Promise<void> {
  try {
    const tableCheck = await sql`
      SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'funcionarios'
      ) as table_exists,
      EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'id_funcionario'
      ) as column_exists
    `

    if (!tableCheck.rows[0]?.table_exists || !tableCheck.rows[0]?.column_exists) {
      console.log("[v0] Employees table or employee_id column not found. Skipping assignment.")
      return
    }

    // Get the vendedor with least leads assigned
    const vendedorResult = await sql`
      SELECT id FROM funcionarios
      WHERE perfil = 'vendedor' AND ativo = true
      ORDER BY leads_atribuidos ASC, criado_em ASC
      LIMIT 1
    `

    if (vendedorResult.rows.length === 0) {
      console.log("[v0] No active vendedores available for lead assignment")
      return
    }

    const vendedorId = vendedorResult.rows[0].id

    // Assign lead to vendedor
    await sql`
      UPDATE leads
      SET id_funcionario = ${vendedorId}
      WHERE id = ${leadId}
    `

    // Increment leads_atribuidos count
    await sql`
      UPDATE funcionarios
      SET leads_atribuidos = leads_atribuidos + 1
      WHERE id = ${vendedorId}
    `

    console.log(`[v0] Lead ${leadId} assigned to vendedor ${vendedorId}`)
  } catch (error) {
    console.error("[v0] Error assigning lead to vendedor:", error)
    // Don't throw - let the lead be saved even if assignment fails
  }
}
