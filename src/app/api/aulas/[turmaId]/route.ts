import { NextResponse } from "next/server"
import { db } from "@/services/firebaseConnection"
import { collection, getDocs, query, where } from "firebase/firestore"

export async function GET(request: Request, { params }: { params: { turmaId: string } }) {
    try {
        const turmaId = params.turmaId

        const aulasRef = collection(db, "aulas")
        const q = query(aulasRef, where("turmaId", "==", turmaId))
        const querySnapshot = await getDocs(q)
        
        const aulas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return NextResponse.json({ aulas }, { status: 200 })

    } catch (error) {
        console.error("Erro ao buscar aulas da turma:", error)
        return NextResponse.json({ 
            error: "Erro ao buscar aulas da turma" 
        }, { status: 500 })
    }
} 