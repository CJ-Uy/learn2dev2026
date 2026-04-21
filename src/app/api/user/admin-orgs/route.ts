import { db } from "@/lib/db";
import { orgMemberships, organizations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgs = await db
    .select({ id: organizations.id, name: organizations.name, slug: organizations.slug, logo: organizations.logo, abbreviation: organizations.abbreviation })
    .from(orgMemberships)
    .innerJoin(organizations, eq(orgMemberships.orgId, organizations.id))
    .where(and(
      eq(orgMemberships.userId, session.user.id),
      eq(orgMemberships.role, "admin"),
      eq(orgMemberships.status, "approved"),
    ))
    .all();

  return NextResponse.json(orgs);
}
