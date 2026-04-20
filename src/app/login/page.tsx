"use client";

import { authClient } from "@/lib/auth-client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resetStatus = searchParams.get("reset");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function login(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const { error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            setError(error.message ?? "An error occurred");
            return;
        }

        // change to home
        router.push("/");
    }

    return (
        <main className="bg-[url('/gonzaga.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="min-h-screen flex items-center justify-center bg-[#c7d1f0]/80">
                <section className="flex w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl">
                    <div className="w-full bg-[#3758BF] py-10 px-4">
                        <h1 className="text-3xl font-black text-white text-center mb-4">
                            Sit<span className="text-[#ffcf32]">2</span>Gether
                        </h1>
                        <h1 className="text-3xl font-semibold text-[#FFFFFF] text-center"> Welcome Back!</h1>
                        <form onSubmit={login} className="px-10 pt-4 space-y-6">
                            <div className="px-10 pt-4 space-y-3">
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

                                <div className="flex justify-end">
                                        <a href="/forgotpassword" className="text-sm text-white/60 hover:text-white">
                                        Forgot password?
                                    </a>
                                </div>

                                {error && (
                                <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center">
                                    Error: {error}
                                </p>
                                )}

                                {resetStatus === "success" && (
                                <p className="rounded-xl bg-green-100 p-2 text-center text-green-700">
                                    Password successfully reset.
                                </p>
                                )}

                                <div className="space-y-2 text-center">
                                    <button type="submit"
                                    className="w-full rounded-2xl bg-[#F8DE59] py-3 text-black font-extrabold ring-5 ring-white ring-inset
                                    transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg ">
                                        Log In
                                    </button>  
                                </div>

                                <p className="font-semibold"> Don't have an account?{" "}
                                    <a href="/signup" className="text-[#F8DE59] font-semibold">
                                        Sign up
                                    </a>
                                </p>
                            </div>
                        </form>
                        </div>
                </section>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}