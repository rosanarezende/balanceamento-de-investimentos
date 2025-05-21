"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { usePreviewAuth } from "@/contexts/preview-auth-context"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth()
  const { user: previewUser, loading: previewLoading } = usePreviewAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Só verificamos a autenticação quando o loading terminar
    if (!authLoading && !previewLoading) {
      const user = authUser || previewUser
      if (!user && pathname !== "/login") {
        router.push("/login")
      } else if (user) {
        setIsAuthorized(true)
      }
    }
  }, [authUser, previewUser, authLoading, previewLoading, router, pathname])

  // Durante a renderização no servidor ou antes da montagem, retornamos um placeholder
  if (!mounted || authLoading || previewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se estiver na página de login ou autorizado, renderiza o conteúdo
  if (pathname === "/login" || isAuthorized) {
    return <>{children}</>
  }

  // Caso contrário, não renderiza nada (redirecionando para login)
  return null
}
