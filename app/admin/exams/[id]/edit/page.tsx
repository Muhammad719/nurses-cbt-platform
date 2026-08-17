import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { ExamForm } from "@/components/admin/exam-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exam } from "@/lib/types"
export default async function EditExamPage({params}:{params:Promise<{id:string}>}){const profile=await requireAdmin();const {id}=await params;const s=await createClient();const {data}=await s.from("exams").select("*").eq("id",id).single();if(!data)notFound();return <div className="min-h-svh bg-background"><AdminHeader profile={profile}/><main className="mx-auto max-w-3xl px-4 py-8"><Link href={`/admin/exams/${id}`} className="text-sm text-muted-foreground">← Back to questions</Link><Card className="mt-4"><CardHeader><CardTitle>Edit exam</CardTitle></CardHeader><CardContent><ExamForm exam={data as Exam}/></CardContent></Card></main></div>}
