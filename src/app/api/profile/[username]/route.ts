import { db } from "@/lib/db";
import { user, events, eventRegistrations } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const profile = await db
    .select({ id: user.id, name: user.name, firstname: user.firstname, lastname: user.lastname,
      username: user.username, displayUsername: user.displayUsername,
      image: user.image, bio: user.bio, year: user.year, course: user.course })
    .from(user).where(eq(user.username, username)).get();

  if (!profile?.id) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const hosting = await db.select().from(events).where(eq(events.userId, profile.id)).all();

  const registrations = await db
    .select({ eventId: eventRegistrations.eventId })
    .from(eventRegistrations).where(eq(eventRegistrations.userId, profile.id)).all();

  const attending = registrations.length
    ? await db.select().from(events).where(inArray(events.id, registrations.map((r) => r.eventId))).all()
    : [];

  return NextResponse.json({ profile, hosting, attending });
}
