import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignInPage() {
  return <main className="min-h-screen bg-[#f7f8f5] px-5 py-10">
    <div className="mx-auto max-w-md">
      <Link href="/" className="text-sm font-semibold text-[#176b52]">← DIU Campus Events</Link>
      <div className="mt-8 rounded-3xl border border-[#e3e9e4] bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#176b52]">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#65716d]">Access your student dashboard and event submissions.</p>
        <div className="my-7"><AuthForm mode="signin" /></div>
      </div>
    </div>
  </main>;
}
