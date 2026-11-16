# DIU Campus Events

A public event calendar for Daffodil International University. Anyone can browse events; verified DIU students can publish events; administrators review student verification and manage events.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and Storage
- Vercel deployment

## Supabase
Project ref: `donrjmnostxyqwhocxcr`
Region: Mumbai (`ap-south-1`)
URL: `https://donrjmnostxyqwhocxcr.supabase.co`

Set these environment variables locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://donrjmnostxyqwhocxcr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Never expose a Supabase secret/service-role key in browser code or a `NEXT_PUBLIC_` variable.

The database schema, RLS policies, categories, and public `event-posters` storage bucket are installed in the hosted project. The frontend is being built next.
