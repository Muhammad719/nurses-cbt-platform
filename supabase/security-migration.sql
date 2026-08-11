-- Examly security migration for an EXISTING Supabase project.
-- Run this after your existing tables already exist.
-- It removes the client-controlled admin escalation path.

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

alter table public.profiles enable row level security;

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (id = auth.uid() and role = 'student')
);

-- To provision an administrator, first create the account in
-- Supabase Authentication > Users, then run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_UUID';
