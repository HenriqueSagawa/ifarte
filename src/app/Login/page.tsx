'use client'

import { LoginForm } from "@/components/Form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
    const { data: session, status } = useSession();

    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push("/");
        }

    }, [session, router]);
    return (
        <div>
            <LoginForm />
        </div>
    )
}