import { db } from "@/lib/db";
import { eventRegistrations, user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
    })
    .from(eventRegistrations)
    .innerJoin(user, eq(eventRegistrations.userId, user.id))
    .where(eq(eventRegistrations.eventId, id))
    .all();

  return NextResponse.json(rows);
}
