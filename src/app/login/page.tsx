"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/core/state/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { signInWithGoogle, error, clearError } = useAuth()

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (err) {
      console.error("Erro ao fazer login com Google:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Seção de Descrição da Plataforma */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Logo size="lg" asLink={false} />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Balanceamento de Investimentos
              </h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Otimize sua carteira de investimentos com nossa plataforma inteligente.
            Acompanhe o desempenho dos seus ativos, receba recomendações personalizadas
            e mantenha um portfólio equilibrado automaticamente.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Análise Inteligente</h3>
                <p className="text-gray-600">Acompanhe o desempenho em tempo real com gráficos e métricas detalhadas</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rebalanceamento Automático</h3>
                <p className="text-gray-600">Receba sugestões para manter sua carteira sempre otimizada</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Histórico Completo</h3>
                <p className="text-gray-600">Visualize a evolução dos seus investimentos ao longo do tempo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Login */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Logo size="md" asLink={false} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Acesse sua conta
              </CardTitle>
              <p className="text-gray-600">
                Entre com sua conta Google para começar
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  {error}
                  <button
                    onClick={clearError}
                    className="ml-2 text-sm hover:text-red-800 font-medium"
                  >
                    ✕
                  </button>
                </Alert>
              )}

              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-base font-medium"
                variant="outline"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </Button>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Ao continuar, você concorda com nossos termos de uso e política de privacidade.
                Seus dados são protegidos e utilizados apenas para melhorar sua experiência.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
