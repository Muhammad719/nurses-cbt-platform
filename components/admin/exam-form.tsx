"use client"

import { useState } from "react"
import { FileUp, FileText, Info } from "lucide-react"
import { createExam, updateExam } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function Submit({label}:{label:string}) { return <Button type="submit">{label}</Button> }

export function ExamForm({exam}:{exam?:any}) {
  const [pub,setPub] = useState(!!exam?.is_published)
  const [fileName,setFileName] = useState("")
  const isNew = !exam
  return <form action={exam ? updateExam : createExam} encType="multipart/form-data" className="space-y-6">
    {exam && <input type="hidden" name="id" value={exam.id}/>}
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2"><Label htmlFor="title">Exam title</Label><Input id="title" name="title" required defaultValue={exam?.title??""}/></div>
      <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={exam?.description??""}/></div>
      <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" defaultValue={exam?.subject??""}/></div>
      <div className="space-y-2"><Label htmlFor="duration_minutes">Duration (minutes)</Label><Input id="duration_minutes" name="duration_minutes" type="number" min="1" max="600" defaultValue={exam?.duration_minutes??60}/></div>
      <div className="space-y-2"><Label htmlFor="passing_score">Passing score (%)</Label><Input id="passing_score" name="passing_score" type="number" min="0" max="100" defaultValue={exam?.passing_score??50}/></div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"><input type="checkbox" name="is_published" checked={pub} onChange={e=>setPub(e.target.checked)} className="h-4 w-4"/><span><b className="block text-sm">Publish exam</b><span className="text-xs text-muted-foreground">Students can only take published exams.</span></span></label>
    </div>

    {isNew && <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start gap-3"><div className="rounded-xl border bg-background p-2"><FileUp className="h-5 w-5 text-primary"/></div><div className="min-w-0 flex-1"><h3 className="font-semibold">Upload Questions</h3><p className="mt-1 text-sm text-muted-foreground">Optional. Create the exam and import all questions in one step.</p></div></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="questions_file">Question file</Label><Input id="questions_file" name="questions_file" type="file" accept=".csv,.json,text/csv,application/json" onChange={e=>setFileName(e.target.files?.[0]?.name ?? "")}/>{fileName && <p className="text-xs text-primary">Selected: {fileName}</p>}</div>
        <div className="rounded-xl border bg-background/70 p-3 text-xs text-muted-foreground"><p className="mb-1 flex items-center gap-1 font-medium text-foreground"><Info className="h-3.5 w-3.5"/>Supported formats</p><p><b>CSV:</b> question, option_a, option_b, option_c, option_d, correct_answer</p><p className="mt-1"><b>JSON:</b> questions array with question_text, options and correct_answer.</p></div>
      </div>
      <div className="mt-4 rounded-xl border bg-background/60 p-3 text-xs text-muted-foreground"><p className="mb-2 flex items-center gap-1 font-medium text-foreground"><FileText className="h-3.5 w-3.5"/>CSV example</p><code className="block overflow-x-auto whitespace-pre">question,option_a,option_b,option_c,option_d,correct_answer
Normal body temperature?,35°C,37°C,40°C,45°C,B</code></div>
    </section>}

    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={()=>history.back()}>Cancel</Button><Submit label={exam?"Save changes":isNew?"Create exam & import questions":"Create exam"}/></div>
  </form>
}
