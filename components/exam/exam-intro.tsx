"use client"

import { Clock, FileQuestion, Maximize, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExamIntro({ title, durationMinutes, questionCount, studentName, onStart }: { title: string; durationMinutes: number; questionCount: number; studentName: string; onStart: () => void }) {
  return <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" /><div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]" />
    <Card className="glass relative w-full max-w-3xl overflow-hidden rounded-[1.75rem]">
      <div className="h-1 bg-gradient-to-r from-primary via-cyan-300 to-primary" />
      <CardHeader className="space-y-3 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Examly secure session</div>
        <CardTitle className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">Good luck, {studentName}. Read each question carefully and keep this window open until submission.</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0 sm:p-8 sm:pt-0">
        <div className="grid gap-3 sm:grid-cols-3">
          {[[Clock, "Duration", `${durationMinutes} minutes`], [FileQuestion, "Questions", `${questionCount}`], [ShieldCheck, "Mode", "Secure CBT"]].map(([Icon, label, value]) => {
            const I = Icon as typeof Clock
            return <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><I className="mb-3 h-5 w-5 text-primary" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label as string}</p><p className="mt-1 font-semibold">{value as string}</p></div>
          })}
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 text-sm">
          <p className="font-semibold">Before you begin</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-5 text-muted-foreground"><li>Stay on this page until you submit.</li><li>Your timer starts when you begin.</li><li>Leaving the exam window may trigger an anti-cheat warning.</li><li>Answers are graded on the server after submission.</li></ul>
        </div>
        <Button size="lg" className="h-12 w-full" onClick={onStart}><Maximize className="mr-2 h-4 w-4" />Start secure exam</Button>
      </CardContent>
    </Card>
  </main>
}
