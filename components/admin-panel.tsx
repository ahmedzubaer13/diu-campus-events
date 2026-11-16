"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Student = { id: string; full_name: string; student_id: string | null; account_status: string; created_at: string; review_note: string | null };
type CampusEvent = { id: string; title: string; organizer_name: string; starts_at: string; status: string; venue: string };

export function AdminPanel({ students, events, adminId }: { students: Student[]; events: CampusEvent[]; adminId: string }) {
  const [tab, setTab] = useState<"students"|"events">("students");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function reviewStudent(student: Student, status: "approved"|"rejected"|"suspended") {
    const note = window.prompt(status === "approved" ? "Optional verification note:" : "Reason or note for this decision:", student.review_note || "");
    if (note === null) return;
    setBusy(student.id); setError(""); setNotice("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").update({
      account_status: status, review_note: note.trim() || null, reviewed_by: adminId, reviewed_at: new Date().toISOString(),
    }).eq("id", student.id);
    if (updateError) setError(updateError.message);
    else {
      await supabase.from("admin_logs").insert({ actor_id: adminId, action: `student_${status}`, target_type: "profile", target_id: student.id, details: { note: note.trim() } });
      setNotice(`Student account ${status}.`);
      window.location.reload();
    }
    setBusy("");
  }

  async function cancelEvent(event: CampusEvent) {
    if (!window.confirm(`Cancel “${event.title}”?`)) return;
    setBusy(event.id); setError(""); setNotice("");
    const supabase = createClient();
    const { error: updateError } = await supabase.from("events").update({ status: "cancelled" }).eq("id", event.id);
    if (updateError) setError(updateError.message);
    else {
      await supabase.from("admin_logs").insert({ actor_id: adminId, action: "event_cancelled", target_type: "event", target_id: event.id });
      setNotice("Event cancelled."); window.location.reload();
    }
    setBusy("");
  }

  const pending = students.filter(s => s.account_status === "pending");
  return <div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat label="Pending verification" value={pending.length} />
      <Stat label="Registered students" value={students.length} />
      <Stat label="Events in system" value={events.length} />
    </div>
    <div className="mt-8 flex gap-2 border-b border-[#e3e9e4]">
      <button onClick={() => setTab("students")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === "students" ? "border-[#176b52] text-[#176b52]" : "border-transparent text-[#65716d]"}`}>Student verification ({pending.length})</button>
      <button onClick={() => setTab("events")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === "events" ? "border-[#176b52] text-[#176b52]" : "border-transparent text-[#65716d]"}`}>Event management ({events.length})</button>
    </div>
    {notice && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {tab === "students" ? <div className="mt-4 space-y-3">
      {students.map(student => <article key={student.id} className="rounded-2xl border border-[#e3e9e4] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="font-semibold">{student.full_name || "Name not provided"}</h3><p className="mt-1 text-sm text-[#65716d]">Student ID: {student.student_id || "Not provided"}</p><p className="mt-1 text-xs text-[#87928d]">Registered {new Date(student.created_at).toLocaleDateString("en-BD")}</p>{student.review_note && <p className="mt-2 text-xs text-[#65716d]">Previous note: {student.review_note}</p>}</div>
          <span className="rounded-full bg-[#f1f4f1] px-3 py-1 text-xs font-semibold capitalize text-[#52615b]">{student.account_status}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button disabled={busy === student.id || student.account_status === "approved"} onClick={() => reviewStudent(student,"approved")} className="rounded-full bg-[#176b52] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button>
          <button disabled={busy === student.id || student.account_status === "rejected"} onClick={() => reviewStudent(student,"rejected")} className="rounded-full border border-[#e6caca] px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Reject</button>
          <button disabled={busy === student.id || student.account_status === "suspended"} onClick={() => reviewStudent(student,"suspended")} className="rounded-full border border-[#dfe5e1] px-4 py-2 text-xs font-semibold text-[#52615b] disabled:opacity-50">Suspend</button>
        </div>
      </article>)}
      {!students.length && <Empty text="No student accounts yet." />}
    </div> : <div className="mt-4 space-y-3">
      {events.map(event => <article key={event.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e3e9e4] bg-white p-5">
        <div><h3 className="font-semibold">{event.title}</h3><p className="mt-1 text-sm text-[#65716d]">{event.organizer_name} · {event.venue}</p><p className="mt-1 text-xs text-[#87928d]">{new Date(event.starts_at).toLocaleString("en-BD",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Dhaka"})}</p></div>
        <div className="flex items-center gap-3"><span className="rounded-full bg-[#f1f4f1] px-3 py-1 text-xs font-semibold capitalize">{event.status}</span>{event.status === "published" && <button disabled={busy === event.id} onClick={() => cancelEvent(event)} className="rounded-full border border-[#e6caca] px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Cancel event</button>}</div>
      </article>)}
      {!events.length && <Empty text="No events have been submitted." />}
    </div>}
  </div>;
}

function Stat({label,value}:{label:string;value:number}) {
  return <div className="rounded-2xl border border-[#e3e9e4] bg-white p-5"><p className="text-xs font-medium text-[#87928d]">{label}</p><p className="mt-2 text-3xl font-semibold text-[#176b52]">{value}</p></div>;
}
function Empty({text}:{text:string}) { return <p className="rounded-2xl border border-dashed border-[#d9e2db] bg-white p-10 text-center text-sm text-[#65716d]">{text}</p>; }
