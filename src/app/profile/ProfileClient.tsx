"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AvatarUpload from "./AvatarUpload";

interface OrgMembership {
  id: string;
  orgId: string;
  orgName: string;
  orgSlug: string;
  orgLogo: string | null;
  orgAbbreviation: string;
  role: string;
  status: string;
}

interface Profile {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  username: string;
  displayUsername: string | null;
  image: string | null;
  bio: string | null;
  year: string | null;
  course: string | null;
}

interface Event {
  id: string;
  eventTitle: string;
  eventStartDate: string;
  eventStartTime: string;
  eventLoc: string;
  currentParticipants: number;
  maxParticipants: number | null;
}

interface Props {
  profile: Profile;
  hosting: Event[];
  attending: Event[];
  isOwn: boolean;
}

function EventCard({ event }: { event: Event }) {
  const dateLabel = (() => {
    const [y, m, d] = event.eventStartDate.split("-");
    return new Date(+y, +m - 1, +d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  })();
  const timeLabel = (() => {
    const [h, m] = event.eventStartTime.split(":");
    const d = new Date(); d.setHours(+h, +m);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  })();
  return (
    <Link href={`/events/${event.id}`}
      className="border rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col gap-1">
      <p className="font-bold text-[#3758BF] leading-tight">{event.eventTitle}</p>
      <p className="text-sm text-slate-500">{dateLabel} · {timeLabel}</p>
      <p className="text-sm text-slate-500">At {event.eventLoc}</p>
      {event.maxParticipants != null && (
        <p className="text-xs text-slate-400">{event.currentParticipants} / {event.maxParticipants} participants</p>
      )}
    </Link>
  );
}

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year", "7th Year", "8th Year"];
const inputClass = "w-full rounded-xl bg-[#F8EACD] px-4 py-2.5 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#3758BF]";
const labelClass = "text-xs font-semibold text-[#3758BF] block mb-1";

export default function ProfileClient({ profile, hosting, attending, isOwn }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [fields, setFields] = useState({
    displayUsername: profile.displayUsername ?? "",
    bio: profile.bio ?? "",
    year: profile.year ?? "",
    course: profile.course ?? "",
    image: profile.image ?? "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOwn) return;
    fetch("/api/user/memberships")
      .then((r) => r.ok ? r.json() : [])
      .then((data: unknown) => { if (Array.isArray(data)) setMemberships(data as OrgMembership[]); });
  }, [isOwn]);

  const displayName = profile.name;
  const avatar = editing
    ? <AvatarUpload current={fields.image || null} name={displayName} onChange={(url) => setFields({ ...fields, image: url })} />
    : profile.image
      ? <img src={profile.image} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
      : <div className="w-24 h-24 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-4xl select-none">{displayName.charAt(0).toUpperCase()}</div>;

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "Failed to save");
      return;
    }
    setSaved(true);
    setEditing(false);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Profile Card */}
      <div className="bg-white border rounded-2xl shadow-sm p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="shrink-0">{avatar}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-800">{displayName}</h1>
                <p className="text-slate-500 text-sm">
                  @{profile.displayUsername || profile.username}
                  {profile.displayUsername && profile.displayUsername !== profile.username && (
                    <span className="ml-1 text-slate-400">({profile.username})</span>
                  )}
                </p>
              </div>
              {isOwn && !editing && (
                <button onClick={() => setEditing(true)}
                  className="rounded-xl border border-[#3758BF] px-4 py-2 text-[#3758BF] font-semibold text-sm transition hover:bg-[#3758BF] hover:text-white">
                  Edit Profile
                </button>
              )}
            </div>

            {!editing && (
              <div className="mt-3 space-y-1">
                {(profile.bio) && <p className="text-slate-700 text-sm">{profile.bio}</p>}
                <div className="flex flex-wrap gap-3 mt-2">
                  {profile.year && <span className="text-xs bg-[#3758BF]/10 text-[#3758BF] px-3 py-1 rounded-full font-semibold">{profile.year}</span>}
                  {profile.course && <span className="text-xs bg-[#ffcf32]/30 text-amber-800 px-3 py-1 rounded-full font-semibold">{profile.course}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-6 border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea rows={3} className={`${inputClass} resize-none`} value={fields.bio}
                onChange={(e) => setFields({ ...fields, bio: e.target.value })}
                placeholder="Tell others about yourself..." />
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <select className={inputClass} value={fields.year}
                onChange={(e) => setFields({ ...fields, year: e.target.value })}>
                <option value="">— select —</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Course</label>
              <input type="text" className={inputClass} value={fields.course}
                onChange={(e) => setFields({ ...fields, course: e.target.value })}
                placeholder="e.g. Computer Science" />
            </div>
            {error && <p className="sm:col-span-2 rounded-xl bg-red-100 p-2 text-red-700 text-sm text-center">{error}</p>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setEditing(false); setError(""); }}
                className="flex-1 rounded-2xl border border-slate-300 py-2.5 font-bold text-slate-600 transition hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="flex-1 rounded-2xl bg-[#F8DE59] py-2.5 font-extrabold text-black ring-2 ring-white ring-inset transition hover:bg-[#f2d53a] disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {saved && <p className="mt-4 text-green-600 text-sm font-semibold text-center">Profile updated!</p>}
      </div>

      {/* Org Memberships (own profile only) */}
      {isOwn && memberships.length > 0 && (
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-black text-zpink mb-4">Organizations</h2>
          <div className="flex flex-wrap gap-3">
            {memberships.map((m) => (
              <Link key={m.id} href={`/orgs/${m.orgSlug}`}
                className="flex items-center gap-2 border rounded-full px-3 py-1.5 hover:shadow-sm transition">
                {m.orgLogo
                  ? <img src={m.orgLogo} alt="" className="w-6 h-6 rounded-full object-contain" />
                  : <div className="w-6 h-6 rounded-full bg-[#3758BF]/10 flex items-center justify-center text-[#3758BF] text-xs font-black">{m.orgAbbreviation.charAt(0)}</div>
                }
                <span className="text-sm font-semibold text-slate-700">{m.orgAbbreviation}</span>
                <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                  m.status === "approved" ? "bg-green-100 text-green-700" :
                  m.status === "rejected" ? "bg-red-100 text-red-600" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{m.status === "approved" ? m.role : m.status}</span>
              </Link>
            ))}
          </div>
          <Link href="/orgs" className="text-xs text-[#3758BF] font-semibold mt-3 inline-block hover:underline">
            Browse all organizations →
          </Link>
        </div>
      )}

      {/* Events */}
      <div className="grid sm:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-black text-zpink mb-4">Hosting ({hosting.length})</h2>
          {hosting.length === 0
            ? <p className="text-slate-400 text-sm">No hosted events.</p>
            : <div className="flex flex-col gap-3">{hosting.map((e) => <EventCard key={e.id} event={e} />)}</div>}
        </section>
        <section>
          <h2 className="text-lg font-black text-zpink mb-4">Attending ({attending.length})</h2>
          {attending.length === 0
            ? <p className="text-slate-400 text-sm">Not attending any events.</p>
            : <div className="flex flex-col gap-3">{attending.map((e) => <EventCard key={e.id} event={e} />)}</div>}
        </section>
      </div>
    </div>
  );
}
