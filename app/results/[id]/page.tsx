import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TopicBreakdownChart } from "@/components/results/topic-breakdown-chart"
import { ResultReview } from "@/components/results/result-review"
import { gradeAttempt } from "@/lib/grade"
import type { Attempt, Exam, Question } from "@/lib/types"

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getCurrentProfile()
  if (!profile) redirect("/auth/login")

  const supabase = await createClient()

  const { data: attempt } = await supabase.from("attempts").select("*").eq("id", id).single()
  if (!attempt || attempt.status !== "submitted") notFound()
  const a = attempt as Attempt
  if (profile.role !== "admin" && a.student_id !== profile.id) notFound()

  const [{ data: examData }, { data: questionData }] = await Promise.all([
    supabase.from("exams").select("*").eq("id", a.exam_id).single(),
    supabase.from("questions").select("*").eq("exam_id", a.exam_id).order("order_index"),
  ])

  if (!examData) notFound()
  const exam = examData as Exam
  const questions = (questionData ?? []) as Question[]

  const grade = gradeAttempt(questions, a.answers)
  const isPass = (a.score ?? 0) >= exam.passing_score

  const topicData = Object.entries(grade.perTopic).map(([topic, v]) => ({
    topic,
    percentage: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    correct: v.correct,
    total: v.total,
  }))

  return (
    <div className="min-h-svh bg-muted/30">
      <AppHeader profile={profile} />
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={profile.role === "admin" ? "/admin/results" : "/dashboard/history"}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <Card className="mb-6 overflow-hidden">
          <div className={isPass ? "h-1.5 bg-success" : "h-1.5 bg-destructive"} />
          <CardContent className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">{exam.title}</h1>
                <Badge variant={isPass ? "default" : "destructive"}>{isPass ? "Passed" : "Failed"}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : ""} · Passing score{" "}
                {exam.passing_score}%
              </p>
              {a.violations > 0 && (
                <p className="mt-2 text-sm text-warning">
                  {a.violations} anti-cheat {a.violations === 1 ? "warning" : "warnings"} recorded during this
                  attempt.
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <div className="text-center">
                <p className="font-display text-4xl font-bold">{a.score ?? 0}%</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold">
                  {grade.correctCount}
                  <span className="text-lg text-muted-foreground">/{questions.length}</span>
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance by topic</CardTitle>
            </CardHeader>
            <CardContent>
              {topicData.length > 0 ? (
                <TopicBreakdownChart data={topicData} />
              ) : (
                <p className="text-sm text-muted-foreground">No topic data available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic detail</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {topicData.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{t.topic}</span>
                    <span className="text-muted-foreground">
                      {t.correct}/{t.total}
                    </span>
                  </div>
                  <Progress value={t.percentage} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question review</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultReview questions={questions} answers={a.answers} />
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> Correct
          </span>
          <span className="inline-flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" /> Incorrect
          </span>
        </div>
      </main>
    </div>
  )
}
