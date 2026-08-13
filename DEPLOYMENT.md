# Examly CBT — Vercel deployment

## Next.js 16 routing

This project uses `proxy.ts`, which is the Next.js 16 convention. Do **not** add a `middleware.ts` file alongside it.

## Vercel environment variables

Add these in Vercel Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The repository intentionally does not include `.env.local`.

## Deploy

1. Push/upload this project to GitHub.
2. Import the repository into Vercel.
3. Select the project root (the folder containing `package.json`).
4. Use the default Next.js build settings.
5. Add the Supabase environment variables.
6. Deploy.

The interface is responsive across mobile, tablet, laptop and desktop screens.
