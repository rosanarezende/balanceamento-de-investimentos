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
import { AppShellEnhanced } from "@/components/layout/app-shell-enhanced"
import AuthGuard from "@/components/auth-guard"

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
      <AuthGuard>
        <AppShellEnhanced>
          <div className="container mx-auto p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </AppShellEnhanced>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AppShellEnhanced>
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
                          formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                        />
                        <Legend />
                        <Bar dataKey="atual" name="% Atual" fill="#00D4FF" />
                        <Bar dataKey="meta" name="% Meta" fill="#7C3AED" />
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white">Meus Ativos</CardTitle>
                <Button
                  onClick={openAddModal}
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
                  <Button onClick={openAddModal}>
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
                          onClick={() => openEditModal(stock)}
                          className="text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteModal(stock)}
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

          {/* Modal de Adicionar Ativo */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Ativo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticker" className="text-slate-300">Ticker</Label>
                  <Input
                    id="ticker"
                    placeholder="Ex: PETR4"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-slate-300">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="targetPercentage" className="text-slate-300">Percentual Alvo (%)</Label>
                  <Input
                    id="targetPercentage"
                    type="number"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={formData.targetPercentage || ""}
                    onChange={(e) => setFormData({ ...formData, targetPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModals}>Cancelar</Button>
                <Button onClick={handleSaveStock}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Editar Ativo */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Editar Ativo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-ticker" className="text-slate-300">Ticker</Label>
                  <Input
                    id="edit-ticker"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={formData.ticker}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="edit-quantity" className="text-slate-300">Quantidade</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-targetPercentage" className="text-slate-300">Percentual Alvo (%)</Label>
                  <Input
                    id="edit-targetPercentage"
                    type="number"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={formData.targetPercentage || ""}
                    onChange={(e) => setFormData({ ...formData, targetPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModals}>Cancelar</Button>
                <Button onClick={handleSaveStock}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Excluir Ativo */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Excluir Ativo</DialogTitle>
              </DialogHeader>
              <p className="text-slate-300">
                Tem certeza que deseja excluir o ativo <span className="font-bold text-white">{selectedStock?.ticker}</span>?
                Esta ação não pode ser desfeita.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={closeModals}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteStock}>Excluir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShellEnhanced>
    </AuthGuard>
  )
}
