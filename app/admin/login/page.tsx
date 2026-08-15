import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { BrandLogo } from "@/components/brand-logo"
import { AdminLoginForm } from "@/components/auth/admin-login-form"

export default async function AdminLoginPage() {
  const profile = await getCurrentProfile()
  if (profile) redirect(profile.role === "student" ? "/dashboard" : "/admin")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <BrandLogo />
        </Link>
        <AdminLoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not an administrator?{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">Create a student account</Link>
        </p>
      </div>
    </main>
  )
}
