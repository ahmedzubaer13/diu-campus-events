"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setUser(data.session?.user ?? null);
        setReady(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#176b52] text-lg text-white">D</span>
        <span>DIU Events</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/#calendar" className="hidden rounded-full px-4 py-2 text-[#52615b] hover:bg-white sm:inline">Explore</Link>
        {ready && user ? (
          <Link href="/dashboard" prefetch className="rounded-full bg-[#176b52] px-4 py-2 font-medium text-white hover:bg-[#10543f]">Dashboard</Link>
        ) : ready ? (
          <>
            <Link href="/auth/sign-in" prefetch className="rounded-full border border-[#dce4de] bg-white px-4 py-2 font-medium hover:border-[#176b52]">Sign in</Link>
            <Link href="/auth/sign-up" prefetch className="rounded-full bg-[#176b52] px-4 py-2 font-medium text-white hover:bg-[#10543f]">Create account</Link>
          </>
        ) : (
          <span className="h-9 w-28 animate-pulse rounded-full bg-[#edf1ed]" aria-label="Loading account navigation" />
        )}
      </nav>
    </header>
  );
}
