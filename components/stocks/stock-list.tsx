"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, ArrowUpDown, Trash2 } from "lucide-react"
import { AddStockForm } from "@/components/add-stock-form"
import { usePortfolio } from "@/hooks/use-portfolio"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function StockList() {
  const { 
    stocksWithDetails, 
    loading, 
    isRefreshing, 
    refreshPortfolio, 
    removeStockFromPortfolio,
    hasPendingOperations
  } = usePortfolio()
  
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"ticker" | "value" | "percentage">("ticker")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [deletingStock, setDeletingStock] = useState<string | null>(null)

  // Ordenar a lista de ativos
  const sortedStocks = [...stocksWithDetails].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case "ticker":
        comparison = a.ticker.localeCompare(b.ticker)
        break
      case "value":
        comparison = a.currentValue - b.currentValue
        break
      case "percentage":
        comparison = a.currentPercentage - b.currentPercentage
        break
    }
    
    return sortDirection === "asc" ? comparison : -comparison
  })

  // Alternar ordenação
  const toggleSort = (newSortBy: "ticker" | "value" | "percentage") => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }

  // Remover ativo
  const handleRemoveStock = async (ticker: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${ticker} da sua carteira?`)) {
      try {
        setDeletingStock(ticker)
        await removeStockFromPortfolio(ticker)
      } catch (error) {
        console.error(`Erro ao remover ${ticker}:`, error)
        toast.error(`Erro ao remover ${ticker}`, {
          description: "Não foi possível remover o ativo. Tente novamente mais tarde."
        })
      } finally {
        setDeletingStock(null)
      }
    }
  }

  // Renderizar estado vazio
  const renderEmptyState = () => (
    <div className="text-center py-10">
      <p className="text-muted-foreground mb-4">Você ainda não possui ações na sua carteira.</p>
      <Button onClick={() => setIsAddStockOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Ativo
      </Button>
    </div>
  )

  // Renderizar esqueleto de carregamento
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-2 border rounded-md">
          <Skeleton className="h-6 w-16" />
          <div className="flex space-x-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Meus Ativos</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              title="Atualizar carteira"
              onClick={refreshPortfolio}
              disabled={isRefreshing || loading || hasPendingOperations}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => toggleSort("ticker")} variant="outline" size="sm">
              Ticker {sortBy === "ticker" && (sortDirection === "asc" ? "↑" : "↓")}
            </Button>
            <Button onClick={() => setIsAddStockOpen(true)} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Ativo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {loading 
              ? "Carregando ativos..." 
              : `${stocksWithDetails.length} ${stocksWithDetails.length === 1 ? 'ativo' : 'ativos'} em sua carteira`
            }
          </p>
          
          {loading ? (
            renderLoadingSkeleton()
          ) : stocksWithDetails.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-2">
              {sortedStocks.map((stock) => (
                <div 
                  key={stock.ticker} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{stock.ticker}</span>
                    <span className="text-xs text-muted-foreground">
                      {stock.quantity} {stock.quantity === 1 ? 'unidade' : 'unidades'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(stock.currentValue)}</div>
                      <div className="text-xs text-muted-foreground">
                        Meta: {stock.targetPercentage.toFixed(1)}% | 
                        Atual: {stock.currentPercentage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveStock(stock.ticker)}
                      disabled={deletingStock === stock.ticker || hasPendingOperations}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AddStockForm 
        isOpen={isAddStockOpen} 
        onClose={() => setIsAddStockOpen(false)} 
      />
    </>
  )
}
