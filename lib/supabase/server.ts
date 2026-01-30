import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Create Supabase client for server-side operations
 * Uses service role key for full access
 */
export async function createClient() {
  const url = process.env.SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""
  
  if (!url || !key) {
    throw new Error("Supabase environment variables not configured")
  }
  
  return createSupabaseClient(url, key)
}
