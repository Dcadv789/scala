// Client-side Supabase client
// NOTE: For client-side operations, use API routes instead
// since NEXT_PUBLIC_ env vars are not available

export function createClient() {
  // This will not work on client-side without NEXT_PUBLIC_ vars
  // Use API routes instead: /api/admin/users, /api/auth/login, etc.
  console.warn("Client-side Supabase client is not available. Use API routes instead.")
  return null
}
