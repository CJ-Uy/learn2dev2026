"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // async function login(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault();
    //     setError("");



    //     return "";




    return (
        <main className="bg-[url('/gonzaga.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="min-h-screen flex items-center justify-center bg-[#c7d1f0]/80">
                <section className="flex w-full max-w-2xl overflow-hidden rounded-2xl shadow-lg">
                    <div className="w-full bg-[#3758BF] py-10 px-4">
                        <h1 className="text-3xl font-semibold text-[#FFFFFF] text-center"> Welcome Back</h1>
                            <div className="px-10 pt-4 space-y-6">
                                <div className="space-y-2 shadow-lg">
                                    <label htmlFor="email" className="font-semibold">Email</label>
                                    <input id="email" name="email" type="email" placeholder="Email" required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                                </div>

                                <div className="space-y-2 shadow-lg">
                                    <label htmlFor="password" className="font-semibold">Password</label>
                                    <input id="password" name="password" type="password" placeholder="Password" required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                                </div>

                                <div className="space-y-2 text-center">
                                    <button type="submit"
                                    className="w-full rounded-2xl bg-[#F8DE59] py-3 text-black font-extrabold ring-5 ring-white ring-inset
                                    transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg ">
                                        Log In
                                    </button>  
                                </div>

                                <p className="font-semibold"> Dont have an account?{" "}
                                    <a href="/signup" className="text-[#F8DE59] font-semibold">
                                        Sign up
                                    </a>
                                </p>
                            </div>

                        </div>
                </section>
            </div>
        </main>
    );
}