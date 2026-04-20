import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayUsername, bio, year, course, image } = await req.json() as { displayUsername?: string; bio?: string; year?: string; course?: string; image?: string };

  try {
    await db.update(user).set({
      ...(displayUsername !== undefined && { displayUsername }),
      ...(bio !== undefined && { bio }),
      ...(year !== undefined && { year }),
      ...(course !== undefined && { course }),
      ...(image !== undefined && { image }),
    }).where(eq(user.id, session.user.id));
  } catch (err) {
    console.error("Profile update failed:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
