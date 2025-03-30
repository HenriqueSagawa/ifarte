import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

interface TurmaCardProps {
    titulo: string
    descricao: string
    horario: string
    totalAlunos: number
    id: string
}

export function TurmaCard({ titulo, descricao, horario, totalAlunos, id }: TurmaCardProps) {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{titulo}</CardTitle>
                <CardDescription>{descricao}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        Horário: {horario}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={16} />
                        <span>{totalAlunos} alunos</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/turma/${id}`} className="w-full">
                    <Button className="w-full">
                        Acessar Turma
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
} 