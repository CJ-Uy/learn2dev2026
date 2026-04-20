"use client";
import { authClient } from "@/lib/auth-client";

export default function HomePage() {
    const { data: session } = authClient.useSession();
    const username = session?.user?.username;
    return (
        <div className="p-8">
        <p className="text-black">hi {username}</p>
        </div>
    );
}
