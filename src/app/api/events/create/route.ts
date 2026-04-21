import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const config = { api: { bodyParser: { sizeLimit: "20mb" } } };

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    eventTitle, eventStartDate, eventEndDate, eventStartTime, eventEndTime,
    eventDesc, eventHost, eventLoc, maxParticipants, eventTags, eventBanner, eventImages,
  } = await req.json() as {
    eventTitle: string; eventStartDate: string; eventEndDate?: string;
    eventStartTime: string; eventEndTime: string; eventDesc?: string;
    eventHost: string; eventLoc: string; maxParticipants?: number;
    eventTags?: string | null; eventBanner?: string | null; eventImages?: string | null;
  };

  if (!eventTitle || !eventStartDate || !eventStartTime || !eventEndTime || !eventHost || !eventLoc) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  try {
    await db.insert(events).values({
      id,
      userId: session.user.id,
      eventTitle,
      eventStartDate,
      eventEndDate: eventEndDate ?? null,
      eventStartTime,
      eventEndTime,
      eventDesc: eventDesc ?? null,
      eventHost,
      eventLoc,
      maxParticipants: maxParticipants ?? null,
      eventTags: eventTags ?? null,
      eventBanner: eventBanner ?? null,
      eventImages: eventImages ?? null,
    });
  } catch (err) {
    console.error("Failed to insert event:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
