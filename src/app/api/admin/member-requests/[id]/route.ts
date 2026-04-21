import { db } from "@/lib/db";
import { user as userSchema, orgMemberships } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await db.select({ role: userSchema.role }).from(userSchema)
    .where(eq(userSchema.id, session.user.id)).all();
  if (!me.length || me[0].role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json() as { status: "approved" | "rejected" };
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(orgMemberships).set({
    status,
    verifiedAt: new Date(),
    verifiedBy: session.user.id,
  }).where(eq(orgMemberships.id, id));

  return NextResponse.json({ ok: true });
}
