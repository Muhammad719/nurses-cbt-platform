import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <BrandLogo />
        </Link>
        <Card className="border-border/60 shadow-lg">
          <CardHeader className="items-center space-y-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
            <CardTitle className="font-display text-2xl">Authentication error</CardTitle>
            <CardDescription>
              Something went wrong while confirming your account. The link may have expired or already been
              used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
