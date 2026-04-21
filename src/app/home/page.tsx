"use client";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Event {
  id: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate?: string | null;
  eventStartTime: string;
  eventEndTime: string;
  eventDesc?: string | null;
  eventHost: string;
  eventLoc: string;
  eventTags?: string | null;
  eventBanner?: string | null;
  currentParticipants: number;
  maxParticipants?: number | null;
  orgId?: string | null;
}

function fmtTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDateBadge(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
  };
}

function EventCard({ event }: { event: Event }) {
  const { month, day, weekday } = fmtDateBadge(event.eventStartDate);
  return (
    <Link href={`/events/${event.id}`} style={{ width: "350px", height: "288px" }} className="flex-none rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition flex flex-col">
      <div className="w-full shrink-0" style={{ height: "144px", backgroundColor: "#f063a0", overflow: "hidden" }}>
        {event.eventBanner && (
          <img src={event.eventBanner} alt="" style={{ width: "100%", height: "144px", objectFit: "cover", display: "block" }} />
        )}
      </div>
      <div className="p-5 flex flex-col gap-0.5 overflow-hidden">
        <p className="font-black text-[#3758BF] text-sm leading-tight line-clamp-2">{event.eventTitle}</p>
        <p className="text-xs text-slate-500 font-semibold mt-1">{weekday}, {month} {day}</p>
        <p className="text-xs text-slate-400">{fmtTime(event.eventStartTime)}</p>
        <p className="text-xs text-slate-400 truncate">At {event.eventLoc}</p>
        <p className="text-xs text-slate-400 truncate">By {event.eventHost}</p>
      </div>
    </Link>
  );
}

function EventRow({ title, events }: { title: string; events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="text-zpink font-extrabold text-2xl mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
        {events.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const username = session?.user?.username;
  const [featured, setFeatured] = useState<Event[]>([]);
  const [orgEvents, setOrgEvents] = useState<Event[]>([]);
  const [studentEvents, setStudentEvents] = useState<Event[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/all_events")
      .then((r) => (r.ok ? r.json() : []))
      .then((all: unknown) => {
        if (!Array.isArray(all)) return;
        const evts = all as Event[];
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = evts.filter((e) => e.eventStartDate >= today);
        upcoming.sort((a, b) => {
          const byParticipants = (b.currentParticipants ?? 0) - (a.currentParticipants ?? 0);
          if (byParticipants !== 0) return byParticipants;
          return a.eventStartDate.localeCompare(b.eventStartDate);
        });
        setFeatured(upcoming.slice(0, 10));

        const byRecent = [...evts].sort((a, b) => b.eventStartDate.localeCompare(a.eventStartDate));
        setOrgEvents(byRecent.filter((e) => e.orgId));
        setStudentEvents(byRecent.filter((e) => !e.orgId));
      });
  }, []);

  const event = featured[idx];

  return (
    <div className="p-8">
      <h1 className="text-zpink font-extrabold text-7xl">Hi {username},</h1>
      <h1 className="text-zpink font-extrabold text-7xl mb-8">Check these out!</h1>

      {featured.length > 0 && event && (
        <div>
          <div className="flex rounded-2xl overflow-hidden shadow-xl" style={{ height: "300px" }}>
            <div
              className="flex-1 bg-[#f063a097]"
              style={
                event.eventBanner
                  ? {
                      backgroundImage: `url(${event.eventBanner})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            />

            <div className="w-130 bg-[#3758BF] text-white p-5 flex flex-col relative shrink-0">
              {(() => {
                const { month, day, weekday } = fmtDateBadge(event.eventStartDate);
                return (
                  <div className="absolute top-4 right-4 text-right leading-tight">
                    <div className="text-xs font-bold opacity-80">{month}</div>
                    <div className="text-3xl font-black">{day}</div>
                    <div className="text-xs font-bold opacity-80">{weekday}</div>
                  </div>
                );
              })()}

              <h2 className="font-black uppercase pr-14 mb-1 text-3xl line-clamp-2">
                {event.eventTitle}
              </h2>
              <p className="text-sm font-semibold mb-0.5">
                {fmtTime(event.eventStartTime)} – {fmtTime(event.eventEndTime)}
              </p>
              <p className="text-xs opacity-70 uppercase mb-2">at {event.eventLoc}</p>

              {event.eventTags &&
                (() => {
                  try {
                    const tags: string[] = JSON.parse(event.eventTags);
                    return tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-white/20 text-xs rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  } catch {
                    return null;
                  }
                })()}

              <p className="text-xs opacity-80 line-clamp-2 grow">{event.eventDesc}</p>

              <div className="mt-3 flex items-end justify-between gap-2">
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-full bg-[#F8DE59] px-4 py-1.5 text-black text-xs font-extrabold hover:bg-[#f2d53a] transition shrink-0"
                >
                  Register Now
                </Link>
                <p className="text-xs font-bold opacity-60 uppercase text-right truncate">
                  By {event.eventHost}
                </p>
              </div>
            </div>
          </div>

          {featured.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setIdx((idx - 1 + featured.length) % featured.length)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-1 leading-none"
              >
                ‹
              </button>
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${
                    i === idx
                      ? "w-3 h-3 bg-[#3758BF]"
                      : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
              <button
                onClick={() => setIdx((idx + 1) % featured.length)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-1 leading-none"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}

      <EventRow title="Org Events" events={orgEvents} />
      <EventRow title="Student Events" events={studentEvents} />
    </div>
  );
}
