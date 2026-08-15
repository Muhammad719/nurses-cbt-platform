import Link from "next/link"
import { requireAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Exam } from "@/lib/types"
export default async function AdminQuestionsPage(){const profile=await requireAdmin();const s=await createClient();const {data}=await s.from("exams").select("*").order("created_at",{ascending:false});const exams=(data??[]) as Exam[];return <div className="min-h-svh bg-muted/30"><AdminHeader profile={profile}/><main className="mx-auto max-w-5xl px-4 py-8"><h1 className="font-display text-3xl font-bold">Question bank</h1><p className="mt-1 mb-8 text-muted-foreground">Choose an exam to create, edit or delete its questions.</p><div className="grid gap-4 md:grid-cols-2">{exams.map(e=><Card key={e.id}><CardContent className="flex items-center justify-between gap-4 py-5"><div><p className="font-semibold">{e.title}</p><p className="text-sm text-muted-foreground">{e.subject||"No subject"}</p></div><Button asChild><Link href={`/admin/exams/${e.id}`}>Manage questions</Link></Button></CardContent></Card>)}{exams.length===0&&<Card><CardContent className="py-12 text-center text-muted-foreground">Create an exam first.</CardContent></Card>}</div></main></div>}
