import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { EventEditForm } from "@/components/event-edit-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const [{ data: profile }, { data: event }, { data: categories }] = await Promise.all([
    supabase.from("profiles").select("role,account_status").eq("id", user.id).maybeSingle(),
    supabase.from("events").select("id,owner_id,title,summary,description,venue,starts_at,ends_at,organizer_name,category_id,registration_url,contact_email,status").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("name"),
  ]);

  if (!event) notFound();
  const isAdmin = profile?.role === "admin" && profile.account_status === "approved";
  const isOwner = event.owner_id === user.id && profile?.account_status === "approved";
  if (!isAdmin && !isOwner) redirect("/dashboard");

  return <main className="min-h-screen"><SiteHeader /><div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-sm font-medium text-[#176b52]">← Back to {isAdmin ? "admin dashboard" : "dashboard"}</Link>
    <div className="mt-5 rounded-3xl border border-[#e3e9e4] bg-white p-6 sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#176b52]">Event management</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit event</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-[#65716d]">Update the event information. Changes will be reflected on the public calendar.</p>
      <EventEditForm event={event} categories={categories || []} />
    </div>
  </div></main>;
}
