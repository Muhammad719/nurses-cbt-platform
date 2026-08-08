import Link from "next/link"
import { Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exam } from "@/lib/types"

export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-2">
        {exam.subject && (
          <Badge variant="secondary" className="w-fit">
            {exam.subject}
          </Badge>
        )}
        <CardTitle className="font-display text-lg leading-snug text-balance">{exam.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {exam.description || "No description provided."}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {exam.duration_minutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            Pass at {exam.passing_score}%
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/exam/${exam.id}`}>Start exam</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
