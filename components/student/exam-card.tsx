import Link from "next/link"
import { Clock, Target, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exam } from "@/lib/types"

export function ExamCard({ exam }: { exam: Exam }) {
  return <Card className="glass group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_60px_color-mix(in_oklch,var(--primary)_10%,transparent)]">
    <CardHeader className="gap-3"><div className="flex items-center justify-between gap-2">{exam.subject ? <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">{exam.subject}</Badge> : <span /> }<ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" /></div><CardTitle className="font-display text-xl leading-snug text-balance">{exam.title}</CardTitle></CardHeader>
    <CardContent className="flex-1"><p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{exam.description || "Ready when you are. Start the assessment to begin."}</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><Clock className="mb-2 h-4 w-4 text-primary" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p><p className="mt-0.5 text-sm font-semibold">{exam.duration_minutes} min</p></div><div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><Target className="mb-2 h-4 w-4 text-primary" /><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pass mark</p><p className="mt-0.5 text-sm font-semibold">{exam.passing_score}%</p></div></div></CardContent>
    <CardFooter><Button asChild className="w-full h-11"><Link href={`/exam/${exam.id}`}>Start exam <ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button></CardFooter>
  </Card>
}
