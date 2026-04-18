"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        <main className="min-h-screen flex items-center justify-center bg-[#c7d1f0]">
            <section className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg">
                <div className="w-full max-w-md bg-[#3758BF] px-6 py-10">
                    <h1 className="text-3xl font-semibold text-[#FFFFFF] text-left p-4"> Create your account</h1>

                    <form onSubmit={signUp} className="mt-8 p-4 flex flex-col gap-4">

                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2 shadow-lg">
                                <label htmlFor="lastname" className="font-semibold">Last Name</label>
                                <input id="lastname" name="lastname" type="text" placeholder="Last Name" required 
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                            </div>

                            <div className="space-y-2 shadow-lg">
                                <label htmlFor="firstname" className="font-semibold">First Name</label>
                                <input id="firstname" name="firstname" type="text" placeholder="First Name" required 
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                            </div>

                        </div>

                        <div className="space-y-2 shadow-lg">
                            <label htmlFor="username" className="font-semibold">Username</label>
                            <input id="username" name="username" type="text" placeholder="Username" required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                        </div>

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

                        <div className="space-y-2 shadow-lg">
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

                        <div className="space-y-2 text-center">
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
                
                <div className="relative hidden md:block flex-1">
                    <Image src="/gonzaga.jpg" alt="Gonzaga Cafeteria" fill sizes="(max-width: 768px) 0px, 420px" className="object-cover"/>
                </div>

            </section>
        </main>
    );
}
