import type { Question } from "./types"

export function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function isCorrect(question: Question, answer: string | undefined) {
  if (answer === undefined || answer === null || answer === "") return false
  if (question.type === "fill_blank") {
    // Allow multiple accepted answers separated by "|"
    const accepted = question.correct_answer.split("|").map(normalize)
    return accepted.includes(normalize(answer))
  }
  return normalize(answer) === normalize(question.correct_answer)
}

export type GradeResult = {
  score: number // percentage 0-100
  totalPoints: number
  earnedPoints: number
  correctCount: number
  perTopic: Record<string, { correct: number; total: number }>
  perSubject: Record<string, { correct: number; total: number }>
}

export function gradeAttempt(questions: Question[], answers: Record<string, string>): GradeResult {
  let earnedPoints = 0
  let totalPoints = 0
  let correctCount = 0
  const perTopic: Record<string, { correct: number; total: number }> = {}
  const perSubject: Record<string, { correct: number; total: number }> = {}

  for (const q of questions) {
    totalPoints += q.points
    const topic = q.topic || "General"
    const subject = q.subject || "General"
    perTopic[topic] ??= { correct: 0, total: 0 }
    perSubject[subject] ??= { correct: 0, total: 0 }
    perTopic[topic].total += 1
    perSubject[subject].total += 1

    if (isCorrect(q, answers[q.id])) {
      earnedPoints += q.points
      correctCount += 1
      perTopic[topic].correct += 1
      perSubject[subject].correct += 1
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  return { score, totalPoints, earnedPoints, correctCount, perTopic, perSubject }
}
