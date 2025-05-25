"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { StockList } from "@/components/stocks/stock-list"
import { usePortfolio } from "@/hooks/use-portfolio"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"

export default function HomePage() {
  const { stocksWithDetails, totalPortfolioValue, loading } = usePortfolio()
  const [dailyChange, setDailyChange] = useState(0)
  const [dailyChangePercentage, setDailyChangePercentage] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simular variação diária
  useEffect(() => {
    try {
      if (typeof totalPortfolioValue !== "number" || totalPortfolioValue <= 0) {
        console.error("Invalid totalPortfolioValue:", totalPortfolioValue)
        return
      }

      if (!loading) {
        // Simular uma variação entre -3% e +3%
        const changePercentage = Math.random() * 6 - 3
        const change = totalPortfolioValue * (changePercentage / 100)

        setDailyChange(change)
        setDailyChangePercentage(changePercentage)
      }
    } catch (error) {
      console.error("Error in daily change simulation:", error)
    }
  }, [totalPortfolioValue, loading])

  // Gerar insights com base nos dados da carteira
  const generateInsights = () => {
    try {
      if (stocksWithDetails.length === 0) {
        return [
          {
            id: "no-stocks",
            message: "Você não possui ações na sua carteira. Adicione ativos para começar.",
            type: "info" as const,
          },
        ]
      }

      const insights = []

      // Verificar se há ativos acima da meta
      const aboveTargetStocks = stocksWithDetails.filter((stock) => stock.currentPercentage > stock.targetPercentage)

      if (aboveTargetStocks.length > 0) {
        const topExcess = aboveTargetStocks.sort(
          (a, b) => b.currentPercentage - b.targetPercentage - (a.currentPercentage - a.targetPercentage),
        )[0]

        insights.push({
          id: "excess-1",
          message: `O ativo ${topExcess.ticker} está ${(topExcess.currentPercentage - topExcess.targetPercentage).toFixed(2)}% acima da meta. Considere focar aportes em outros ativos.`,
          type: "warning" as const,
        })
      }

      // Verificar se há ativos com recomendação "Comprar" abaixo da meta
      const buyBelowTarget = stocksWithDetails.filter(
        (stock) => stock.userRecommendation === "Comprar" && stock.currentPercentage < stock.targetPercentage,
      )

      if (buyBelowTarget.length > 0) {
        insights.push({
          id: "buy-below-1",
          message: `${buyBelowTarget.length} ${buyBelowTarget.length === 1 ? "ativo" : "ativos"} com recomendação "Comprar" ${buyBelowTarget.length === 1 ? "está" : "estão"} abaixo da meta. Bom foco para aportes!`,
          type: "info" as const,
        })
      }

      // Verificar se a soma das metas é 100%
      const totalTargetPercentage = stocksWithDetails.reduce((sum, stock) => sum + stock.targetPercentage, 0)

      if (Math.abs(totalTargetPercentage - 100) > 1) {
        insights.push({
          id: "target-sum",
          message: `A soma das suas metas é ${totalTargetPercentage.toFixed(2)}%. Ajuste para 100% para um balanceamento ideal.`,
          type: "warning" as const,
        })
      }

      // Verificar se há ativos com recomendação "Vender"
      const sellRecommendations = stocksWithDetails.filter((stock) => stock.userRecommendation === "Vender")

      if (sellRecommendations.length > 0) {
        insights.push({
          id: "sell-rec",
          message: `Você tem ${sellRecommendations.length} ${sellRecommendations.length === 1 ? "ativo" : "ativos"} com recomendação "Vender". Considere reavaliar estas posições.`,
          type: "warning" as const,
        })
      }

      return insights
    } catch (error) {
      console.error("Error generating insights:", error)
      return []
    }
  }

  // Evitar renderização no servidor para prevenir erros de hidratação
  if (!mounted) {
    return null
  }

  return (
    <AuthGuard>
      <AppShell>
        <PortfolioSummary
          totalValue={totalPortfolioValue}
          stocksCount={stocksWithDetails.length}
          dailyChange={dailyChange}
          dailyChangePercentage={dailyChangePercentage}
          stocksData={stocksWithDetails}
        />

        {/* Só mostra os insights quando não está carregando */}
        {!loading && <InsightsPanel insights={generateInsights()} />}

        <StockList />

        <div className="mt-4">
          <Link href="/editar-ativos">
            <Button className="w-full" size="lg">
              Acessar Edição de Ativos
            </Button>
          </Link>
        </div>
      </AppShell>
    </AuthGuard>
  )
}
