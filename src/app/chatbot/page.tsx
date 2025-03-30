"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Mensagem {
    id: string
    conteudo: string
    tipo: "usuario" | "bot"
    timestamp: Date
}

export default function ChatbotPage() {
    const [mensagens, setMensagens] = useState<Mensagem[]>([])
    const [inputMensagem, setInputMensagem] = useState("")
    const [carregando, setCarregando] = useState(false)
    const [sessionId] = useState(() => Math.random().toString(36).substring(7))
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const scrollParaBaixo = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollParaBaixo()
    }, [mensagens])

    const enviarMensagem = async () => {
        if (!inputMensagem.trim() || carregando) return

        const novaMensagem: Mensagem = {
            id: Date.now().toString(),
            conteudo: inputMensagem,
            tipo: "usuario",
            timestamp: new Date()
        }

        setMensagens(prev => [...prev, novaMensagem])
        setInputMensagem("")
        setCarregando(true)

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    mensagem: inputMensagem,
                    sessionId: sessionId
                }),
            })

            const data = await response.json()

            if (data.erro) {
                throw new Error(data.erro)
            }

            const respostaBot: Mensagem = {
                id: (Date.now() + 1).toString(),
                conteudo: data.resposta,
                tipo: "bot",
                timestamp: new Date()
            }
            setMensagens(prev => [...prev, respostaBot])
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error)
            const mensagemErro: Mensagem = {
                id: (Date.now() + 1).toString(),
                conteudo: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.",
                tipo: "bot",
                timestamp: new Date()
            }
            setMensagens(prev => [...prev, mensagemErro])
        } finally {
            setCarregando(false)
        }
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
                    <h1 className="text-3xl font-bold">Chatbot de Suporte</h1>
                </div>
            </div>

            <Card className="h-[calc(100vh-200px)]">
                <CardHeader>
                    <CardTitle>Assistente Virtual</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                    <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
                        <div className="space-y-4">
                            {mensagens.map((mensagem) => (
                                <div
                                    key={mensagem.id}
                                    className={`flex ${
                                        mensagem.tipo === "usuario" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg p-3 ${
                                            mensagem.tipo === "usuario"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {mensagem.tipo === "bot" && (
                                                <Bot className="h-5 w-5 text-gray-500" />
                                            )}
                                            {mensagem.tipo === "usuario" && (
                                                <User className="h-5 w-5 text-white" />
                                            )}
                                            <div>
                                                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                                                    {mensagem.tipo === "bot" ? (
                                                        <ReactMarkdown>{mensagem.conteudo}</ReactMarkdown>
                                                    ) : (
                                                        <p>{mensagem.conteudo}</p>
                                                    )}
                                                </div>
                                                <p className="text-xs mt-1 opacity-70">
                                                    {mensagem.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {carregando && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                                            <p className="text-sm text-gray-500">Digitando...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="flex gap-2 mt-4">
                        <Input
                            value={inputMensagem}
                            onChange={(e) => setInputMensagem(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            onKeyPress={(e) => e.key === "Enter" && enviarMensagem()}
                            disabled={carregando}
                        />
                        <Button onClick={enviarMensagem} disabled={carregando}>
                            {carregando ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 