"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Info, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/core/utils/formatting"
import { useAuth } from "@/contexts/auth-context"
import { usePortfolio } from "@/hooks/use-portfolio"
import { saveSimulation } from "@/services/firebase/firestore"
import AuthGuard from "@/components/auth-guard"
import { LoadingState } from "@/components/ui/loading-state"
import { type SimulationAllocation } from "@/lib/schemas/stock"

export default function ResultadoCalculadora() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { stocksWithDetails, loading: portfolioLoading, refreshPortfolio } = usePortfolio()
  const [allocations, setAllocations] = useState<SimulationAllocation[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [newTotalPortfolioValue, setNewTotalPortfolioValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingSimulation, setSavingSimulation] = useState(false)
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [triedRefresh, setTriedRefresh] = useState(false)

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
      if (isNaN(investmentValue) || investmentValue <= 0) {
        setError("Por favor, insira um valor de investimento válido.")
        setLoading(false)
        return
      }

      setTotalInvestment(investmentValue)

      // Verificar se há ativos na carteira
      if (stocksWithDetails.length === 0) {
        if (!triedRefresh) {
          setError("Você precisa atualizar sua carteira antes de usar a calculadora.")
        } else {
          setError("Você precisa adicionar ativos à sua carteira antes de usar a calculadora.")
        }
        setLoading(false)
        return
      }

      // Verificar se há ativos elegíveis para investimento
      const eligibleStocks = stocksWithDetails.filter(stock => stock.userRecommendation === "Comprar")
      if (eligibleStocks.length === 0) {
        setError("Não há ativos marcados como 'Comprar' na sua carteira. Adicione recomendações aos seus ativos.")
        setLoading(false)
        return
      }

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

        // Calcular investimentos ideais para todas as ações
        const stocksWithIdealInvestment = eligibleStocks.map((stock) => {
          // Valor alvo para esta ação na nova carteira
          const targetValue = (stock.targetPercentage / 100) * (currentTotalValue + investmentValue)

          // Investimento ideal para levar a ação à sua meta (se estiver abaixo do peso)
          const idealInvestment = stock.isEligibleForInvestment ? Math.max(0, targetValue - stock.currentValue) : 0

          return {
            ...stock,
            idealInvestment,
            targetValue,
          }
        })

        // Calcular a soma dos investimentos ideais para ações elegíveis
        const totalIdealInvestment = stocksWithIdealInvestment.reduce(
          (sum, stock) => sum + (stock.isEligibleForInvestment ? stock.idealInvestment : 0),
          0,
        )

        // Calcular as alocações finais
        const finalAllocations = stocksWithIdealInvestment.map((stock) => {
          let investmentAmount = 0

          if (stock.isEligibleForInvestment) {
            if (totalIdealInvestment <= investmentValue) {
              // Caso 1: Podemos atender todas as necessidades ideais
              // Primeiro, alocar o necessário para atingir a meta
              investmentAmount = stock.idealInvestment

              // Calcular o investimento restante após atender todas as necessidades
              const remainingInvestment = investmentValue - totalIdealInvestment

              if (remainingInvestment > 0) {
                // Distribuir o restante proporcionalmente entre todas as ações elegíveis
                // com base em seus percentuais alvo
                const totalEligibleTargetPercentage = eligibleStocks
                  .filter((s) => s.isEligibleForInvestment)
                  .reduce((sum, s) => sum + s.targetPercentage, 0)

                if (totalEligibleTargetPercentage > 0) {
                  const proportionalShare = stock.targetPercentage / totalEligibleTargetPercentage
                  investmentAmount += proportionalShare * remainingInvestment
                }
              }
            } else if (totalIdealInvestment > 0) {
              // Caso 2: Não podemos atender todas as necessidades
              // Distribuir proporcionalmente com base nas necessidades
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

        // Verificar se há algum valor não alocado devido ao arredondamento
        const totalAllocated = finalAllocations.reduce((sum, allocation) => sum + allocation.investmentAmount, 0)
        const unallocatedAmount = investmentValue - totalAllocated

        // Se houver valor não alocado significativo, tentar alocar para a ação com maior diferença para a meta
        if (unallocatedAmount > 0) {
          // Encontrar a ação elegível com maior diferença para a meta
          const eligibleAllocations = finalAllocations.filter((a) => a.isEligibleForInvestment)
          if (eligibleAllocations.length > 0) {
            // Ordenar por diferença entre percentual atual e meta (decrescente)
            eligibleAllocations.sort((a, b) => {
              const diffA = a.targetPercentage - a.currentPercentage
              const diffB = b.targetPercentage - a.currentPercentage
              return diffB - diffA
            })

            // Tentar alocar o valor restante para a primeira ação elegível
            const targetAllocation = eligibleAllocations[0]
            const index = finalAllocations.findIndex((a) => a.ticker === targetAllocation.ticker)

            if (index >= 0 && unallocatedAmount >= finalAllocations[index].currentPrice) {
              // Calcular quantas ações adicionais podemos comprar
              const additionalQuantity = Math.floor(unallocatedAmount / finalAllocations[index].currentPrice)
              const additionalInvestment = additionalQuantity * finalAllocations[index].currentPrice

              // Atualizar a alocação
              finalAllocations[index] = {
                ...finalAllocations[index],
                investmentAmount: finalAllocations[index].investmentAmount + additionalInvestment,
                quantityToAcquire: finalAllocations[index].quantityToAcquire + additionalQuantity,
                newQuantity:
                  finalAllocations[index].currentQuantity +
                  finalAllocations[index].quantityToAcquire +
                  additionalQuantity,
              }
            }
          }
        }

        setAllocations(finalAllocations)

        // Gerar recomendação de IA
        generateAiRecommendation(finalAllocations, investmentValue, currentTotalValue)
      } catch (error) {
        console.error("Erro ao calcular alocações:", error)
        setError("Não foi possível calcular as alocações. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    // Só calcular se houver ativos e não estiver carregando
    if (stocksWithDetails.length > 0 && !portfolioLoading) {
      calculateAllocations()
    }
  }, [stocksWithDetails, searchParams, router, portfolioLoading, triedRefresh])

  // Função para gerar recomendação de IA
  const generateAiRecommendation = async (
    allocations: StockAllocation[],
    investmentValue: number,
    portfolioValue: number,
  ) => {
    if (allocations.length === 0) return

    setAiLoading(true)

    try {
      // Preparar os dados para a API
      const topAllocations = allocations
        .filter((a) => a.investmentAmount > 0)
        .sort((a, b) => b.investmentAmount - a.investmentAmount)
        .slice(0, 3)

      const portfolioSize = allocations.length
      const totalInvestment = investmentValue
      const currentPortfolioValue = portfolioValue
      const percentageIncrease = (investmentValue / portfolioValue) * 100

      // Construir o prompt para a API
      const prompt = `
        Como consultor financeiro, analise este balanceamento de carteira:
        
        Valor atual da carteira: ${formatCurrency(currentPortfolioValue)}
        Valor do novo aporte: ${formatCurrency(totalInvestment)} (${percentageIncrease.toFixed(2)}% da carteira atual)
        Número de ativos na carteira: ${portfolioSize}
        
        Principais alocações recomendadas:
        ${topAllocations.map((a) => `- ${a.ticker}: ${formatCurrency(a.investmentAmount)} (${a.quantityToAcquire} ações)`).join("\n")}
        
        Forneça uma breve análise (máximo 3 frases) sobre este balanceamento, considerando a diversificação e a estratégia de investimento. Seja conciso e direto.
      `

      // Chamar a API
      const response = await fetch("/api/ai-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Falha ao gerar recomendação")
      }

      const data = await response.json()
      setAiRecommendation(data.recommendation)
    } catch (error) {
      console.error("Erro ao gerar recomendação de IA:", error)
      // Não definimos erro aqui para não afetar a experiência principal
    } finally {
      setAiLoading(false)
    }
  }

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

  // Função para forçar a atualização da carteira
  const handleRefreshPortfolio = async () => {
    setIsRefreshing(true)
    setTriedRefresh(true)
    setError(null)
    try {
      await refreshPortfolio()
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error)
      setError("Não foi possível atualizar a carteira. Por favor, tente novamente.")
    } finally {
      setIsRefreshing(false)
    }
  }

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
                  Não há ativos marcados como &quot;Comprar&quot; que estejam abaixo do peso na sua carteira. Considere alterar
                  suas recomendações ou ajustar os percentuais META.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPortfolio}
                  disabled={isRefreshing}
                  className="w-full mt-4"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar Carteira
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Resumo do Investimento</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor do Aporte</p>
                        <p className="font-medium">{formatCurrency(totalInvestment)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carteira Atual</p>
                        <p className="font-medium">{formatCurrency(totalPortfolioValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carteira Após Aporte</p>
                        <p className="font-medium">{formatCurrency(newTotalPortfolioValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ativos Elegíveis</p>
                        <p className="font-medium">
                          {allocations.filter((a) => a.isEligibleForInvestment && a.investmentAmount > 0).length} de{" "}
                          {allocations.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {aiRecommendation && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="text-blue-500 mr-2 mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                          <h3 className="font-medium text-blue-500 mb-1">Análise do Consultor</h3>
                          <p className="text-sm text-muted-foreground">{aiRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aiLoading && (
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        <p className="text-sm">Gerando análise personalizada...</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Recomendações de Compra</h3>
                    </div>
                    <div className="divide-y">
                      {allocations
                        .filter((allocation) => allocation.quantityToAcquire > 0)
                        .sort((a, b) => b.investmentAmount - a.investmentAmount)
                        .map((allocation) => (
                          <div key={allocation.ticker} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">{allocation.ticker}</div>
                              <div className="text-sm text-muted-foreground">
                                {allocation.currentPercentage.toFixed(1)}% → {allocation.targetPercentage.toFixed(1)}%
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Comprar: </span>
                                <span className="font-medium">{allocation.quantityToAcquire} ações</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Investir: </span>
                                <span className="font-medium">{formatCurrency(allocation.investmentAmount)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Preço atual: </span>
                                <span>{formatCurrency(allocation.currentPrice)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Novo total: </span>
                                <span>{allocation.newQuantity} ações</span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {allocations.filter((allocation) => allocation.quantityToAcquire > 0).length === 0 && (
                        <div className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Não há recomendações de compra para o valor informado.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => setShowTerms(true)}>Salvar Simulação</Button>
                    <Button variant="outline" onClick={handleBack}>
                      Voltar
                    </Button>
                  </div>
                </div>

                {showTerms && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-card rounded-lg max-w-md w-full p-6">
                      <h3 className="font-bold text-lg mb-2">Salvar Simulação</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta simulação será salva no seu histórico para consulta futura. Você poderá acessá-la a qualquer
                        momento na seção de histórico.
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowTerms(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAgreeTerms} disabled={savingSimulation}>
                          {savingSimulation ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
