import { SearchField } from "@heroui/react";

export default function Home() {
  return (
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
                className="w-70"
                placeholder="Search..."
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <a
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          href="/all"
        >
          View All Events
        </a>
      </div>
    </div>
  );
}
