-- Examly / Supabase database setup
-- Run this in Supabase SQL Editor for a fresh database.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  passing_score integer not null default 50 check (passing_score between 0 and 100),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  type text not null check (type in ('mcq','true_false','fill_blank')),
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  subject text,
  topic text,
  points integer not null default 1 check (points > 0),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score integer,
  total_points integer,
  correct_count integer,
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  violations integer not null default 0,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists questions_exam_order_idx on public.questions(exam_id, order_index);
create index if not exists attempts_student_idx on public.attempts(student_id, submitted_at desc);
create index if not exists attempts_exam_idx on public.attempts(exam_id, submitted_at desc);
-- For a one-attempt-per-student-per-exam policy, keep this unique index.
create unique index if not exists attempts_exam_student_unique on public.attempts(exam_id, student_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;

drop policy if exists "profiles own or admin read" on public.profiles;
create policy "profiles own or admin read" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (id = auth.uid() and role = 'student')
);

drop policy if exists "exams published or admin read" on public.exams;
create policy "exams published or admin read" on public.exams
for select to authenticated using (
  is_published = true or public.is_admin() or exists (
    select 1 from public.attempts a where a.exam_id = exams.id and a.student_id = auth.uid()
  )
);

drop policy if exists "exams admin insert" on public.exams;
create policy "exams admin insert" on public.exams
for insert to authenticated with check (public.is_admin());

drop policy if exists "exams admin update" on public.exams;
create policy "exams admin update" on public.exams
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "exams admin delete" on public.exams;
create policy "exams admin delete" on public.exams
for delete to authenticated using (public.is_admin());

drop policy if exists "questions published or admin read" on public.questions;
create policy "questions published or admin read" on public.questions
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.exams e where e.id = exam_id and e.is_published = true
  ) or exists (
    select 1 from public.attempts a where a.exam_id = questions.exam_id and a.student_id = auth.uid()
  )
);

drop policy if exists "questions admin insert" on public.questions;
create policy "questions admin insert" on public.questions
for insert to authenticated with check (public.is_admin());

drop policy if exists "questions admin update" on public.questions;
create policy "questions admin update" on public.questions
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "questions admin delete" on public.questions;
create policy "questions admin delete" on public.questions
for delete to authenticated using (public.is_admin());

drop policy if exists "attempts own or admin read" on public.attempts;
create policy "attempts own or admin read" on public.attempts
for select to authenticated using (student_id = auth.uid() or public.is_admin());

drop policy if exists "attempts own insert" on public.attempts;
create policy "attempts own insert" on public.attempts
for insert to authenticated with check (student_id = auth.uid() and not public.is_admin());

-- Admin result exports use authenticated Supabase access and therefore rely on the
-- admin SELECT policy above.


-- IMPORTANT SECURITY MIGRATION FOR EXISTING DATABASES:
-- Public sign-up must always create students. Never trust a role sent from the browser.
-- Run this script after applying the schema to existing projects.
-- Existing admin rows are preserved.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

