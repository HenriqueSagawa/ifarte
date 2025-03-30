"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "../ui/button"

export function Navbar() {
    const { data: session } = useSession()

    const handleSignOut = async () => {
        await signOut({
            redirect: true,
            callbackUrl: "/Login"
        })
    }

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-4">
                        {session ? (
                            <>
                                <span className="text-gray-800 text-2xl font-semibold">
                                    Olá, {session?.user?.name}

                                </span>
                            </>
                        ) : (
                            <span className="text-gray-800 text-2xl font-semibold">
                                Chamada Aula de Violão
                            </span>
                        )}


                    </div>
                    {session && (
                        <Button
                            onClick={handleSignOut}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sair
                        </Button>
                    )}

                </div>
            </div>
        </nav>
    )
}
