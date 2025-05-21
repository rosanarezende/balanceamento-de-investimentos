"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { usePortfolio } from "@/hooks/use-portfolio"
import { saveSimulation } from "@/lib/firestore"
import AuthGuard from "@/components/auth-guard"
import { LoadingState } from "@/components/ui/loading-state"

interface StockAllocation {
  ticker: string
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  currentQuantity: number
  investmentAmount: number
  newQuantity: number
  quantityToAcquire: number
  currentPrice: number
  userRecommendation: string
  isEligibleForInvestment: boolean
}

export default function ResultadoCalculadora() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { stocksWithDetails, loading: portfolioLoading } = usePortfolio()
  const [allocations, setAllocations] = useState<StockAllocation[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [newTotalPortfolioValue, setNewTotalPortfolioValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingSimulation, setSavingSimulation] = useState(false)

  useEffect(() => {
    const calculateAllocations = async () => {
      setLoading(true)
      setError(null)

      const investmentParam = searchParams.get("valor")
      if (!investmentParam) {
        router.push("/calculadora-balanceamento")
        return
      }

      const investmentValue = Number.parseFloat(investmentParam)
      setTotalInvestment(investmentValue)

      try {
        // Calcular o valor total atual da carteira
        const currentTotalValue = stocksWithDetails.reduce((total, stock) => {
          return total + stock.currentValue
        }, 0)

        setTotalPortfolioValue(currentTotalValue)
        setNewTotalPortfolioValue(currentTotalValue + investmentValue)

        // Filtrar ações elegíveis para investimento (recomendação "Comprar")
        const eligibleStocks = stocksWithDetails.map((stock) => ({
          ...stock,
          isEligibleForInvestment: stock.userRecommendation === "Comprar",
        }))

        // Calcular investimentos ideais apenas para ações elegíveis e abaixo do peso
        const stocksWithIdealInvestment = eligibleStocks.map((stock) => {
          const targetValue = (stock.targetPercentage / 100) * (currentTotalValue + investmentValue)
          const idealInvestment = stock.isEligibleForInvestment ? Math.max(0, targetValue - stock.currentValue) : 0

          return {
            ...stock,
            idealInvestment,
          }
        })

        // Calcular a soma dos investimentos ideais para ações elegíveis
        const totalIdealInvestment = stocksWithIdealInvestment.reduce((sum, stock) => sum + stock.idealInvestment, 0)

        // Calcular as alocações finais
        const finalAllocations = stocksWithIdealInvestment.map((stock) => {
          let investmentAmount = 0

          if (stock.isEligibleForInvestment) {
            if (totalIdealInvestment <= investmentValue) {
              // Caso 1: Podemos atender todas as necessidades ideais
              const remainingInvestment = investmentValue - totalIdealInvestment

              // Distribuir o restante proporcionalmente entre ações elegíveis
              const totalEligibleTargetPercentage = eligibleStocks
                .filter((s) => s.isEligibleForInvestment)
                .reduce((sum, s) => sum + s.targetPercentage, 0)

              const proportionalShare =
                totalEligibleTargetPercentage > 0 ? stock.targetPercentage / totalEligibleTargetPercentage : 0

              investmentAmount = stock.idealInvestment + proportionalShare * remainingInvestment
            } else if (totalIdealInvestment > 0) {
              // Caso 2: Distribuir proporcionalmente às necessidades
              investmentAmount = (stock.idealInvestment / totalIdealInvestment) * investmentValue
            }
          }

          // Arredondar para o número inteiro de ações
          const quantityToAcquire = Math.floor(investmentAmount / stock.currentPrice)
          const adjustedInvestment = quantityToAcquire * stock.currentPrice

          return {
            ticker: stock.ticker,
            currentValue: stock.currentValue,
            currentPercentage: stock.currentPercentage,
            targetPercentage: stock.targetPercentage,
            currentQuantity: stock.quantity,
            investmentAmount: adjustedInvestment,
            newQuantity: stock.quantity + quantityToAcquire,
            quantityToAcquire,
            currentPrice: stock.currentPrice,
            userRecommendation: stock.userRecommendation,
            isEligibleForInvestment: stock.isEligibleForInvestment,
          }
        })

        setAllocations(finalAllocations)
      } catch (error) {
        console.error("Erro ao calcular alocações:", error)
        setError("Não foi possível calcular as alocações. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (stocksWithDetails.length > 0) {
      calculateAllocations()
    }
  }, [stocksWithDetails, searchParams, router])

  const handleBack = () => {
    router.back()
  }

  const handleAgreeTerms = async () => {
    if (!user) return

    setShowTerms(false)
    setSavingSimulation(true)

    try {
      // Salvar a simulação no Firestore
      await saveSimulation(user.uid, {
        date: new Date(),
        investmentAmount: totalInvestment,
        portfolioValueBefore: totalPortfolioValue,
        portfolioValueAfter: newTotalPortfolioValue,
        allocations: allocations.map((allocation) => ({
          ticker: allocation.ticker,
          currentValue: allocation.currentValue,
          currentPercentage: allocation.currentPercentage,
          targetPercentage: allocation.targetPercentage,
          currentQuantity: allocation.currentQuantity,
          investmentAmount: allocation.investmentAmount,
          newQuantity: allocation.newQuantity,
          quantityToAcquire: allocation.quantityToAcquire,
          currentPrice: allocation.currentPrice,
          userRecommendation: allocation.userRecommendation,
        })),
      })

      // Redirecionar para a página de histórico
      router.push("/historico")
    } catch (error) {
      console.error("Erro ao salvar simulação:", error)
      alert("Não foi possível salvar a simulação. Por favor, tente novamente.")
    } finally {
      setSavingSimulation(false)
    }
  }

  // Verificar se há ações elegíveis para investimento
  const hasEligibleStocks = allocations.some(
    (allocation) => allocation.isEligibleForInvestment && allocation.investmentAmount > 0,
  )

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-md">
        <Card className="border-none shadow-none bg-card">
          <div className="p-4 flex items-center border-b border-border">
            <button onClick={handleBack} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-medium text-foreground">Calculadora De Balanceamento</h1>
              <p className="text-xs text-muted-foreground">Calcule como reorganizar seus investimentos</p>
            </div>
          </div>

          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-2 text-foreground">3º Passo</h2>

            <p className="text-sm text-muted-foreground mb-4">
              Baseado nos ativos da carteira, vamos exibir as ações que recomendamos de acordo com o valor informado e
              suas preferências pessoais.
            </p>

            {error && (
              <div className="bg-destructive/10 p-3 rounded-lg mb-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {loading || portfolioLoading ? (
              <LoadingState message="Calculando recomendações de investimento..." />
            ) : !hasEligibleStocks ? (
              <div className="bg-yellow-500/10 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-center mb-2 text-foreground">Nenhum ativo elegível para aporte</h3>
                <p className="text-sm text-muted-foreground">
                  Não há ativos marcados como "Comprar" que estejam abaixo do peso na sua carteira. Considere alterar
                  suas recomendações ou ajustar os percentuais META.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {allocations
                  .filter((allocation) => allocation.investmentAmount > 0)
                  .map((allocation) => (
                    <Card
                      key={allocation.ticker}
                      className={`border border-border overflow-hidden ${
                        !allocation.isEligibleForInvestment ? "opacity-50" : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-muted rounded-full p-1 mr-2">
                              <Info size={20} className="text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">CÓDIGO</div>
                              <div className="font-bold text-foreground">{allocation.ticker}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded-full mr-1 ${
                                allocation.userRecommendation === "Comprar"
                                  ? "bg-green-500/20 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : allocation.userRecommendation === "Aguardar"
                                    ? "bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-500/20 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {allocation.userRecommendation}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                          <div className="text-muted-foreground">VALOR ATUAL DOS ATIVOS</div>
                          <div className="text-muted-foreground">ALOCAÇÃO ATUAL</div>
                          <div className="font-bold text-foreground">{formatCurrency(allocation.currentValue)}</div>
                          <div className="font-bold text-foreground">{allocation.currentPercentage.toFixed(2)}%</div>

                          <div className="text-muted-foreground">VALOR A INVESTIR</div>
                          <div className="text-muted-foreground">ALOCAÇÃO RECOMENDADA/META</div>
                          <div className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(allocation.investmentAmount)}
                          </div>
                          <div className="font-bold text-foreground">{allocation.targetPercentage.toFixed(2)}%</div>

                          <div className="text-muted-foreground">QTD ATUAL</div>
                          <div className="text-muted-foreground">QTD A ADQUIRIR</div>
                          <div className="font-bold text-foreground">{allocation.currentQuantity}</div>
                          <div className="font-bold text-foreground">{allocation.quantityToAcquire}</div>

                          <div className="text-muted-foreground">PREÇO DO PAPEL NO MOMENTO DA CONSULTA</div>
                          <div className="text-muted-foreground"></div>
                          <div className="font-bold text-foreground">{formatCurrency(allocation.currentPrice)}</div>
                          <div className="font-bold text-foreground"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            <Card className="bg-destructive/10 mb-6 border-destructive/20">
              <CardContent className="p-4">
                <h3 className="text-destructive font-bold text-center mb-2">ATENÇÃO!</h3>
                <p className="text-xs text-foreground mb-2">
                  Para investir, é necessário realizar a compra de ações diretamente na sua corretora/ banco.
                </p>
                <p className="text-xs text-foreground mb-2">
                  Ao clicar em "Confirmar Aporte", você reconhece que isto não é uma ordem de investimento e sim uma
                  sugestão pessoal. Este aplicativo não realiza aplicações no CPF dos usuários.
                </p>
                <p className="text-xs text-foreground mb-2">
                  1. Algumas corretoras/bancos de investimentos cobram taxas de corretagem para compra e venda de ações.
                </p>
                <p className="text-xs text-foreground mb-2">
                  2. Antes de investir, transfira o dinheiro para a sua corretora/ banco.
                </p>
                <p className="text-xs text-foreground mb-2">
                  3. O prazo de liquidação na Bolsa de Valores, que é de D+2, significa que o dinheiro da compra ou
                  venda de ações é debitado ou creditado 2 dias úteis após a negociação.
                </p>
                <p className="text-xs text-foreground mb-2">
                  4. Os preços dos ativos sofrem um atraso de até 15 minutos em relação ao mercado. Portanto, podem
                  existir diferenças de valores entre o preço exibido e o preço real de mercado.
                </p>
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full py-3"
              onClick={() => setShowTerms(true)}
              disabled={savingSimulation || loading || portfolioLoading}
            >
              {savingSimulation ? "PROCESSANDO..." : "CONFIRME O TERMO ACIMA"}
            </Button>
          </CardContent>
        </Card>

        {showTerms && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 text-foreground">Confirmar Simulação</h3>
                <p className="text-sm mb-6 text-muted-foreground">
                  Você confirma que entende que esta é apenas uma simulação e que a execução das ordens deve ser feita
                  diretamente na sua corretora?
                </p>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowTerms(false)}
                    disabled={savingSimulation}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleAgreeTerms} disabled={savingSimulation}>
                    {savingSimulation ? "Salvando..." : "Confirmar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
