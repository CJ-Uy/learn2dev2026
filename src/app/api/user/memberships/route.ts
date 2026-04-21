import { db } from "@/lib/db";
import { orgMemberships, organizations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await db
    .select({
      id: orgMemberships.id,
      orgId: organizations.id,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      orgLogo: organizations.logo,
      orgAbbreviation: organizations.abbreviation,
      role: orgMemberships.role,
      status: orgMemberships.status,
    })
    .from(orgMemberships)
    .innerJoin(organizations, eq(orgMemberships.orgId, organizations.id))
    .where(eq(orgMemberships.userId, session.user.id))
    .all();

  return NextResponse.json(memberships);
}
