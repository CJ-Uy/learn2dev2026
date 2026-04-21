import { db } from "@/lib/db";
import { organizations, orgMemberships } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const org = await db.select().from(organizations).where(eq(organizations.slug, slug)).get();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const existing = await db
    .select()
    .from(orgMemberships)
    .where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.userId, session.user.id), eq(orgMemberships.role, "admin")))
    .get();

  if (existing) {
    return NextResponse.json({ error: "Already requested or an admin" }, { status: 409 });
  }

  await db.insert(orgMemberships).values({
    id: crypto.randomUUID(),
    orgId: org.id,
    userId: session.user.id,
    role: "admin",
    status: "pending",
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
