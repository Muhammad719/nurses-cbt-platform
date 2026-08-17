import Link from "next/link"
import { LogOut } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Profile } from "@/lib/types"

function initials(name: string | null) {
  if (!name) return "U"
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

export function AppHeader({ profile, nav }: { profile: Profile; nav?: { href: string; label: string }[] }) {
  const home = profile.role === "admin" ? "/admin" : "/dashboard"
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link href={home} className="shrink-0"><BrandLogo /></Link>
          {nav && <nav className="hidden items-center gap-1 md:flex">{nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground">{item.label}</Link>
          ))}</nav>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden text-right lg:block"><p className="text-sm font-medium leading-none">{profile.full_name ?? "User"}</p><p className="mt-1 text-[11px] capitalize text-muted-foreground">{profile.role}</p></div>
          <Avatar className="h-9 w-9 border border-primary/20"><AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">{initials(profile.full_name)}</AvatarFallback></Avatar>
          <form action={signOut}><Button type="submit" variant="ghost" size="icon" className="h-9 w-9" aria-label="Sign out"><LogOut className="h-4 w-4" /></Button></form>
        </div>
      </div>
      {nav && <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">{nav.map((item) => (
        <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground">{item.label}</Link>
      ))}</nav>}
    </header>
  )
}
