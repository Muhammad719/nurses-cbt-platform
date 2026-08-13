import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return <Card className="glass overflow-hidden transition hover:border-primary/25">
    <CardContent className="relative flex items-center justify-between p-5">
      <div><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p></div>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10"><Icon className="h-5 w-5" /></span>
    </CardContent>
  </Card>
}
