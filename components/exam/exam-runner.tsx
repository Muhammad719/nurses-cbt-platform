"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Loader2,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { submitExam } from "@/app/exam/actions"
import type { QuestionType } from "@/lib/types"
import { ExamIntro } from "@/components/exam/exam-intro"
import { QuestionView } from "@/components/exam/question-view"

export type ClientQuestion = {
  id: string
  type: QuestionType
  question_text: string
  options: string[]
  points: number
}

const MAX_VIOLATIONS = 3

export function ExamRunner({
  examId,
  title,
  durationMinutes,
  questions,
  studentName,
}: {
  examId: string
  title: string
  durationMinutes: number
  questions: ClientQuestion[]
  studentName: string
}) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [violations, setViolations] = useState(0)
  const [showViolation, setShowViolation] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submittedRef = useRef(false)
  const answersRef = useRef(answers)
  const violationsRef = useRef(violations)
  answersRef.current = answers
  violationsRef.current = violations

  const doSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return
      submittedRef.current = true
      setSubmitting(true)

      const res = await submitExam({
        examId,
        answers: answersRef.current,
        violations: violationsRef.current,
      })

      if (res.ok) {
        if (auto) toast.info("Time's up — your exam was submitted automatically.")
        router.replace(`/results/${res.attemptId}`)
      } else {
        // Duplicate submission returns an attemptId we can navigate to.
        const maybeId = (res as { attemptId?: string }).attemptId
        if (maybeId) {
          router.replace(`/results/${maybeId}`)
          return
        }
        submittedRef.current = false
        setSubmitting(false)
        toast.error(res.error)
      }
    },
    [examId, router],
  )

  // Timer
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          void doSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [started, doSubmit])

  // Anti-cheat: tab/visibility + window blur
  useEffect(() => {
    if (!started) return

    function registerViolation(reason: string) {
      if (submittedRef.current) return
      setViolations((v) => {
        const next = v + 1
        if (next >= MAX_VIOLATIONS) {
          toast.error("Too many violations. Submitting your exam.")
          void doSubmit(true)
        } else {
          setShowViolation(true)
        }
        return next
      })
      console.log("[v0] anti-cheat violation:", reason)
    }

    function onVisibility() {
      if (document.hidden) registerViolation("tab-hidden")
    }
    function onBlur() {
      registerViolation("window-blur")
    }
    function onContextMenu(e: MouseEvent) {
      e.preventDefault()
    }
    function onCopy(e: ClipboardEvent) {
      e.preventDefault()
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("blur", onBlur)
    document.addEventListener("contextmenu", onContextMenu)
    document.addEventListener("copy", onCopy)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("blur", onBlur)
      document.removeEventListener("contextmenu", onContextMenu)
      document.removeEventListener("copy", onCopy)
    }
  }, [started, doSubmit])

  // Warn on refresh/close
  useEffect(() => {
    if (!started) return
    function beforeUnload(e: BeforeUnloadEvent) {
      if (submittedRef.current) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [started])

  function start() {
    setStarted(true)
    // Try to enter fullscreen for a focused environment.
    document.documentElement.requestFullscreen?.().catch(() => {})
  }

  function setAnswer(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
  }

  function toggleFlag(qid: string) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(qid)) next.delete(qid)
      else next.add(qid)
      return next
    })
  }

  if (!started) {
    return (
      <ExamIntro
        title={title}
        durationMinutes={durationMinutes}
        questionCount={questions.length}
        studentName={studentName}
        onStart={start}
      />
    )
  }

  const q = questions[current]
  const answeredCount = Object.values(answers).filter((a) => a && a.length > 0).length
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const lowTime = timeLeft <= 60
  const progressPct = Math.round((answeredCount / questions.length) * 100)

  return (
    <div className="flex min-h-svh flex-col bg-muted/30 select-none">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <div className="flex items-center gap-3">
            {violations > 0 && (
              <span
                className="hidden items-center gap-1 rounded-md bg-warning/15 px-2 py-1 text-xs font-medium text-warning sm:inline-flex"
                title="Anti-cheat warnings"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {violations}/{MAX_VIOLATIONS}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tabular-nums",
                lowTime ? "animate-pulse bg-destructive/15 text-destructive" : "bg-secondary text-foreground",
              )}
            >
              <Clock className="h-4 w-4" />
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
        <Progress value={progressPct} className="h-1 rounded-none" />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Question */}
        <div className="flex-1">
          <Card>
            <CardContent className="py-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {current + 1} of {questions.length}
                </span>
                <Button
                  variant={flagged.has(q.id) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => toggleFlag(q.id)}
                >
                  <Flag className={cn("h-4 w-4", flagged.has(q.id) && "fill-current")} />
                  {flagged.has(q.id) ? "Flagged" : "Flag"}
                </Button>
              </div>

              <QuestionView
                question={q}
                value={answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setShowConfirm(true)}>Review &amp; submit</Button>
            )}
          </div>
        </div>

        {/* Palette */}
        <aside className="lg:w-64 lg:shrink-0">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="py-5">
              <p className="mb-3 text-sm font-medium">Questions</p>
              <div className="grid grid-cols-6 gap-2 lg:grid-cols-5">
                {questions.map((qq, i) => {
                  const answered = answers[qq.id] && answers[qq.id].length > 0
                  const isFlagged = flagged.has(qq.id)
                  return (
                    <button
                      key={qq.id}
                      onClick={() => setCurrent(i)}
                      className={cn(
                        "relative flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                        i === current
                          ? "border-primary bg-primary text-primary-foreground"
                          : answered
                            ? "border-success/40 bg-success/10 text-foreground"
                            : "border-border bg-background hover:bg-muted",
                      )}
                      aria-label={`Go to question ${i + 1}`}
                    >
                      {i + 1}
                      {isFlagged && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-success/40 bg-success/10" /> Answered
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-warning" /> Flagged
                </span>
              </div>
              <Button className="mt-4 w-full" onClick={() => setShowConfirm(true)}>
                Submit exam
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Violation warning dialog */}
      <Dialog open={showViolation} onOpenChange={setShowViolation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Warning: stay on this page
            </DialogTitle>
            <DialogDescription>
              Leaving the exam window is not allowed. This is warning {violations} of {MAX_VIOLATIONS}. After{" "}
              {MAX_VIOLATIONS} warnings your exam will be submitted automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowViolation(false)}>I understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit confirmation */}
      <Dialog open={showConfirm} onOpenChange={(o) => !submitting && setShowConfirm(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your exam?</DialogTitle>
            <DialogDescription>
              You&apos;ve answered {answeredCount} of {questions.length} questions
              {answeredCount < questions.length
                ? ` — ${questions.length - answeredCount} unanswered will be marked incorrect.`
                : "."}{" "}
              You can&apos;t change your answers after submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
              Keep working
            </Button>
            <Button onClick={() => doSubmit(false)} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Submitting…" : "Submit exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
