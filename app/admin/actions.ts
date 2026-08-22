"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/supabase/admin"

function text(v: FormDataEntryValue | null, fallback = "") {
  return String(v ?? fallback).trim()
}
function integer(v: FormDataEntryValue | null, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : fallback
}

type ImportedQuestion = {
  type: "mcq" | "true_false" | "fill_blank"
  question_text: string
  options: string[]
  correct_answer: string
  subject: string | null
  topic: string | null
  points: number
}

function csvRows(source: string) {
  const rows: string[][] = []
  let row: string[] = [], cell = "", quoted = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (quoted && ch === '"' && source[i + 1] === '"') { cell += '"'; i++; continue }
    if (ch === '"') { quoted = !quoted; continue }
    if (!quoted && ch === ',') { row.push(cell.trim()); cell = ""; continue }
    if (!quoted && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && source[i + 1] === '\n') i++
      row.push(cell.trim()); cell = ""
      if (row.some(Boolean)) rows.push(row)
      row = []; continue
    }
    cell += ch
  }
  if (cell.length || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row) }
  return rows
}

function normaliseImportedQuestion(raw: any, fallbackSubject: string): ImportedQuestion | null {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const found = Object.keys(raw ?? {}).find(k => k.toLowerCase().replace(/[ _-]/g, "") === key.toLowerCase().replace(/[ _-]/g, ""))
      if (found && raw[found] != null && String(raw[found]).trim()) return String(raw[found]).trim()
    }
    return ""
  }
  const question_text = get("question_text", "question", "questiontext")
  if (!question_text) return null
  const rawOptions = raw?.options
  const options = Array.isArray(rawOptions) ? rawOptions.map((x:any) => String(x).trim()).filter(Boolean) : [
    get("option_a", "optiona", "a"), get("option_b", "optionb", "b"),
    get("option_c", "optionc", "c"), get("option_d", "optiond", "d"),
    get("option_e", "optione", "e"), get("option_f", "optionf", "f")
  ].filter(Boolean)
  let type = get("type", "question_type").toLowerCase()
  if (type === "multiple_choice" || type === "multiplechoice") type = "mcq"
  if (!type) type = options.length ? "mcq" : "fill_blank"
  if (!["mcq", "true_false", "fill_blank"].includes(type)) type = "mcq"
  const finalOptions = type === "true_false" ? ["True", "False"] : options
  let correct_answer = get("correct_answer", "correct", "answer")
  if (type === "mcq" && /^[A-F]$/i.test(correct_answer)) correct_answer = finalOptions[correct_answer.toUpperCase().charCodeAt(0) - 65] ?? correct_answer
  if (type === "true_false" && correct_answer) correct_answer = /^true$/i.test(correct_answer) ? "True" : /^false$/i.test(correct_answer) ? "False" : correct_answer
  if (!correct_answer) return null
  return {
    type: type as ImportedQuestion["type"], question_text, options: finalOptions, correct_answer,
    subject: get("subject") || fallbackSubject || null,
    topic: get("topic") || null,
    points: Math.max(1, integer(get("points") || "1", 1)),
  }
}

async function parseQuestionFile(file: File, fallbackSubject: string) {
  if (!file || file.size === 0) return [] as ImportedQuestion[]
  const name = file.name.toLowerCase()
  const source = await file.text()
  if (name.endsWith(".json") || file.type.includes("json")) {
    const parsed = JSON.parse(source)
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : []
    if (!Array.isArray(items)) throw new Error("JSON must contain a questions array.")
    return items.map((item:any) => normaliseImportedQuestion(item, fallbackSubject)).filter(Boolean) as ImportedQuestion[]
  }
  if (name.endsWith(".csv") || file.type.includes("csv") || file.type === "text/plain") {
    const rows = csvRows(source)
    if (rows.length < 2) throw new Error("CSV must contain a header row and at least one question.")
    const headers = rows[0].map(h => h.trim())
    return rows.slice(1).map(row => {
      const item: Record<string,string> = {}
      headers.forEach((h, i) => { item[h] = row[i] ?? "" })
      return normaliseImportedQuestion(item, fallbackSubject)
    }).filter(Boolean) as ImportedQuestion[]
  }
  throw new Error("Unsupported file. Use CSV or JSON.")
}

export async function createExam(formData: FormData) {
  const admin = await requireAdmin()
  const supabase = await createClient()
  const subject = text(formData.get("subject")) || null
  const { data: exam, error } = await supabase.from("exams").insert({
    title: text(formData.get("title")),
    description: text(formData.get("description")) || null,
    subject,
    duration_minutes: Math.max(1, integer(formData.get("duration_minutes"), 60)),
    passing_score: Math.min(100, Math.max(0, integer(formData.get("passing_score"), 50))),
    is_published: formData.get("is_published") === "on",
    created_by: admin.id,
  }).select("id").single()
  if (error || !exam) throw new Error(error?.message || "Could not create exam")

  const upload = formData.get("questions_file")
  if (upload instanceof File && upload.size > 0) {
    const questions = await parseQuestionFile(upload, subject || "")
    if (!questions.length) throw new Error("The exam was created, but no valid questions were found in the uploaded file.")
    const { error: importError } = await supabase.from("questions").insert(questions.map((q, index) => ({ ...q, exam_id: exam.id, order_index: index })))
    if (importError) throw new Error(`Exam created, but question import failed: ${importError.message}`)
  }
  revalidatePath("/admin")
  revalidatePath("/admin/exams")
  redirect(`/admin/exams/${exam.id}`)
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
