import Link from "next/link"
import { requireAdmin } from "@/lib/supabase/admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { ExamForm } from "@/components/admin/exam-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default async function NewExamPage(){const profile=await requireAdmin();return <div className="min-h-svh bg-muted/30"><AdminHeader profile={profile}/><main className="mx-auto max-w-3xl px-4 py-8"><Link href="/admin/exams" className="text-sm text-muted-foreground">← Back to exams</Link><Card className="mt-4"><CardHeader><CardTitle>Create exam</CardTitle></CardHeader><CardContent><ExamForm/></CardContent></Card></main></div>}
