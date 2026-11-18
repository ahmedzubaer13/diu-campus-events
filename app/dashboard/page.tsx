import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data: profile } = await supabase.from("profiles").select("full_name,student_id,account_status,role,review_note").eq("id", user.id).single();
  const { data: events } = await supabase.from("events").select("id,title,starts_at,status,venue").eq("owner_id", user.id).order("created_at", { ascending: false });
  if (profile?.role === "admin") redirect("/admin");

  const statusText: Record<string,string> = { pending: "Awaiting verification", approved: "Verified student", rejected: "Verification rejected", suspended: "Account suspended" };
  const statusColor: Record<string,string> = { pending: "bg-amber-50 text-amber-800", approved: "bg-green-50 text-green-800", rejected: "bg-red-50 text-red-800", suspended: "bg-slate-100 text-slate-700" };

  return <main className="min-h-screen"><SiteHeader /><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#176b52]">Student workspace</p><h1 className="mt-2 text-3xl font-semibold">Hello, {profile?.full_name || user.email}</h1><p className="mt-2 text-sm text-[#65716d]">Manage your campus event submissions.</p></div><Link href="/" className="text-sm font-medium text-[#176b52]">View public calendar ↗</Link></div>
    <div className="mt-8 grid gap-5 md:grid-cols-[.8fr_1.2fr]">
      <section className="rounded-2xl border border-[#e3e9e4] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#87928d]">Account status</p>
        <span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusColor[profile?.account_status || "pending"]}`}>{statusText[profile?.account_status || "pending"]}</span>
        <p className="mt-4 text-sm leading-6 text-[#65716d]">{profile?.account_status === "approved" ? "Your student account is verified. You can publish events directly without individual event approval." : profile?.account_status === "rejected" ? "Your verification was not approved. Review the note below and contact an administrator." : profile?.account_status === "suspended" ? "Publishing is disabled for this account. Contact an administrator if you believe this is a mistake." : "Your details are awaiting manual review by a DIU Events administrator. You can browse the calendar while waiting."}</p>
        {profile?.review_note && <p className="mt-3 rounded-xl bg-[#f7f8f5] p-3 text-sm text-[#52615b]">Admin note: {profile.review_note}</p>}
        <div className="mt-5 border-t border-[#edf0ed] pt-4 text-xs text-[#87928d]">Student ID: {profile?.student_id || "Not provided"}</div>
        {profile?.account_status === "approved" && <Link href="/dashboard/events/new" className="mt-5 inline-flex rounded-full bg-[#176b52] px-5 py-2.5 text-sm font-semibold text-white">＋ Publish an event</Link>}
      </section>
      <section className="rounded-2xl border border-[#e3e9e4] bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Your events</h2>{profile?.account_status === "approved" && <Link href="/dashboard/events/new" className="text-sm font-semibold text-[#176b52]">＋ New event</Link>}</div>
        {!events?.length ? <p className="mt-8 rounded-xl bg-[#f7f8f5] p-6 text-center text-sm text-[#65716d]">You haven&apos;t submitted any events yet.</p> : <div className="mt-4 divide-y divide-[#edf0ed]">{events.map((event) => <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{event.title}</p><p className="mt-1 text-xs text-[#87928d]">{new Date(event.starts_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })} · {event.venue}</p></div><span className="rounded-full bg-[#f1f4f1] px-3 py-1 text-xs font-semibold capitalize text-[#52615b]">{event.status}</span></div>)}</div>}
      </section>
    </div>
  </div></main>;
}
