"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AulaDetalhesModal } from "@/components/AulaDetalhesModal"
import { Plus, Info, Trash2, Download, ArrowLeft } from "lucide-react"
import { exportToExcel } from '@/utils/exportToExcel'
import * as XLSX from 'xlsx'
import Link from "next/link"

interface Aluno {
    id: string
    nome: string
    email: string
    telefone: string
    descricao?: string
    turmaId: string
}

interface Aula {
    id: string
    data: Date
    professor: string
    conteudo: string
    presencas: {
        alunoId: string
        presente: boolean
    }[]
    turmaId: string
}

interface TurmaInfo {
    id: string
    titulo: string
    descricao: string
    horario: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function PainelPage() {
    const [alunos, setAlunos] = useState<Aluno[]>([])
    const [aulas, setAulas] = useState<Aula[]>([])
    const [carregando, setCarregando] = useState(true)
    const [aulaDetalhes, setAulaDetalhes] = useState<Aula | null>(null)
    const [novoAluno, setNovoAluno] = useState({
        nome: "",
        email: "",
        telefone: "",
        turmaId: ""
    })

    const turmas: TurmaInfo[] = [
        {
            id: "1",
            titulo: "Turma Iniciante",
            descricao: "Aulas para iniciantes em violão",
            horario: "Quinta - 13h30"
        },
        {
            id: "2",
            titulo: "Turma Intermediária",
            descricao: "Aulas para alunos de nível intermediário",
            horario: "Quinta - 14h30"
        },
        {
            id: "3",
            titulo: "Turma dos Idosos",
            descricao: "Aulas para alunos idosos",
            horario: "Quinta - 15h30"
        }
    ]

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            setCarregando(true)
            const [alunosRes, aulasRes] = await Promise.all([
                fetch('/api/alunos'),
                fetch('/api/aulas')
            ])

            const alunosData = await alunosRes.json()
            const aulasData = await aulasRes.json()

            console.log('Dados das aulas:', aulasData)

            setAlunos(alunosData.alunos || [])
            setAulas(aulasData.aulas?.map((aula: any) => ({
                ...aula,
                data: new Date(aula.data),
                turmaId: aula.turmaId || "2",
                presencas: Array.isArray(aula.presencas) ? aula.presencas : []
            })) || [])
        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        } finally {
            setCarregando(false)
        }
    }

    const getAlunosPorTurma = () => {
        return turmas.map(turma => ({
            name: turma.titulo,
            value: alunos.filter(aluno => aluno.turmaId === turma.id).length
        }))
    }

    const getPresencasPorTurma = () => {
        return turmas.map(turma => {
            const turmaAlunos = alunos.filter(a => a.turmaId === turma.id)
            const aulasData = aulas.filter(aula => aula.turmaId === turma.id)
            
            let totalPresencas = 0
            let totalPossivel = 0

            aulasData.forEach(aula => {
                if (Array.isArray(aula.presencas)) {
                    const presencasAula = aula.presencas.filter(p => p.presente).length
                    totalPresencas += presencasAula
                    totalPossivel += turmaAlunos.length
                }
            })

            return {
                turma: turma.titulo,
                presenca: totalPossivel > 0 ? Math.round((totalPresencas / totalPossivel) * 100) : 0
            }
        })
    }

    const getAulasPorMes = () => {
        // Array com todos os meses de 2025
        const meses2025 = Array.from({ length: 12 }, (_, i) => {
            const data = new Date(2025, i, 1) // Cria uma data para cada mês de 2025
            return data
        })

        return meses2025.map(mes => {
            const aulasNoMes = aulas.filter(aula => {
                const aulaData = aula.data instanceof Date ? aula.data : new Date(aula.data)
                return aulaData.getMonth() === mes.getMonth() &&
                       aulaData.getFullYear() === 2025 // Filtra apenas aulas de 2025
            }).length

            return {
                name: mes.toLocaleDateString('pt-BR', { month: 'short' }),
                quantidade: aulasNoMes
            }
        })
    }

    const adicionarAluno = async (turmaId: string) => {
        try {
            const response = await fetch('/api/alunos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...novoAluno, turmaId }),
            })

            if (response.ok) {
                await carregarDados()
                setNovoAluno({ nome: "", email: "", telefone: "", turmaId: "" })
            }
        } catch (error) {
            console.error("Erro ao adicionar aluno:", error)
        }
    }

    const removerAluno = async (alunoId: string) => {
        try {
            const response = await fetch(`/api/alunos?id=${alunoId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await carregarDados()
            }
        } catch (error) {
            console.error("Erro ao remover aluno:", error)
        }
    }

    const exportarDistribuicaoAlunos = () => {
        const data = getAlunosPorTurma().map(item => ({
            Turma: item.name,
            'Quantidade de Alunos': item.value
        }))
        exportToExcel(data, 'distribuicao-alunos')
    }

    const exportarTaxaPresenca = () => {
        const data = getPresencasPorTurma().map(item => ({
            Turma: item.turma,
            'Taxa de Presença (%)': item.presenca
        }))
        exportToExcel(data, 'taxa-presenca')
    }

    const exportarEvolucaoAulas = () => {
        const data = getAulasPorMes().map(item => ({
            Mês: item.name,
            'Quantidade de Aulas': item.quantidade
        }))
        exportToExcel(data, 'evolucao-aulas')
    }

    const exportarDadosTurma = (turma: TurmaInfo) => {
        const turmaAlunos = alunos.filter(a => a.turmaId === turma.id)
        const turmaAulas = aulas.filter(a => a.turmaId === turma.id)

        const alunosData = turmaAlunos.map(aluno => ({
            Nome: aluno.nome,
            Email: aluno.email,
            Telefone: aluno.telefone
        }))

        const aulasData = turmaAulas.map(aula => ({
            Data: new Date(aula.data).toLocaleDateString('pt-BR'),
            Professor: aula.professor,
            Conteúdo: aula.conteudo,
            'Total Presentes': aula.presencas?.filter(p => p.presente).length || 0
        }))

        const wb = XLSX.utils.book_new()
        
        const wsAlunos = XLSX.utils.json_to_sheet(alunosData)
        XLSX.utils.book_append_sheet(wb, wsAlunos, "Alunos")
        
        const wsAulas = XLSX.utils.json_to_sheet(aulasData)
        XLSX.utils.book_append_sheet(wb, wsAulas, "Aulas")
        
        XLSX.writeFile(wb, `dados-turma-${turma.id}.xlsx`)
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-4">
                    <Link href="/">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Painel Administrativo</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total de Alunos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{alunos.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total de Aulas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{aulas.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Turmas Ativas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{turmas.length}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="distribuicao" className="space-y-4 mt-12">
                <TabsList className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-0">
                    <TabsTrigger value="distribuicao" className="w-full sm:w-auto">
                        Distribuição de Alunos
                    </TabsTrigger>
                    <TabsTrigger value="presenca" className="w-full sm:w-auto">
                        Taxa de Presença
                    </TabsTrigger>
                    <TabsTrigger value="evolucao" className="w-full sm:w-auto">
                        Evolução de Aulas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="distribuicao" className="bg-white p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Distribuição de Alunos por Turma</h2>
                        <Button variant="outline" onClick={exportarDistribuicaoAlunos}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Excel
                        </Button>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getAlunosPorTurma()}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    label
                                >
                                    {getAlunosPorTurma().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="presenca" className="bg-white p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Taxa de Presença por Turma</h2>
                        <Button variant="outline" onClick={exportarTaxaPresenca}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Excel
                        </Button>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getPresencasPorTurma()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="turma" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar 
                                    dataKey="presenca" 
                                    name="Taxa de Presença (%)" 
                                    fill="#8884d8"
                                    label={{ position: 'top' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="evolucao" className="bg-white p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Evolução de Aulas por Mês</h2>
                        <Button variant="outline" onClick={exportarEvolucaoAulas}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Excel
                        </Button>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getAulasPorMes()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="quantidade" 
                                    name="Quantidade de Aulas" 
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Detalhes por Turma</h2>
                {turmas.map(turma => {
                    const turmaAlunos = alunos.filter(a => a.turmaId === turma.id)
                    const turmaAulas = aulas.filter(a => a.turmaId === turma.id)
                    
                    return (
                        <div key={turma.id} className="mb-8 bg-white rounded-lg shadow">
                            <div className="p-6 border-b flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{turma.titulo}</h3>
                                    <p className="text-gray-600">{turma.descricao}</p>
                                    <p className="text-gray-600">Horário: {turma.horario}</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => exportarDadosTurma(turma)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar Dados
                                </Button>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-lg font-semibold">Alunos Matriculados</h4>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Adicionar Aluno
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
                                                    <Button onClick={() => adicionarAluno(turma.id)}>
                                                        Adicionar
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {turmaAlunos.map(aluno => (
                                            <div key={aluno.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{aluno.nome}</p>
                                                    <p className="text-sm text-gray-600">{aluno.email}</p>
                                                    <p className="text-sm text-gray-600">{aluno.telefone}</p>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => removerAluno(aluno.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold mb-3">Últimas Aulas</h4>
                                    <div className="space-y-3">
                                        {turmaAulas
                                            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                                            .slice(0, 5)
                                            .map(aula => (
                                                <div key={aula.id} className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">
                                                                {new Date(aula.data).toLocaleDateString('pt-BR')}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Professor: {aula.professor}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setAulaDetalhes(aula)}
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm mt-2">{aula.conteudo}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {aulaDetalhes && (
                <AulaDetalhesModal
                    aula={aulaDetalhes}
                    alunos={alunos.filter(a => a.turmaId === aulaDetalhes.turmaId)}
                    open={!!aulaDetalhes}
                    onOpenChange={() => setAulaDetalhes(null)}
                />
            )}
        </div>
    )
} 