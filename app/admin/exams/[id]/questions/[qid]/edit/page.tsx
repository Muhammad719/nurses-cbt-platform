import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { QuestionForm } from "@/components/admin/question-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default async function EditQuestionPage({params}:{params:Promise<{id:string;qid:string}>}){const profile=await requireAdmin();const {id,qid}=await params;const s=await createClient();const {data}=await s.from("questions").select("*").eq("id",qid).eq("exam_id",id).single();if(!data)notFound();return <div className="min-h-svh bg-muted/30"><AdminHeader profile={profile}/><main className="mx-auto max-w-2xl px-4 py-8"><Link href={`/admin/exams/${id}`} className="text-sm text-muted-foreground">← Back to questions</Link><Card className="mt-4"><CardHeader><CardTitle>Edit question</CardTitle></CardHeader><CardContent><QuestionForm examId={id} question={data}/></CardContent></Card></main></div>}
