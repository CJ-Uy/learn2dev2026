'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function AllEventsPage() {
  const { data: session } = authClient.useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attendingEvents, setAttendingEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [allRes, attendingRes] = await Promise.all([
          fetch('/api/all_events'),
          fetch('/api/events/attending'),
        ]);
        if (!allRes.ok) throw new Error('Failed to fetch events');
        setEvents(await allRes.json());
        if (attendingRes.ok) setAttendingEvents(await attendingRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateValue) => {
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return d.toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateValue) => {
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return 'Invalid Time';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid Time';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const now = Date.now();
  const userId = session?.user?.id;

  const yourEvents = events.filter((e) => e.userId === userId && e.eventDate >= now);
  const overdueEvents = events.filter((e) => e.eventDate < now);
  const allUpcoming = events.filter((e) => e.eventDate >= now);

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
              ? { backgroundImage: `linear-gradient(rgba(55, 88, 191, 0.45), rgba(55, 88, 191, 0.45)), url(${event.eventBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { backgroundColor: '#f063a097' }}
          >
            <h2 className="text-xl font-semibold mb-2">{event.eventTitle}</h2>
            <p className="text-gray-600 mb-4 grow line-clamp-2">
              {event.eventDesc}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>
                <p>{formatDate(event.eventDate)}</p>
                <p>{formatTime(event.eventDate)}</p>
              </span>
            </div>
            <p>At {event.eventLoc}</p>
            <p>By {event.eventHost}</p>
            {event.maxParticipants != null && (
              <p className="text-sm text-gray-500 mt-1">
                {event.currentParticipants ?? 0} / {event.maxParticipants}{" "}
                participants
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <Link
                href={`/events/${event.id}`}
                className="text-pink-300 font-medium hover:text-pink-800 text-sm inline-flex items-center"
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

      <h2 className="text-xl font-bold mb-4">Your Events</h2>
      <EventGrid events={yourEvents} />

      <h2 className="text-xl font-bold mt-10 mb-4">Attending</h2>
      <EventGrid events={attendingEvents} />

      <h2 className="text-xl font-bold mt-10 mb-4">All Events</h2>
      <EventGrid events={allUpcoming} />

      <h2 className="text-xl font-bold mt-10 mb-4">Past Events</h2>
      <EventGrid events={overdueEvents} overdue />
    </div>
  );
}
