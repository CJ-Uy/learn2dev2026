import { db } from "@/lib/db";
import { eventComments, user } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const comments = await db.select().from(eventComments)
      .where(eq(eventComments.eventId, id))
      .all();

    if (!comments.length) return NextResponse.json([]);

    const userIds = [...new Set(comments.map((c) => c.userId))];
    const users = await db
      .select({ id: user.id, name: user.name, username: user.username, image: user.image })
      .from(user)
      .where(inArray(user.id, userIds))
      .all();

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    return NextResponse.json(comments.map((c) => ({ ...c, user: userMap[c.userId] ?? null })));
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content, parentId, replyToUsername } = await req.json() as { content: string; parentId?: string; replyToUsername?: string };

  if (!content?.trim()) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });

  const newId = crypto.randomUUID();

  await db.insert(eventComments).values({
    id: newId,
    eventId: id,
    userId: session.user.id,
    parentId: parentId ?? null,
    replyToUsername: replyToUsername ?? null,
    content: content.trim(),
  });

  const [comment, u] = await Promise.all([
    db.select().from(eventComments).where(eq(eventComments.id, newId)).get(),
    db.select({ id: user.id, name: user.name, username: user.username, image: user.image })
      .from(user).where(eq(user.id, session.user.id)).get(),
  ]);

  return NextResponse.json({ ...comment, user: u }, { status: 201 });
}
