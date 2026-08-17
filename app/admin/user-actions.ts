"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireSuperAdmin } from "@/lib/supabase/admin"
import type { Role } from "@/lib/types"

const allowedRoles: Role[] = ["student", "admin", "super_admin"]

export async function updateUserRole(formData: FormData) {
  const current = await requireSuperAdmin()
  const userId = String(formData.get("user_id") ?? "")
  const role = String(formData.get("role") ?? "") as Role

  if (!userId || !allowedRoles.includes(role)) {
    throw new Error("Invalid user or role.")
  }

  if (userId === current.id && role !== "super_admin") {
    throw new Error("You cannot remove your own Super Admin access.")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/users")
  revalidatePath("/admin")
}
