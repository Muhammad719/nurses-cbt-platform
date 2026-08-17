import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export function BrandLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_24%,transparent)] ring-1 ring-primary/30 sm:h-10 sm:w-10">
        <span className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
        <GraduationCap className="relative h-5 w-5 sm:h-[21px] sm:w-[21px]" aria-hidden="true" />
      </span>
      {showText && <span className="font-display text-lg font-bold tracking-[-0.03em] sm:text-xl">Examly<span className="text-primary">.</span></span>}
    </span>
  )
}
