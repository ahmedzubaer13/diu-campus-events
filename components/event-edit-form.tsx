"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EventRecord = {
  id: string; title: string; summary: string; description: string; venue: string;
  starts_at: string; ends_at: string; organizer_name: string; category_id: string | null;
  registration_url: string | null; contact_email: string | null; status: string;
};
type Category = { id: string; name: string };

function localDate(value: string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function EventEditForm({ event, categories }: { event: EventRecord; categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const input = "w-full rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10";

  async function submit(formData: FormData) {
    setLoading(true); setError("");
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const starts = new Date(String(formData.get("starts_at")) + ":00+06:00");
      const ends = new Date(String(formData.get("ends_at")) + ":00+06:00");
      if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) throw new Error("Please provide a valid event start and end time.");

      const payload = {
        title: String(formData.get("title") || "").trim(),
        summary: String(formData.get("summary") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        category_id: String(formData.get("category_id") || "") || null,
        venue: String(formData.get("venue") || "").trim(),
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        registration_url: String(formData.get("registration_url") || "").trim() || null,
        contact_email: String(formData.get("contact_email") || "").trim() || null,
      };
      const { error: updateError } = await supabase.from("events").update(payload).eq("id", event.id);
      if (updateError) throw updateError;
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update event.");
    } finally {
      setLoading(false);
    }
  }

  return <form action={submit} className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Event title *</span><input name="title" required maxLength={120} defaultValue={event.title} className={input} /></label>
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Short summary *</span><input name="summary" required maxLength={220} defaultValue={event.summary} className={input} /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Category</span><select name="category_id" defaultValue={event.category_id || ""} className={input}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Venue *</span><input name="venue" required defaultValue={event.venue} className={input} /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Starts at (Bangladesh time) *</span><input name="starts_at" type="datetime-local" required defaultValue={localDate(event.starts_at)} className={input} /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Ends at (Bangladesh time) *</span><input name="ends_at" type="datetime-local" required defaultValue={localDate(event.ends_at)} className={input} /></label>
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Full description *</span><textarea name="description" required rows={7} defaultValue={event.description} className={input} /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Registration link</span><input name="registration_url" type="url" defaultValue={event.registration_url || ""} className={input} /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Contact email</span><input name="contact_email" type="email" defaultValue={event.contact_email || ""} className={input} /></label>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex justify-end border-t border-[#edf0ed] pt-5"><button disabled={loading} className="rounded-full bg-[#176b52] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Saving…" : "Save changes"}</button></div>
  </form>;
}
