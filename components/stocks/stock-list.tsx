"use client"

import { useState, useEffect } from "react"
import { StockCard } from "@/components/stocks/stock-card"
import { StockEditModal, type StockEditData } from "@/components/stocks/stock-edit-modal"
import { StockDeleteModal } from "@/components/stocks/stock-delete-modal"
import { SectionTitle } from "@/components/ui/section-title"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Plus, ArrowUpDown, RefreshCw } from "lucide-react"
import { usePortfolio } from "@/hooks/use-portfolio"
import { LoadingState } from "@/components/ui/loading-state"
import type { StockWithDetails } from "@/hooks/use-portfolio"

type SortOption =
  | "ticker-asc"
  | "ticker-desc"
  | "value-asc"
  | "value-desc"
  | "current-asc"
  | "current-desc"
  | "target-asc"
  | "target-desc"
  | "recommendation"

export function StockList() {
  const { stocksWithDetails, loading, error, addOrUpdateStock, removeStockFromPortfolio, refreshPortfolio, hasEligibleStocks } = usePortfolio()

  const [sortedStocks, setSortedStocks] = useState<StockWithDetails[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("ticker-asc")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockWithDetails | null>(null)
  const [isNewStock, setIsNewStock] = useState(false)
  const [stocksWithDailyChange, setStocksWithDailyChange] = useState<StockWithDetails[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Gere os valores aleatórios apenas uma vez, quando stocksWithDetails mudar
  useEffect(() => {
    const generated = stocksWithDetails.map((stock) => ({
      ...stock,
      dailyChange: (Math.random() * 2 - 1) * stock.currentValue * 0.05, // -5% a +5%
      dailyChangePercentage: Math.random() * 10 - 5, // -5% a +5%
    }))
    setStocksWithDailyChange(generated)
  }, [stocksWithDetails])

  // Ordenar os ativos quando a opção de ordenação ou os dados mudam
  useEffect(() => {
    if (stocksWithDailyChange.length === 0) {
      setSortedStocks([])
      return
    }

    const sorted = [...stocksWithDailyChange]

    switch (sortOption) {
      case "ticker-asc":
        sorted.sort((a, b) => a.ticker.localeCompare(b.ticker))
        break
      case "ticker-desc":
        sorted.sort((a, b) => b.ticker.localeCompare(a.ticker))
        break
      case "value-asc":
        sorted.sort((a, b) => a.currentValue - b.currentValue)
        break
      case "value-desc":
        sorted.sort((a, b) => b.currentValue - a.currentValue)
        break
      case "current-asc":
        sorted.sort((a, b) => a.currentPercentage - b.currentPercentage)
        break
      case "current-desc":
        sorted.sort((a, b) => b.currentPercentage - a.currentPercentage)
        break
      case "target-asc":
        sorted.sort((a, b) => a.targetPercentage - b.targetPercentage)
        break
      case "target-desc":
        sorted.sort((a, b) => b.targetPercentage - a.targetPercentage)
        break
      case "recommendation":
        // Ordenar por recomendação: Comprar, Aguardar, Vender
        sorted.sort((a, b) => {
          const order = { Comprar: 0, Aguardar: 1, Vender: 2 }
          return order[a.userRecommendation as keyof typeof order] - order[b.userRecommendation as keyof typeof order]
        })
        break
    }

    setSortedStocks(sorted)
  }, [sortOption, stocksWithDailyChange])

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption)
  }

  const handleAddStock = () => {
    setSelectedStock(null)
    setIsNewStock(true)
    setEditModalOpen(true)
  }

  const handleEditStock = (stock: StockWithDetails) => {
    setSelectedStock(stock)
    setIsNewStock(false)
    setEditModalOpen(true)
  }

  const handleDeleteStock = (stock: StockWithDetails) => {
    setSelectedStock(stock)
    setDeleteModalOpen(true)
  }

  const handleSaveStock = async (data: StockEditData) => {
    await addOrUpdateStock(data.ticker, data.quantity, data.targetPercentage, data.userRecommendation)
  }

  const handleConfirmDelete = async () => {
    if (selectedStock) {
      await removeStockFromPortfolio(selectedStock.ticker)
    }
  }

  // Função para forçar a atualização da carteira
  const handleRefreshPortfolio = async () => {
    setIsRefreshing(true)
    try {
      await refreshPortfolio()
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // P0149: Add useEffect to refresh portfolio on component mount
  useEffect(() => {
    refreshPortfolio()
  }, [refreshPortfolio])

  console.log({ sortedStocks })

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <SectionTitle
          title="Meus Ativos"
          subtitle={`${sortedStocks.length} ativos em sua carteira`}
          icon={<Briefcase size={20} />}
        />

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-text-tertiary" />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] bg-background-tertiary border-border-secondary">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary border-border-primary">
                <SelectItem value="ticker-asc">Ticker (A-Z)</SelectItem>
                <SelectItem value="ticker-desc">Ticker (Z-A)</SelectItem>
                <SelectItem value="value-asc">Menor Valor</SelectItem>
                <SelectItem value="value-desc">Maior Valor</SelectItem>
                <SelectItem value="current-asc">Menor % Atual</SelectItem>
                <SelectItem value="current-desc">Maior % Atual</SelectItem>
                <SelectItem value="target-asc">Menor % Meta</SelectItem>
                <SelectItem value="target-desc">Maior % Meta</SelectItem>
                <SelectItem value="recommendation">Recomendação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddStock} className="btn-primary">
            <Plus size={16} className="mr-2" />
            Adicionar Ativo
          </Button>

          {/* Botão para atualizar a carteira manualmente */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshPortfolio} 
            disabled={isRefreshing}
            title="Atualizar carteira"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Carregando seus ativos..." />
      ) : error ? (
        <div className="p-4 rounded-lg bg-state-error/10 border border-state-error/20 text-state-error">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      ) : sortedStocks.length === 0 ? (
        <div className="text-center py-12 bg-background-tertiary rounded-lg">
          <p className="text-text-secondary mb-4">Você ainda não possui ações na sua carteira.</p>
          <Button onClick={handleAddStock} className="btn-primary">
            <Plus size={16} className="mr-2" />
            Adicionar Ativo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedStocks.map((stock) => {
            if (typeof stock.currentValue !== "number" || stock.currentValue <= 0) {
              console.error(`Invalid currentValue for stock ${stock.ticker}: ${stock.currentValue}`)
              return null
            }

            return (
              <StockCard
                key={stock.ticker}
                ticker={stock.ticker}
                quantity={stock.quantity}
                currentValue={stock.currentValue}
                currentPercentage={stock.currentPercentage}
                targetPercentage={stock.targetPercentage}
                toBuy={stock.toBuy}
                excess={stock.excess}
                currentPrice={stock.currentPrice}
                dailyChange={(stock as any).dailyChange}
                dailyChangePercentage={(stock as any).dailyChangePercentage}
                userRecommendation={stock.userRecommendation}
                onEdit={() => handleEditStock(stock)}
                onDelete={() => handleDeleteStock(stock)}
                loading={loading}
              />
            )
          })}
        </div>
      )}

      {/* Modais */}
      <StockEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveStock}
        stock={selectedStock}
        isNew={isNewStock}
      />

      <StockDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        ticker={selectedStock?.ticker || ""}
      />
    </div>
  )
}
