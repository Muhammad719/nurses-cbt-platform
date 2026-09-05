"use server"

import { createClient } from "@/lib/supabase/server"
import { gradeAttempt } from "@/lib/grade"
import type { Question } from "@/lib/types"

type SubmitInput = {
  examId: string
  answers: Record<string, string>
  violations: number
}

type SubmitResult = { ok: true; attemptId: string } | { ok: false; error: string }

/**
 * Grades the attempt SERVER-SIDE using the questions' correct answers.
 * The client never sees correct answers, and the score it computes is never trusted.
 */
export async function submitExam(input: SubmitInput): Promise<SubmitResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated." }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role === "admin") return { ok: false, error: "Administrators cannot submit student exams." }

  // Verify exam is published and load questions (server-side, with answers).
  const { data: exam } = await supabase
    .from("exams")
    .select("id, is_published")
    .eq("id", input.examId)
    .single()
  if (!exam || !exam.is_published) return { ok: false, error: "Exam not available." }

  const { data: questionData } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_id", input.examId)
    .order("order_index")
  const questions = (questionData ?? []) as Question[]
  if (questions.length === 0) return { ok: false, error: "This exam has no questions." }

  // Only keep answers for real question ids.
  const validIds = new Set(questions.map((q) => q.id))
  const cleanAnswers: Record<string, string> = {}
  for (const [qid, ans] of Object.entries(input.answers ?? {})) {
    if (validIds.has(qid) && typeof ans === "string") cleanAnswers[qid] = ans.slice(0, 2000)
  }

  const grade = gradeAttempt(questions, cleanAnswers)

  const { data: inserted, error } = await supabase
    .from("attempts")
    .insert({
      exam_id: input.examId,
      student_id: user.id,
      answers: cleanAnswers,
      score: grade.score,
      total_points: grade.totalPoints,
      correct_count: grade.correctCount,
      status: "submitted",
      violations: Math.max(0, Math.min(999, Math.floor(input.violations || 0))),
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error || !inserted) {
    return { ok: false, error: "Could not save your submission. Please try again." }
  }

  return { ok: true, attemptId: inserted.id }
}
