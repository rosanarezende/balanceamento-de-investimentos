"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/core/state/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/core/state/error-handling"

// Componente para proteger rotas que exigem autenticação
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redirecionar para login
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Mostrar mensagem de erro se houver algum problema de autenticação
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ErrorDisplay 
            message={error} 
            onRetry={() => router.push("/login")} 
          />
        </div>
      </div>
    )
  }

  // Mostrar esqueleto de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  // Se não estiver carregando e houver usuário, renderizar o conteúdo protegido
  return user ? <>{children}</> : null
}
