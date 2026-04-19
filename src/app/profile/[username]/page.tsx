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

  const { profile, hosting, attending } = await res.json();

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
