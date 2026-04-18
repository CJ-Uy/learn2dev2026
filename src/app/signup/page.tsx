"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const router = useRouter();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    async function signUp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const fullname = firstname + " " + lastname;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return
        }

        const { error: signUpError } = await authClient.signUp.email({
            name: fullname,
            firstname,
            lastname,
            username,
            displayUsername: username,
            email,
            password,
        });

        if (signUpError) {
            return signUpError.message;
        }

        // redirect. to be replaced once finalized
        router.push("/");
        return "";
    }

    return (
        <main className="bg-[url('/gonzaga.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="min-h-screen flex items-center justify-center bg-[#c7d1f0]/80">
                <section className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg">
                    <div className="w-full max-w-md bg-[#3758BF] px-6 py-10">
                        <div className="px-4 pt-4">
                            <h1 className="text-3xl font-semibold text-[#FFFFFF]"> Create your account</h1>
                            <p className="text-sml font-semibold text-[#FFFFFF]/70"> Join us in creating safe spaces</p>
                        </div>

                        <form onSubmit={signUp} className="mt-4 p-4 flex flex-col gap-3">

                            <div className="grid grid-cols-2 gap-4">

                                <div className="shadow-lg">
                                    <label htmlFor="lastname" className="font-semibold">Last Name</label>
                                    <input id="lastname" name="lastname" type="text" placeholder="Last Name" required 
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                                </div>

                                <div className="shadow-lg">
                                    <label htmlFor="firstname" className="font-semibold">First Name</label>
                                    <input id="firstname" name="firstname" type="text" placeholder="First Name" required 
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                                </div>

                            </div>

                            <div className="shadow-lg">
                                <label htmlFor="username" className="font-semibold">Username</label>
                                <input id="username" name="username" type="text" placeholder="Username" required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                            </div>

                            <div className="shadow-lg">
                                <label htmlFor="email" className="font-semibold">Email</label>
                                <input id="email" name="email" type="email" placeholder="Email" required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                            </div>

                            <div className="shadow-lg">
                                <label htmlFor="password" className="font-semibold">Password</label>
                                <input id="password" name="password" type="password" placeholder="Password" required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                            </div>

                            <div className="shadow-lg">
                                <label htmlFor="confirmPassword" className="font-semibold">Confirm Password</label>
                                <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                            </div>

                            {error && (
                                <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center">
                                    Error: {error}
                                </p>
                            )}

                            <div className="mt-3 text-center">
                                <button type="submit"
                                className="w-full rounded-2xl bg-[#F8DE59] py-3 text-black font-extrabold ring-5 ring-white ring-inset
                                transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg ">
                                    Sign Up
                                </button>  
                            </div>
                        </form>

                        <p className="px-4 font-semibold"> Already have an account?{" "}
                            <a href="/login" className="text-[#F8DE59] font-semibold">
                                Login
                            </a>
                        </p>
                    </div>
                    
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white px-10">
                        <div className="text-center">
                            <h1 className="text-5xl font-black text-[#3758BF]">Sit<span className="text-[#ffcf32]">2</span>Gether</h1>
                            <p className="mt-4 max-w-sm text-lg text-slate-700">
                                Find your perfect campus spot and connect with fellow students.
                            </p>
                        </div>


                        <div className="mt-10 space-y-3 w-full max-w-xs">
                            <div className="flex items-start gap-3">
                                <span className="mt-1 text-[#3758BF]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                    </svg>
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-[#3758BF]">Connect with students</h2>
                                    <p className="text-slate-700">Socialize together, achieve more.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="mt-1 text-[#3758BF]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-[#3758BF]">Discover Events</h2>
                                    <p className="text-slate-700">Never miss out on campus events.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="mt-1 text-[#3758BF]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                    </svg>
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-[#3758BF]">Schedule Meetups</h2>
                                    <p className="text-slate-700">Pick a spot, set a time, show up.</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </section>
            </div>
        </main>
    );
}
