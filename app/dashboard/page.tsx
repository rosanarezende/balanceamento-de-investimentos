"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BarChart2, PieChart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePortfolio } from "@/hooks/use-portfolio"
import { PortfolioChart } from "@/components/portfolio-chart"
import { PortfolioComparisonChart } from "@/components/portfolio-comparison-chart"
import AuthGuard from "@/components/auth-guard"
import { AppShell } from "@/components/layout/app-shell"

export default function Dashboard() {
  const router = useRouter()
  const { stocksWithDetails, loading, error, totalPortfolioValue } = usePortfolio()
  const [chartType, setChartType] = useState<"pie" | "comparison">("pie")

  const handleBack = () => {
    router.push("/")
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="container max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="w-10"></div> {/* Espaçador para centralizar o título */}
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-2">Resumo da Carteira</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantidade de Ativos</p>
                  <p className="text-xl font-bold">{stocksWithDetails.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                className="rounded-r-none"
                onClick={() => setChartType("pie")}
              >
                <PieChart className="h-4 w-4 mr-2" />
                Composição
              </Button>
              <Button
                variant={chartType === "comparison" ? "default" : "outline"}
                className="rounded-l-none"
                onClick={() => setChartType("comparison")}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Comparação
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</p>
            </div>
          ) : stocksWithDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Você ainda não possui ações na sua carteira.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Adicionar Ações
              </Button>
            </div>
          ) : chartType === "pie" ? (
            <PortfolioChart data={stocksWithDetails} totalValue={totalPortfolioValue} />
          ) : (
            <PortfolioComparisonChart data={stocksWithDetails} />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  )
}
