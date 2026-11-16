"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string };

export function EventForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    createClient().from("categories").select("id,name").order("name").then(({ data }) => setCategories(data || []));
  }, []);

  async function submit(formData: FormData) {
    setLoading(true); setError("");
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const { data: profile } = await supabase.from("profiles").select("account_status,full_name").eq("id", user.id).single();
      if (profile?.account_status !== "approved") throw new Error("Only verified DIU students can publish events.");
      const starts = new Date(String(formData.get("starts_at")));
      const ends = new Date(String(formData.get("ends_at")));
      if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) throw new Error("Please provide a valid event start and end time.");
      const poster = formData.get("poster") as File | null;
      let poster_path: string | null = null;
      if (poster && poster.size > 0) {
        if (poster.size > 5 * 1024 * 1024) throw new Error("Poster must be 5 MB or smaller.");
        if (!["image/jpeg","image/png","image/webp"].includes(poster.type)) throw new Error("Poster must be JPG, PNG, or WebP.");
        const ext = poster.type === "image/jpeg" ? "jpg" : poster.type.split("/")[1];
        poster_path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("event-posters").upload(poster_path, poster, { contentType: poster.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const payload = {
        owner_id: user.id,
        organizer_name: profile.full_name,
        title: String(formData.get("title") || "").trim(),
        summary: String(formData.get("summary") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        category_id: String(formData.get("category_id") || "") || null,
        venue: String(formData.get("venue") || "").trim(),
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        registration_url: String(formData.get("registration_url") || "").trim() || null,
        contact_email: String(formData.get("contact_email") || "").trim() || null,
        poster_path,
        status: "published",
      };
      const { error: insertError } = await supabase.from("events").insert(payload);
      if (insertError) throw insertError;
      router.push("/dashboard"); router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to publish event.");
    } finally { setLoading(false); }
  }

  const input = "w-full rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm outline-none focus:border-[#176b52] focus:ring-2 focus:ring-[#176b52]/10";
  return <form action={submit} className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Event title *</span><input name="title" required maxLength={120} className={input} placeholder="e.g. DIU Tech Fest 2026" /></label>
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Short summary *</span><input name="summary" required maxLength={220} className={input} placeholder="A short introduction shown on event cards" /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Category</span><select name="category_id" className={input}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Venue *</span><input name="venue" required className={input} placeholder="e.g. Knowledge Tower" /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Starts at (Bangladesh time) *</span><input name="starts_at" type="datetime-local" required className={input} /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Ends at (Bangladesh time) *</span><input name="ends_at" type="datetime-local" required className={input} /></label>
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Full description *</span><textarea name="description" required rows={6} className={input} placeholder="Share the event details, schedule, eligibility, and anything attendees should know." /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Registration link (optional)</span><input name="registration_url" type="url" className={input} placeholder="https://" /></label>
      <label className="space-y-1.5"><span className="text-sm font-medium">Contact email (optional)</span><input name="contact_email" type="email" className={input} placeholder="organizer@example.com" /></label>
      <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium">Event poster (optional, JPG/PNG/WebP up to 5 MB)</span><input name="poster" type="file" accept="image/jpeg,image/png,image/webp" className={input} /></label>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ed] pt-5"><p className="max-w-md text-xs leading-5 text-[#87928d]">Publishing is immediate. Please check event details before publishing; administrators can remove inappropriate or inaccurate events.</p><button disabled={loading} className="rounded-full bg-[#176b52] px-6 py-3 text-sm font-semibold text-white hover:bg-[#10543f] disabled:opacity-60">{loading ? "Publishing…" : "Publish event"}</button></div>
  </form>;
}
