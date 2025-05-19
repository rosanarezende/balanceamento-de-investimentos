"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getSimulation, type Simulation } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"
import AuthGuard from "@/components/auth-guard"

export default function SimulationDetails() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSimulation() {
      if (!user || !params.id) return

      setLoading(true)
      setError(null)

      try {
        const simulationData = await getSimulation(user.uid, params.id as string)
        setSimulation(simulationData)
      } catch (error) {
        console.error("Erro ao carregar simulação:", error)
        setError("Não foi possível carregar os detalhes da simulação. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadSimulation()
  }, [user, params.id])

  const handleBack = () => {
    router.back()
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

  // Determinar a cor com base na recomendação
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Comprar":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      case "Aguardar":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Vender":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <AuthGuard>
      <div className="container max-w-md mx-auto px-4 py-6">
        <Button variant="ghost" size="icon" className="mb-4" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <h1 className="text-2xl font-bold mb-6">Detalhes da Simulação</h1>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Carregando detalhes...</p>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        ) : simulation ? (
          <div>
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Data da Simulação</p>
                <p className="font-medium">{formatDate(simulation.date)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor do Aporte</p>
                  <p className="text-xl font-bold">{formatCurrency(simulation.investmentAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total Após Aporte</p>
                  <p className="text-xl font-bold">{formatCurrency(simulation.portfolioValueAfter)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Valor da Carteira Antes do Aporte</p>
                <p className="font-medium">{formatCurrency(simulation.portfolioValueBefore)}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Alocações Recomendadas</h2>

            <div className="space-y-4 mb-6">
              {simulation.allocations
                .filter((allocation) => allocation.investmentAmount > 0)
                .map((allocation, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-xs text-muted-foreground">CÓDIGO</div>
                          <div className="font-bold">{allocation.ticker}</div>
                        </div>
                        <div
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getRecommendationColor(
                            allocation.userRecommendation,
                          )}`}
                        >
                          {allocation.userRecommendation}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        <div className="text-muted-foreground">VALOR ATUAL DOS ATIVOS</div>
                        <div className="text-muted-foreground">ALOCAÇÃO ATUAL</div>
                        <div className="font-bold">{formatCurrency(allocation.currentValue)}</div>
                        <div className="font-bold">{allocation.currentPercentage.toFixed(2)}%</div>

                        <div className="text-muted-foreground">VALOR A INVESTIR</div>
                        <div className="text-muted-foreground">ALOCAÇÃO RECOMENDADA/META</div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(allocation.investmentAmount)}
                        </div>
                        <div className="font-bold">{allocation.targetPercentage.toFixed(2)}%</div>

                        <div className="text-muted-foreground">QTD ATUAL</div>
                        <div className="text-muted-foreground">QTD A ADQUIRIR</div>
                        <div className="font-bold">{allocation.currentQuantity}</div>
                        <div className="font-bold">{allocation.quantityToAcquire}</div>

                        <div className="text-muted-foreground">PREÇO DO PAPEL NO MOMENTO DA CONSULTA</div>
                        <div className="text-muted-foreground"></div>
                        <div className="font-bold">{formatCurrency(allocation.currentPrice)}</div>
                        <div className="font-bold"></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <Button className="w-full" onClick={() => router.push("/calculadora-balanceamento")}>
              Nova Simulação
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Simulação não encontrada.</p>
            <Button className="mt-4" onClick={() => router.push("/historico")}>
              Voltar para o Histórico
            </Button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
