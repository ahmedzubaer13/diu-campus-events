import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#176b52] text-lg text-white">D</span>
        <span>DIU Events</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/#calendar" className="hidden rounded-full px-4 py-2 text-[#52615b] hover:bg-white sm:inline">Explore</Link>
        {user ? (
          <Link href="/dashboard" className="rounded-full bg-[#176b52] px-4 py-2 font-medium text-white hover:bg-[#10543f]">Dashboard</Link>
        ) : (
          <>
            <Link href="/auth/sign-in" className="rounded-full border border-[#dce4de] bg-white px-4 py-2 font-medium hover:border-[#176b52]">Sign in</Link>
            <Link href="/auth/sign-up" className="rounded-full bg-[#176b52] px-4 py-2 font-medium text-white hover:bg-[#10543f]">Create account</Link>
          </>
        )}
      </nav>
    </header>
  );
}
