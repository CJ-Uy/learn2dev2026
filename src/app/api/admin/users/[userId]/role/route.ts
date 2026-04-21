import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await db.select({ role: userSchema.role }).from(userSchema)
    .where(eq(userSchema.id, session.user.id)).get();

  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const { role } = await req.json() as { role: string };

  if (role !== "user" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await db.update(userSchema).set({ role }).where(eq(userSchema.id, userId));
  return NextResponse.json({ ok: true });
}
