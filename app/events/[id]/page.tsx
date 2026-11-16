import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("id,title,summary,description,venue,starts_at,ends_at,organizer_name,status,registration_url,contact_email,poster_path,categories(name,color)").eq("id", id).maybeSingle();
  if (!event || !["published","cancelled"].includes(event.status)) notFound();
  const poster = event.poster_path ? supabase.storage.from("event-posters").getPublicUrl(event.poster_path).data.publicUrl : null;
  return <main className="min-h-screen"><SiteHeader /><article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <Link href="/#calendar" className="text-sm font-medium text-[#176b52]">← Back to calendar</Link>
    <div className="mt-5 overflow-hidden rounded-3xl border border-[#e3e9e4] bg-white">
      {poster && <img src={poster} alt="" className="max-h-[420px] w-full object-cover" />}
      <div className="p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#edf6f0] px-3 py-1 text-xs font-semibold text-[#176b52]">{event.categories?.name || "Campus event"}</span>{event.status === "cancelled" && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Cancelled</span>}</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
        <p className="mt-3 text-lg leading-7 text-[#65716d]">{event.summary}</p>
        <div className="my-8 grid gap-4 rounded-2xl bg-[#f7f8f5] p-5 sm:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[#87928d]">Date & time</p><p className="mt-2 text-sm font-medium">{new Date(event.starts_at).toLocaleString("en-BD",{dateStyle:"full",timeStyle:"short",timeZone:"Asia/Dhaka"})}</p><p className="mt-1 text-xs text-[#65716d]">Ends {new Date(event.ends_at).toLocaleString("en-BD",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Dhaka"})}</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[#87928d]">Venue</p><p className="mt-2 text-sm font-medium">{event.venue}</p><p className="mt-1 text-xs text-[#65716d]">Organized by {event.organizer_name}</p></div>
        </div>
        <h2 className="text-lg font-semibold">About this event</h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#52615b]">{event.description}</div>
        {event.status === "published" && event.registration_url && <a href={event.registration_url} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-[#176b52] px-6 py-3 text-sm font-semibold text-white">Register for event ↗</a>}
        {event.contact_email && <p className="mt-6 text-sm text-[#65716d]">Questions? <a className="font-medium text-[#176b52]" href={"mailto:" + event.contact_email}>{event.contact_email}</a></p>}
      </div>
    </div>
  </article></main>;
}
