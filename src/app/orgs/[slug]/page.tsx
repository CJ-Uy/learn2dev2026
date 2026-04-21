"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface Org {
  id: string;
  name: string;
  abbreviation: string;
  cluster: string | null;
  slug: string;
  logo: string | null;
  description: string | null;
  detailUrl: string | null;
}

interface Member {
  id: string;
  name: string;
  username: string;
  displayUsername: string | null;
  image: string | null;
  role: "member" | "admin";
  membershipId: string;
}

interface PendingRequest {
  id: string;
  userId: string;
  name: string;
  username: string;
  image: string | null;
  requestedAt: number;
}

export default function OrgProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = authClient.useSession();
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [myStatus, setMyStatus] = useState<{ member?: string; admin?: string }>({});

  const isOrgAdmin = members.some((m) => m.id === session?.user?.id && m.role === "admin");
  const isMember = members.some((m) => m.id === session?.user?.id);

  const fetchData = useCallback(async () => {
    const [orgRes, myRes] = await Promise.all([
      fetch(`/api/orgs/${slug}`),
      fetch("/api/user/memberships"),
    ]);
    if (!orgRes.ok) return;
    const data = await orgRes.json() as { org: Org; members: Member[] };
    setOrg(data.org);
    setMembers(data.members);
    if (myRes.ok) {
      type M = { orgSlug: string; role: string; status: string };
      const mine: M[] = await myRes.json();
      const forThis = mine.filter((m) => m.orgSlug === slug);
      setMyStatus({
        member: forThis.find((m) => m.role === "member")?.status,
        admin: forThis.find((m) => m.role === "admin")?.status,
      });
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!isOrgAdmin) return;
    fetch(`/api/orgs/${slug}/requests`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: unknown) => { if (Array.isArray(data)) setPendingRequests(data as PendingRequest[]); });
  }, [slug, isOrgAdmin]);

  async function handleJoin() {
    const res = await fetch(`/api/orgs/${slug}/join`, { method: "POST" });
    if (res.ok) { setMyStatus((s) => ({ ...s, member: "pending" })); setActionMsg("Membership request sent!"); }
    else setActionMsg("Already requested or a member.");
  }

  async function handleRequestAdmin() {
    const res = await fetch(`/api/orgs/${slug}/request-admin`, { method: "POST" });
    if (res.ok) { setMyStatus((s) => ({ ...s, admin: "pending" })); setActionMsg("Org admin request sent to platform admin."); }
    else setActionMsg("Already requested or an admin.");
  }

  async function handleMemberAction(membershipId: string, status: "approved" | "rejected") {
    const res = await fetch(`/api/orgs/${slug}/members/${membershipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setPendingRequests((prev) => prev.filter((r) => r.id !== membershipId));
      if (status === "approved") fetchData();
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!org) return <div className="p-8 text-center text-red-500">Organization not found.</div>;

  const admins = members.filter((m) => m.role === "admin");
  const regularMembers = members.filter((m) => m.role === "member");

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Org header */}
      <div className="bg-white border rounded-2xl shadow-sm p-8 mb-6 flex items-start gap-6">
        {org.logo
          ? <img src={org.logo} alt={org.name} className="w-24 h-24 object-contain rounded-full shrink-0" />
          : <div className="w-24 h-24 rounded-full bg-[#3758BF]/10 flex items-center justify-center text-[#3758BF] font-black text-4xl select-none shrink-0">
              {org.abbreviation.charAt(0).toUpperCase()}
            </div>
        }
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{org.cluster}</p>
          <h1 className="text-2xl font-black text-slate-800">{org.name}</h1>
          <p className="text-[#3758BF] font-semibold text-sm">{org.abbreviation}</p>
          {org.description && <p className="text-slate-600 text-sm mt-2">{org.description}</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            {session && !isMember && (
              myStatus.member === "pending"
                ? <span className="rounded-full bg-yellow-100 px-4 py-1.5 text-yellow-700 text-sm font-bold">Membership Pending</span>
                : myStatus.member === "approved" ? null
                : <button onClick={handleJoin}
                    className="rounded-full bg-[#3758BF] px-4 py-1.5 text-white text-sm font-bold hover:bg-[#2d47a0] transition">
                    Request Membership
                  </button>
            )}
            {session && !isOrgAdmin && (
              myStatus.admin === "pending"
                ? <span className="rounded-full bg-yellow-100 px-4 py-1.5 text-yellow-700 text-sm font-bold">Admin Request Pending</span>
                : myStatus.admin === "approved" ? null
                : <button onClick={handleRequestAdmin}
                    className="rounded-full border border-[#3758BF] px-4 py-1.5 text-[#3758BF] text-sm font-bold hover:bg-[#3758BF]/10 transition">
                    Request Org Admin
                  </button>
            )}
            {org.detailUrl && (
              <a href={org.detailUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-full border border-slate-300 px-4 py-1.5 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
                RecWeek Page ↗
              </a>
            )}
          </div>
          {actionMsg && <p className="mt-3 text-sm text-green-600 font-semibold">{actionMsg}</p>}
        </div>
      </div>

      {/* Pending membership requests (org admin only) */}
      {isOrgAdmin && pendingRequests.length > 0 && (
        <div className="bg-white border border-yellow-200 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-amber-700 mb-4">Pending Requests ({pendingRequests.length})</h2>
          <ul className="space-y-3">
            {pendingRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {r.image
                    ? <img src={r.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : <div className="w-9 h-9 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-sm">{r.name.charAt(0)}</div>
                  }
                  <div>
                    <Link href={`/profile/${r.username}`} className="font-semibold text-sm hover:underline">{r.name}</Link>
                    <p className="text-xs text-slate-400">@{r.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleMemberAction(r.id, "approved")}
                    className="rounded-full bg-green-500 px-3 py-1 text-white text-xs font-bold hover:bg-green-600">Approve</button>
                  <button onClick={() => handleMemberAction(r.id, "rejected")}
                    className="rounded-full bg-red-100 px-3 py-1 text-red-600 text-xs font-bold hover:bg-red-200">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Members */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-black text-[#3758BF] mb-4">Members ({members.length})</h2>

        {admins.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Admins</p>
            <ul className="space-y-2">
              {admins.map((m) => <MemberRow key={m.id} member={m} />)}
            </ul>
          </div>
        )}

        {regularMembers.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Members</p>
            <ul className="space-y-2">
              {regularMembers.map((m) => <MemberRow key={m.id} member={m} />)}
            </ul>
          </div>
        )}

        {members.length === 0 && <p className="text-slate-400 text-sm">No members yet.</p>}
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <li className="flex items-center gap-3">
      <Link href={`/profile/${member.username}`}>
        {member.image
          ? <img src={member.image} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
          : <div className="w-9 h-9 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-sm shrink-0">{member.name.charAt(0)}</div>
        }
      </Link>
      <div>
        <Link href={`/profile/${member.username}`} className="font-semibold text-sm hover:underline">{member.name}</Link>
        <p className="text-xs text-slate-400">@{member.displayUsername ?? member.username}</p>
      </div>
    </li>
  );
}
