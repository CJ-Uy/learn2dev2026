"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BannerUpload from "../BannerUpload";
import DescriptionImageUpload from "../DescriptionImageUpload";

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventBanner, setEventBanner] = useState<string | null>(null);
  const [descImages, setDescImages] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const rawParticipants = (form.elements.namedItem("eventParticipants") as HTMLInputElement).value;
    const maxParticipants = rawParticipants === "" ? null : Number(rawParticipants);

    const data = {
      userId: session?.user?.id,
      eventTitle: (form.elements.namedItem("eventTitle") as HTMLInputElement).value,
      eventDate: (form.elements.namedItem("eventDate") as HTMLInputElement).value,
      eventDesc: (form.elements.namedItem("eventDesc") as HTMLTextAreaElement).value,
      eventDur: Number((form.elements.namedItem("eventDur") as HTMLInputElement).value),
      eventHost: (form.elements.namedItem("eventHost") as HTMLInputElement).value,
      eventLoc: (form.elements.namedItem("eventLoc") as HTMLInputElement).value,
      maxParticipants,
      eventBanner,
      eventImages: descImages.length > 0 ? JSON.stringify(descImages) : null,
    };

    if (new Date(data.eventDate) < new Date()) {
      setError("Event date cannot be in the past");
      return;
    }

    if (data.eventDur < 1) {
      setError("Invalid Duration (Value must be at least 1 minute)");
      return;
    }

    if (maxParticipants !== null && maxParticipants < 1) {
      setError("Max Participants must be at least 1");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "Something went wrong");
      return;
    }

    router.push("/events");
  }

  const defaultHost = session?.user?.name ?? "";

  return (
    <main className="min-h-screen bg-background flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-black text-[#3758BF] mb-1">Create Event</h1>
        <p className="text-slate-500 mb-8">Fill in the details for your event.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-semibold text-sm block mb-1 text-[#3758BF]">Event Banner <span className="text-slate-400 font-normal">(optional)</span></label>
            <BannerUpload current={null} onChange={setEventBanner} />
          </div>

          <div>
            <label htmlFor="eventTitle" className="font-semibold text-sm block mb-1 text-[#3758BF]">Event Title</label>
            <input id="eventTitle" name="eventTitle" type="text" required placeholder="e.g. Study Group – Finals Week"
              className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventDate" className="font-semibold text-sm block mb-1 text-[#3758BF]">Date & Time</label>
              <input id="eventDate" name="eventDate" type="datetime-local" required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]" />
            </div>
            <div>
              <label htmlFor="eventDur" className="font-semibold text-sm block mb-1 text-[#3758BF]">Duration (minutes)</label>
              <input id="eventDur" name="eventDur" type="number" min={1} defaultValue={30}
                className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]" />
            </div>
          </div>

          <div>
            <label htmlFor="eventLoc" className="font-semibold text-sm block mb-1 text-[#3758BF]">Location</label>
            <input id="eventLoc" name="eventLoc" type="text" required placeholder="e.g. MVP Roofdeck"
              className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]" />
          </div>

          <div>
            <label htmlFor="eventHost" className="font-semibold text-sm block mb-1 text-[#3758BF]">Host</label>
            <input id="eventHost" name="eventHost" type="text" required value={defaultHost} readOnly
              className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 opacity-60 cursor-not-allowed" />
          </div>

          <div>
            <label htmlFor="eventParticipants" className="font-semibold text-sm block mb-1 text-[#3758BF]">Max Participants <span className="text-slate-400 font-normal">(optional)</span></label>
            <input id="eventParticipants" name="eventParticipants" type="number" min={1} placeholder="e.g. 10"
              className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]" />
          </div>

          <div>
            <label htmlFor="eventDesc" className="font-semibold text-sm block mb-1 text-[#3758BF]">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea id="eventDesc" name="eventDesc" rows={3} placeholder="What's this event about?"
              className="w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF] resize-none" />
          </div>

          <div>
            <label className="font-semibold text-sm block mb-1 text-[#3758BF]">Description Images <span className="text-slate-400 font-normal">(optional, up to 5)</span></label>
            <DescriptionImageUpload images={descImages} onChange={setDescImages} />
          </div>

          {error && (
            <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 rounded-2xl border border-slate-300 py-3 font-bold text-slate-600 transition hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-2xl bg-[#F8DE59] py-3 font-extrabold text-black ring-2 ring-white ring-inset
              transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg disabled:opacity-60">
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
