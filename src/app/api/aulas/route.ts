import { NextResponse } from "next/server"
import { db } from "@/services/firebaseConnection"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const aulasRef = collection(db, "aulas")
        
        const novaAula = {
            ...body,
            data: new Date(body.data).toISOString(),
            createdAt: new Date().toISOString()
        }

        const docRef = await addDoc(aulasRef, novaAula)
        
        return NextResponse.json({ 
            id: docRef.id,
            ...novaAula
        }, { status: 201 })

    } catch (error) {
        console.error("Erro ao salvar aula:", error)
        return NextResponse.json({ 
            error: "Erro ao salvar aula" 
        }, { status: 500 })
    }
}

export async function GET() {
    try {
        const aulasRef = collection(db, "aulas")
        const querySnapshot = await getDocs(aulasRef)
        
        const aulas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            data: doc.data().data,
            presencas: Array.isArray(doc.data().presencas) ? doc.data().presencas : []
        }))

        console.log('Aulas recuperadas:', aulas)

        return NextResponse.json({ aulas }, { status: 200 })

    } catch (error) {
        console.error("Erro ao buscar aulas:", error)
        return NextResponse.json({ 
            error: "Erro ao buscar aulas",
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
    }
} 