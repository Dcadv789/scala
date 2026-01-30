"use client"

import { createClient } from "@supabase/supabase-js"

// Create a singleton Supabase client for browser use
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Supabase] Missing environment variables")
    // Return a dummy client that will fail gracefully
    throw new Error("Supabase not configured")
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey)
  return supabaseInstance
}
