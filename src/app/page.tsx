"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TurmaCard } from "@/components/TurmaCard";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      router.push("/Login");
    }

  }, []);


  const turmas = [
    {
      id: "1",
      titulo: "Turma Iniciante",
      descricao: "Aulas para iniciantes em violão",
      horario: "Quarta: 14:30 - 15:30",
      totalAlunos: 0
    },
    {
      id: "2",
      titulo: "Turma Intermediária",
      descricao: "Aulas para alunos de nível intermediário",
      horario: "Quarta: 15h30 - 16:30",
      totalAlunos: 0
    },
    {
      id: "3",
      titulo: "Turma dos Idosos",
      descricao: "Aulas para alunos idosos",
      horario: "Quarta: 16h30 - 17h30",
      totalAlunos: 0
    },
    {
      id: "4",
      titulo: "Oficina do Música",
      descricao: "Oficinas de música do IFPR",
      horario: "Quarta: 13:10 - 14:15",
      totalAlunos: 0
    }
  ]

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-center md:text-left font-bold">Minhas Turmas</h1>
        <Link href="/chatbot">
          <Button variant="outline" className="gap-2">
            <Bot className="h-4 w-4" />
            Assistente Virtual
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center md:place-items-stretch">
        {turmas.map((turma) => (
          <TurmaCard
            key={turma.id}
            id={turma.id}
            titulo={turma.titulo}
            descricao={turma.descricao}
            horario={turma.horario}
            totalAlunos={turma.totalAlunos}
          />
        ))}
      </div>
    </main>
  );
}
