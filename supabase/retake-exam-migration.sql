-- Retake exam migration
-- Run once in Supabase SQL Editor.
-- Allows a student to submit the same published exam more than once.

drop index if exists public.attempts_exam_student_unique;

create index if not exists attempts_exam_student_submitted_idx
  on public.attempts(exam_id, student_id, submitted_at desc);
