"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/supabase/admin"

function text(v: FormDataEntryValue | null, fallback = "") {
  return String(v ?? fallback).trim()
}
function integer(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : fallback
}

export async function createExam(formData: FormData) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("exams").insert({
    title: text(formData.get("title")),
    description: text(formData.get("description")) || null,
    subject: text(formData.get("subject")) || null,
    duration_minutes: Math.max(1, integer(formData.get("duration_minutes"), 60)),
    passing_score: Math.min(100, Math.max(0, integer(formData.get("passing_score"), 50))),
    is_published: formData.get("is_published") === "on",
    created_by: admin.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/admin/exams")
}

export async function updateExam(formData: FormData) {
  const admin = await requireAdmin()
  const id = text(formData.get("id"))
  const supabase = await createClient()
  const { error } = await supabase.from("exams").update({
    title: text(formData.get("title")),
    description: text(formData.get("description")) || null,
    subject: text(formData.get("subject")) || null,
    duration_minutes: Math.max(1, integer(formData.get("duration_minutes"), 60)),
    passing_score: Math.min(100, Math.max(0, integer(formData.get("passing_score"), 50))),
    is_published: formData.get("is_published") === "on",
  }).eq("id", id)
  if (error) throw new Error(error.message)
  void admin
  revalidatePath("/admin")
  revalidatePath("/admin/exams")
  revalidatePath(`/admin/exams/${id}`)
}

export async function deleteExam(formData: FormData) {
  await requireAdmin()
  const id = text(formData.get("id"))
  const supabase = await createClient()
  const { error } = await supabase.from("exams").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/admin/exams")
}

export async function toggleExamPublished(formData: FormData) {
  await requireAdmin()
  const id = text(formData.get("id"))
  const published = text(formData.get("published")) === "true"
  const supabase = await createClient()
  const { error } = await supabase.from("exams").update({ is_published: !published }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/admin/exams")
  revalidatePath(`/admin/exams/${id}`)
}

export async function createQuestion(formData: FormData) {
  await requireAdmin()
  const examId = text(formData.get("exam_id"))
  const type = text(formData.get("type"))
  const optionsRaw = text(formData.get("options_ui")) || text(formData.get("options"))
  let options: string[] = []
  try { options = optionsRaw.includes("\n") ? optionsRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) : JSON.parse(optionsRaw || "[]") } catch { options = [] }
  if (type === "true_false") options = ["True", "False"]
  const supabase = await createClient()
  const { data: last } = await supabase.from("questions").select("order_index").eq("exam_id", examId).order("order_index", { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from("questions").insert({
    exam_id: examId,
    type,
    question_text: text(formData.get("question_text")),
    options,
    correct_answer: text(formData.get("correct_answer")),
    subject: text(formData.get("subject")) || null,
    topic: text(formData.get("topic")) || null,
    points: Math.max(1, integer(formData.get("points"), 1)),
    order_index: (last?.order_index ?? -1) + 1,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/exams/${examId}`)
  revalidatePath("/admin/questions")
}

export async function updateQuestion(formData: FormData) {
  await requireAdmin()
  const id = text(formData.get("id"))
  const examId = text(formData.get("exam_id"))
  const type = text(formData.get("type"))
  let options: string[] = []
  try { const raw=text(formData.get("options_ui")) || text(formData.get("options")); options = raw.includes("\n") ? raw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) : JSON.parse(raw || "[]") } catch { options = [] }
  if (type === "true_false") options = ["True", "False"]
  const supabase = await createClient()
  const { error } = await supabase.from("questions").update({
    type, question_text: text(formData.get("question_text")), options,
    correct_answer: text(formData.get("correct_answer")),
    subject: text(formData.get("subject")) || null, topic: text(formData.get("topic")) || null,
    points: Math.max(1, integer(formData.get("points"), 1)),
  }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/exams/${examId}`)
  revalidatePath("/admin/questions")
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin()
  const id = text(formData.get("id"))
  const examId = text(formData.get("exam_id"))
  const supabase = await createClient()
  const { error } = await supabase.from("questions").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/exams/${examId}`)
  revalidatePath("/admin/questions")
}
