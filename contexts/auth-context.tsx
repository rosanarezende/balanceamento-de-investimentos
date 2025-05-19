"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)

        // Verificar se o usuário já existe no Firestore
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        // Se não existir, criar um novo documento para o usuário
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            portfolio: {},
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
