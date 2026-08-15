"use client"

import { Clock, FileQuestion, Maximize, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExamIntro({
  title, durationMinutes, questionCount, studentName, onStart,
}: {
  title: string; durationMinutes: number; questionCount: number; studentName: string; onStart: () => void
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <p className="text-sm font-medium text-primary">Examly CBT</p>
          <CardTitle className="font-display text-2xl md:text-3xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">Good luck, {studentName}. Read each question carefully before submitting.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-4"><Clock className="mb-2 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Duration</p><p className="font-semibold">{durationMinutes} minutes</p></div>
            <div className="rounded-xl border bg-muted/30 p-4"><FileQuestion className="mb-2 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Questions</p><p className="font-semibold">{questionCount}</p></div>
            <div className="rounded-xl border bg-muted/30 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Mode</p><p className="font-semibold">Secure CBT</p></div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-medium">Before you begin</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Stay on this page until you submit.</li>
              <li>Your timer starts when you begin.</li>
              <li>Leaving the exam window may trigger an anti-cheat warning.</li>
              <li>Answers are graded on the server after submission.</li>
            </ul>
          </div>
          <Button size="lg" className="w-full" onClick={onStart}><Maximize className="mr-2 h-4 w-4" />Start exam</Button>
        </CardContent>
      </Card>
    </main>
  )
}
