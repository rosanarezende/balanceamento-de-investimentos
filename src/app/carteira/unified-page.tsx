"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart2
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useAuth } from "@/core/state/auth-context"
import { getUserPortfolio, updateStock, removeStock } from "@/services/firebase/firestore"
import { formatCurrency } from "@/core/utils"
import { cn } from "@/core/utils"
import { AppShellEnhanced } from "@/components/layout/app-shell-enhanced"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { PortfolioComparisonChart } from "@/components/dashboard/portfolio-comparison-chart"

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

export default function UnifiedCarteiraPage() {
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
  const [activeTab, setActiveTab] = useState("resumo")
  const [chartType, setChartType] = useState<"pie" | "comparison">("pie")

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu portfólio",
        variant: "destructive"
      })
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
    )
  }

  return (
    <AppShellEnhanced>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Minha Carteira
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus investimentos e acompanhe o desempenho
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadPortfolio}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              onClick={openAddModal}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ativo
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumo" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
          </TabsList>
          
          {/* Tab de Resumo */}
          <TabsContent value="resumo" className="space-y-6 pt-4">
            {/* Métricas principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(portfolioSummary.totalValue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Ativos Diferentes</div>
                  <div className="text-2xl font-bold">
                    {portfolioSummary.totalAssets}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Variação Hoje</div>
                  <div className={cn(
                    "text-2xl font-bold flex items-center",
                    portfolioSummary.performanceToday === "up" ? "text-green-500" :
                      portfolioSummary.performanceToday === "down" ? "text-red-500" : ""
                  )}>
                    {portfolioSummary.performanceToday === "up" ? <TrendingUp className="w-5 h-5 mr-1" /> :
                      portfolioSummary.performanceToday === "down" ? <TrendingDown className="w-5 h-5 mr-1" /> : null}
                    {portfolioSummary.dailyChangePercentage.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-1">Variação (R$)</div>
                  <div className={cn(
                    "text-2xl font-bold",
                    portfolioSummary.performanceToday === "up" ? "text-green-500" :
                      portfolioSummary.performanceToday === "down" ? "text-red-500" : ""
                  )}>
                    {formatCurrency(portfolioSummary.dailyChange)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seletor de gráficos */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  className="rounded-r-none"
                  onClick={() => setChartType("pie")}
                >
                  <PieChartIcon className="h-4 w-4 mr-2" />
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

            {/* Gráficos */}
            <div className="min-h-[400px]">
              {stocks.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground mb-4">Você ainda não possui ações na sua carteira.</p>
                  <Button onClick={openAddModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Ações
                  </Button>
                </div>
              ) : chartType === "pie" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Composição Atual da Carteira</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <PortfolioChart 
                      data={stocks} 
                      totalValue={typeof portfolioSummary.totalValue === 'number' && !isNaN(portfolioSummary.totalValue) ? portfolioSummary.totalValue : 0} 
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação: Atual vs Meta</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <PortfolioComparisonChart data={stocks} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Tab de Ativos */}
          <TabsContent value="ativos" className="space-y-4 pt-4">
            {/* Barra de pesquisa */}
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ativo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Tabela de ativos */}
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th 
                        className="px-4 py-3 text-left font-medium cursor-pointer"
                        onClick={() => handleSort("ticker")}
                      >
                        <div className="flex items-center">
                          Ticker
                          {sortBy === "ticker" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-medium cursor-pointer"
                        onClick={() => handleSort("value")}
                      >
                        <div className="flex items-center justify-end">
                          Valor
                          {sortBy === "value" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-medium cursor-pointer"
                        onClick={() => handleSort("percentage")}
                      >
                        <div className="flex items-center justify-end">
                          Atual %
                          {sortBy === "percentage" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-right font-medium cursor-pointer"
                        onClick={() => handleSort("target")}
                      >
                        <div className="flex items-center justify-end">
                          Meta %
                          {sortBy === "target" && (
                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedStocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          {searchTerm ? "Nenhum ativo encontrado com esse termo" : "Nenhum ativo cadastrado"}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedStocks.map((stock) => (
                        <tr key={stock.ticker} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{stock.ticker}</td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(stock.currentValue || 0)}
                            <div className="text-xs text-muted-foreground">
                              {stock.quantity} x {formatCurrency(stock.currentPrice || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {stock.currentPercentage?.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            {stock.targetPercentage.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(stock)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteModal(stock)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Adicionar Ativo */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Ativo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  placeholder="Ex: PETR4"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetPercentage">Percentual Alvo (%)</Label>
                <Input
                  id="targetPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
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

        {/* Modal de Editar Ativo */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Ativo: {selectedStock?.ticker}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantidade</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-targetPercentage">Percentual Alvo (%)</Label>
                <Input
                  id="edit-targetPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Ativo</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir o ativo <strong>{selectedStock?.ticker}</strong>?</p>
              <p className="text-sm text-muted-foreground mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeModals}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteStock}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShellEnhanced>
  )
}

// Componente ErrorBoundary para capturar erros em componentes filhos
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro em componente filho:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
