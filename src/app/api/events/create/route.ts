import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventTitle, eventDate, eventDesc, eventDur, eventHost, eventLoc, maxParticipants } =
    await req.json() as { eventTitle: string; eventDate: string; eventDesc?: string; eventDur?: number; eventHost: string; eventLoc: string; maxParticipants?: number };

  if (!eventTitle || !eventDate || !eventHost || !eventLoc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  try {
    await db.insert(events).values({
      id,
      userId: session.user.id,
      eventTitle,
      eventDate: new Date(eventDate).getTime(),
      eventDesc: eventDesc ?? null,
      eventDur: eventDur ?? 30,
      eventHost,
      eventLoc,
      maxParticipants: maxParticipants ?? null,
    });
  } catch (err) {
    console.error("Failed to insert event:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
