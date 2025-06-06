"use client"

import { useState } from "react"
import { Plus, Search, ChevronUp, ChevronDown, Edit, Trash2, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/core/utils"
import { StockWithDetails } from "@/core/types"
import { usePortfolio } from "@/core/state/portfolio-context"

interface ListaAtivosProps {
  onAddStock: () => void
  onEditStock: (stock: StockWithDetails) => void
  onDeleteStock: (stock: StockWithDetails) => void
}

export function ListaAtivos({ 
  onAddStock, 
  onEditStock, 
  onDeleteStock 
}: ListaAtivosProps) {
  const { stocksWithDetails } = usePortfolio()
  // Estados locais para controle da lista
  const [sortBy, setSortBy] = useState<"ticker" | "value" | "percentage" | "target">("ticker")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const filteredAndSortedStocks = stocksWithDetails
    .filter(stock =>
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valueA: number, valueB: number

      switch (sortBy) {
        case "ticker":
          return sortOrder === "asc"
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker)
        case "value":
          valueA = a.currentValue || 0
          valueB = b.currentValue || 0
          break
        case "percentage":
          valueA = a.currentPercentage || 0
          valueB = b.currentPercentage || 0
          break
        case "target":
          valueA = a.targetPercentage
          valueB = b.targetPercentage
          break
        default:
          return 0
      }

      return sortOrder === "asc" ? valueA - valueB : valueB - valueA
    })

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-white">Meus Ativos</CardTitle>
          <Button
            onClick={onAddStock}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Ativo
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Barra de pesquisa e filtros */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por ticker..."
            className="pl-10 bg-slate-800 border-slate-700 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-5 gap-4 mb-4 px-4 py-2 bg-slate-800 rounded-lg">
          <button
            className="flex items-center text-slate-300 hover:text-white"
            onClick={() => handleSort("ticker")}
          >
            Ticker
            {sortBy === "ticker" && (
              sortOrder === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          <button
            className="flex items-center text-slate-300 hover:text-white"
            onClick={() => handleSort("value")}
          >
            Valor
            {sortBy === "value" && (
              sortOrder === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          <button
            className="flex items-center text-slate-300 hover:text-white"
            onClick={() => handleSort("percentage")}
          >
            % Atual
            {sortBy === "percentage" && (
              sortOrder === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          <button
            className="flex items-center text-slate-300 hover:text-white"
            onClick={() => handleSort("target")}
          >
            % Meta
            {sortBy === "target" && (
              sortOrder === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          <div className="text-slate-300">Ações</div>
        </div>

        {/* Lista de ativos */}
        {filteredAndSortedStocks.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Nenhum ativo encontrado</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? "Nenhum resultado para sua busca" : "Adicione seu primeiro ativo para começar"}
            </p>
            <Button onClick={onAddStock}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ativo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedStocks.map((stock) => (
              <div
                key={stock.ticker}
                className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono font-bold">
                    {stock.ticker}
                  </Badge>
                  <span className="ml-2 text-slate-400">
                    {stock.quantity} ações
                  </span>
                </div>
                <div className="text-white">
                  {formatCurrency(stock.currentValue || 0)}
                </div>
                <div className="text-white">
                  {(stock.currentPercentage || 0).toFixed(2)}%
                </div>
                <div className="text-white">
                  {stock.targetPercentage.toFixed(2)}%
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditStock(stock)}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteStock(stock)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
