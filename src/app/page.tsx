import Link from "next/link";

export default function LandingPage() {
  return (
    <>
    <main className="bg-[url('/2gonz.jpg')] bg-cover bg-center bg-no-repeat min-h-screen">
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#3758BF]/65">
        <div className="flex flex-col items-center gap-6 text-center px-6">
          <h1 className="text-6xl font-black text-white drop-shadow-lg">
            Sit<span className="text-[#ffcf32]">2</span>Gether
          </h1>

          <p className="max-w-sm text-lg text-white/90 font-medium">
            Find your perfect campus spot and connect with fellow students.
          </p>

          <div className="flex gap-4 mt-4">
            <Link
              href="/signup"
              className="rounded-2xl bg-[#F8DE59] px-8 py-3 text-black font-extrabold ring-2 ring-white ring-inset
              transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="rounded-2xl bg-white/10 border border-white px-8 py-3 text-white font-extrabold
              transition duration-200 hover:translate-y-0.5 hover:bg-white/20 hover:shadow-lg"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </main>

    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-black text-[#3758BF] mb-4">
          Your campus, connected.
        </h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-16">
          Sit2Gether helps Ateneans discover events, find study spots, and schedule meet ups with fellow Ateneans.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-[#3758BF]/10 p-4 rounded-2xl text-[#3758BF]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#3758BF]">Connect with Students</h3>
            <p className="text-slate-600">Socialize together, achieve more. Find people with the same goals and interests.</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-[#3758BF]/10 p-4 rounded-2xl text-[#3758BF]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#3758BF]">Discover Events</h3>
            <p className="text-slate-600">Never miss out on campus events. Browse what's happening around you right now.</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-[#3758BF]/10 p-4 rounded-2xl text-[#3758BF]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#3758BF]">Schedule Meetups</h3>
            <p className="text-slate-600">Pick a spot, set a time, show up. Making plans has never been this easy.</p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
