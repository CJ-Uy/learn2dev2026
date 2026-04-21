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
    .select({ id: orgMemberships.id })
    .from(orgMemberships)
    .where(and(eq(orgMemberships.orgId, org.id), eq(orgMemberships.userId, session.user.id), eq(orgMemberships.role, "member")))
    .all();

  if (existing.length > 0) {
    return NextResponse.json({ error: "Already requested or a member" }, { status: 409 });
  }

  try {
    await db.insert(orgMemberships).values({
      id: crypto.randomUUID(),
      orgId: org.id,
      userId: session.user.id,
      role: "member",
      status: "pending",
    });
    console.log("[join] insert succeeded");
  } catch (e) {
    console.error("[join] insert failed:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
