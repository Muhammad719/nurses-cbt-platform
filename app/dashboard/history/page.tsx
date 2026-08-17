import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Attempt, Exam } from "@/lib/types"

export default async function HistoryPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/auth/login")
  if (profile.role === "admin") redirect("/admin")

  const supabase = await createClient()
  const { data: attempts } = await supabase
    .from("attempts")
    .select("*")
    .eq("student_id", profile.id)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })

  const submitted = (attempts ?? []) as Attempt[]

  let exams: Exam[] = []
  if (submitted.length > 0) {
    const ids = Array.from(new Set(submitted.map((a) => a.exam_id)))
    const { data } = await supabase.from("exams").select("*").in("id", ids)
    exams = (data ?? []) as Exam[]
  }

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/history", label: "My Results" },
  ]

  return (
    <div className="min-h-svh bg-background">
      <AppHeader profile={profile} nav={nav} />
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <h1 className="mb-1 font-display text-2xl font-bold tracking-tight md:text-3xl">My results</h1>
        <p className="mb-8 text-muted-foreground">Review every exam you&apos;ve completed.</p>

        {submitted.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No results yet</p>
              <p className="text-sm text-muted-foreground">Complete an exam to see your results here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {submitted.map((a) => {
              const exam = exams.find((e) => e.id === a.exam_id)
              const isPass = exam && (a.score ?? 0) >= exam.passing_score
              return (
                <Link key={a.id} href={`/results/${a.id}`}>
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium">{exam?.title ?? "Exam"}</p>
                          {exam?.subject && (
                            <Badge variant="secondary" className="shrink-0">
                              {exam.subject}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : ""} ·{" "}
                          {a.correct_count ?? 0} correct
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-xl font-bold">{a.score ?? 0}%</span>
                        <Badge variant={isPass ? "default" : "destructive"}>
                          {isPass ? "Passed" : "Failed"}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
