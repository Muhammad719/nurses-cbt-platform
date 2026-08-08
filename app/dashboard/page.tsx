import { redirect } from "next/navigation"
import Link from "next/link"
import { Award, BookOpen, CheckCircle2, TrendingUp } from "lucide-react"
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
    supabase
      .from("attempts")
      .select("*")
      .eq("student_id", profile.id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false }),
  ])

  const publishedExams = (exams ?? []) as Exam[]
  const submitted = (attempts ?? []) as Attempt[]

  const completedExamIds = new Set(submitted.map((a) => a.exam_id))
  const availableExams = publishedExams.filter((e) => !completedExamIds.has(e.id))

  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((sum, a) => sum + (a.score ?? 0), 0) / submitted.length)
      : 0
  const passed = submitted.filter((a) => {
    const exam = publishedExams.find((e) => e.id === a.exam_id)
    return exam && (a.score ?? 0) >= exam.passing_score
  }).length

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/history", label: "My Results" },
  ]

  return (
    <div className="min-h-svh bg-muted/30">
      <AppHeader profile={profile} nav={nav} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, {profile.full_name?.split(" ")[0] ?? "student"}
          </h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s your assessment overview.</p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Available exams" value={availableExams.length} />
          <StatCard icon={CheckCircle2} label="Completed" value={submitted.length} />
          <StatCard icon={TrendingUp} label="Average score" value={`${avgScore}%`} />
          <StatCard icon={Award} label="Exams passed" value={passed} />
        </div>

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Available exams</h2>
          </div>
          {availableExams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No exams available right now</p>
                <p className="text-sm text-muted-foreground">
                  New exams published by your instructor will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent results</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/history">View all</Link>
            </Button>
          </div>
          {submitted.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                You haven&apos;t completed any exams yet.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Latest attempts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border">
                {submitted.slice(0, 5).map((a) => {
                  const exam = publishedExams.find((e) => e.id === a.exam_id)
                  const isPass = exam && (a.score ?? 0) >= exam.passing_score
                  return (
                    <Link
                      key={a.id}
                      href={`/results/${a.id}`}
                      className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{exam?.title ?? "Exam"}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg font-semibold">{a.score ?? 0}%</span>
                        <Badge variant={isPass ? "default" : "destructive"}>
                          {isPass ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
