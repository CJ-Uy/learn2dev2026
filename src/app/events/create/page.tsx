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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function addTag(raw: string) {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value;
    const rawParticipants = get("eventParticipants");
    const maxParticipants = rawParticipants === "" ? null : Number(rawParticipants);

    const eventStartDate = get("eventStartDate");
    const eventEndDate = get("eventEndDate") || null;
    const eventStartTime = get("eventStartTime");
    const eventEndTime = get("eventEndTime");

    if (eventEndDate && eventEndDate < eventStartDate) {
      setError("End date cannot be before start date");
      return;
    }
    if (maxParticipants !== null && maxParticipants < 1) {
      setError("Max Participants must be at least 1");
      return;
    }

    const data = {
      userId: session?.user?.id,
      eventTitle: get("eventTitle"),
      eventStartDate,
      eventEndDate,
      eventStartTime,
      eventEndTime,
      eventDesc: (form.elements.namedItem("eventDesc") as HTMLTextAreaElement).value,
      eventHost: get("eventHost"),
      eventLoc: get("eventLoc"),
      maxParticipants,
      eventTags: tags.length > 0 ? JSON.stringify(tags) : null,
      eventBanner,
      eventImages: descImages.length > 0 ? JSON.stringify(descImages) : null,
    };

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

  const inputClass = "w-full rounded-xl bg-[#F8EACD] px-4 py-3 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF]";
  const labelClass = "font-semibold text-sm block mb-1 text-[#3758BF]";
  const defaultHost = session?.user?.name ?? "";

  return (
    <main className="min-h-screen bg-background flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-black text-[#3758BF] mb-1">Create Event</h1>
        <p className="text-slate-500 mb-8">Fill in the details for your event.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Event Banner <span className="text-slate-400 font-normal">(optional)</span></label>
            <BannerUpload current={null} onChange={setEventBanner} />
          </div>

          <div>
            <label htmlFor="eventTitle" className={labelClass}>Event Title</label>
            <input id="eventTitle" name="eventTitle" type="text" required placeholder="e.g. Study Group – Finals Week"
              className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventStartDate" className={labelClass}>Start Date</label>
              <input id="eventStartDate" name="eventStartDate" type="date" required
                min={new Date().toISOString().slice(0, 10)}
                className={inputClass} />
            </div>
            <div>
              <label htmlFor="eventEndDate" className={labelClass}>End Date <span className="text-slate-400 font-normal">(optional)</span></label>
              <input id="eventEndDate" name="eventEndDate" type="date"
                min={new Date().toISOString().slice(0, 10)}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventStartTime" className={labelClass}>Start Time</label>
              <input id="eventStartTime" name="eventStartTime" type="time" required className={inputClass} />
            </div>
            <div>
              <label htmlFor="eventEndTime" className={labelClass}>End Time</label>
              <input id="eventEndTime" name="eventEndTime" type="time" required className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="eventLoc" className={labelClass}>Location</label>
            <input id="eventLoc" name="eventLoc" type="text" required placeholder="e.g. MVP Roofdeck"
              className={inputClass} />
          </div>

          <div>
            <label htmlFor="eventHost" className={labelClass}>Host</label>
            <input id="eventHost" name="eventHost" type="text" required value={defaultHost} readOnly
              className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>

          <div>
            <label htmlFor="eventParticipants" className={labelClass}>Max Participants <span className="text-slate-400 font-normal">(optional)</span></label>
            <input id="eventParticipants" name="eventParticipants" type="number" min={1} placeholder="e.g. 10"
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tags <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="rounded-xl bg-[#F8EACD] px-4 py-3 flex flex-wrap gap-2 min-h-13">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-[#3758BF] text-white text-xs font-semibold rounded-full px-3 py-1">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="ml-1 hover:text-red-200 leading-none">×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                placeholder={tags.length === 0 ? "Type a tag and press Enter" : ""}
                className="bg-transparent text-amber-950 text-sm focus:outline-none min-w-30 flex-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="eventDesc" className={labelClass}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea id="eventDesc" name="eventDesc" rows={3} placeholder="What's this event about?"
              className={`${inputClass} resize-none`} />
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
