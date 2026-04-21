import { db } from "@/lib/db";
import { events as eventSchema, eventRegistrations, user as userSchema, organizations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import RegisterButton from "./RegisterButton";
import CommentsSection from "./CommentsSection";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const event = await db
    .select()
    .from(eventSchema)
    .where(eq(eventSchema.id, id))
    .get();

  if (!event) notFound();

  const isHost = session?.user?.id === event.userId;

  const allRegistrations = await db
    .select({ userId: eventRegistrations.userId })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, id))
    .all();
  const participantIds = allRegistrations.map((r) => r.userId);

  const registration = session
    ? await db.select({ id: eventRegistrations.id })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, session.user.id)))
        .get()
    : null;
  const isRegistered = !!registration?.id;

  const hostUser = await db
    .select({ image: userSchema.image, username: userSchema.username })
    .from(userSchema)
    .where(eq(userSchema.id, event.userId))
    .get();

  const hostOrg = event.orgId
    ? await db.select({ id: organizations.id, name: organizations.name, slug: organizations.slug, logo: organizations.logo, abbreviation: organizations.abbreviation })
        .from(organizations).where(eq(organizations.id, event.orgId)).get()
    : null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/events" className="text-pink-300 hover:text-pink-800">
          ← Back to all events
        </Link>
        {isHost && (
          <Link
            href={`/events/${id}/edit`}
            className="rounded-xl bg-[#3758BF] px-5 py-2 text-white font-bold text-sm transition hover:bg-[#2d47a0]"
          >
            Edit Event
          </Link>
        )}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {event.eventBanner && (
          <img src={event.eventBanner} alt="Event banner" className="w-full max-h-64 object-cover" />
        )}
        <div className="p-8">
        <h1 className="text-4xl font-bold mb-4 text-[#3758BF]">{event.eventTitle}</h1>

        <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {(() => {
              const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              return event.eventEndDate && event.eventEndDate !== event.eventStartDate
                ? `${fmt(event.eventStartDate)} – ${fmt(event.eventEndDate)}`
                : fmt(event.eventStartDate);
            })()}
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {(() => {
              const fmt = (t: string) => { const [h,m] = t.split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); };
              return `${fmt(event.eventStartTime)} – ${fmt(event.eventEndTime)}`;
            })()}
          </div>
          {event.eventTags && (() => {
            let tagList: string[] = [];
            try { tagList = JSON.parse(event.eventTags); } catch { return null; }
            return tagList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <span key={tag} className="bg-[#F8EACD] text-amber-950 text-xs font-semibold rounded-full px-3 py-1">{tag}</span>
                ))}
              </div>
            ) : null;
          })()}
          <p>At {event.eventLoc}</p>
          <div className="flex items-center gap-2">
            {hostOrg ? (
              <>
                {hostOrg.logo
                  ? <img src={hostOrg.logo} alt={hostOrg.name} className="w-6 h-6 rounded-full object-contain" />
                  : <div className="w-6 h-6 rounded-full bg-[#3758BF]/10 flex items-center justify-center text-[#3758BF] font-black text-xs shrink-0">{hostOrg.abbreviation.charAt(0)}</div>
                }
                <Link href={`/orgs/${hostOrg.slug}`} className="hover:underline text-[#3758BF] font-semibold">
                  {hostOrg.name}
                </Link>
              </>
            ) : (
              <>
                {hostUser?.image
                  ? <img src={hostUser.image} alt="host" className="w-6 h-6 rounded-full object-cover" />
                  : <div className="w-6 h-6 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-xs select-none shrink-0">{event.eventHost.charAt(0).toUpperCase()}</div>
                }
                <Link href={`/profile/${hostUser?.username}`} className="hover:underline">
                  {event.eventHost}
                </Link>
              </>
            )}
          </div>
          {event.maxParticipants != null && (
            <p>{event.currentParticipants} / {event.maxParticipants} participants</p>
          )}
        </div>

        <div className="prose max-w-none mb-8">
          <h2 className="text-xl font-semibold mb-2 text-[#F063A0]">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.eventDesc || "No description provided."}
          </p>
          {event.eventImages && (() => {
            let imgs: string[] = [];
            try { imgs = JSON.parse(event.eventImages); } catch { return null; }
            return imgs.length > 0 ? (
              <div className="flex flex-wrap gap-3 mt-4 not-prose">
                {imgs.map((src, i) => (
                  <img key={i} src={src} alt={`Event image ${i + 1}`} className="rounded-lg max-h-60 object-cover" />
                ))}
              </div>
            ) : null;
          })()}
        </div>

        {!isHost && session && (
          <RegisterButton
            eventId={id}
            eventTitle={event.eventTitle}
            eventStartDate={event.eventStartDate}
            eventStartTime={event.eventStartTime}
            eventLoc={event.eventLoc}
            isFull={event.maxParticipants !== null && event.currentParticipants >= event.maxParticipants}
            initialRegistered={isRegistered}
          />
        )}

        {/* Participants */}
        <ParticipantsList eventId={id} />

        {/* Comments */}
        <CommentsSection
          eventId={id}
          hostId={event.userId}
          participantIds={participantIds}
          currentUserId={session?.user?.id ?? null}
        />
        </div>
      </div>
    </div>
  );
}

async function ParticipantsList({ eventId }: { eventId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/events/${eventId}/participants`, { cache: 'no-store' });
  const participants: { id: string; name: string; username: string; image: string | null }[] = res.ok ? await res.json() : [];

  if (participants.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4 text-[#3758BF]">Participants ({participants.length})</h2>
      <ul className="space-y-3">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <Link href={`/profile/${p.username}`}>
              {p.image
                ? <img src={p.image} alt="avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
                : <div className="w-9 h-9 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-sm select-none shrink-0">{p.name.charAt(0).toUpperCase()}</div>
              }
            </Link>
            <div>
              <Link href={`/profile/${p.username}`} className="font-semibold text-sm leading-tight text-[#253dac] hover:underline">{p.name}</Link>
              <Link href={`/profile/${p.username}`} className="block text-xs text-slate-500 hover:underline">@{p.username}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
