import { NextResponse } from "next/server"
import { db } from "@/services/firebaseConnection"
import { collection, getDocs, query, where } from "firebase/firestore"

export async function GET(request: Request, { params }: { params: { turmaId: string } }) {
    try {
        const turmaId = params.turmaId

        const alunosRef = collection(db, "alunos")
        const q = query(alunosRef, where("turmaId", "==", turmaId))
        const querySnapshot = await getDocs(q)
        
        const alunos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return NextResponse.json({ alunos }, { status: 200 })

    } catch (error) {
        console.error("Erro ao buscar alunos da turma:", error)
        return NextResponse.json({ 
            error: "Erro ao buscar alunos da turma" 
        }, { status: 500 })
    }
} 