import { createClient, SupabaseClient } from "@supabase/supabase-js"

// Create Supabase client for server-side operations
export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  
  if (!url || !key) {
    console.error("Supabase environment variables not configured")
    return null
  }
  
  return createClient(url, key)
}

// Legacy export for backwards compatibility
export const supabase = getSupabaseClient()

// Helper to get client with error handling
export async function getSupabaseClientOrThrow(): Promise<SupabaseClient> {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error("Supabase client not configured")
  }
  return client
}
