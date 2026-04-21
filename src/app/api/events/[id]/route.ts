import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const config = { api: { bodyParser: { sizeLimit: "20mb" } } };

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

  const {
    eventTitle, eventStartDate, eventEndDate, eventStartTime, eventEndTime,
    eventDesc, eventHost, eventLoc, maxParticipants, orgId, eventTags, eventBanner, eventImages,
  } = await req.json() as {
    eventTitle: string; eventStartDate: string; eventEndDate?: string;
    eventStartTime: string; eventEndTime: string; eventDesc?: string;
    eventHost?: string; eventLoc: string; maxParticipants?: number;
    orgId?: string | null; eventTags?: string | null; eventBanner?: string | null; eventImages?: string | null;
  };

  if (!eventTitle || !eventStartDate || !eventStartTime || !eventEndTime || !eventLoc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await db.update(events).set({
      eventTitle,
      eventStartDate,
      eventEndDate: eventEndDate ?? null,
      eventStartTime,
      eventEndTime,
      eventDesc: eventDesc ?? null,
      eventHost: eventHost ?? event.eventHost,
      eventLoc,
      orgId: orgId ?? null,
      maxParticipants: maxParticipants ?? null,
      eventTags: eventTags ?? null,
      eventBanner: eventBanner ?? null,
      eventImages: eventImages ?? null,
    }).where(eq(events.id, id));
  } catch (err) {
    console.error("Failed to update event:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }

  return NextResponse.json({ id });
}
