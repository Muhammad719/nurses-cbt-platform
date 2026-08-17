"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck } from "lucide-react"

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError("Invalid administrator email or password.")
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Unable to verify your administrator account.")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
      await supabase.auth.signOut()
      setError("This account is a student account. Please use the student login.")
      setLoading(false)
      return
    }

    router.push("/admin")
    router.refresh()
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <CardTitle className="font-display text-2xl">Administrator portal</CardTitle>
        <CardDescription>Sign in with an administrator account. Admin accounts are provisioned separately and cannot be created through public registration.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-email">Administrator email</Label>
            <Input id="admin-email" type="email" autoComplete="username" placeholder="admin@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Verifying…" : "Sign in as administrator"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
