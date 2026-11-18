"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import luxonPlugin from "@fullcalendar/luxon3";

type CampusEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  organizer_name: string;
  summary: string;
  status: string;
  categories?: { name: string; color: string } | { name: string; color: string }[] | null;
};

export function EventCalendar({ events }: { events: CampusEvent[] }) {
  const [selected, setSelected] = useState<CampusEvent | null>(null);
  const calendarEvents = useMemo(() => events.map((event) => {
    const category = Array.isArray(event.categories) ? event.categories[0] : event.categories;
    return ({
    id: event.id,
    title: event.title,
    start: event.starts_at,
    end: event.ends_at,
    backgroundColor: category?.color || "#176b52",
    borderColor: category?.color || "#176b52",
    extendedProps: { event },
  });
  }), [events]);


  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin, luxonPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,listMonth" }}
        height="auto"
        events={calendarEvents}
        displayEventTime={false}
        eventClick={(info) => setSelected(info.event.extendedProps.event as CampusEvent)}
        dayMaxEvents
        nowIndicator
        firstDay={0}
        timeZone="Asia/Dhaka"
      />
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Event details" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-[#176b52]">Campus event</p><h3 className="mt-2 text-2xl font-semibold">{selected.title}</h3></div>
              <button onClick={() => setSelected(null)} className="rounded-full bg-[#f1f4f1] px-3 py-1 text-sm" aria-label="Close">✕</button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#65716d]">{selected.summary}</p>
            <div className="mt-5 space-y-2 text-sm">
              <p><strong>When:</strong> {new Date(selected.starts_at).toLocaleString("en-BD", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Dhaka" })}</p>
              <p><strong>Venue:</strong> {selected.venue}</p>
              <p><strong>Organizer:</strong> {selected.organizer_name}</p>
            </div>
            <a href={`/events/${selected.id}`} className="mt-6 inline-flex rounded-full bg-[#176b52] px-5 py-2.5 text-sm font-semibold text-white">View event details ↗</a>
          </div>
        </div>
      )}
    </div>
  );
}
