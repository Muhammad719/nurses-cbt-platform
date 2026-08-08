import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export function BrandLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </span>
      {showText && (
        <span className="font-display text-xl font-bold tracking-tight text-foreground">Examly</span>
      )}
    </span>
  )
}
