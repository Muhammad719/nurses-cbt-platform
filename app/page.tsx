import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ListChecks,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

const features = [
  { icon: Clock3, title: "Precision timing", desc: "Live countdowns and automatic submission keep every candidate on the same clock." },
  { icon: ListChecks, title: "Flexible question engine", desc: "Build MCQ, true/false and fill-in-the-blank assessments in one clean workflow." },
  { icon: FileCheck2, title: "Instant scoring", desc: "Objective answers are graded immediately, giving students useful feedback without the wait." },
  { icon: BarChart3, title: "Actionable analytics", desc: "See scores, topics and performance patterns instead of just a final percentage." },
  { icon: ShieldCheck, title: "Focused exam mode", desc: "Fullscreen, visibility and copy protections help create a controlled testing environment." },
  { icon: Smartphone, title: "Works everywhere", desc: "A responsive, installable experience that feels at home on phones, tablets and computers." },
]

export default async function HomePage() {
  const profile = await getCurrentProfile()
  if (profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard")

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="shadow-[0_0_25px_color-mix(in_oklch,var(--primary)_20%,transparent)]">
              <Link href="/auth/sign-up">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pb-28 md:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Sparkles className="h-3 w-3" /></span>
              Next-generation computer based testing
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.03] tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Smarter exams. <span className="text-gradient">Sharper results.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Examly gives schools and training teams a modern command center for creating secure exams,
              guiding candidates and turning every submission into useful performance data.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-6">
                <Link href="/auth/sign-up">Create student account <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 bg-background/40">
                <Link href="/auth/login">Enter exam portal</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {["Responsive by design", "Secure exam mode", "Instant results"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />{item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-3xl" />
            <div className="glass glow neon-border relative overflow-hidden rounded-[1.5rem] p-2 sm:p-3">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3 sm:px-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_12px_currentColor]" />
                  <span className="text-xs font-medium text-muted-foreground">LIVE • SECURE SESSION</span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">CBT MODE</span>
              </div>
              <Image src="/hero-exam.png" alt="Student taking a computer-based exam" width={900} height={700} priority className="aspect-[16/11] w-full rounded-xl object-cover" />
              <div className="grid grid-cols-3 gap-2 p-2 sm:gap-3 sm:p-3">
                {[["01", "Timed"], ["24", "Questions"], ["92%", "Progress"]].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-display text-lg font-bold sm:text-xl">{value}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Built for serious assessment</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">Everything in one intelligent exam workspace.</h2>
              <p className="mt-4 text-muted-foreground">A clean interface for candidates and a focused control center for administrators.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="glass group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition group-hover:shadow-[0_0_25px_color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/[0.08] p-7 sm:p-10 md:p-14">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Zap className="h-4 w-4" /> Ready when you are</div>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Turn your next assessment into a better experience.</h2>
                <p className="mt-4 text-muted-foreground">Students get clarity. Administrators get control. Everyone gets results faster.</p>
              </div>
              <Button size="lg" asChild className="h-12 shrink-0 px-7"><Link href="/auth/sign-up">Start now <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandLogo />
          <div className="flex flex-wrap items-center gap-4"><span>© {new Date().getFullYear()} Examly</span><Link href="/admin/login" className="transition hover:text-foreground">Admin portal</Link></div>
        </div>
      </footer>
    </div>
  )
}
