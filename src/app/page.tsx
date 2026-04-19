import { SearchField, Label, Description, FieldError } from "@heroui/react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="bg-[#3758BF] h-[15vh] flex flex-row">
        {/* Logo and Search */}
        <div className="flex flex-row basis-1/2">
          <h1 className="basis-1/4 flex justify-center items-center text-white font-black text-3xl">
            LOGO
          </h1>
          <div className="flex justify-center items-center">
            <SearchField name="search">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="w-[280px]"
                  placeholder="Search..."
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>
        </div>

        {/* Pages */}
        <div className="flex flex-row basis-1/2">
          <Link href="/">Home</Link>
          <Link href="/find-events">Find Events</Link>
          <h1>Create Event</h1>
          <h1>Profile V</h1>
        </div>
      </div>
      <div>Content</div>
    </>
  );
}
