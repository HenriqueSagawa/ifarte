"use client"

import { Button } from "@/components/ui/button"
import { BarChart2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function PainelButton() {
    const pathname = usePathname()

    // Não mostrar o botão se já estiver na página do painel
    if (pathname === "/painel") {
        return null
    }

    return (
        <Link href="/painel">
            <Button variant="outline" className="fixed bottom-4 right-4 shadow-lg">
                <BarChart2 className="h-4 w-4 mr-2" />
                Painel
            </Button>
        </Link>
    )
} 