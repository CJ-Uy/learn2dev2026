import { db } from "@/lib/db";
import { user as userSchema, orgMemberships, organizations } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await db.select({ role: userSchema.role }).from(userSchema)
    .where(eq(userSchema.id, session.user.id)).get();

  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const requests = await db
    .select({
      id: sql<string>`${orgMemberships.id}`.as("membership_id"),
      status: orgMemberships.status,
      requestedAt: orgMemberships.requestedAt,
      userId: sql<string>`${userSchema.id}`.as("user_id"),
      name: userSchema.name,
      username: userSchema.username,
      image: userSchema.image,
      orgId: sql<string>`${organizations.id}`.as("org_id"),
      orgName: sql<string>`${organizations.name}`.as("org_name"),
      orgSlug: sql<string>`${organizations.slug}`.as("org_slug"),
    })
    .from(orgMemberships)
    .innerJoin(userSchema, eq(orgMemberships.userId, userSchema.id))
    .innerJoin(organizations, eq(orgMemberships.orgId, organizations.id))
    .where(and(eq(orgMemberships.role, "admin"), eq(orgMemberships.status, "pending")))
    .all();

  return NextResponse.json(requests);
}
