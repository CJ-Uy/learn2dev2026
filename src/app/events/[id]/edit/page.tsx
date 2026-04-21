"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import BannerUpload from "../../BannerUpload";
import DescriptionImageUpload from "../../DescriptionImageUpload";

interface AdminOrg { id: string; name: string; abbreviation: string; logo: string | null; }

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: session } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [adminOrgs, setAdminOrgs] = useState<AdminOrg[]>([]);
  const [hostAs, setHostAs] = useState<"self" | string>("self");
  const [fields, setFields] = useState({
    eventTitle: "",
    eventStartDate: "",
    eventEndDate: "",
    eventStartTime: "",
    eventEndTime: "",
    eventDesc: "",
    eventLoc: "",
    maxParticipants: "" as string | number,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [eventBanner, setEventBanner] = useState<string | null>(null);
  const [descImages, setDescImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/user/admin-orgs")
      .then((r) => r.ok ? r.json() : [])
      .then((data: unknown) => { if (Array.isArray(data)) setAdminOrgs(data as AdminOrg[]); });
  }, []);

  useEffect(() => {
    fetch(`/api/all_events/${id}`)
      .then((r) => { if (!r.ok) throw new Error("Event not found"); return r.json(); })
      .then((raw) => {
        const event = raw as {
          eventTitle: string; eventStartDate: string; eventEndDate?: string;
          eventStartTime: string; eventEndTime: string; eventDesc?: string;
          eventLoc: string; maxParticipants?: number; orgId?: string | null;
          eventTags?: string | null; eventBanner?: string | null; eventImages?: string | null;
        };
        setFields({
          eventTitle: event.eventTitle ?? "",
          eventStartDate: event.eventStartDate ?? "",
          eventEndDate: event.eventEndDate ?? "",
          eventStartTime: event.eventStartTime ?? "",
          eventEndTime: event.eventEndTime ?? "",
          eventDesc: event.eventDesc ?? "",
          eventLoc: event.eventLoc ?? "",
          maxParticipants: event.maxParticipants ?? "",
        });
        setHostAs(event.orgId ?? "self");
        setTags(event.eventTags ? JSON.parse(event.eventTags) : []);
        setEventBanner(event.eventBanner ?? null);
        setDescImages(event.eventImages ? JSON.parse(event.eventImages) : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [id]);

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

    const rawParticipants = String(fields.maxParticipants);
    const maxParticipants = rawParticipants === "" ? null : Number(rawParticipants);

    if (fields.eventEndDate && fields.eventEndDate < fields.eventStartDate) {
      setError("End date cannot be before start date");
      return;
    }
    if (maxParticipants !== null && maxParticipants < 1) {
      setError("Max Participants must be at least 1");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        eventEndDate: fields.eventEndDate || null,
        eventHost: hostAs !== "self" ? (adminOrgs.find((o) => o.id === hostAs)?.name ?? fields.eventTitle) : session?.user?.name,
        orgId: hostAs !== "self" ? hostAs : null,
        maxParticipants,
        eventTags: tags.length > 0 ? JSON.stringify(tags) : null,
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
              <label className={labelClass}>Start Date</label>
              <input type="date" required className={inputClass}
                value={fields.eventStartDate}
                onChange={(e) => setFields({ ...fields, eventStartDate: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>End Date <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="date" className={inputClass}
                value={fields.eventEndDate}
                onChange={(e) => setFields({ ...fields, eventEndDate: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time</label>
              <input type="time" required className={inputClass}
                value={fields.eventStartTime}
                onChange={(e) => setFields({ ...fields, eventStartTime: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input type="time" required className={inputClass}
                value={fields.eventEndTime}
                onChange={(e) => setFields({ ...fields, eventEndTime: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input type="text" required className={inputClass}
              value={fields.eventLoc}
              onChange={(e) => setFields({ ...fields, eventLoc: e.target.value })} />
          </div>

          <div>
            <label className={labelClass}>Host As</label>
            {adminOrgs.length === 0 ? (
              <input type="text" readOnly value={session?.user?.name ?? ""}
                className={`${inputClass} opacity-60 cursor-not-allowed`} />
            ) : (
              <select value={hostAs} onChange={(e) => setHostAs(e.target.value)} className={inputClass}>
                <option value="self">{session?.user?.name ?? "Yourself"}</option>
                {adminOrgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.abbreviation})</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Max Participants <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" min={1} placeholder="e.g. 10" className={inputClass}
              value={fields.maxParticipants}
              onChange={(e) => setFields({ ...fields, maxParticipants: e.target.value })} />
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
