import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { BrandLogo } from "@/components/brand-logo"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default async function SignUpPage() {
  const profile = await getCurrentProfile()
  if (profile) {
    redirect(profile.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <BrandLogo />
        </Link>
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Administrator? <Link href="/admin/login" className="font-medium text-primary hover:underline">Use the admin portal</Link>
        </p>
      </div>
    </main>
  )
}
