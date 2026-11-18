"use client";

import Link from "next/link";
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

function getCategory(event: CampusEvent) {
  return Array.isArray(event.categories) ? event.categories[0] : event.categories;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-BD", { ...options, timeZone: "Asia/Dhaka" }).format(new Date(value));
}

export function EventCalendar({ events }: { events: CampusEvent[] }) {
  const [selected, setSelected] = useState<CampusEvent | null>(null);
  const upcomingEvents = useMemo(
    () => [...events].filter((event) => new Date(event.ends_at).getTime() >= Date.now())
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()).slice(0, 4),
    [events],
  );
  const calendarEvents = useMemo(() => events.map((event) => {
    const category = getCategory(event);
    return {
      id: event.id,
      title: event.title,
      start: event.starts_at,
      end: event.ends_at,
      backgroundColor: category?.color || "#176b52",
      borderColor: category?.color || "#176b52",
      extendedProps: { event },
    };
  }), [events]);

  return (
    <div className="calendar-layout">
      <section className="calendar-panel" aria-label="Campus event calendar">
        <div className="calendar-panel-top">
          <div>
            <p className="calendar-eyebrow">Plan your campus life</p>
            <h3 className="calendar-panel-title">Find your next campus moment</h3>
          </div>
          <span className="calendar-count">{events.length} published</span>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin, luxonPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,listMonth" }}
          buttonText={{ today: "Today", month: "Month", list: "List" }}
          height="auto"
          events={calendarEvents}
          displayEventTime={true}
          views={{
            dayGridMonth: { displayEventTime: false },
            listMonth: { displayEventTime: true },
          }}
          eventClick={(info) => setSelected(info.event.extendedProps.event as CampusEvent)}
          dayMaxEvents={2}
          moreLinkClick="popover"
          nowIndicator
          firstDay={0}
          timeZone="Asia/Dhaka"
          fixedWeekCount={false}
        />
        <div className="calendar-legend">
          <span><i className="legend-dot legend-green" /> Academic & campus</span>
          <span><i className="legend-dot legend-blue" /> Technology</span>
          <span><i className="legend-dot legend-purple" /> Career & culture</span>
        </div>
      </section>

      <aside className="upcoming-panel" aria-label="Upcoming events">
        <div className="upcoming-heading">
          <div>
            <p className="calendar-eyebrow">Don&apos;t miss out</p>
            <h3 className="upcoming-title">Upcoming events</h3>
          </div>
          <span className="upcoming-total">{upcomingEvents.length}</span>
        </div>
        {upcomingEvents.length ? (
          <div className="upcoming-list">
            {upcomingEvents.map((event) => {
              const category = getCategory(event);
              return (
                <button key={event.id} type="button" className="upcoming-card" onClick={() => setSelected(event)}>
                  <span className="upcoming-date" style={{ borderColor: category?.color || "#176b52" }}>
                    <span>{formatDate(event.starts_at, { month: "short" })}</span>
                    <strong>{formatDate(event.starts_at, { day: "2-digit" })}</strong>
                  </span>
                  <span className="upcoming-copy">
                    <strong>{event.title}</strong>
                    <span>{category?.name || "Campus event"}</span>
                    <small>{formatDate(event.starts_at, { weekday: "short", hour: "numeric", minute: "2-digit" })} · {event.venue}</small>
                  </span>
                  <span className="upcoming-arrow" aria-hidden="true">↗</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="upcoming-empty">
            <span className="empty-calendar-icon">▦</span>
            <strong>No upcoming events yet</strong>
            <p>Check back soon for what&apos;s happening around DIU.</p>
          </div>
        )}
        <Link href="/#calendar" className="upcoming-browse">Browse the calendar <span aria-hidden="true">→</span></Link>
      </aside>

      {selected && (
        <div className="event-modal-backdrop" role="dialog" aria-modal="true" aria-label="Event details" onClick={() => setSelected(null)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-heading">
              <div>
                <p className="calendar-eyebrow">Campus event</p>
                <h3>{selected.title}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="event-modal-close" aria-label="Close">×</button>
            </div>
            <p className="event-modal-summary">{selected.summary}</p>
            <div className="event-modal-meta">
              <p><strong>When</strong><span>{formatDate(selected.starts_at, { dateStyle: "full", timeStyle: "short" })}</span></p>
              <p><strong>Venue</strong><span>{selected.venue}</span></p>
              <p><strong>Organizer</strong><span>{selected.organizer_name}</span></p>
            </div>
            <Link href={`/events/${selected.id}`} className="event-modal-link">View event details <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      )}
    </div>
  );
}
