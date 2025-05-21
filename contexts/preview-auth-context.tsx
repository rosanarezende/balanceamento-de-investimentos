"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Tipo de usuário simulado para o ambiente de preview
interface PreviewUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

interface PreviewAuthContextType {
  user: PreviewUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, name: string) => void
  signOut: () => void
  clearError: () => void
}

const PreviewAuthContext = createContext<PreviewAuthContextType | undefined>(undefined)

// Chave para armazenar o usuário no localStorage
const PREVIEW_USER_KEY = "preview_user"

export function PreviewAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PreviewUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(PREVIEW_USER_KEY)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error("Erro ao carregar usuário do preview:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = (email: string, name: string) => {
    try {
      setLoading(true)
      setError(null)

      // Criar usuário simulado
      const previewUser: PreviewUser = {
        uid: `preview_${Date.now()}`,
        email,
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      }

      // Salvar no localStorage
      localStorage.setItem(PREVIEW_USER_KEY, JSON.stringify(previewUser))
      setUser(previewUser)

      // Redirecionar para a página inicial
      router.push("/")
    } catch (err) {
      console.error("Erro ao fazer login no preview:", err)
      setError("Erro ao fazer login no ambiente de preview")
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    try {
      localStorage.removeItem(PREVIEW_USER_KEY)
      setUser(null)
      router.push("/login")
    } catch (err) {
      console.error("Erro ao fazer logout no preview:", err)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <PreviewAuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </PreviewAuthContext.Provider>
  )
}

export function usePreviewAuth() {
  const context = useContext(PreviewAuthContext)
  if (context === undefined) {
    throw new Error("usePreviewAuth deve ser usado dentro de um PreviewAuthProvider")
  }
  return context
}
