import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyBHEPSiyvrzCA1Cni6nqOeIliNei8sLHGY")

// Armazena o histórico de conversas por sessão
const historicoConversas = new Map<string, any[]>()

interface Aluno {
    id: string
    nome: string
    email: string
    turmaId: string
}

interface Aula {
    id: string
    data: Date
    conteudo: string
    turmaId: string
    presencas: {
        alunoId: string
        presente: boolean
    }[]
}

interface Turma {
    id: string
    titulo: string
    descricao: string
    horario: string
}

interface DadosTurma {
    nome: string
    totalAlunos: number
    totalAulas: number
    mediaPresenca: string
    alunos: {
        nome: string
        email: string
    }[]
    ultimasAulas: {
        data: string
        conteudo: string
        presencas: number
    }[]
}

async function buscarDadosBanco(): Promise<DadosTurma[]> {
    try {
        console.log("Iniciando busca de dados...")
        
        // Busca dados usando as APIs existentes
        const [alunosRes, aulasRes] = await Promise.all([
            fetch('http://localhost:3000/api/alunos'),
            fetch('http://localhost:3000/api/aulas')
        ])

        console.log("Respostas recebidas:", {
            alunosStatus: alunosRes.status,
            aulasStatus: aulasRes.status
        })

        if (!alunosRes.ok || !aulasRes.ok) {
            throw new Error(`Erro nas requisições: alunos=${alunosRes.status}, aulas=${aulasRes.status}`)
        }

        const alunosData = await alunosRes.json()
        const aulasData = await aulasRes.json()

        console.log("Dados recebidos:", {
            alunosCount: alunosData.alunos?.length || 0,
            aulasCount: aulasData.aulas?.length || 0
        })

        const turmas: Turma[] = [
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

        const dadosFormatados = turmas.map(turma => {
            const alunosTurma = (alunosData.alunos || []).filter((a: Aluno) => a.turmaId === turma.id)
            const aulasTurma = (aulasData.aulas || []).filter((a: Aula) => a.turmaId === turma.id)

            console.log(`Dados da turma ${turma.titulo}:`, {
                alunosCount: alunosTurma.length,
                aulasCount: aulasTurma.length
            })

            const totalAlunos = alunosTurma.length
            const totalAulas = aulasTurma.length

            // Calcula média de presença por aula
            const mediaPresenca = aulasTurma.reduce((acc: number, aula: Aula) => {
                const presentes = aula.presencas?.filter((p) => p.presente).length || 0
                return acc + (presentes / totalAlunos)
            }, 0) / (totalAulas || 1)

            return {
                nome: turma.titulo,
                totalAlunos,
                totalAulas,
                mediaPresenca: (mediaPresenca * 100).toFixed(1),
                alunos: alunosTurma.map((aluno: Aluno) => ({
                    nome: aluno.nome,
                    email: aluno.email
                })),
                ultimasAulas: aulasTurma
                    .sort((a: Aula, b: Aula) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .slice(0, 3)
                    .map((aula: Aula) => ({
                        data: new Date(aula.data).toLocaleDateString('pt-BR'),
                        conteudo: aula.conteudo,
                        presencas: aula.presencas?.filter((p) => p.presente).length || 0
                    }))
            }
        })

        console.log("Dados formatados com sucesso")
        return dadosFormatados
    } catch (error) {
        console.error("Erro detalhado ao buscar dados:", error)
        return []
    }
}

const contextoInicial = `Você é um assistente virtual especializado no suporte a professores de violão.

Seu objetivo é fornecer estatísticas detalhadas com base nos dados do banco de dados e auxiliar os professores com insights, sugestões e metodologias para melhorar o ensino.

Suas funções incluem:
✅ Analisar estatísticas das aulas de violão com base nas informações fornecidas pelo banco de dados.
✅ Identificar padrões de desempenho, apontando possíveis dificuldades dos alunos e sugerindo melhorias.
✅ Oferecer suporte pedagógico, recomendando metodologias de ensino, estratégias motivacionais e repertórios adequados.
✅ Ajudar na identificação de problemas, como baixa frequência, dificuldades recorrentes ou engajamento dos alunos.
✅ Sugerir exercícios e técnicas, com base no desempenho registrado dos estudantes.

Regras e limitações:
❌ Nunca invente informações – todas as respostas devem ser baseadas nos dados disponíveis.
❌ Foque exclusivamente em estatísticas e suporte pedagógico – não forneça informações administrativas como valores, matrículas ou horários.
❌ Se não houver dados suficientes para uma análise concreta, informe o professor e peça mais detalhes.

Lembre-se: seu público são exclusivamente os professores. Mantenha um tom profissional, colaborativo e focado na melhoria do ensino e aprendizagem.

Para cada turma, você receberá as seguintes informações:
1. Nome da turma
2. Total de alunos matriculados
3. Total de aulas realizadas
4. Média de presença nas aulas
5. Lista completa de alunos com seus nomes e emails
6. Histórico detalhado das últimas aulas, incluindo:
   - Data da aula
   - Conteúdo ministrado
   - Número de alunos presentes
   - Taxa de presença

Use essas informações para:
- Analisar o progresso dos alunos
- Identificar padrões de frequência
- Sugerir melhorias no conteúdo
- Propor exercícios complementares
- Avaliar o engajamento da turma
- Identificar alunos que precisam de atenção especial

Baseie suas respostas sempre nos dados reais fornecidos, nunca em suposições.`

console.log(contextoInicial);

export async function POST(request: Request) {
    try {
        const { mensagem, sessionId } = await request.json()
        console.log("Mensagem recebida:", mensagem)
        console.log("Session ID:", sessionId)

        // Busca dados do banco
        const dadosBanco = await buscarDadosBanco()
        console.log("Dados do banco recebidos:", JSON.stringify(dadosBanco, null, 2))

        // Formata os dados para o contexto
        const dadosContexto = dadosBanco.map(turma => `
Turma: ${turma.nome}
Total de Alunos: ${turma.totalAlunos}
Total de Aulas: ${turma.totalAulas}
Média de Presença: ${turma.mediaPresenca}%

Lista de Alunos:
${turma.alunos.map(a => `- ${a.nome} (${a.email})`).join('\n')}

Histórico de Aulas:
${turma.ultimasAulas.map(a => `
Data: ${a.data}
Conteúdo: ${a.conteudo}
Alunos Presentes: ${a.presencas} de ${turma.totalAlunos}
Taxa de Presença: ${((a.presencas / turma.totalAlunos) * 100).toFixed(1)}%
`).join('\n')}
`).join('\n\n')

        // Obtém ou cria o histórico para esta sessão
        let historico = historicoConversas.get(sessionId) || []
        
        // Se for a primeira mensagem, adiciona o contexto inicial
        if (historico.length === 0) {
            historico.push({
                role: "user",
                parts: [{ text: `${contextoInicial}\n\nDados Atuais do Sistema:\n\n${dadosContexto}` }],
            })
        }

        // Adiciona a mensagem atual ao histórico
        historico.push({
            role: "user",
            parts: [{ text: mensagem }],
        })

        console.log("Histórico atual:", JSON.stringify(historico, null, 2))

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const chat = model.startChat({
            history: historico,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        })

        const result = await chat.sendMessage(mensagem)
        const response = await result.response
        const resposta = response.text()

        // Adiciona a resposta ao histórico
        historico.push({
            role: "model",
            parts: [{ text: resposta }],
        })

        // Atualiza o histórico na memória
        historicoConversas.set(sessionId, historico)

        console.log("Resposta gerada com sucesso")
        return NextResponse.json({ resposta })
    } catch (error) {
        console.error("Erro detalhado ao processar mensagem:", error)
        return NextResponse.json(
            { erro: "Erro ao processar mensagem" },
            { status: 500 }
        )
    }
} 