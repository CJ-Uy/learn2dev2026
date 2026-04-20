"use client";

import { authClient } from "@/lib/auth-client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm(){
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const { error } = await authClient.resetPassword({
            token,
            newPassword,
        });

        if (error) {
            setError(error.message ?? "An error occurred");
            return;
        }

        router.push("/login?reset=success");
    }

    return (
        <main className="bg-[url('/gonzaga.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="min-h-screen flex items-center justify-center bg-[#c7d1f0]/80">
                <section className="flex w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl">
                    <div className="w-full bg-[#3758BF] py-10 px-4">
                        <h1 className="text-3xl font-black text-white text-center mb-4">
                            Sit<span className="text-[#ffcf32]">2</span>Gether
                        </h1>
                        <h1 className="text-3xl font-semibold text-[#FFFFFF] text-center"> Reset Password</h1>
                        <form onSubmit={handleResetPassword} className="px-10 pt-4">
                            <div className="px-10 pt-4 space-y-4">

                                <div className="space-y-2 shadow-lg">
                                    <label htmlFor="newPassword" className="font-semibold">Enter New Password</label>
                                    <input id="newPassword" name="newPassword" type="password" placeholder="New Password" required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                                </div>

                                <div className="space-y-2 shadow-lg">
                                    <label htmlFor="confirmPassword" className="font-semibold">Confirm New Password</label>
                                    <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm New Password" required
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
                                        Reset Password
                                    </button>  
                                </div>
                            </div>
                        </form>
                        </div>
                </section>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}