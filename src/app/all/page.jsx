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
                {event.eventTitle}
              </h2>
              <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{event.event_desc}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>
                  {formatDate(event.eventDate)} at {formatTime(event.eventDate)}
                </span>
                <span>{event.eventDur} mins</span>
              </div>
              <Link 
                href={`/all/${event.id}`}
                className="text-pink-300 font-medium hover:text-pink-800 text-sm inline-flex items-center"
              >
                View Details
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
