import { db } from "@/lib/db";
import { events as eventSchema } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  const event = await db
    .select()
    .from(eventSchema)
    .where(eq(eventSchema.id, id))
    .get();

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link 
        href="/events" 
        className="text-pink-300 hover:text-pink-800 mb-6 inline-block"
      >
        ← Back to all events
      </Link>
      
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <h1 className="text-4xl font-bold mb-4 text-[#3758BF]">{event.eventTitle}</h1>
        
        <div className="flex flex-wrap gap-4 mb-8 text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(event.eventDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="mx-2">•</span>
            {event.eventDur} minutes
          </div>
          <p>At { event.eventLoc } </p>
          <p>By { event.eventHost }</p>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2 text-[#F063A0]">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.eventDesc || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
}
