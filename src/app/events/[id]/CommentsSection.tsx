"use client";
import { useState, useEffect, useRef } from "react";

interface CommentUser {
  id: string;
  name: string;
  username: string;
}

interface Comment {
  id: string;
  userId: string;
  parentId: string | null;
  replyToUsername: string | null;
  content: string;
  createdAt: number;
  user: CommentUser | null;
}

interface Props {
  eventId: string;
  hostId: string;
  participantIds: string[];
  currentUserId: string | null;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function UserBadges({ userId, hostId, participantIds }: { userId: string; hostId: string; participantIds: string[] }) {
  return (
    <span className="flex gap-1 items-center">
      {userId === hostId && <Badge label="HOST" color="bg-[#3758BF] text-white" />}
      {participantIds.includes(userId) && <Badge label="PARTICIPANT" color="bg-green-100 text-green-700" />}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-sm select-none shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CommentsSection({ eventId, hostId, participantIds, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ parentId: string; username: string } | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/comments`)
      .then((r) => r.json().catch(() => []))
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    if (replyTo) replyInputRef.current?.focus();
  }, [replyTo]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/events/${eventId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        parentId: replyTo?.parentId ?? null,
        replyToUsername: replyTo?.username ?? null,
      }),
    });

    setSubmitting(false);
    if (!res.ok) return;

    const newComment: Comment = await res.json();
    setComments((prev) => [...prev, newComment]);
    setText("");
    setReplyTo(null);
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const replies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  function CommentCard({ c, isReply = false }: { c: Comment; isReply?: boolean }) {
    const name = c.user?.name ?? "Unknown";
    const username = c.user?.username ?? "";

    const handleReply = () => {
      setReplyTo({ parentId: c.parentId ?? c.id, username });
      setText("");
    };

    return (
      <div className={`flex gap-3 ${isReply ? "ml-10 mt-3" : "mt-4"}`}>
        <Avatar name={name} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-xs text-slate-400">@{username}</span>
            <UserBadges userId={c.userId} hostId={hostId} participantIds={participantIds} />
            <span className="text-xs text-slate-400 ml-auto">{formatTime(c.createdAt)}</span>
          </div>
          {c.replyToUsername && (
            <p className="text-xs text-[#3758BF] mb-1">↩ replying to @{c.replyToUsername}</p>
          )}
          <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{c.content}</p>
          {currentUserId && (
            <button onClick={handleReply} className="text-xs text-slate-400 hover:text-[#3758BF] mt-1 transition">
              Reply
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4 text-[#3758BF]">Comments</h2>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-slate-400 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div>
          {topLevel.map((c) => (
            <div key={c.id} className="border-b pb-4 last:border-b-0">
              <CommentCard c={c} />
              {replies(c.id).map((r) => (
                <CommentCard key={r.id} c={r} isReply />
              ))}
            </div>
          ))}
        </div>
      )}

      {currentUserId && (
        <form onSubmit={submit} className="mt-6">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-[#3758BF]">
              <span>↩ Replying to @{replyTo.username}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕ cancel
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <textarea
              ref={replyInputRef}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Write a comment..."}
              className="flex-1 rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#3758BF] resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="self-end rounded-2xl bg-[#3758BF] px-5 py-3 text-white font-bold text-sm transition hover:bg-[#2d47a0] disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
