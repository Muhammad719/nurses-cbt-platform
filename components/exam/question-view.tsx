"use client"

import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { QuestionType } from "@/lib/types"

export function QuestionView({
  question, value, onChange,
}: {
  question: { type: QuestionType; question_text: string; options: string[]; points: number }
  value: string; onChange: (value: string) => void
}) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-lg font-semibold leading-relaxed md:text-xl">{question.question_text}</p>
        <p className="mt-2 text-xs text-muted-foreground">{question.points} point{question.points === 1 ? "" : "s"}</p>
      </div>
      {question.type === "mcq" && (
        <RadioGroup value={value} onValueChange={onChange} className="gap-3">
          {question.options.map((option, index) => (
            <Label key={index} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 has-aria-checked:border-primary has-aria-checked:bg-primary/5">
              <RadioGroupItem value={option} className="mt-0.5" />
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>
      )}
      {question.type === "true_false" && (
        <RadioGroup value={value} onValueChange={onChange} className="gap-3">
          {["True", "False"].map((option) => (
            <Label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-muted/50 has-aria-checked:border-primary has-aria-checked:bg-primary/5">
              <RadioGroupItem value={option} />
              <span>{option}</span>
            </Label>
          ))}
        </RadioGroup>
      )}
      {question.type === "fill_blank" && (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type your answer" className="h-11" />
      )}
    </div>
  )
}
