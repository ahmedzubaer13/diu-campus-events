import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return <main className="min-h-screen bg-[#f7f8f5] px-5 py-10">
    <div className="mx-auto max-w-md">
      <Link href="/" className="text-sm font-semibold text-[#176b52]">← DIU Campus Events</Link>
      <div className="mt-8 rounded-3xl border border-[#e3e9e4] bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#176b52]">Student registration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Join the campus calendar</h1>
        <p className="mt-3 text-sm leading-6 text-[#65716d]">Create an account with your DIU details. An administrator will review your student information before you can publish events.</p>
        <div className="my-7"><AuthForm mode="signup" /></div>
        <p className="text-xs leading-5 text-[#87928d]">Your student ID is used for verification and is not shown publicly.</p>
      </div>
    </div>
  </main>;
}
