"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Users, Clock, Plus, PlusCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AlunoSkeleton } from "@/components/skeletons/AlunoSkeleton"
import { AulaSkeleton } from "@/components/skeletons/AulaSkeleton"

interface Aluno {
    id: string
    nome: string
    email: string
    telefone: string
    descricao?: string
}

interface Presenca {
    alunoId: string
    presente: boolean
}

interface Aula {
    id: string
    data: Date
    professor: string
    conteudo: string
    presencas: Presenca[]
    turmaId: string
}

interface NovoAluno {
    nome: string
    email: string
    telefone: string
    descricao: string
    turmaId: string
}

export default function TurmaPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [aulas, setAulas] = useState<Aula[]>([])
    const [novaAula, setNovaAula] = useState<Partial<Aula>>({
        professor: "",
        conteudo: "",
        data: new Date(),
    })
    const [presencas, setPresencas] = useState<Presenca[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [novoAluno, setNovoAluno] = useState<NovoAluno>({
        nome: "",
        email: "",
        telefone: "",
        descricao: "",
        turmaId: ""
    })
    const [dialogAlunoOpen, setDialogAlunoOpen] = useState(false)

    const [alunos, setAlunos] = useState<Aluno[]>([
    ])

    const [carregandoAlunos, setCarregandoAlunos] = useState(true)
    const [carregandoAulas, setCarregandoAulas] = useState(true)

    const turmas = [
        {
            id: "1",
            titulo: "Turma Iniciante",
            descricao: "Aulas para iniciantes em violão",
            horario: "Quinta - 13h30",
            totalAlunos: 0
        },
        {
            id: "2",
            titulo: "Turma Intermediária",
            descricao: "Aulas para alunos de nível intermediário",
            horario: "Quinta - 14h30",
            totalAlunos: 0
        },
        {
            id: "3",
            titulo: "Turma dos Idosos",
            descricao: "Aulas para alunos idosos",
            horario: "Quinta - 15h30",
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

    useEffect(() => {
        if (!session) {
            router.push("/Login")
            return
        }

        if (params.id) {
            carregarAulas()
            carregarAlunos()
        }
    }, [session, params.id])

    const turma = turmas.find(t => t.id === params.id)

    if (!turma) {
        return <div className="container mx-auto py-10">Turma não encontrada</div>
    }

    const carregarAulas = async () => {
        try {
            setCarregandoAulas(true)
            const response = await fetch(`/api/aulas/${params.id}`)
            const data = await response.json()
            
            if (data.aulas) {
                setAulas(data.aulas.map((aula: any) => ({
                    ...aula,
                    data: new Date(aula.data)
                })))
            }
        } catch (error) {
            console.error("Erro ao carregar aulas:", error)
        } finally {
            setCarregandoAulas(false)
        }
    }

    const carregarAlunos = async () => {
        try {
            setCarregandoAlunos(true)
            const response = await fetch(`/api/alunos/${params.id}`)
            const data = await response.json()
            
            if (data.alunos) {
                setAlunos(data.alunos)
            }
        } catch (error) {
            console.error("Erro ao carregar alunos:", error)
        } finally {
            setCarregandoAlunos(false)
        }
    }

    const iniciarNovaAula = () => {
        setPresencas(alunos.map(aluno => ({
            alunoId: aluno.id,
            presente: false
        })))
        setDialogOpen(true)
    }

    const togglePresenca = (alunoId: string) => {
        setPresencas(presencas.map(p => 
            p.alunoId === alunoId ? { ...p, presente: !p.presente } : p
        ))
    }

    const salvarAula = async () => {
        try {
            const novaAulaCompleta: Aula = {
                id: Date.now().toString(),
                data: novaAula.data!,
                professor: novaAula.professor!,
                conteudo: novaAula.conteudo!,
                presencas: presencas,
                turmaId: params.id as string
            }

            const response = await fetch('/api/aulas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novaAulaCompleta),
            })

            if (response.ok) {
                await carregarAulas()
                setDialogOpen(false)
                setNovaAula({
                    professor: "",
                    conteudo: "",
                    data: new Date(),
                })
            } else {
                console.error("Erro ao salvar aula")
            }
        } catch (error) {
            console.error("Erro ao salvar aula:", error)
        }
    }

    const salvarAluno = async () => {
        try {
            const alunoParaSalvar = {
                ...novoAluno,
                turmaId: params.id as string
            }

            const response = await fetch('/api/alunos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alunoParaSalvar),
            })

            if (response.ok) {
                await carregarAlunos()
                setDialogAlunoOpen(false)
                setNovoAluno({
                    nome: "",
                    email: "",
                    telefone: "",
                    descricao: "",
                    turmaId: ""
                })
            } else {
                console.error("Erro ao salvar aluno")
            }
        } catch (error) {
            console.error("Erro ao salvar aluno:", error)
        }
    }

    const removerAluno = async (alunoId: string) => {
        try {
            const response = await fetch(`/api/alunos?id=${alunoId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await carregarAlunos()
            } else {
                console.error("Erro ao remover aluno")
            }
        } catch (error) {
            console.error("Erro ao remover aluno:", error)
        }
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="outline" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{turma.titulo}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações da Turma</h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                            <span>{turma.descricao}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-gray-500" />
                            <span>{turma.horario}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="mr-2 h-5 w-5 text-gray-500" />
                            <span>{turma.totalAlunos} alunos</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Lista de Alunos</h2>
                        <Dialog open={dialogAlunoOpen} onOpenChange={setDialogAlunoOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Novo Aluno
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Nome</Label>
                                        <Input 
                                            value={novoAluno.nome}
                                            onChange={(e) => setNovoAluno({...novoAluno, nome: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input 
                                            type="email"
                                            value={novoAluno.email}
                                            onChange={(e) => setNovoAluno({...novoAluno, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Telefone</Label>
                                        <Input 
                                            value={novoAluno.telefone}
                                            onChange={(e) => setNovoAluno({...novoAluno, telefone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Descrição</Label>
                                        <Textarea 
                                            value={novoAluno.descricao}
                                            onChange={(e) => setNovoAluno({...novoAluno, descricao: e.target.value})}
                                            placeholder="Informações adicionais sobre o aluno..."
                                        />
                                    </div>
                                    <Button onClick={salvarAluno} className="w-full">
                                        Salvar Aluno
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="space-y-3">
                        {carregandoAlunos ? (
                            <>
                                <AlunoSkeleton />
                                <AlunoSkeleton />
                                <AlunoSkeleton />
                            </>
                        ) : (
                            alunos.map(aluno => (
                                <div 
                                    key={aluno.id} 
                                    className="flex justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex flex-col">
                                        <div className="font-semibold">{aluno.nome}</div>
                                        <div className="text-sm text-gray-600">
                                            <div>Email: {aluno.email}</div>
                                            <div>Telefone: {aluno.telefone}</div>
                                            {aluno.descricao && (
                                                <div className="mt-1">{aluno.descricao}</div>
                                            )}
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remover Aluno</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja remover este aluno? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={() => removerAluno(aluno.id)}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    Remover
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="col-span-full">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Registro de Aulas</h2>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={iniciarNovaAula}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nova Aula
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Registrar Nova Aula</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Professor</Label>
                                            <Input 
                                                value={novaAula.professor}
                                                onChange={(e) => setNovaAula({...novaAula, professor: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Conteúdo da Aula</Label>
                                            <Textarea 
                                                value={novaAula.conteudo}
                                                onChange={(e) => setNovaAula({...novaAula, conteudo: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Lista de Presença</Label>
                                            <div className="space-y-2 mt-2">
                                                {alunos.map(aluno => {
                                                    const presenca = presencas.find(p => p.alunoId === aluno.id)
                                                    return (
                                                        <div 
                                                            key={aluno.id}
                                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                                        >
                                                            <span>{aluno.nome}</span>
                                                            <Button
                                                                type="button"
                                                                variant={presenca?.presente ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => togglePresenca(aluno.id)}
                                                            >
                                                                {presenca?.presente ? 'Presente' : 'Ausente'}
                                                            </Button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <Button onClick={salvarAula} className="w-full">
                                            Salvar Aula
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-4">
                            {carregandoAulas ? (
                                <>
                                    <AulaSkeleton />
                                    <AulaSkeleton />
                                </>
                            ) : (
                                aulas.map(aula => (
                                    <div key={aula.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {format(aula.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </h3>
                                                <p className="text-sm text-gray-600">Professor: {aula.professor}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm mb-4">{aula.conteudo}</p>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-2">Presenças:</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {aula.presencas.map(presenca => {
                                                    const aluno = alunos.find(a => a.id === presenca.alunoId)
                                                    return (
                                                        <div 
                                                            key={presenca.alunoId}
                                                            className="text-sm flex items-center gap-2"
                                                        >
                                                            <span>{aluno?.nome}:</span>
                                                            <span className={presenca.presente ? "text-green-600" : "text-red-600"}>
                                                                {presenca.presente ? "Presente" : "Ausente"}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 