import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/supabase/auth"
import { ExamRunner, type ClientQuestion } from "@/components/exam/exam-runner"
import type { Exam, Question } from "@/lib/types"

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getCurrentProfile()
  if (!profile) redirect("/auth/login")
  if (profile.role === "admin") redirect("/admin")

  const supabase = await createClient()

  const { data: examData } = await supabase
    .from("exams")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()
  if (!examData) notFound()
  const exam = examData as Exam

  const { data: questionData } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_id", id)
    .order("order_index")
  const questions = (questionData ?? []) as Question[]

  if (questions.length === 0) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-xl font-semibold">This exam has no questions yet</h1>
          <p className="mt-2 text-muted-foreground">Please check back later.</p>
        </div>
      </main>
    )
  }

  // Strip correct answers before sending to the client.
  const clientQuestions: ClientQuestion[] = questions.map((q) => ({
    id: q.id,
    type: q.type,
    question_text: q.question_text,
    options: q.options,
    points: q.points,
  }))

  return (
    <ExamRunner
      examId={exam.id}
      title={exam.title}
      durationMinutes={exam.duration_minutes}
      questions={clientQuestions}
      studentName={profile.full_name ?? "Student"}
    />
  )
}
