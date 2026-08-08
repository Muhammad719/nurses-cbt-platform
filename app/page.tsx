import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import {
  BarChart3,
  Clock,
  FileCheck2,
  ListChecks,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Clock,
    title: "Timed exams",
    desc: "Countdown timers with auto-submit ensure every candidate plays by the same rules.",
  },
  {
    icon: ListChecks,
    title: "Multiple question types",
    desc: "MCQs, true/false, and fill-in-the-blank — mix formats within a single exam.",
  },
  {
    icon: FileCheck2,
    title: "Instant grading",
    desc: "Objective questions are scored the moment a student submits. No manual marking.",
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    desc: "Break results down by subject and topic to see exactly where students struggle.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-cheat monitoring",
    desc: "Tab-switch detection, fullscreen mode, and copy protection during live exams.",
  },
  {
    icon: Smartphone,
    title: "Installable PWA",
    desc: "Add Examly to any device home screen and run exams like a native app.",
  },
]

export default async function HomePage() {
  const profile = await getCurrentProfile()
  if (profile) {
    redirect(profile.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Computer-Based Testing, done right
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
              Run secure online exams with instant, insightful results
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
              Examly is a complete CBT platform for schools and coaching centers. Create exams, monitor
              candidates, and turn every submission into actionable analytics.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Create free account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">I already have an account</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5" />
            <Image
              src="/hero-exam.png"
              alt="A student taking a computer-based exam on a laptop"
              width={720}
              height={720}
              priority
              className="w-full rounded-2xl border border-border/60 shadow-xl"
            />
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/60 bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
                Everything you need to assess with confidence
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                From authoring questions to analyzing outcomes, Examly covers the full assessment lifecycle.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Ready to give your first exam?
            </h2>
            <p className="max-w-xl text-primary-foreground/80 text-pretty">
              Set up an account in seconds. Students take exams, admins build them — everyone gets results
              instantly.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">Get started for free</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <BrandLogo />
          <p>&copy; {new Date().getFullYear()} Examly. Built for better assessments.</p>
        </div>
      </footer>
    </div>
  )
}
