"use client";

import dynamic from "next/dynamic";

const EventCalendar = dynamic(
  () => import("@/components/event-calendar").then((module) => module.EventCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[620px] animate-pulse rounded-2xl border border-[#e3e9e4] bg-[#fbfcfa] p-5">
        <div className="mb-6 flex justify-between"><div className="h-8 w-36 rounded bg-[#e7ece7]" /><div className="h-8 w-48 rounded bg-[#e7ece7]" /></div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-[#e3e9e4] bg-[#e3e9e4]">{Array.from({ length: 42 }, (_, i) => <div key={i} className="min-h-20 bg-white p-2"><div className="h-3 w-5 rounded bg-[#edf1ed]" /></div>)}</div>
      </div>
    ),
  }
);

export function EventCalendarLoader({ events }: { events: React.ComponentProps<typeof EventCalendar>["events"] }) {
  return <EventCalendar events={events} />;
}
