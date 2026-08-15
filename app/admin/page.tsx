import Link from "next/link"
import { Activity, BookOpen, CheckCircle2, FileQuestion, Plus, Users, type LucideIcon } from "lucide-react"
import { requireAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
export default async function AdminDashboard() {
 const profile=await requireAdmin(); const s=await createClient();
 const [{count:exams},{count:questions},{count:attempts},{count:students}]=await Promise.all([
  s.from("exams").select("*",{count:"exact",head:true}),s.from("questions").select("*",{count:"exact",head:true}),s.from("attempts").select("*",{count:"exact",head:true}).eq("status","submitted"),s.from("profiles").select("*",{count:"exact",head:true}).eq("role","student")])
 const stats: { label: string; value: number; Icon: LucideIcon; href: string }[] = [
  { label: "Total exams", value: exams ?? 0, Icon: BookOpen, href: "/admin/exams" },
  { label: "Questions", value: questions ?? 0, Icon: FileQuestion, href: "/admin/exams" },
  { label: "Submitted attempts", value: attempts ?? 0, Icon: CheckCircle2, href: "/admin/results" },
  { label: "Students", value: students ?? 0, Icon: Users, href: "/admin/results" },
 ]
 return <div className="min-h-svh bg-muted/30"><AdminHeader profile={profile}/><main className="mx-auto max-w-6xl px-4 py-8"><div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Administration</p><h1 className="font-display text-3xl font-bold">Control center</h1><p className="mt-1 text-muted-foreground">Create exams, manage questions and monitor student performance.</p></div><Button asChild><Link href="/admin/exams/new"><Plus className="mr-2 h-4 w-4"/>New exam</Link></Button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(({ label, value, Icon, href })=><Link key={label} href={href}><Card className="h-full hover:border-primary/40"><CardContent className="flex items-center justify-between py-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-bold">{value}</p></div><Icon className="h-8 w-8 text-primary/70"/></CardContent></Card></Link>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4"/>Quick actions</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Button variant="outline" asChild><Link href="/admin/exams/new">Create an exam</Link></Button><Button variant="outline" asChild><Link href="/admin/results">View results</Link></Button><Button variant="outline" asChild><Link href="/admin/exams">Manage exams</Link></Button><Button variant="outline" asChild><Link href="/admin/results?format=csv">Export results CSV</Link></Button></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Admin workflow</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p><b className="text-foreground">1.</b> Create an exam and set its duration and passing score.</p><p><b className="text-foreground">2.</b> Add and edit questions, answer options and topics.</p><p><b className="text-foreground">3.</b> Publish the exam when it is ready for students.</p><p><b className="text-foreground">4.</b> Monitor submissions and export results as CSV.</p></CardContent></Card></div></main></div>
}
