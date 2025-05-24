"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Usar uma variável para controlar se o componente ainda está montado
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!isMounted) return

        if (currentUser) {
          setUser(currentUser)

          // Verificar se o usuário já existe no Firestore
          const userRef = doc(db, "users", currentUser.uid)
          const userSnap = await getDoc(userRef)

          // Se não existir, criar um novo documento para o usuário
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email,
              displayName: currentUser.displayName,
              portfolio: {},
              watchlist: {},
              preferences: {
                theme: "dark",
              },
            })
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err)
        setError("Erro ao verificar autenticação. Por favor, tente novamente.")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })

    // Cleanup function
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const clearError = () => {
    setError(null)
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error)
      setError(`Erro ao fazer login: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      setError("Erro ao fazer logout. Por favor, tente novamente.")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
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
