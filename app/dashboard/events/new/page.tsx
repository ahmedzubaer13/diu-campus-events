import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { EventForm } from "@/components/event-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data: profile } = await supabase.from("profiles").select("account_status").eq("id", user.id).single();
  if (profile?.account_status !== "approved") redirect("/dashboard");
  return <main className="min-h-screen"><SiteHeader /><div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <Link href="/dashboard" className="text-sm font-medium text-[#176b52]">← Back to dashboard</Link>
    <div className="mt-5 rounded-3xl border border-[#e3e9e4] bg-white p-6 sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#176b52]">Event publishing</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create a campus event</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-[#65716d]">Your event will be published to the public calendar immediately.</p>
      <EventForm />
    </div>
  </div></main>;
}
