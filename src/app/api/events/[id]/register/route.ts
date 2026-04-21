import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await db.select().from(events).where(eq(events.id, id)).get();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!event.orgId && event.userId === session.user.id) return NextResponse.json({ error: "You cannot register for your own event" }, { status: 400 });

  const existing = await db.select({ id: eventRegistrations.id }).from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, session.user.id)))
    .get();

  if (existing?.id) return NextResponse.json({ error: "Already registered" }, { status: 400 });

  if (event.maxParticipants !== null && event.currentParticipants >= event.maxParticipants) {
    return NextResponse.json({ error: "Event is full" }, { status: 400 });
  }

  try {
    await db.insert(eventRegistrations).values({
      id: crypto.randomUUID(),
      eventId: id,
      userId: session.user.id,
    });

    await db.update(events)
      .set({ currentParticipants: event.currentParticipants + 1 })
      .where(eq(events.id, id));
  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await db.select({ currentParticipants: events.currentParticipants }).from(events).where(eq(events.id, id)).get();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const existing = await db.select({ id: eventRegistrations.id }).from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, session.user.id)))
    .get();

  if (!existing?.id) return NextResponse.json({ error: "Not registered" }, { status: 400 });

  try {
    await db.delete(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, session.user.id)));

    await db.update(events)
      .set({ currentParticipants: Math.max(0, (event.currentParticipants ?? 1) - 1) })
      .where(eq(events.id, id));
  } catch (err) {
    console.error("Delist failed:", err);
    return NextResponse.json({ error: "Delist failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
