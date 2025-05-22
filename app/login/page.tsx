"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreviewLoginForm } from "@/components/preview-login-form"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function LoginPage() {
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false)
  const { user, loading, error, signInWithGoogle, clearError } = useAuth()
  const router = useRouter()
  const [animateIn, setAnimateIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Verificar se estamos em um ambiente de preview
  useEffect(() => {
    const hostname = window.location.hostname
    const isPreview = hostname.includes("github.dev") || hostname.includes("localhost") || hostname.includes("v0.dev")
    setIsPreviewEnvironment(isPreview) 
  }, [])

  useEffect(() => {
    setMounted(true)

    if (user) {
      router.push("/")
    }

    // Iniciar animação após o componente montar
    setTimeout(() => {
      setAnimateIn(true)
    }, 100)

    // Limpar animação ao sair da página
    return () => {
      setAnimateIn(false)
    }
  }, [user, router])

  const handleLogin = async () => {
    clearError()
    await signInWithGoogle()
    // Não redirecionamos aqui, deixamos o useEffect fazer isso quando o user for definido
  }

  // Evitar renderização no servidor para prevenir erros de hidratação
  if (!mounted) {
    return null
  }

  const previewLogin = () => (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">EquilibreInvest</h1>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="preview">Login Preview</TabsTrigger>
            <TabsTrigger value="google">Login Google</TabsTrigger>
          </TabsList>

            <TabsContent value="preview">
              <PreviewLoginForm />
            </TabsContent>

          <TabsContent value="google">
            <Card className="p-6 flex flex-col items-center">
              <p className="mb-4 text-center text-muted-foreground">
                Faça login com sua conta Google para acessar a aplicação.
              </p>
              <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading ? "Entrando..." : "Entrar com Google"}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  const prodLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div
        className={`w-full max-w-md transition-all duration-700 transform ${
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="glassmorphism rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <Logo size="xl" />
            </div>
            <p className="text-2xl font-bold text-gradient">Gerencie e equilibre sua carteira de investimentos de forma inteligente</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <p className="text-center text-gray-300">
              Bem-vindo! Faça login para acessar sua carteira de investimentos.
            </p>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? "Entrando..." : "Login com Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return isPreviewEnvironment ? previewLogin() : prodLogin()
}
