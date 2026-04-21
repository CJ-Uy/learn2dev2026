import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await db.select({ role: userSchema.role }).from(userSchema)
    .where(eq(userSchema.id, session.user.id)).get();

  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await db
    .select({ id: userSchema.id, name: userSchema.name, username: userSchema.username, email: userSchema.email, image: userSchema.image, role: userSchema.role, createdAt: userSchema.createdAt })
    .from(userSchema)
    .all();

  return NextResponse.json(users);
}
