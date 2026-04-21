"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  eventId: string;
  eventTitle: string;
  eventStartDate: string;
  eventStartTime: string;
  eventLoc: string;
  isFull: boolean;
  initialRegistered: boolean;
}

export default function RegisterButton({ eventId, eventTitle, eventStartDate, eventStartTime, eventLoc, isFull, initialRegistered }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delistOpen, setDelistOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(initialRegistered);

  async function confirm() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "Registration failed");
      return;
    }

    setRegistered(true);
    setOpen(false);
    router.refresh();
  }

  async function delist() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/events/${eventId}/register`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "Delist failed");
      return;
    }

    setRegistered(false);
    setDelistOpen(false);
    router.refresh();
  }

  const eventSummary = (
    <div className="bg-[#F8EACD] rounded-xl p-4 mb-6 space-y-1 text-sm text-amber-950">
      <p className="font-bold text-base">{eventTitle}</p>
      <p>{new Date(eventStartDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <p>{(() => { const [h,m] = eventStartTime.split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); })()}</p>
      <p>At {eventLoc}</p>
    </div>
  );

  if (registered) {
    return (
      <>
        <div className="flex items-center gap-4">
          <p className="text-green-600 font-semibold">You are registered for this event!</p>
          <button
            onClick={() => { setDelistOpen(true); setError(""); }}
            className="rounded-2xl border bg-[#f54949] px-6 py-2 text-white font-bold text-sm transition hover:bg-[#993636]"
          >
            Delist
          </button>
        </div>

        {delistOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
              <h2 className="text-xl font-black text-[#973030] mb-2">Cancel Registration</h2>
              <p className="text-slate-500 text-sm mb-5">You are about to remove yourself from:</p>
              {eventSummary}
              {error && (
                <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center text-sm mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setDelistOpen(false); setError(""); }}
                  className="flex-1 rounded-2xl border border-slate-300 py-3 font-bold text-slate-600 transition hover:bg-slate-100">
                  Cancel
                </button>
                <button onClick={delist} disabled={loading}
                  className="flex-1 rounded-2xl bg-[#f54949] py-3 font-extrabold text-white transition duration-200 hover:bg-[#a83434] disabled:opacity-60">
                  {loading ? "Delisting..." : "Confirm Delist"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        disabled={isFull}
        onClick={() => { setOpen(true); setError(""); }}
        className="rounded-2xl bg-[#F8DE59] px-8 py-3 font-extrabold text-black ring-2 ring-white ring-inset
        transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isFull ? "Event Full" : "Register"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <h2 className="text-xl font-black text-[#3758BF] mb-2">Confirm Registration</h2>
            <p className="text-slate-500 text-sm mb-5">You are about to register for:</p>
            {eventSummary}
            {error && (
              <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center text-sm mb-4">{error}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setOpen(false); setError(""); }}
                className="flex-1 rounded-2xl border border-slate-300 py-3 font-bold text-slate-600 transition hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={confirm} disabled={loading}
                className="flex-1 rounded-2xl bg-[#F8DE59] py-3 font-extrabold text-black ring-2 ring-white ring-inset
                transition duration-200 hover:bg-[#f2d53a] disabled:opacity-60">
                {loading ? "Registering..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
