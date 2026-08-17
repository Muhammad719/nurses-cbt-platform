import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { BrandLogo } from "@/components/brand-logo"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default async function SignUpPage() {
  const profile = await getCurrentProfile()
  if (profile) redirect(["admin", "super_admin"].includes(profile.role) ? "/admin" : "/dashboard")
  return <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" /><div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
    <div className="relative z-10 w-full max-w-md"><Link href="/" className="mb-8 flex justify-center"><BrandLogo /></Link>
      <div className="glass rounded-3xl p-1"><SignUpForm /></div>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
      <p className="mt-3 text-center text-xs text-muted-foreground">Administrator? <Link href="/admin/login" className="font-medium text-primary hover:underline">Use the admin portal</Link></p>
    </div>
  </main>
}
