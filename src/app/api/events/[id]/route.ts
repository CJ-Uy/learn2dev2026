import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await db.select().from(events).where(eq(events.id, id)).get();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventTitle, eventDate, eventDesc, eventDur, eventLoc, maxParticipants } = await req.json();

  if (!eventTitle || !eventDate || !eventLoc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await db.update(events).set({
      eventTitle,
      eventDate: new Date(eventDate).getTime(),
      eventDesc: eventDesc ?? null,
      eventDur: eventDur ?? 30,
      eventLoc,
      maxParticipants: maxParticipants ?? null,
    }).where(eq(events.id, id));
  } catch (err) {
    console.error("Failed to update event:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }

  return NextResponse.json({ id });
}
