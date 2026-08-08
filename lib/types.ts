export type Role = "student" | "admin"

export type QuestionType = "mcq" | "true_false" | "fill_blank"

export type Profile = {
  id: string
  full_name: string | null
  role: Role
  created_at: string
}

export type Exam = {
  id: string
  title: string
  description: string | null
  subject: string | null
  duration_minutes: number
  passing_score: number
  is_published: boolean
  created_by: string | null
  created_at: string
}

export type Question = {
  id: string
  exam_id: string
  type: QuestionType
  question_text: string
  options: string[]
  correct_answer: string
  subject: string | null
  topic: string | null
  points: number
  order_index: number
  created_at: string
}

export type AttemptStatus = "in_progress" | "submitted"

export type Attempt = {
  id: string
  exam_id: string
  student_id: string
  answers: Record<string, string>
  score: number | null
  total_points: number | null
  correct_count: number | null
  status: AttemptStatus
  violations: number
  started_at: string
  submitted_at: string | null
}
