"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("diu-events-theme");
    const enabled = storedTheme === "dark";
    document.documentElement.classList.toggle("dark", enabled);
    setDarkMode(enabled);

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

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("diu-events-theme", next ? "dark" : "light");
  }

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#176b52] text-lg text-white">D</span>
        <span>DIU Events</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/#calendar" className="hidden rounded-full px-4 py-2 text-[#52615b] hover:bg-white sm:inline">Explore</Link>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={darkMode}>
          <span className="theme-toggle-icon" aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
          <span className="hidden sm:inline">{darkMode ? "Light mode" : "Dark mode"}</span>
        </button>
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
