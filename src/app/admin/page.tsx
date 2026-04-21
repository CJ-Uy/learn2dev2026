"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  role: string;
}

interface OrgRequest {
  id: string;
  name: string;
  username: string;
  image: string | null;
  orgName: string;
  orgSlug: string;
  requestedAt: number;
}

export default function AdminPage() {
  const { data: session } = authClient.useSession();
  const [tab, setTab] = useState<"users" | "org-requests" | "member-requests">("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [orgRequests, setOrgRequests] = useState<OrgRequest[]>([]);
  const [memberRequests, setMemberRequests] = useState<OrgRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    setMsg("");
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/org-requests").then((r) => r.json()),
      fetch("/api/admin/member-requests").then((r) => r.json()),
    ]).then(([u, o, m]: [unknown, unknown, unknown]) => {
      if (Array.isArray(u)) setUsers(u as UserRow[]);
      else setMsg(`Users error: ${JSON.stringify(u)}`);
      if (Array.isArray(o)) setOrgRequests(o as OrgRequest[]);
      else setMsg((prev) => prev + ` | Org admin error: ${JSON.stringify(o)}`);
      if (Array.isArray(m)) setMemberRequests(m as OrgRequest[]);
      else setMsg((prev) => prev + ` | Member error: ${JSON.stringify(m)}`);
      setLoading(false);
    }).catch((e) => { setMsg(String(e)); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function setRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
      setMsg("Role updated.");
    }
  }

  async function handleOrgRequest(id: string, status: "approved" | "rejected") {
    const res = await fetch(`/api/admin/org-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrgRequests((prev) => prev.filter((r) => r.id !== id));
      setMsg(`Request ${status}.`);
    }
  }

  async function handleMemberRequest(id: string, status: "approved" | "rejected") {
    const res = await fetch(`/api/admin/member-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMemberRequests((prev) => prev.filter((r) => r.id !== id));
      setMsg(`Request ${status}.`);
    }
  }

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  if (loading || session === undefined) return <div className="p-8 text-center">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-red-500">Access denied.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={fetchData} className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold hover:bg-slate-100 transition">
          Refresh
        </button>
      </div>
      {msg && <p className="text-red-600 text-sm font-semibold mb-4">{msg}</p>}

      <div className="flex gap-2 mb-8 flex-wrap">
        <button onClick={() => setTab("users")}
          className={`rounded-full px-5 py-2 font-bold text-sm transition ${tab === "users" ? "bg-[#3758BF] text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
          Users ({users.length})
        </button>
        <button onClick={() => setTab("org-requests")}
          className={`rounded-full px-5 py-2 font-bold text-sm transition ${tab === "org-requests" ? "bg-[#3758BF] text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
          Org Admin Requests {orgRequests.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-xs">{orgRequests.length}</span>}
        </button>
        <button onClick={() => setTab("member-requests")}
          className={`rounded-full px-5 py-2 font-bold text-sm transition ${tab === "member-requests" ? "bg-[#3758BF] text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
          Member Requests {memberRequests.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-xs">{memberRequests.length}</span>}
        </button>
      </div>

      {tab === "users" && (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.image
                        ? <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-xs">{u.name.charAt(0)}</div>
                      }
                      <div>
                        <Link href={`/profile/${u.username}`} className="font-semibold hover:underline">{u.name}</Link>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.role === "admin" ? "bg-[#3758BF] text-white" : "bg-slate-100 text-slate-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== session?.user?.id && (
                      <button
                        onClick={() => setRole(u.id, u.role === "admin" ? "user" : "admin")}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-100 transition"
                      >
                        {u.role === "admin" ? "Remove admin" : "Make admin"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === "org-requests" || tab === "member-requests") && (() => {
        const list = tab === "org-requests" ? orgRequests : memberRequests;
        const handle = tab === "org-requests" ? handleOrgRequest : handleMemberRequest;
        const emptyMsg = tab === "org-requests" ? "No pending org admin requests." : "No pending member requests.";
        return list.length === 0
          ? <p className="text-slate-400">{emptyMsg}</p>
          : (
            <ul className="space-y-4">
              {list.map((r) => (
                <li key={r.id} className="bg-white border rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {r.image
                      ? <img src={r.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                      : <div className="w-10 h-10 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black">{r.name.charAt(0)}</div>
                    }
                    <div>
                      <Link href={`/profile/${r.username}`} className="font-bold hover:underline">{r.name}</Link>
                      <p className="text-xs text-slate-400">@{r.username}</p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {tab === "org-requests" ? "Requesting admin of" : "Requesting membership in"}{" "}
                        <Link href={`/orgs/${r.orgSlug}`} className="text-[#3758BF] font-semibold hover:underline">{r.orgName}</Link>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handle(r.id, "approved")}
                      className="rounded-full bg-green-500 px-4 py-1.5 text-white text-sm font-bold hover:bg-green-600">Approve</button>
                    <button onClick={() => handle(r.id, "rejected")}
                      className="rounded-full bg-red-100 px-4 py-1.5 text-red-600 text-sm font-bold hover:bg-red-200">Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          );
      })()}
    </div>
  );
}
