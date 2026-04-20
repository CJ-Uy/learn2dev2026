import { SearchField, Label, Description, FieldError } from "@heroui/react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="bg-[#3758BF] h-[15vh] flex flex-row">
        {/* Logo and Search */}
        <div className="flex flex-row basis-1/2">
          <h1 className="basis-1/4 flex justify-center items-center text-white font-black text-3xl font-sans ">
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
        <div className="flex flex-row basis-1/2 grid justify-center items-center grid-cols-4 gap-4 text-yellow-200 font-[1000] font-sans text-xl ">
          <Link href="/">Home</Link>
          <Link href="/find-events">Find Events</Link>
          <h1>Create Event</h1>
          <Link href="/profile">Profile</Link>
        </div>
      </div>
      {/* Greeter */}
          <div className="hero bg-base-200 min-h-screen">
  <div className="hero-content grid-cols-2 lg:flex-row">
    <img
      src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
      className="max-w-sm rounded-lg shadow-2xl"
    />
    <div>
      <h1 className="text-5xl font-bold">Box Office News!</h1>
      <p className="py-6">
        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
        quasi. In deleniti eaque aut repudiandae et a id nisi.
      </p>
      <button className="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
    </>
  )
}
