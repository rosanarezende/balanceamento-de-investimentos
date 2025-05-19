"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithEmailPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const clearError = () => {
    setError(null)
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithPopup(auth, googleProvider)
      router.push("/")
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error)

      // Tratamento específico para o erro de domínio não autorizado
      if (error.code === "auth/unauthorized-domain") {
        setError(
          "Este domínio não está autorizado para autenticação. Em ambiente de desenvolvimento, use o login com email e senha.",
        )
      } else {
        setError(`Erro ao fazer login: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (error: any) {
      console.error("Erro ao fazer login com email/senha:", error)

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Email ou senha incorretos.")
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido.")
      } else {
        setError(`Erro ao fazer login: ${error.message}`)
      }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithEmailPassword,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
