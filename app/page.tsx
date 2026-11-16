import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { EventCalendar } from "@/components/event-calendar";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id,title,summary,venue,starts_at,ends_at,organizer_name,status,categories(name,color)")
    .eq("status", "published")
    .gte("ends_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(250);
  const events = data || [];

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 md:grid-cols-[1.15fr_.85fr] md:items-center md:pb-24 md:pt-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[.14em] text-[#176b52]"><span className="h-2 w-2 rounded-full bg-[#39a47b]" /> The DIU student community</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-.055em] md:text-7xl">Your campus.<br /><span className="text-[#176b52]">One calendar.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#65716d]">Discover workshops, competitions, cultural programs, sports, and academic events happening across Daffodil International University.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#calendar" className="rounded-full bg-[#176b52] px-6 py-3 text-sm font-semibold text-white hover:bg-[#10543f]">Explore campus events ↗</a>
            <Link href="/auth/sign-up" className="rounded-full border border-[#dce4de] bg-white px-6 py-3 text-sm font-semibold hover:border-[#176b52]">Publish an event</Link>
          </div>
          <p className="mt-5 text-xs text-[#87928d]">Open to everyone · Event publishing for verified DIU students</p>
        </div>
        <div className="rounded-[1.7rem] border border-[#e0e8e1] bg-white p-6 shadow-[0_24px_80px_-38px_rgba(26,65,48,.35)]">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#87928d]">Campus at a glance</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-[#176b52]">{events.length}</p>
          <p className="mt-1 text-sm text-[#65716d]">Published upcoming events</p>
          <div className="my-6 h-px bg-[#edf0ed]" />
          <p className="text-sm font-semibold">A shared space for campus life</p>
          <p className="mt-2 text-sm leading-6 text-[#65716d]">Find events, plan your week, and stay connected with what's happening across DIU.</p>
          <div className="mt-5 flex flex-wrap gap-2">{["Academic","Technology","Cultural","Sports","Career","Workshop"].map((c) => <span key={c} className="rounded-full bg-[#f1f6f2] px-3 py-1.5 text-xs font-medium text-[#176b52]">{c}</span>)}</div>
        </div>
      </section>
      <section id="calendar" className="border-y border-[#e4e9e5] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#176b52]">Discover & participate</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Campus event calendar</h2></div><p className="max-w-md text-sm leading-6 text-[#65716d]">Browse public events and select any event to see its details. Times are shown in Bangladesh time.</p></div>
          {events.length ? <EventCalendar events={events} /> : <div className="rounded-2xl border border-dashed border-[#d9e2db] bg-[#fbfcfa] px-6 py-16 text-center"><p className="text-lg font-semibold">The calendar is ready for its first event.</p><p className="mt-2 text-sm text-[#65716d]">Once verified students publish events, they will appear here.</p><Link href="/auth/sign-up" className="mt-5 inline-flex rounded-full bg-[#176b52] px-5 py-2.5 text-sm font-semibold text-white">Register as a student</Link></div>}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-xs text-[#87928d] sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© {new Date().getFullYear()} DIU Campus Events</span><span>Built for the Daffodil International University community</span></footer>
    </main>
  );
}
