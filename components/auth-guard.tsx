"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Só verificamos a autenticação quando o loading terminar
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, loading, router])

  // Durante a renderização no servidor ou antes da montagem, retornamos um placeholder
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Só renderiza o conteúdo se estiver autorizado
  return isAuthorized ? <>{children}</> : null
}
