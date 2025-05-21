"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserPortfolio, updateStock, removeStock, updateUserRecommendation, type Portfolio } from "@/lib/firestore"
import { fetchStockPrice } from "@/lib/api"

export interface StockWithDetails {
  ticker: string
  quantity: number
  targetPercentage: number
  userRecommendation: string
  currentPrice: number
  currentValue: number
  currentPercentage: number
  toBuy: number
  excess: number
}

export function usePortfolio() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<Portfolio>({})
  const [stocksWithDetails, setStocksWithDetails] = useState<StockWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)  // Novo estado para controlar atualizações

  // Adicionar persistência local como backup
  useEffect(() => {
    // Quando o portfolio for carregado do Firestore, salvar no localStorage
    if (Object.keys(portfolio).length > 0) {
      localStorage.setItem('userPortfolio', JSON.stringify(portfolio))
    }
  }, [portfolio])

  // Carregar a carteira do usuário
  useEffect(() => {
    let isMounted = true

    async function loadPortfolio() {
      if (!user) {
        if (isMounted) {
          setLoading(false)
          setPortfolio({})
        }
        return
      }

      if (isMounted) {
        setLoading(true)
        setError(null)
      }

      try {
        // Tentar carregar do localStorage primeiro para feedback imediato
        const cachedPortfolio = localStorage.getItem('userPortfolio')
        if (cachedPortfolio && isMounted) {
          setPortfolio(JSON.parse(cachedPortfolio))
        }

        // Então carregar do Firestore (dados mais atualizados)
        const userPortfolio = await getUserPortfolio(user.uid)
        if (isMounted) {
          setPortfolio(userPortfolio || {})
          // Atualizar o cache
          localStorage.setItem('userPortfolio', JSON.stringify(userPortfolio))
        }
      } catch (error) {
        console.error("Erro ao carregar carteira:", error)
        if (isMounted) {
          setError("Não foi possível carregar sua carteira. Por favor, tente novamente.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPortfolio()

    return () => {
      isMounted = false
    }
  }, [user])

  // Calcular detalhes da carteira quando o portfolio mudar
  useEffect(() => {
    let isMounted = true

    async function calculatePortfolioDetails() {
      if (!user || Object.keys(portfolio).length === 0) {
        if (isMounted) {
          setStocksWithDetails([])
          setTotalPortfolioValue(0)
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLoading(true)
        setError(null)
      }

      try {
        // Buscar preços atuais para todas as ações
        const stockPrices: Record<string, number> = {}
        const failedStocks: string[] = []

        // Buscar preços em paralelo para melhorar performance
        const pricePromises = Object.keys(portfolio).map(async (ticker) => {
          try {
            const price = await fetchStockPrice(ticker)
            return { ticker, price }
          } catch (err) {
            console.error(`Erro ao buscar preço para ${ticker}:`, err)
            failedStocks.push(ticker)
            return { ticker, price: 0 }
          }
        })

        // Aguardar todas as requisições de preço
        const priceResults = await Promise.all(pricePromises)

        // Preencher o objeto de preços
        priceResults.forEach(({ ticker, price }) => {
          stockPrices[ticker] = price
        })

        // Se alguma ação falhou, mostrar aviso mas continuar
        if (failedStocks.length > 0) {
          console.warn(`Não foi possível obter preços para: ${failedStocks.join(", ")}`)
        }

        // Calcular o valor total da carteira
        const totalValue = Object.entries(portfolio).reduce((total, [ticker, stock]) => {
          const price = stockPrices[ticker] || 0
          return total + stock.quantity * price
        }, 0)

        // Calcular informações detalhadas para cada ação
        const detailedStocks = Object.entries(portfolio).map(([ticker, stock]) => {
          const currentPrice = stockPrices[ticker] || 0
          const currentValue = stock.quantity * currentPrice
          const currentPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0
          const targetValue = (stock.targetPercentage / 100) * totalValue
          const toBuy = Math.max(0, targetValue - currentValue)
          const excess = Math.max(0, currentValue - targetValue)

          return {
            ticker,
            quantity: stock.quantity,
            targetPercentage: stock.targetPercentage,
            userRecommendation: stock.userRecommendation || "Comprar",
            currentPrice,
            currentValue,
            currentPercentage,
            toBuy,
            excess,
          }
        })

        if (isMounted) {
          setTotalPortfolioValue(totalValue)
          setStocksWithDetails(detailedStocks)
        }
      } catch (error) {
        console.error("Erro ao calcular detalhes da carteira:", error)
        if (isMounted) {
          setError("Não foi possível calcular os detalhes da sua carteira. Por favor, tente novamente.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    calculatePortfolioDetails()

    return () => {
      isMounted = false
    }
  }, [portfolio, user])

  // Adicionar ou atualizar uma ação
  const addOrUpdateStock = useCallback(
    async (ticker: string, quantity: number, targetPercentage: number, userRecommendation = "Comprar") => {
      if (!user) return

      try {
        // Atualizar no Firestore
        await updateStock(user.uid, ticker, {
          quantity,
          targetPercentage,
          userRecommendation,
        })

        // Atualizar o estado local
        setPortfolio((prev) => ({
          ...prev,
          [ticker]: {
            quantity,
            targetPercentage,
            userRecommendation,
          },
        }))
        
        // Aguardar o próximo ciclo de renderização
        await new Promise(resolve => setTimeout(resolve, 50))
        
        return true
      } catch (error) {
        console.error(`Erro ao adicionar/atualizar ação ${ticker}:`, error)
        throw error
      }
    },
    [user],
  )

  // Remover uma ação
  const removeStockFromPortfolio = useCallback(
    async (ticker: string) => {
      if (!user) return

      try {
        await removeStock(user.uid, ticker)

        // Atualizar o estado local
        setPortfolio((prev) => {
          const newPortfolio = { ...prev }
          delete newPortfolio[ticker]
          return newPortfolio
        })
      } catch (error) {
        console.error(`Erro ao remover ação ${ticker}:`, error)
        throw error
      }
    },
    [user],
  )

  // Atualizar a recomendação do usuário
  const updateRecommendation = useCallback(
    async (ticker: string, recommendation: string) => {
      if (!user) return

      try {
        await updateUserRecommendation(user.uid, ticker, recommendation)

        // Atualizar o estado local
        setPortfolio((prev) => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            userRecommendation: recommendation,
          },
        }))
      } catch (error) {
        console.error(`Erro ao atualizar recomendação para ${ticker}:`, error)
        throw error
      }
    },
    [user],
  )

  // Função para forçar a atualização dos dados da carteira
  const refreshPortfolio = useCallback(async () => {
    if (!user || isRefreshing) return

    setIsRefreshing(true)
    setLoading(true)
    setError(null)

    try {
      const userPortfolio = await getUserPortfolio(user.uid)
      setPortfolio(userPortfolio || {})

      // Aguardar o próximo ciclo de renderização para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return userPortfolio
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error)
      setError("Não foi possível atualizar sua carteira. Por favor, tente novamente.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user, isRefreshing])

  // Adicionar método para verificar ativos elegíveis
  const getEligibleStocks = (recommendation = "Comprar") => {
    return stocksWithDetails.filter(stock => stock.userRecommendation === recommendation)
  }

  // Adicionar método para verificar se há ativos abaixo do peso
  const getUnderweightStocks = () => {
    return stocksWithDetails.filter(stock => stock.currentPercentage < stock.targetPercentage)
  }

  return {
    portfolio,
    stocksWithDetails,
    loading,
    error,
    totalPortfolioValue,
    addOrUpdateStock,
    removeStockFromPortfolio,
    updateRecommendation,
    refreshPortfolio,
    getEligibleStocks,
    getUnderweightStocks,
    hasStocks: stocksWithDetails.length > 0,
    hasEligibleStocks: stocksWithDetails.some(stock => stock.userRecommendation === "Comprar"),
  }
}
