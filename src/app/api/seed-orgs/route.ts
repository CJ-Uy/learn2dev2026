import { db } from "@/lib/db";
import { organizations } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import orgsData from "@/../../data/scraped/recweek-organizations.json";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomId() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = (orgsData as { cluster: string; abbreviation: string; organizationName: string; detailUrl: string }[]).map((org) => ({
    id: randomId(),
    name: org.organizationName,
    abbreviation: org.abbreviation,
    cluster: org.cluster ?? null,
    slug: slugify(org.abbreviation),
    logo: null,
    description: null,
    detailUrl: org.detailUrl ?? null,
    createdAt: Date.now(),
  }));

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      await db.insert(organizations).values(row).onConflictDoNothing();
      inserted++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ inserted, skipped, total: rows.length });
}
