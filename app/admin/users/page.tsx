import { ShieldCheck, UserCog, Users } from "lucide-react"
import { requireSuperAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Profile, Role } from "@/lib/types"
import { updateUserRole } from "@/app/admin/user-actions"

function roleLabel(role: Role) {
  if (role === "super_admin") return "Super Admin"
  if (role === "admin") return "Admin"
  return "Student"
}

function roleVariant(role: Role): "default" | "secondary" | "outline" {
  if (role === "super_admin") return "default"
  if (role === "admin") return "secondary"
  return "outline"
}

export default async function AdminUsersPage() {
  const actor = await requireSuperAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const users = (data ?? []) as Profile[]

  return (
    <div className="min-h-svh bg-muted/30">
      <AdminHeader profile={actor} />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Super Admin</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">User management</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Control access levels for everyone registered on the CBT platform. Only Super Admins can change roles.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">All users</p>
                <p className="font-display text-2xl font-bold">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <UserCog className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="font-display text-2xl font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Super Admins</p>
                <p className="font-display text-2xl font-bold">
                  {users.filter((u) => u.role === "super_admin").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{user.full_name || "Unnamed user"}</p>
                      <Badge variant={roleVariant(user.role)}>{roleLabel(user.role)}</Badge>
                      {user.id === actor.id && <Badge variant="outline">You</Badge>}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {user.email || "Email unavailable"}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground/70">
                      {user.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["student", "admin", "super_admin"] as Role[]).map((role) => (
                      <form key={role} action={updateUserRole}>
                        <input type="hidden" name="user_id" value={user.id} />
                        <input type="hidden" name="role" value={role} />
                        <Button
                          type="submit"
                          size="sm"
                          variant={user.role === role ? "default" : "outline"}
                          disabled={user.id === actor.id && role !== "super_admin"}
                        >
                          {roleLabel(role)}
                        </Button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
