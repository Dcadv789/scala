"use server"

import { createClient } from "./server"

export interface UserData {
  id?: string
  name: string
  email: string
  phone?: string
  plan: string
  plan_status: string
  role?: string
  connections?: number
  messages_sent?: number
  created_at?: string
  updated_at?: string
}

// Get all users (for superadmin)
export async function getAllUsers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  
  return data || []
}

// Get user by email
export async function getUserByEmail(email: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

// Create or update user
export async function upsertUser(userData: UserData) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        plan: userData.plan,
        plan_status: userData.plan_status,
        role: userData.role || "user",
        connections: userData.connections || 0,
        messages_sent: userData.messages_sent || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select()
    .single()
  
  if (error) {
    console.error("Error upserting user:", error)
    return null
  }
  
  return data
}

// Update user plan status
export async function updateUserPlanStatus(email: string, planStatus: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .update({ plan_status: planStatus, updated_at: new Date().toISOString() })
    .eq("email", email)
    .select()
    .single()
  
  if (error) {
    console.error("Error updating plan status:", error)
    return null
  }
  
  return data
}

// Update user stats (connections, messages)
export async function updateUserStats(email: string, connections: number, messagesSent: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("users")
    .update({ 
      connections, 
      messages_sent: messagesSent,
      updated_at: new Date().toISOString() 
    })
    .eq("email", email)
    .select()
    .single()
  
  if (error) {
    console.error("Error updating user stats:", error)
    return null
  }
  
  return data
}

// Delete user
export async function deleteUser(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("email", email)
  
  if (error) {
    console.error("Error deleting user:", error)
    return false
  }
  
  return true
}

// Get users count by status
export async function getUsersStats() {
  const supabase = await createClient()
  
  const { data: allUsers, error } = await supabase
    .from("users")
    .select("plan_status")
  
  if (error || !allUsers) {
    return { total: 0, active: 0, pending: 0, cancelled: 0 }
  }
  
  return {
    total: allUsers.length,
    active: allUsers.filter(u => u.plan_status === "active").length,
    pending: allUsers.filter(u => u.plan_status === "pending").length,
    cancelled: allUsers.filter(u => u.plan_status === "cancelled").length,
  }
}
