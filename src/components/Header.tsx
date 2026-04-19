"use client";
import { SearchField } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

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
          href="/all"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 px-5"
        >
          View All Events
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
