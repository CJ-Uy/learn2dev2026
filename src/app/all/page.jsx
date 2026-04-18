'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AllEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/all_events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">All Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/all/${event.id}`} className="hover:text-pink-200 transition-colors underline">
                  {event.eventTitle}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{event.event_desc}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>
                  {new Date(event.event_date).toLocaleDateString()} at{' '}
                  {/* {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} */}
                </span>
                {/* <span>{event.event_dur} mins</span> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
