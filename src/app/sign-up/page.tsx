"use client";

import { authClient } from "@/lib/auth-client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignUpPage() {
    const router = useRouter();

    async function signUp(_prev: string | undefined, formData: FormData) {
        const { error: signUpError } = await authClient.signUp.email({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        });

        if (signUpError) {
            return signUpError.message;
        }

        // redirect. to be replaced once finalized
        router.push("/");
        return "";
    }
  
    const [error, action] = useActionState(signUp, "");

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#c7d1f0]">
            <section className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg">
                <div className="w-full max-w-md bg-[#3758BF] px-6 py-10">
                    <h1 className="text-3xl font-semibold text-[#FFFFFF] text-left p-4"> Create your account</h1>

                    <form action={action} className="mt-8 p-4 flex flex-col gap-4">

                        <div className="space-y-2 shadow-lg">
                            <label htmlFor="name" className="font-semibold">Name</label>
                            <input id="name" name="name" type="text" placeholder="Name" required
                            className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                        </div>

                        <div className="space-y-2 shadow-lg">
                            <label htmlFor="email" className="font-semibold">Email</label>
                            <input id="email" name="email" type="email" placeholder="Email" required
                            className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                        </div>

                        <div className="space-y-2 shadow-lg">
                            <label htmlFor="password" className="font-semibold">Password</label>
                            <input id="password" name="password" type="password" placeholder="Password" required
                            className="w-full rounded-2xl bg-[#F8EACD] px-4 py-3 text-amber-950"/>
                        </div>

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
