import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

// Credenciais hardcoded conforme solicitado
const ADMIN_CREDENTIALS = {
  username: "adminadmin",
  password: "Beserra139@@",
}

export async function validateAdmin(username: string, password: string): Promise<boolean> {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}

export async function validateEmployee(
  username: string,
  password: string,
): Promise<{
  success: boolean
  employee?: any
  error?: string
}> {
  try {
    const result = await sql`
      SELECT id, nome_usuario, hash_senha, nome_completo, email, perfil, ativo
      FROM funcionarios
      WHERE nome_usuario = ${username} AND ativo = true
    `

    if (result.length === 0) {
      return { success: false, error: "Usuário não encontrado ou inativo" }
    }

    const employee = result[0]
    const isValidPassword = await bcrypt.compare(password, employee.hash_senha)

    if (!isValidPassword) {
      return { success: false, error: "Senha incorreta" }
    }

    return { success: true, employee }
  } catch (error) {
    console.error("[v0] Error validating employee:", error)
    return { success: false, error: "Erro ao validar usuário" }
  }
}

export async function createAdminSession(employeeData?: { id: number; role: string; username: string }) {
  const cookieStore = await cookies()

  if (employeeData) {
    // Store employee session with role
    cookieStore.set("admin_session", JSON.stringify(employeeData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })
  } else {
    // Legacy admin session
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
}

export async function verifyAuth(request?: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")

    if (!sessionCookie) {
      return { authenticated: false, user: null, role: null, employeeId: null }
    }

    // Try to parse as JSON (new employee sessions)
    try {
      const employeeData = JSON.parse(sessionCookie.value)
      return {
        authenticated: true,
        user: employeeData,
        role: employeeData.role,
        employeeId: employeeData.id,
      }
    } catch {
      // Legacy session format
      if (sessionCookie.value === "authenticated") {
        return {
          authenticated: true,
          user: { role: "admin" },
          role: "admin",
          employeeId: null,
        }
      }
    }

    return { authenticated: false, user: null, role: null, employeeId: null }
  } catch (error) {
    console.error("[v0] Error verifying auth:", error)
    return { authenticated: false, user: null, role: null, employeeId: null }
  }
}
