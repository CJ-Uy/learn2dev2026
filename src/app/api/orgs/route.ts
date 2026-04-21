import { db } from "@/lib/db";
import { organizations } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const orgs = await db.select().from(organizations).all();
  return NextResponse.json(orgs);
}
