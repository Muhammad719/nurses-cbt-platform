"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/supabase/admin"
import type { Role } from "@/lib/types"

const allowedRoles: Role[] = ["student", "admin", "super_admin"]

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

export async function updateUserRole(formData: FormData) {
  const actor = await requireSuperAdmin()
  const userId = text(formData.get("user_id"))
  const role = text(formData.get("role")) as Role

  if (!userId || !allowedRoles.includes(role)) {
    throw new Error("Invalid user or role.")
  }

  if (userId === actor.id && role !== "super_admin") {
    throw new Error("You cannot remove your own Super Admin access.")
  }

  const supabase = await createClient()

  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .single()

  if (targetError || !target) {
    throw new Error("User profile not found.")
  }

  // Never allow the last Super Admin to be removed.
  if (target.role === "super_admin" && role !== "super_admin") {
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")

    if (countError) throw new Error("Could not verify Super Admin count.")
    if ((count ?? 0) <= 1) {
      throw new Error("At least one Super Admin must remain.")
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/admin/users")
}
