"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(""); setMessage("");
    const supabase = createClient();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    try {
      if (isSignup) {
        const full_name = String(formData.get("full_name") || "").trim();
        const student_id = String(formData.get("student_id") || "").trim();
        const batch = String(formData.get("batch") || "").trim();
        const { data, error: authError } = await supabase.auth.signUp({
          email, password, options: { data: { full_name, student_id, batch } },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push("/dashboard"); router.refresh();
        } else {
          setMessage("Registration received. Check your email to confirm your account. Your account will remain pending until an administrator verifies your student details.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/dashboard"); router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isSignup && <>
        <Field label="Full name" name="full_name" placeholder="As shown on your student ID" required />
        <Field label="DIU student ID" name="student_id" placeholder="Your student ID" required />
        <Field label="Batch (optional)" name="batch" placeholder="e.g.  Fall 26" />
      </>}
      <Field label="Email address" name="email" type="email" placeholder="you@example.com" required />
      <Field label="Password" name="password" type="password" placeholder={isSignup ? "At least 8 characters" : "Your password"} required minLength={8} />
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm leading-6 text-green-800">{message}</p>}
      <button disabled={loading} className="w-full rounded-full bg-[#176b52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#10543f] disabled:opacity-60">{loading ? "Please wait…" : isSignup ? "Create student account" : "Sign in"}</button>
      <p className="text-center text-sm text-[#65716d]">{isSignup ? "Already registered?" : "New to DIU Campus Events?"} <Link className="font-semibold text-[#176b52] hover:underline" href={isSignup ? "/auth/sign-in" : "/auth/sign-up"}>{isSignup ? "Sign in" : "Create an account"}</Link></p>
    </form>
  );
}

function Field({ label, name, type = "text", placeholder, required = false, minLength }: { label: string; name: string; type?: string; placeholder: string; required?: boolean; minLength?: number }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium text-[#35413b]">{label}</span><input name={name} type={type} placeholder={placeholder} required={required} minLength={minLength} className="w-full rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#a0aaa4] focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10" /></label>;
}
