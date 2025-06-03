"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useAuth } from "@/core/state/auth-context"
import { getUserPortfolio, updateStock, removeStock } from "@/services/firebase/firestore"
import { formatCurrency } from "@/core/utils"
import { cn } from "@/core/utils"

// Cores inspiradas no design Behance - tema dark com acentos vibrantes
const COLORS = [
  '#00D4FF', // Azul elétrico
  '#7C3AED', // Roxo vibrante  
  '#10B981', // Verde neon
  '#F59E0B', // Amarelo dourado
  '#EF4444', // Vermelho vibrante
  '#8B5CF6', // Lilás
  '#06B6D4', // Ciano
  '#F97316', // Laranja
]

interface Stock {
  ticker: string
  quantity: number
  targetPercentage: number
  userRecommendation?: "Comprar" | "Vender" | "Aguardar"
  currentPrice?: number
  currentValue?: number
  currentPercentage?: number
  dailyChange?: number
  dailyChangePercentage?: number
}

interface PortfolioSummary {
  totalValue: number
  totalAssets: number
  dailyChange: number
  dailyChangePercentage: number
  performanceToday: "up" | "down" | "neutral"
}

export default function CarteiraPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalAssets: 0,
    dailyChange: 0,
    dailyChangePercentage: 0,
    performanceToday: "neutral"
  })
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [sortBy, setSortBy] = useState<"ticker" | "value" | "percentage" | "target">("ticker")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  // Estados para formulários
  const [formData, setFormData] = useState({
    ticker: "",
    quantity: 0,
    targetPercentage: 0
  })

  // Mock data para desenvolvimento - substitua pela API real
  const mockStockPrices = {
    "RANI3": 45.20,
    "ITUB4": 28.50,
    "PETR4": 32.80,
    "VALE3": 55.90,
    "BBDC4": 22.15
  }

  useEffect(() => {
    loadPortfolio()
  }, [user])

  const loadPortfolio = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Buscar dados do portfolio do Firestore
      const portfolioData = await getUserPortfolio(user.uid)

      // Simular preços atuais (substitua pela API real)
      const stocksWithPrices: Stock[] = Object.entries(portfolioData).map(([ticker, data]) => {
        const currentPrice = mockStockPrices[ticker as keyof typeof mockStockPrices] || 50
        const currentValue = data.quantity * currentPrice
        const dailyChange = (Math.random() - 0.5) * 4 // Simular variação diária

        return {
          ticker,
          quantity: data.quantity,
          targetPercentage: data.targetPercentage,
          userRecommendation: data.userRecommendation,
          currentPrice,
          currentValue,
          dailyChange,
          dailyChangePercentage: (dailyChange / currentPrice) * 100
        }
      })

      // Calcular valor total e percentuais atuais
      const totalValue = stocksWithPrices.reduce((sum, stock) => sum + (stock.currentValue || 0), 0)

      const stocksWithPercentages = stocksWithPrices.map(stock => ({
        ...stock,
        currentPercentage: totalValue > 0 ? ((stock.currentValue || 0) / totalValue) * 100 : 0
      }))

      // Calcular resumo do portfólio
      const totalDailyChange = stocksWithPrices.reduce((sum, stock) => sum + (stock.dailyChange || 0) * stock.quantity, 0)
      const dailyChangePercentage = totalValue > 0 ? (totalDailyChange / totalValue) * 100 : 0

      setStocks(stocksWithPercentages)
      setPortfolioSummary({
        totalValue,
        totalAssets: stocksWithPercentages.length,
        dailyChange: totalDailyChange,
        dailyChangePercentage,
        performanceToday: dailyChangePercentage > 0 ? "up" : dailyChangePercentage < 0 ? "down" : "neutral"
      })

    } catch (error) {
      console.error("Erro ao carregar portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  // Funções para modais
  const openAddModal = () => {
    setFormData({ ticker: "", quantity: 0, targetPercentage: 0 })
    setIsAddModalOpen(true)
  }

  const openEditModal = (stock: Stock) => {
    setSelectedStock(stock)
    setFormData({
      ticker: stock.ticker,
      quantity: stock.quantity,
      targetPercentage: stock.targetPercentage
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (stock: Stock) => {
    setSelectedStock(stock)
    setIsDeleteModalOpen(true)
  }

  const closeModals = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedStock(null)
    setFormData({ ticker: "", quantity: 0, targetPercentage: 0 })
  }

  const handleSaveStock = async () => {
    try {
      if (!user) return

      // Validações
      if (!formData.ticker.trim()) {
        toast({
          title: "Erro",
          description: "Ticker é obrigatório",
          variant: "destructive"
        })
        return
      }

      if (formData.quantity <= 0) {
        toast({
          title: "Erro",
          description: "Quantidade deve ser maior que zero",
          variant: "destructive"
        })
        return
      }

      if (formData.targetPercentage <= 0 || formData.targetPercentage > 100) {
        toast({
          title: "Erro",
          description: "Percentual alvo deve estar entre 0 e 100",
          variant: "destructive"
        })
        return
      }

      // Salvar no Firestore
      if (isEditModalOpen) {
        await updateStock(user.uid, formData.ticker, {
          quantity: formData.quantity,
          targetPercentage: formData.targetPercentage,
          userRecommendation: "Aguardar" // Valor padrão
        })
      } else {
        await updateStock(user.uid, formData.ticker, {
          quantity: formData.quantity,
          targetPercentage: formData.targetPercentage,
          userRecommendation: "Aguardar" // Valor padrão
        })
      }

      toast({
        title: "Sucesso",
        description: isEditModalOpen ? "Ação atualizada com sucesso" : "Ação adicionada com sucesso"
      })

      closeModals()
      loadPortfolio()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar ação",
        variant: "destructive"
      })
    }
  }

  const handleDeleteStock = async () => {
    try {
      if (!user || !selectedStock) return

      // Remover do Firestore
      await removeStock(user.uid, selectedStock.ticker)

      toast({
        title: "Sucesso",
        description: "Ação removida com sucesso"
      })

      closeModals()
      loadPortfolio()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover ação",
        variant: "destructive"
      })
    }
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const filteredAndSortedStocks = stocks
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

  // Dados para o gráfico de pizza (composição atual)
  const pieData = stocks.map((stock, index) => ({
    name: stock.ticker,
    value: stock.currentPercentage || 0,
    fill: COLORS[index % COLORS.length]
  }))

  // Dados para o gráfico de barras (atual vs meta)
  const barData = stocks.map(stock => ({
    ticker: stock.ticker,
    atual: stock.currentPercentage || 0,
    meta: stock.targetPercentage,
    recomendacao: stock.userRecommendation
  }))

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Minha Carteira
            </h1>
            <p className="text-slate-400 mt-2">
              Gerencie seus investimentos e acompanhe o desempenho
            </p>
          </div>
          <Button
            onClick={loadPortfolio}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Painel de Resumo Expansível */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white">Resumo da Carteira</CardTitle>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>

          <CardContent className={cn("transition-all duration-300", !isExpanded ? "hidden" : "")}>
            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(portfolioSummary.totalValue)}
                </div>
                <div className="text-slate-400">Valor Total</div>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                <div className="text-3xl font-bold text-white">
                  {portfolioSummary.totalAssets}
                </div>
                <div className="text-slate-400">Ativos Diferentes</div>
              </div>

              <div className={cn(
                "text-center p-6 rounded-lg border",
                portfolioSummary.performanceToday === "up"
                  ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30"
                  : portfolioSummary.performanceToday === "down"
                    ? "bg-gradient-to-r from-red-600/20 to-rose-600/20 border-red-500/30"
                    : "bg-gradient-to-r from-slate-600/20 to-gray-600/20 border-slate-500/30"
              )}>
                <div className={cn(
                  "text-3xl font-bold flex items-center justify-center",
                  portfolioSummary.performanceToday === "up" ? "text-green-400" :
                    portfolioSummary.performanceToday === "down" ? "text-red-400" : "text-slate-400"
                )}>
                  {portfolioSummary.performanceToday === "up" ? <TrendingUp className="w-6 h-6 mr-2" /> :
                    portfolioSummary.performanceToday === "down" ? <TrendingDown className="w-6 h-6 mr-2" /> : null}
                  {portfolioSummary.dailyChangePercentage.toFixed(2)}%
                </div>
                <div className="text-slate-400">Hoje</div>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30">
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(portfolioSummary.dailyChange)}
                </div>
                <div className="text-slate-400">Variação (R$)</div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de Pizza - Composição Atual */}
              <div className="p-6 rounded-lg bg-slate-800/50">
                <h3 className="text-xl font-semibold text-white mb-4">Composição Atual</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Participação']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Barras - Atual vs Meta */}
              <div className="p-6 rounded-lg bg-slate-800/50">
                <h3 className="text-xl font-semibold text-white mb-4">Atual vs Meta</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="ticker" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="atual" fill="#00D4FF" name="Atual %" />
                      <Bar dataKey="meta" fill="#7C3AED" name="Meta %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ativos */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-2xl text-white">Meus Ativos</CardTitle>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar ativo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {/* Botões de ordenação */}
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "ticker" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("ticker")}
                    className="text-xs"
                  >
                    Ticker {sortBy === "ticker" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                  <Button
                    variant={sortBy === "value" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("value")}
                    className="text-xs"
                  >
                    Valor {sortBy === "value" && (sortOrder === "asc" ? "↑" : "↓")}
                  </Button>
                </div>

                <Button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ativo
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredAndSortedStocks.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum ativo encontrado</h3>
                <p className="text-slate-500 mb-6">Adicione seus primeiros ativos para começar a acompanhar seu portfólio</p>
                <Button
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Ativo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedStocks.map((stock) => (
                  <Card
                    key={stock.ticker}
                    className={cn(
                      "border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:scale-105",
                      stock.userRecommendation === "Comprar"
                        ? "border-green-500/50 from-green-900/20 to-emerald-900/20 shadow-green-500/20 shadow-lg"
                        : "border-slate-700 from-slate-800/50 to-slate-900/50"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">{stock.ticker}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                stock.userRecommendation === "Comprar" ? "default" :
                                  stock.userRecommendation === "Vender" ? "destructive" : "secondary"
                              }
                              className="text-xs"
                            >
                              {stock.userRecommendation || "Aguardar"}
                            </Badge>
                            {stock.dailyChangePercentage && (
                              <span className={cn(
                                "text-sm font-medium",
                                stock.dailyChangePercentage > 0 ? "text-green-400" : "text-red-400"
                              )}>
                                {stock.dailyChangePercentage > 0 ? "+" : ""}{stock.dailyChangePercentage.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(stock)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteModal(stock)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Quantidade</div>
                          <div className="text-white font-semibold">{stock.quantity}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Preço Atual</div>
                          <div className="text-white font-semibold">
                            {formatCurrency(stock.currentPrice || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Valor Total</div>
                          <div className="text-white font-semibold">
                            {formatCurrency(stock.currentValue || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Variação</div>
                          <div className={cn(
                            "font-semibold",
                            (stock.dailyChange || 0) > 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {formatCurrency(stock.dailyChange || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Barras de progresso para atual vs meta */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Atual: {(stock.currentPercentage || 0).toFixed(1)}%</span>
                          <span className="text-slate-400">Meta: {stock.targetPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((stock.currentPercentage || 0), 100)}%` }}
                          />
                          <div
                            className="absolute top-0 h-full w-0.5 bg-white/60"
                            style={{ left: `${Math.min(stock.targetPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Adicionar/Editar Ação */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={closeModals}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isEditModalOpen ? "Editar Ação" : "Adicionar Nova Ação"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ticker" className="text-slate-300">Ticker da Ação</Label>
              <Input
                id="ticker"
                value={formData.ticker}
                onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                placeholder="Ex: PETR4"
                className="bg-slate-800 border-slate-600 text-white"
                disabled={isEditModalOpen} // Não permitir editar ticker
              />
            </div>

            <div>
              <Label htmlFor="quantity" className="text-slate-300">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                placeholder="Ex: 100"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="targetPercentage" className="text-slate-300">Percentual Alvo (%)</Label>
              <Input
                id="targetPercentage"
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={formData.targetPercentage || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, targetPercentage: parseFloat(e.target.value) || 0 }))}
                placeholder="Ex: 25.5"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModals} className="border-slate-600 text-slate-300">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveStock}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isEditModalOpen ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={closeModals}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-slate-300">
              Tem certeza que deseja remover a ação <strong className="text-white">{selectedStock?.ticker}</strong> da sua carteira?
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Esta ação não poderá ser desfeita.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModals} className="border-slate-600 text-slate-300">
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteStock}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
