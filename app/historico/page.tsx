"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getSimulations, type Simulation } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"
import AuthGuard from "@/components/auth-guard"
import { AppShell } from "@/components/layout/app-shell"

export default function Historico() {
  const router = useRouter()
  const { user } = useAuth()
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSimulations() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const userSimulations = await getSimulations(user.uid)
        setSimulations(userSimulations)
      } catch (error) {
        console.error("Erro ao carregar simulações:", error)
        setError("Não foi possível carregar o histórico de simulações. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadSimulations().catch((error) => {
      console.error("Erro ao carregar simulações:", error)
      setError("Não foi possível carregar o histórico de simulações. Por favor, tente novamente.")
      setLoading(false)
    })
  }, [user])

  const handleBack = () => {
    router.back()
  }

  const handleViewDetails = (id: string) => {
    try {
      router.push(`/historico/${id}`)
    } catch (error) {
      console.error("Erro ao visualizar detalhes:", error)
      setError("Não foi possível visualizar os detalhes da simulação. Por favor, tente novamente.")
    }
  }

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="container max-w-md mx-auto px-4 py-6">
          <Button variant="ghost" size="icon" className="mb-4" onClick={handleBack} aria-label="Voltar">
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <h1 className="text-2xl font-bold mb-6">Histórico de Simulações</h1>

          {loading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Carregando simulações...</p>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </div>
          ) : simulations.length > 0 ? (
            <div className="space-y-4">
              {simulations.map((simulation) => (
                <Card key={simulation.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Simulação</h3>
                      <span className="text-sm text-muted-foreground">{formatDate(simulation.date)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="text-muted-foreground">Valor do aporte:</div>
                      <div className="font-medium text-right">{formatCurrency(simulation.investmentAmount)}</div>

                      <div className="text-muted-foreground">Valor anterior:</div>
                      <div className="font-medium text-right">{formatCurrency(simulation.portfolioValueBefore)}</div>

                      <div className="text-muted-foreground">Valor após aporte:</div>
                      <div className="font-medium text-right">{formatCurrency(simulation.portfolioValueAfter)}</div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (typeof simulation.investmentAmount !== "number" || simulation.investmentAmount <= 0) {
                          setError("O valor do aporte deve ser um número maior que zero.")
                          return
                        }
                        simulation.id && handleViewDetails(simulation.id)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma simulação encontrada.</p>
              <Button className="mt-4" onClick={() => router.push("/calculadora-balanceamento")}>
                Criar Nova Simulação
              </Button>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  )
}
