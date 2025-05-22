"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreviewLoginForm } from "@/components/preview-login-form"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false)
  const { signInWithGoogle, loading } = useAuth()
  const router = useRouter()

  // Verificar se estamos em um ambiente de preview
  useEffect(() => {
    const hostname = window.location.hostname
    const isPreview = hostname.includes("github.dev") || hostname.includes("localhost") || hostname.includes("v0.dev")
    setIsPreviewEnvironment(isPreview) 
  }, [])

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">EquilibreInvest</h1>

        <Tabs defaultValue={isPreviewEnvironment ? "preview" : "google"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            {isPreviewEnvironment && (
              <TabsTrigger value="preview">Login Preview</TabsTrigger>
            )}
            <TabsTrigger value="google">Login Google</TabsTrigger>
          </TabsList>

          {isPreviewEnvironment && (
            <TabsContent value="preview">
              <PreviewLoginForm />
            </TabsContent>
          )}

          <TabsContent value="google">
            <Card className="p-6 flex flex-col items-center">
              <p className="mb-4 text-center text-muted-foreground">
                Faça login com sua conta Google para acessar a aplicação.
              </p>
              <Button onClick={handleGoogleLogin} disabled={loading} className="w-full">
                {loading ? "Entrando..." : "Entrar com Google"}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
