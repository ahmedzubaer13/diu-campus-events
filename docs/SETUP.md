# Setup and first launch

## Install
Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

## Environment variables
Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://donrjmnostxyqwhocxcr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the publishable key from Supabase Dashboard → Project Settings → API Keys. Never use a secret/service-role key in browser code.

## Configure Auth
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: your local URL during development, then your production domain.
- Add redirect URLs: `http://localhost:3000/auth/callback` and your production `https://YOUR_DOMAIN/auth/callback`.

## Bootstrap the first admin
1. Register a normal student account through the app.
2. Confirm the email.
3. In Supabase SQL Editor, open `docs/bootstrap-admin.sql`.
4. Replace the placeholder email with the account email and run it.
5. Sign in again. The account will be routed to `/admin`.

Do not expose the bootstrap SQL as a public endpoint or leave the placeholder email unchanged.

## Product behavior
- Public event calendar: no login required.
- Student accounts: manually reviewed by an admin.
- Approved students: direct event publishing; no per-event review.
- Pending, rejected, or suspended users cannot publish.
- Admins: approve/reject/suspend students and cancel events.
- Times: Asia/Dhaka for display; timestamps stored as timestamptz.
