import { db } from "@/lib/db";
import { organizations, orgMemberships, user as userSchema } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const org = await db.select().from(organizations).where(eq(organizations.slug, slug)).get();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const members = await db
    .select({
      id: sql<string>`${userSchema.id}`.as("user_id"),
      name: userSchema.name,
      username: userSchema.username,
      displayUsername: userSchema.displayUsername,
      image: userSchema.image,
      role: orgMemberships.role,
      membershipId: sql<string>`${orgMemberships.id}`.as("membership_id"),
    })
    .from(orgMemberships)
    .innerJoin(userSchema, eq(orgMemberships.userId, userSchema.id))
    .where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.status, "approved")))
    .all();

  return NextResponse.json({ org, members });
}
