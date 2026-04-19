import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const registrations = await db
    .select({ eventId: eventRegistrations.eventId })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.userId, session.user.id))
    .all();

  if (!registrations.length) return NextResponse.json([]);

  const attendedEvents = await db
    .select()
    .from(events)
    .where(inArray(events.id, registrations.map((r) => r.eventId)))
    .all();

  return NextResponse.json(attendedEvents);
}
