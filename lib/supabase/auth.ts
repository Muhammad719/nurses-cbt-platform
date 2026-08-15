import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

/**
 * Returns the current authenticated user's profile (with role), or null.
 * Server-only.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    // Fallback if the trigger hasn't populated the row yet
    return {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      email: user.email ?? null,
      role: "student",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return profile as Profile
}
