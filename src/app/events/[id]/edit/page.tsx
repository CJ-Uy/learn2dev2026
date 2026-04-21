"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import BannerUpload from "../../BannerUpload";
import DescriptionImageUpload from "../../DescriptionImageUpload";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    eventTitle: "",
    eventDate: "",
    eventDesc: "",
    eventDur: 30,
    eventLoc: "",
    maxParticipants: "" as string | number,
  });
  const [eventBanner, setEventBanner] = useState<string | null>(null);
  const [descImages, setDescImages] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/all_events/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Event not found"); return r.json(); })
      .then((raw) => {
        const event = raw as {
          eventDate: number; eventTitle: string; eventDesc?: string;
          eventDur?: number; eventLoc: string; maxParticipants?: number;
          eventBanner?: string | null; eventImages?: string | null;
        };
        const d = new Date(event.eventDate);
        const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setFields({
          eventTitle: event.eventTitle ?? "",
          eventDate: localISO,
          eventDesc: event.eventDesc ?? "",
          eventDur: event.eventDur ?? 30,
          eventLoc: event.eventLoc ?? "",
          maxParticipants: event.maxParticipants ?? "",
        });
        setEventBanner(event.eventBanner ?? null);
        setDescImages(event.eventImages ? JSON.parse(event.eventImages) : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const rawParticipants = String(fields.maxParticipants);
    const maxParticipants = rawParticipants === "" ? null : Number(rawParticipants);

    if (fields.eventDur < 1) {
      setError("Duration must be at least 1 minute");
      return;
    }
    if (maxParticipants !== null && maxParticipants < 1) {
      setError("Max Participants must be at least 1");
      return;
    }
    if (new Date(fields.eventDate) < new Date()) {
      setError("Event date cannot be in the past");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        maxParticipants,
        eventBanner,
        eventImages: descImages.length > 0 ? JSON.stringify(descImages) : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "Something went wrong");
      return;
    }

    router.push(`/events/${id}`);
  }

  if (fetching) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const inputClass = "w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]";
  const labelClass = "font-semibold text-sm block mb-1 text-[#3758BF]";

  return (
    <main className="min-h-screen bg-background flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-black text-[#3758BF] mb-1">Edit Event</h1>
        <p className="text-slate-500 mb-8">Update the details for your event.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Event Banner <span className="text-slate-400 font-normal">(optional)</span></label>
            <BannerUpload current={eventBanner} onChange={setEventBanner} />
          </div>

          <div>
            <label className={labelClass}>Event Title</label>
            <input type="text" required className={inputClass}
              value={fields.eventTitle}
              onChange={(e) => setFields({ ...fields, eventTitle: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date & Time</label>
              <input type="datetime-local" required className={inputClass}
                min={new Date().toISOString().slice(0, 16)}
                value={fields.eventDate}
                onChange={(e) => setFields({ ...fields, eventDate: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <input type="number" min={1} className={inputClass}
                value={fields.eventDur}
                onChange={(e) => setFields({ ...fields, eventDur: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input type="text" required className={inputClass}
              value={fields.eventLoc}
              onChange={(e) => setFields({ ...fields, eventLoc: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Host</label>
            <input type="text" readOnly value={session?.user?.name ?? ""}
              className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>

          <div>
            <label className={labelClass}>Max Participants <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" min={1} placeholder="e.g. 10" className={inputClass}
              value={fields.maxParticipants}
              onChange={(e) => setFields({ ...fields, maxParticipants: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={3} className={`${inputClass} resize-none`}
              value={fields.eventDesc}
              onChange={(e) => setFields({ ...fields, eventDesc: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Description Images <span className="text-slate-400 font-normal">(optional, up to 5)</span></label>
            <DescriptionImageUpload images={descImages} onChange={setDescImages} />
          </div>

          {error && (
            <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center text-sm">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 rounded-2xl border border-slate-300 py-3 font-bold text-slate-600 transition hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-2xl bg-[#F8DE59] py-3 font-extrabold text-black ring-2 ring-white ring-inset transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg disabled:opacity-60">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
