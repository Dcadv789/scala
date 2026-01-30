import { neon } from "@neondatabase/serverless"

// Create a reusable SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Types for the leads table
export interface Lead {
  id?: number
  name: string
  email: string
  whatsapp: string
  company?: string
  business_type?: string
  current_volume?: string
  service_type?: string
  automation_system?: string
  goal?: string
  timeline?: string
  budget?: string
  created_at?: Date
  employee_id?: number // Added employee_id to Lead interface
}

// Function to save a lead to the database
export async function saveLead(lead: Lead) {
  try {
    console.log("[v0] Attempting to save lead:", lead)

    const result = await sql`
      INSERT INTO leads (
        nome, 
        email, 
        whatsapp, 
        empresa,
        tipo_negocio, 
        volume_atual,
        tipo_servico,
        sistema_automacao,
        objetivo, 
        prazo, 
        orcamento
      )
      VALUES (
        ${lead.name}, 
        ${lead.email}, 
        ${lead.whatsapp}, 
        ${lead.company || null},
        ${lead.business_type || null}, 
        ${lead.current_volume || null},
        ${lead.service_type || null},
        ${lead.automation_system || null},
        ${lead.goal || null}, 
        ${lead.timeline || null}, 
        ${lead.budget || null}
      )
      RETURNING *
    `

    const savedLead = result[0]
    console.log("[v0] Lead saved successfully:", savedLead)

    if (savedLead.id) {
      try {
        const { assignLeadToNextVendedor } = await import("@/lib/employees")
        await assignLeadToNextVendedor(savedLead.id)
      } catch (error) {
        console.log("[v0] Employee assignment skipped (table may not exist yet):", error)
        // Don't fail if employees table doesn't exist yet
      }
    }

    return { success: true, data: savedLead }
  } catch (error) {
    console.error("[v0] Error saving lead:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Function to get all leads
export async function getLeads() {
  try {
    const result = await sql`
      SELECT * FROM leads ORDER BY criado_em DESC
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Error fetching leads:", error)
    return { success: false, error }
  }
}

export async function getLeadsByEmployee(employeeId: number) {
  try {
    const result = await sql`
      SELECT * FROM leads 
      WHERE id_funcionario = ${employeeId}
      ORDER BY criado_em DESC
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Error fetching leads by employee:", error)
    return { success: false, error }
  }
}
