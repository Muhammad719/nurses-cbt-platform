-- ============================================================
-- EXAMLY ROLE SEPARATION MIGRATION
-- Run this on an existing project that already has profiles/exams/
-- questions/attempts. It preserves existing records.
-- ============================================================

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('student', 'admin', 'super_admin');
  end if;
end $$;

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
declare
  role_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
  into role_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'profiles'
    and a.attname = 'role'
    and a.attnum > 0
    and not a.attisdropped;

  if role_type is not null and role_type <> 'public.user_role' then
    alter table public.profiles drop constraint if exists profiles_role_check;
    alter table public.profiles
      alter column role type public.user_role
      using role::text::public.user_role;
  end if;
end $$;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'student'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  super_count integer;
begin
  if new.role is distinct from old.role then
    if not public.is_super_admin() then
      raise exception 'Only a Super Admin can change user roles';
    end if;

    if old.role = 'super_admin' and new.role <> 'super_admin' then
      select count(*) into super_count
      from public.profiles
      where role = 'super_admin';

      if super_count <= 1 then
        raise exception 'At least one Super Admin must remain';
      end if;
    end if;

    if old.id = auth.uid() and new.role <> 'super_admin' then
      raise exception 'You cannot remove your own Super Admin access';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_role_change on public.profiles;
create trigger guard_profile_role_change
before update on public.profiles
for each row execute procedure public.guard_profile_role_change();

alter table public.profiles enable row level security;

drop policy if exists "profiles own or admin read" on public.profiles;
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles own update" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
on public.profiles for update to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

-- Make sure the existing exam/question/attempt policies recognize Super Admin.
drop policy if exists "exams published or admin read" on public.exams;
drop policy if exists "exams_select" on public.exams;
create policy "exams_select"
on public.exams for select to authenticated
using (
  is_published = true
  or public.is_admin()
  or exists (
    select 1 from public.attempts a
    where a.exam_id = exams.id and a.student_id = auth.uid()
  )
);

drop policy if exists "exams admin insert" on public.exams;
drop policy if exists "exams_insert" on public.exams;
create policy "exams_insert"
on public.exams for insert to authenticated with check (public.is_admin());

drop policy if exists "exams admin update" on public.exams;
drop policy if exists "exams_update" on public.exams;
create policy "exams_update"
on public.exams for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "exams admin delete" on public.exams;
drop policy if exists "exams_delete" on public.exams;
create policy "exams_delete"
on public.exams for delete to authenticated using (public.is_admin());

drop policy if exists "questions published or admin read" on public.questions;
drop policy if exists "questions_select" on public.questions;
create policy "questions_select"
on public.questions for select to authenticated
using (
  public.is_admin()
  or exists (select 1 from public.exams e where e.id = questions.exam_id and e.is_published = true)
  or exists (select 1 from public.attempts a where a.exam_id = questions.exam_id and a.student_id = auth.uid())
);

drop policy if exists "questions admin insert" on public.questions;
drop policy if exists "questions_insert" on public.questions;
create policy "questions_insert" on public.questions for insert to authenticated with check (public.is_admin());

drop policy if exists "questions admin update" on public.questions;
drop policy if exists "questions_update" on public.questions;
create policy "questions_update" on public.questions for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "questions admin delete" on public.questions;
drop policy if exists "questions_delete" on public.questions;
create policy "questions_delete" on public.questions for delete to authenticated using (public.is_admin());

drop policy if exists "attempts own or admin read" on public.attempts;
drop policy if exists "attempts_select" on public.attempts;
create policy "attempts_select" on public.attempts for select to authenticated
using (student_id = auth.uid() or public.is_admin());

drop policy if exists "attempts own insert" on public.attempts;
drop policy if exists "attempts_insert" on public.attempts;
create policy "attempts_insert" on public.attempts for insert to authenticated
with check (student_id = auth.uid() and not public.is_admin());

revoke all on public.profiles from anon;
revoke all on public.exams from anon;
revoke all on public.questions from anon;
revoke all on public.attempts from anon;
