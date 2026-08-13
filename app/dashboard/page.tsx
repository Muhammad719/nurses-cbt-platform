import { redirect } from "next/navigation"
import Link from "next/link"
import { Award, BookOpen, CheckCircle2, TrendingUp, Sparkles, ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { AppHeader } from "@/components/app-header"
import { StatCard } from "@/components/stat-card"
import { ExamCard } from "@/components/student/exam-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Attempt, Exam } from "@/lib/types"

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/auth/login")
  if (profile.role === "admin") redirect("/admin")
  const supabase = await createClient()
  const [{ data: exams }, { data: attempts }] = await Promise.all([
    supabase.from("exams").select("*").eq("is_published", true).order("created_at", { ascending: false }),
    supabase.from("attempts").select("*").eq("student_id", profile.id).eq("status", "submitted").order("submitted_at", { ascending: false }),
  ])
  const publishedExams = (exams ?? []) as Exam[]
  const submitted = (attempts ?? []) as Attempt[]
  const completedExamIds = new Set(submitted.map((a) => a.exam_id))
  const availableExams = publishedExams.filter((e) => !completedExamIds.has(e.id))
  const avgScore = submitted.length ? Math.round(submitted.reduce((sum, a) => sum + (a.score ?? 0), 0) / submitted.length) : 0
  const passed = submitted.filter((a) => { const exam = publishedExams.find((e) => e.id === a.exam_id); return exam && (a.score ?? 0) >= exam.passing_score }).length
  const nav = [{ href: "/dashboard", label: "Dashboard" }, { href: "/dashboard/history", label: "My Results" }]

  return <div className="min-h-svh bg-background"><AppHeader profile={profile} nav={nav} /><main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 md:py-10 lg:px-8">
    <section className="glass relative mb-7 overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Student command center</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {profile.full_name?.split(" ")[0] ?? "student"}.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Your exams, progress and results — organized in one focused workspace.</p></div>
    </section>
    <div className="mb-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard icon={BookOpen} label="Available exams" value={availableExams.length} /><StatCard icon={CheckCircle2} label="Completed" value={submitted.length} /><StatCard icon={TrendingUp} label="Average score" value={`${avgScore}%`} /><StatCard icon={Award} label="Exams passed" value={passed} /></div>
    <section className="mb-10"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Next up</p><h2 className="mt-1 font-display text-2xl font-bold">Available exams</h2></div></div>{availableExams.length === 0 ? <Card className="glass"><CardContent className="flex flex-col items-center gap-3 py-14 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></span><p className="font-medium">You&apos;re all caught up</p><p className="max-w-md text-sm text-muted-foreground">New published assessments will appear here.</p></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{availableExams.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>}</section>
    <section><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Performance</p><h2 className="mt-1 font-display text-2xl font-bold">Recent results</h2></div><Button variant="ghost" size="sm" asChild><Link href="/dashboard/history">View all <ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button></div>{submitted.length === 0 ? <Card className="glass"><CardContent className="py-12 text-center text-sm text-muted-foreground">Complete your first exam to start building your performance history.</CardContent></Card> : <Card className="glass overflow-hidden"><CardHeader className="border-b border-white/10"><CardTitle className="text-sm font-medium text-muted-foreground">Latest attempts</CardTitle></CardHeader><CardContent className="flex flex-col divide-y divide-border">{submitted.slice(0, 5).map((a) => { const exam = publishedExams.find((e) => e.id === a.exam_id); const isPass = exam && (a.score ?? 0) >= exam.passing_score; return <Link key={a.id} href={`/results/${a.id}`} className="flex items-center justify-between gap-4 py-4 transition hover:bg-white/[0.03]"><div className="min-w-0"><p className="truncate font-medium">{exam?.title ?? "Exam"}</p><p className="mt-1 text-xs text-muted-foreground">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ""}</p></div><div className="flex shrink-0 items-center gap-2 sm:gap-3"><span className="font-display text-lg font-bold">{a.score ?? 0}%</span><Badge variant={isPass ? "default" : "destructive"}>{isPass ? "Passed" : "Failed"}</Badge></div></Link> })}</CardContent></Card>}</section>
  </main></div>
}
