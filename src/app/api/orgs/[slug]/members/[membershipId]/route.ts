import { db } from "@/lib/db";
import { organizations, orgMemberships } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; membershipId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, membershipId } = await params;
  const org = await db.select().from(organizations).where(eq(organizations.slug, slug)).get();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOrgAdmin = await db
    .select()
    .from(orgMemberships)
    .where(and(
      eq(orgMemberships.orgId, org.id),
      eq(orgMemberships.userId, session.user.id),
      eq(orgMemberships.role, "admin"),
      eq(orgMemberships.status, "approved"),
    ))
    .get();

  if (!isOrgAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json() as { status: "approved" | "rejected" };
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(orgMemberships).set({
    status,
    verifiedAt: new Date(),
    verifiedBy: session.user.id,
  }).where(and(eq(orgMemberships.id, membershipId), eq(orgMemberships.orgId, org.id)));

  return NextResponse.json({ ok: true });
}
