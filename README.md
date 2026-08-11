# Examly CBT Platform

Examly is a Next.js + Supabase computer-based testing platform with student exams, server-side grading, an administrator control panel and PWA support.

## Completed in this version

- Admin dashboard with exam/question/result management
- Exam CRUD: create, edit, publish/unpublish and delete
- Question CRUD: MCQ, True/False and fill-in-the-blank
- Topic, subject, points and ordering support
- Results dashboard with pass/fail status
- Results CSV export
- Secure role checks for admin pages and result ownership
- Supabase RLS starter schema in `supabase/schema.sql`
- PWA manifest, service worker, offline fallback and install prompt
- Missing exam UI components completed
- Existing student exam flow preserved

## 1. Supabase setup

For a fresh Supabase database, open the Supabase SQL Editor and run `supabase/schema.sql`.

If your Supabase database already has the `profiles`, `exams`, `questions` and `attempts` tables, compare the schema with your existing columns before running it. Do not blindly replace an existing production schema.

Supabase's current Next.js documentation recommends cookie-based SSR and public URL/key environment variables with Row Level Security enabled. The project supports both the newer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the older `NEXT_PUBLIC_SUPABASE_ANON_KEY` naming.

After creating your first account, promote that account to admin from the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'YOUR_ADMIN_EMAIL@example.com'
);
```

Never put a Supabase secret/service-role key in browser-exposed `NEXT_PUBLIC_*` variables.

## 2. Local environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Then install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 3. Deploy to the existing Vercel project

### Recommended: GitHub → Vercel

1. Extract this ZIP.
2. Create a GitHub repository and upload the extracted project.
3. Open Vercel and select **Add New → Project**.
4. Import the GitHub repository.
5. Vercel should detect Next.js automatically.
6. Add these environment variables in the Vercel project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
7. Apply them to Production and Preview as appropriate.
8. Deploy.
9. Open the deployment URL and test sign-up/login, student dashboard, admin dashboard, exam creation and results export.

### If you already have the Vercel project

You can connect the GitHub repository to that existing Vercel project instead of creating a new one. Once connected, pushes to the production branch create production deployments and other branches can create Preview deployments.

### CLI alternative

From the project folder:

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local
npx vercel --prod
```

The CLI asks you to choose/link the existing Vercel project.

## 4. Supabase Auth redirect URLs

After deployment, configure Supabase Auth redirect URLs for the Vercel domain.

At minimum, allow:

```text
https://YOUR-PROJECT.vercel.app/**
http://localhost:3000/**
```

For a custom production domain, also add:

```text
https://YOUR-DOMAIN.com/**
```

## 5. Admin workflow

Go to:

```text
/admin
```

Only profiles whose database role is `admin` can enter the admin panel.

Admin routes:

- `/admin` — dashboard
- `/admin/exams` — exam CRUD
- `/admin/exams/new` — create exam
- `/admin/exams/[id]` — question CRUD
- `/admin/questions` — question bank
- `/admin/results` — results
- `/api/admin/results.csv` — CSV export

## 6. CSV

The results export contains:

- Attempt ID
- Student
- Exam
- Subject
- Score
- Passing score
- Result
- Correct count
- Anti-cheat violations
- Submission time

It opens directly in Excel, Google Sheets and other spreadsheet applications.

## 7. PWA

The app includes:

- `/manifest.webmanifest`
- `/sw.js`
- 192px and 512px app icons
- offline fallback page
- browser install prompt
- standalone display metadata

The service worker deliberately does not cache authenticated API requests or exam submissions. A live connection is required to submit an exam.

## 8. Important security notes

- Correct answers are not sent to the student exam client.
- Exam grading happens server-side.
- Admin pages verify the authenticated profile role.
- Students can only view their own result pages.
- Supabase RLS policies are included in `supabase/schema.sql`.
- Do not use a service-role/secret Supabase key in the frontend.

## Roles and registration

- Public registration is **student-only**. The browser never sends an admin role during sign-up.
- Administrator accounts are provisioned separately. Use **/admin/login** for the administrator portal.
- A student account cannot access `/admin`; server-side `requireAdmin()` checks the database role.
- The database trigger always creates newly registered users with `role = 'student'`.
- The profile update RLS policy prevents a student from changing their own role to `admin`.

### Provision the first administrator

1. Create the administrator account in Supabase Authentication → Users.
2. Find that user's UUID.
3. In SQL Editor run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID';
```

4. Sign in at `/admin/login`.

For an existing database, run `supabase/security-migration.sql` before using the new registration flow.
