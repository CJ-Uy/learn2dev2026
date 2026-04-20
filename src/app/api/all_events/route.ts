import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const allEvents = await db.select().from(events).all();
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
