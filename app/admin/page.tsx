import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AdminPanel } from "@/components/admin-panel";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data: profile } = await supabase.from("profiles").select("role,account_status").eq("id", user.id).single();
  if (profile?.role !== "admin" || profile.account_status !== "approved") redirect("/dashboard");
  const [{ data: students }, { data: events }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,student_id,account_status,created_at,review_note").eq("role", "student").order("created_at", { ascending: false }).limit(200),
    supabase.from("events").select("id,title,organizer_name,starts_at,status,venue").order("created_at", { ascending: false }).limit(200),
  ]);
  return <main className="min-h-screen"><SiteHeader /><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#176b52]">Platform administration</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin dashboard</h1>
    <p className="mt-2 text-sm text-[#65716d]">Review student verification requests and moderate campus events.</p>
    <div className="mt-8"><AdminPanel students={students || []} events={events || []} adminId={user.id} /></div>
  </div></main>;
}
