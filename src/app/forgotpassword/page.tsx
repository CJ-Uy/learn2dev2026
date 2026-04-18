"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ForgetPasswordPage(){
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const { error } = await authClient.requestPasswordReset({
            email,
            redirectTo: "http://localhost:3000/resetpassword",
        });

        if (error) {
            setError(error.message);
            return;
        }

        setSuccess("Password Reset link sent! Check your inbox.")
    }

    return (
        <main className="bg-[url('/gonzaga.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="min-h-screen flex items-center justify-center bg-[#c7d1f0]/80">
                <section className="flex w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl">
                    <div className="w-full bg-[#3758BF] py-10 px-4">
                        <h1 className="text-3xl font-black text-white text-center mb-4">
                            Sit<span className="text-[#ffcf32]">2</span>Gether
                        </h1>
                        <h1 className="text-3xl font-semibold text-[#FFFFFF] text-center"> Forgot Password?</h1>
                        <form onSubmit={resetPassword} className="px-10 pt-4">
                            <div className="px-10 pt-4 space-y-4">
                                <div className="space-y-2 shadow-lg">
                                    <label htmlFor="email" className="font-semibold">Enter Email</label>
                                    <input id="email" name="email" type="email" placeholder="Email" required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                                </div>

                                {error && (
                                <p className="rounded-xl bg-red-100 p-2 text-red-700 text-center">
                                    Error: {error}
                                </p>
                                )}

                                {success && (
                                    <p className="rounded-xl bg-green-100 p-2 text-green-700 text-center">
                                        {success}
                                    </p>
                                )}

                                <div className="space-y-2 text-center">
                                    <button type="submit"
                                    className="w-full rounded-2xl bg-[#F8DE59] py-3 text-black font-extrabold ring-5 ring-white ring-inset
                                    transition duration-200 hover:translate-y-0.5 hover:bg-[#f2d53a] hover:shadow-lg ">
                                        Send Reset Link
                                    </button>  
                                </div>

                                <a href="/login" className="text-white/60 hover:text-white text-sm">
                                    Back to Login
                                </a>
                            </div>
                        </form>
                        </div>
                </section>
            </div>
        </main>
    );
}