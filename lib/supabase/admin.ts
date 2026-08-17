import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/types"

export async function requireAdmin(): Promise<Profile> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return profile as Profile
}

export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await requireAdmin()

  if (profile.role !== "super_admin") {
    redirect("/admin")
  }

  return profile
}
