import { db } from "@/lib/db";
import { orgMemberships, organizations } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await db
    .select({
        id: sql<string>`${orgMemberships.id}`.as("membership_id"),
      orgId: sql<string>`${organizations.id}`.as("org_id"),
      orgName: sql<string>`${organizations.name}`.as("org_name"),
      orgSlug: sql<string>`${organizations.slug}`.as("org_slug"),
      orgLogo: sql<string>`${organizations.logo}`.as("org_logo"),
      orgAbbreviation: sql<string>`${organizations.abbreviation}`.as("org_abbreviation"),
      role: orgMemberships.role,
      status: orgMemberships.status,
    })
    .from(orgMemberships)
    .innerJoin(organizations, eq(orgMemberships.orgId, organizations.id))
    .where(eq(orgMemberships.userId, session.user.id))
    .all();

  return NextResponse.json(memberships);
}
