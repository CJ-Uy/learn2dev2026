"use client";

import { authClient } from "@/lib/auth-client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

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
        <form action={action}>
            <input name="name" type="text" placeholder="Name" required/>
            <input name="email" type="email" placeholder="Email" required/>
            <input name="password" type="password" placeholder="Password" required/>
            {error && <p>{error}</p>}
            <button type="submit">Sign Up</button>  
        </form>
    );

}
