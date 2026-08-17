import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { BrandLogo } from "@/components/brand-logo"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const profile = await getCurrentProfile()
  if (profile) redirect(["admin", "super_admin"].includes(profile.role) ? "/admin" : "/dashboard")
  return <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" /><div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
    <div className="relative z-10 w-full max-w-md"><Link href="/" className="mb-8 flex justify-center"><BrandLogo /></Link>
      <div className="glass rounded-3xl p-1"><LoginForm /></div>
      <p className="mt-6 text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">Create one</Link></p>
      <p className="mt-3 text-center text-xs text-muted-foreground">Secure student access to your exam workspace.</p>
    </div>
  </main>
}
