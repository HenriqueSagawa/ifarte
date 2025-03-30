import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "email" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials: any, req: any): Promise<any> {
                try {
                    const usersRef = collection(db, "usuarios");
                    const q = query(usersRef, where("email", "==", credentials.email));
                    const querySnapshot = await getDocs(q);


                    if (querySnapshot.empty) {
                        return null;
                    }

                    const user = querySnapshot.docs[0].data();

                    
                    if (credentials.password !== user.password) {
                        return null
                    }

                    return {
                        name: user.nome,
                        email: user.email
                    }
                }
                catch (err) {
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET as string
})

export { handler as GET, handler as POST }