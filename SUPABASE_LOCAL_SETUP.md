# Supabase Local Setup

## 1) Create your Supabase project
- Create a new project in Supabase.

## 2) Add environment variables
- Update `.env`:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_ANON_KEY"
VITE_APP_URL="http://localhost:8080"
VITE_DEV_PORT="8080"
```

## 3) Run app database schema
- In Supabase SQL Editor, run:
- `supabase/migrations/20260222050151_b54b7722-afa5-42ae-bd67-b72c9f752912.sql`

## 4) Configure authentication URLs
- Supabase Dashboard -> Authentication -> URL Configuration
- Site URL: `http://localhost:8080`
- Redirect URLs:
- `http://localhost:8080/`
- `http://localhost:8080/auth`
- `http://localhost:8080/reset-password`
- `http://localhost:8080/email-verified`

## 5) Configure Google OAuth
- Supabase Dashboard -> Authentication -> Providers -> Google -> Enable
- In Google Cloud Console OAuth Client, add this Authorized redirect URI:
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## 6) Start locally
- `npm install`
- `npm run dev`

## 7) Deploy on Vercel/Render
- Set these environment variables in the hosting dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_APP_URL` as your production URL (for example `https://your-app.vercel.app`)
- In Supabase URL configuration, add production URLs too:
- `https://your-app.vercel.app/`
- `https://your-app.vercel.app/auth`
- `https://your-app.vercel.app/reset-password`
- `https://your-app.vercel.app/email-verified`
