"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Org {
  id: string;
  name: string;
  abbreviation: string;
  cluster: string | null;
  slug: string;
  logo: string | null;
}

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orgs")
      .then((r) => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setOrgs(data as Org[]); })
      .finally(() => setLoading(false));
  }, []);

  const clusters = Array.from(new Set(orgs.map((o) => o.cluster).filter(Boolean))) as string[];
  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.abbreviation.toLowerCase().includes(search.toLowerCase()),
  );

  const byCluster = clusters.map((c) => ({
    cluster: c,
    orgs: filtered.filter((o) => o.cluster === c),
  })).filter((g) => g.orgs.length > 0);

  const unclustered = filtered.filter((o) => !o.cluster);

  if (loading) return <div className="p-8 text-center">Loading organizations...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-zpink">Organizations</h1>
      <p className="text-slate-500 mb-6">{orgs.length} organizations</p>

      <input
        type="text"
        placeholder="Search organizations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-xl bg-[#F8EACD] px-4 py-2.5 text-amber-950 focus:outline-none focus:ring-2 focus:ring-[#3758BF] mb-8"
      />

      {byCluster.map(({ cluster, orgs: clusterOrgs }) => (
        <div key={cluster} className="mb-10">
          <h2 className="text-lg font-black text-[#3758BF] mb-4 uppercase tracking-wide">{cluster}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {clusterOrgs.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        </div>
      ))}

      {unclustered.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-black text-[#3758BF] mb-4 uppercase tracking-wide">Other</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unclustered.map((org) => <OrgCard key={org.id} org={org} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-slate-400">No organizations found.</p>
      )}
    </div>
  );
}

function OrgCard({ org }: { org: Org }) {
  return (
    <Link href={`/orgs/${org.slug}`}
      className="border rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow bg-white">
      {org.logo
        ? <img src={org.logo} alt={org.name} className="w-16 h-16 object-contain rounded-full" />
        : <div className="w-16 h-16 rounded-full bg-[#3758BF]/10 flex items-center justify-center text-[#3758BF] font-black text-xl select-none">
            {org.abbreviation.charAt(0).toUpperCase()}
          </div>
      }
      <p className="font-bold text-sm text-[#3758BF] leading-tight">{org.abbreviation}</p>
      <p className="text-xs text-slate-500 line-clamp-2 leading-snug">{org.name}</p>
    </Link>
  );
}
