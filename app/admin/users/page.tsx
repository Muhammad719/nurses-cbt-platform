import { ShieldCheck, UserCog, Users } from "lucide-react"
import { requireSuperAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateUserRole } from "@/app/admin/user-actions"
import type { Profile, Role } from "@/lib/types"

const roles: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
]

export default async function UsersPage() {
  const profile = await requireSuperAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })

  const users = (data ?? []) as Profile[]

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Super Admin</p>
              <h1 className="font-display text-3xl font-bold">User Management</h1>
            </div>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Assign Student, Admin or Super Admin access. Only Super Admins can change roles.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Registered users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <p className="p-6 text-sm text-destructive">{error.message}</p>
            ) : users.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{user.full_name || "Unnamed user"}</p>
                        {user.id === profile.id && <Badge variant="outline">You</Badge>}
                      </div>
                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {user.email || "No email recorded"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Current role: <span className="font-medium text-foreground">{user.role.replace("_", " ")}</span>
                      </p>
                    </div>

                    <form action={updateUserRole} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input type="hidden" name="user_id" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        disabled={user.id === profile.id}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <Button type="submit" disabled={user.id === profile.id}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Save role
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
