'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function AllEventsPage() {
  const { data: session } = authClient.useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/all_events')
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch events'); return r.json(); })
      .then((data) => setEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-8 text-center">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const today = new Date().toISOString().slice(0, 10);
  const userId = session?.user?.id;

  const overdueEvents = events.filter((e) => e.eventStartDate < today);
  const allUpcoming = events.filter((e) => e.eventStartDate >= today);

  function EventGrid({ events, overdue = false }) {
    return events.length === 0 ? (
      <p className="text-gray-500">No events found.</p>
    ) : (
      <div className="grid gap-6 md:grid-cols">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col ${overdue ? "opacity-60" : ""}`}
            style={event.eventBanner
              ? { backgroundImage: `linear-gradient(rgba(30, 50, 130, 0.7), rgba(30, 50, 130, 0.7)), url(${event.eventBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { backgroundColor: '#f063a097' }}
          >
            <h2 className="text-xl font-bold text-white mb-2">{event.eventTitle}</h2>
            <p className="text-white/80 mb-4 grow line-clamp-2">
              {event.eventDesc}
            </p>
            <div className="text-sm text-white/70 mb-4">
              <p>{formatDate(event.eventStartDate)}{event.eventEndDate && event.eventEndDate !== event.eventStartDate ? ` – ${formatDate(event.eventEndDate)}` : ''}</p>
              <p>{formatTime(event.eventStartTime)} – {formatTime(event.eventEndTime)}</p>
            </div>
            {event.eventTags && (() => {
              try {
                const tagList = JSON.parse(event.eventTags);
                return tagList.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tagList.map((tag) => (
                      <span key={tag} className="bg-white/30 text-white text-xs font-semibold rounded-full px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                ) : null;
              } catch { return null; }
            })()}
            <p className="text-white/90">At {event.eventLoc}</p>
            <p className="text-white/90">By {event.eventHost}</p>
            {event.maxParticipants != null && (
              <p className="text-sm text-white/70 mt-1">
                {event.currentParticipants ?? 0} / {event.maxParticipants}{" "}
                participants
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <Link
                href={`/events/${event.id}`}
                className="text-[#F8DE59] font-medium hover:text-white text-sm inline-flex items-center"
              >
                View Details
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              {event.userId === userId && (
                <Link
                  href={`/events/${event.id}/edit`}
                  className="text-[#3758BF] font-medium text-sm hover:underline"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link
          href="/events/create"
          className="rounded-2xl bg-[#3758BF] px-6 py-2 text-white font-bold transition duration-200 hover:bg-[#2d47a0] hover:shadow-md"
        >
          + Create Event
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">All Events</h2>
      <EventGrid events={allUpcoming} />

      <h2 className="text-xl font-bold mt-10 mb-4">Past Events</h2>
      <EventGrid events={overdueEvents} overdue />
    </div>
  );
}
