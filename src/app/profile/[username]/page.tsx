import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ProfileClient from "../ProfileClient";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/profile/${username}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const { profile, hosting, attending } = await res.json() as {
    profile: { id: string; name: string; firstname: string; lastname: string; username: string; displayUsername: string | null; image: string | null; bio: string | null; year: string | null; course: string | null };
    hosting: { id: string; eventTitle: string; eventStartDate: string; eventStartTime: string; eventLoc: string; currentParticipants: number; maxParticipants: number | null }[];
    attending: { id: string; eventTitle: string; eventStartDate: string; eventStartTime: string; eventLoc: string; currentParticipants: number; maxParticipants: number | null }[];
  };

  const isOwn = session?.user?.username === username;

  return (
    <ProfileClient
      profile={profile}
      hosting={hosting}
      attending={attending}
      isOwn={isOwn}
    />
  );
}
