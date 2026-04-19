"use client";
import { SearchField } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const displayName = session?.user?.name ?? "User";
  const username = (session?.user as { username?: string })?.username;

  return (
    <header className="bg-[#3758BF] h-[13vh] flex flex-row items-center px-4">
      <div className="flex flex-row basis-1/2">
        <Link href="/home" className="basis-1/4 flex justify-center items-center text-white font-black text-4xl">
          Sit<span className="text-[#ffcf32]">2</span>Gether
        </Link>
        <div className="flex justify-center items-center px-10">
          <SearchField name="search">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input className="w-70" placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
      </div>

      <div className="flex gap-4 items-center ml-auto">
        <Link
          href="/events"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-[#3758BF] gap-2 hover:bg-[#969696] hover:text-[#22356e] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 px-5"
        >
          View All Events
        </Link>

        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-end">
            <span className="text-white font-semibold text-sm leading-tight">{displayName}</span>
            {username && <span className="text-white/60 text-xs">@{username}</span>}
          </div>

          {/* Can be changed to a profile pic */}
          <div className="w-10 h-10 rounded-full bg-[#ffcf32] flex items-center justify-center text-[#3758BF] font-black text-lg select-none">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </Link>

        <button
          className="rounded-full border border-white/40 transition-colors flex items-center justify-center text-white hover:bg-white/10 font-medium text-sm h-10 px-5"
          onClick={() => authClient.signOut().then(() => router.push("/login"))}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
