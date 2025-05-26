"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePortfolio } from "@/hooks/use-portfolio"
import { Skeleton } from "@/components/ui/skeleton"

export function PortfolioSummary() {
  const { 
    totalPortfolioValue, 
    stocksWithDetails, 
    loading, 
    lastUpdated, 
    isRefreshing, 
    refreshPortfolio 
  } = usePortfolio()
  
  // Formatar a data da última atualização
  const formattedLastUpdate = lastUpdated 
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(lastUpdated)
    : 'Nunca'

  // Simular variação diária (em produção seria calculado com dados reais)
  const dailyChange = totalPortfolioValue * (Math.random() * 0.06 - 0.03) // Entre -3% e +3%
  const dailyChangePercentage = totalPortfolioValue > 0 ? (dailyChange / totalPortfolioValue) * 100 : 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Resumo da Carteira</CardTitle>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Atualizado: {formattedLastUpdate}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            title="Atualizar carteira"
            onClick={refreshPortfolio}
            disabled={isRefreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Visão geral dos seus investimentos</p>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Valor Total */}
          <div>
            <p className="text-sm font-medium">Valor Total</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <p className="text-2xl font-bold">
                {formatCurrency(totalPortfolioValue)}
              </p>
            )}
          </div>
          
          {/* Ativos */}
          <div>
            <p className="text-sm font-medium">Ativos</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">
                {stocksWithDetails.length}
              </p>
            )}
          </div>
          
          {/* Variação Hoje */}
          <div>
            <p className="text-sm font-medium">Variação Hoje</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <p className={`text-2xl font-bold flex items-center ${dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(dailyChange)}
                <span className="text-sm ml-1">
                  {dailyChange >= 0 ? '↑' : '↓'} {Math.abs(dailyChangePercentage).toFixed(2)}%
                </span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
