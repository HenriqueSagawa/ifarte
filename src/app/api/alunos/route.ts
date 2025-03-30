import { NextResponse } from "next/server"
import { db } from "@/services/firebaseConnection"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"

export async function GET() {
    try {
        const alunosRef = collection(db, "alunos")
        const querySnapshot = await getDocs(alunosRef)
        
        const alunos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return NextResponse.json({ alunos }, { status: 200 })

    } catch (error) {
        console.error("Erro ao buscar alunos:", error)
        return NextResponse.json({ 
            error: "Erro ao buscar alunos" 
        }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const alunosRef = collection(db, "alunos")
        
        const docRef = await addDoc(alunosRef, body)
        
        return NextResponse.json({ 
            id: docRef.id,
            ...body
        }, { status: 201 })

    } catch (error) {
        console.error("Erro ao salvar aluno:", error)
        return NextResponse.json({ 
            error: "Erro ao salvar aluno" 
        }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const alunoId = searchParams.get('id')

        if (!alunoId) {
            return NextResponse.json({ 
                error: "ID do aluno é obrigatório" 
            }, { status: 400 })
        }

        const alunoRef = doc(db, "alunos", alunoId)
        await deleteDoc(alunoRef)

        return NextResponse.json({ 
            message: "Aluno removido com sucesso" 
        }, { status: 200 })

    } catch (error) {
        console.error("Erro ao remover aluno:", error)
        return NextResponse.json({ 
            error: "Erro ao remover aluno" 
        }, { status: 500 })
    }
} 