import { CheckCircle2, XCircle } from "lucide-react"
import { isCorrect } from "@/lib/grade"
import { cn } from "@/lib/utils"
import type { Question } from "@/lib/types"

export function ResultReview({
  questions,
  answers,
}: {
  questions: Question[]
  answers: Record<string, string>
}) {
  return (
    <ol className="flex flex-col gap-4">
      {questions.map((q, i) => {
        const userAnswer = answers[q.id]
        const correct = isCorrect(q, userAnswer)
        return (
          <li
            key={q.id}
            className={cn(
              "rounded-xl border p-4",
              correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">
                {correct ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  <span className="text-muted-foreground">Q{i + 1}.</span> {q.question_text}
                </p>
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={correct ? "text-success" : "text-destructive"}>
                      {userAnswer && userAnswer.length > 0 ? userAnswer : "No answer"}
                    </span>
                  </p>
                  {!correct && (
                    <p>
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="text-success">{q.correct_answer.split("|")[0]}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
