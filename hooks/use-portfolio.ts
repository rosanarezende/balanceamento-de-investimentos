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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Persistência local como backup
  useEffect(() => {
    if (Object.keys(portfolio).length > 0) {
      localStorage.setItem('userPortfolio', JSON.stringify(portfolio))
      localStorage.setItem('portfolioLastUpdated', new Date().toISOString())
    }
  }, [portfolio])

  // Carregar a carteira do usuário
  const loadPortfolio = useCallback(async () => {
    if (!user) {
      setPortfolio({})
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Feedback imediato do cache local
      const cachedPortfolio = localStorage.getItem('userPortfolio')
      if (cachedPortfolio) {
        const parsedPortfolio = JSON.parse(cachedPortfolio)
        setPortfolio(parsedPortfolio)
        
        // Verificar se o cache é recente (menos de 5 minutos)
        const lastUpdatedStr = localStorage.getItem('portfolioLastUpdated')
        if (lastUpdatedStr) {
          const lastUpdated = new Date(lastUpdatedStr)
          const now = new Date()
          const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60)
          
          // Se o cache for recente, podemos usá-lo temporariamente enquanto buscamos dados atualizados
          if (diffMinutes < 5) {
            setLastUpdated(lastUpdated)
          }
        }
      }

      // Buscar do Firestore (sempre busca para garantir dados atualizados)
      const userPortfolio = await getUserPortfolio(user.uid)
      
      if (userPortfolio) {
        setPortfolio(userPortfolio)
        localStorage.setItem('userPortfolio', JSON.stringify(userPortfolio))
        const now = new Date()
        localStorage.setItem('portfolioLastUpdated', now.toISOString())
        setLastUpdated(now)
      } else if (Object.keys(portfolio).length === 0) {
        // Se não há dados no Firestore e não temos cache, definir como objeto vazio
        setPortfolio({})
      }
    } catch (err) {
      console.error("Erro ao carregar carteira:", err)
      setError("Não foi possível carregar sua carteira. Por favor, tente novamente.")
      
      // Se temos dados em cache, mantemos eles mesmo com erro
      const cachedPortfolio = localStorage.getItem('userPortfolio')
      if (cachedPortfolio && Object.keys(portfolio).length === 0) {
        setPortfolio(JSON.parse(cachedPortfolio))
      }
    } finally {
      setLoading(false)
    }
  }, [user, portfolio])

  // Carregar a carteira ao inicializar
  useEffect(() => {
    loadPortfolio()
  }, [loadPortfolio])

  // Calcular detalhes da carteira
  useEffect(() => {
    let cancelled = false
    async function calculatePortfolioDetails() {
      if (!user || Object.keys(portfolio).length === 0) {
        if (!cancelled) {
          setStocksWithDetails([])
          setTotalPortfolioValue(0)
          setLoading(false)
        }
        return
      }
      setLoading(true)
      setError(null)
      try {
        const stockPrices: Record<string, number> = {}
        const failedStocks: string[] = []
        const pricePromises = Object.keys(portfolio).map(async (ticker) => {
          try {
            const price = await fetchStockPrice(ticker)
            return { ticker, price }
          } catch {
            failedStocks.push(ticker)
            return { ticker, price: 0 }
          }
        })
        const priceResults = await Promise.all(pricePromises)
        priceResults.forEach(({ ticker, price }) => {
          stockPrices[ticker] = price
        })
        const totalValue = Object.entries(portfolio).reduce((total, [ticker, stock]) => {
          const price = stockPrices[ticker] || 0
          return total + stock.quantity * price
        }, 0)
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
        if (!cancelled) {
          setTotalPortfolioValue(totalValue)
          setStocksWithDetails(detailedStocks)
          // Notificar usuário se algum preço falhou
          if (failedStocks.length > 0) {
            setError(
              `Não foi possível atualizar o preço de ${failedStocks.length === 1 ? 'um ativo' : failedStocks.length + ' ativos'}: ${failedStocks.join(', ')}. Os valores podem estar desatualizados.`
            )
          }
        }
      } catch (err) {
        console.error("Erro ao calcular detalhes da carteira:", err)
        if (!cancelled) setError("Não foi possível calcular os detalhes da sua carteira. Por favor, tente novamente.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    calculatePortfolioDetails()
    return () => { cancelled = true }
  }, [portfolio, user])

  // Adicionar ou atualizar uma ação com retry e confirmação
  const addOrUpdateStock = useCallback(
    async (ticker: string, quantity: number, targetPercentage: number, userRecommendation = "Comprar") => {
      if (!user) return false
      
      setLoading(true)
      setError(null)
      
      // Implementação com retry
      const maxRetries = 3
      let retryCount = 0
      let success = false
      
      while (retryCount < maxRetries && !success) {
        try {
          // Atualizar no Firestore
          await updateStock(user.uid, ticker, { quantity, targetPercentage, userRecommendation })
          
          // Atualizar cache local imediatamente para feedback rápido
          setPortfolio(prev => ({
            ...prev,
            [ticker]: { quantity, targetPercentage, userRecommendation }
          }))
          
          // Forçar recarga completa dos dados
          await loadPortfolio()
          
          success = true
          return true
        } catch (err) {
          console.error(`Tentativa ${retryCount + 1} falhou ao adicionar/atualizar ação ${ticker}:`, err)
          retryCount++
          
          // Esperar antes de tentar novamente (backoff exponencial)
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
          }
        }
      }
      
      if (!success) {
        setError(`Erro ao adicionar/atualizar ação ${ticker} após ${maxRetries} tentativas.`)
        throw new Error(`Falha ao adicionar/atualizar ação ${ticker}`)
      }
      
      setLoading(false)
      return success
    },
    [user, loadPortfolio]
  )

  // Remover uma ação com confirmação
  const removeStockFromPortfolio = useCallback(
    async (ticker: string) => {
      if (!user) return false
      
      setLoading(true)
      setError(null)
      
      try {
        await removeStock(user.uid, ticker)
        
        // Atualizar cache local imediatamente
        setPortfolio(prev => {
          const newPortfolio = { ...prev }
          delete newPortfolio[ticker]
          return newPortfolio
        })
        
        // Forçar recarga completa
        await loadPortfolio()
        return true
      } catch (err) {
        console.error(`Erro ao remover ação ${ticker}:`, err)
        setError(`Erro ao remover ação ${ticker}.`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, loadPortfolio]
  )

  // Atualizar recomendação com confirmação
  const updateRecommendation = useCallback(
    async (ticker: string, recommendation: string) => {
      if (!user) return false
      
      setLoading(true)
      setError(null)
      
      try {
        await updateUserRecommendation(user.uid, ticker, recommendation)
        
        // Atualizar cache local imediatamente
        setPortfolio(prev => {
          if (!prev[ticker]) return prev
          
          return {
            ...prev,
            [ticker]: {
              ...prev[ticker],
              userRecommendation: recommendation
            }
          }
        })
        
        // Forçar recarga completa
        await loadPortfolio()
        return true
      } catch (err) {
        console.error(`Erro ao atualizar recomendação para ${ticker}:`, err)
        setError(`Erro ao atualizar recomendação para ${ticker}.`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, loadPortfolio]
  )

  // Forçar atualização com proteção contra chamadas simultâneas
  const refreshPortfolio = useCallback(async () => {
    if (!user || isRefreshing) return null
    
    setIsRefreshing(true)
    setLoading(true)
    setError(null)
    
    try {
      await loadPortfolio()
      return portfolio
    } catch (err) {
      console.error("Erro ao atualizar carteira:", err)
      throw err
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user, isRefreshing, loadPortfolio, portfolio])

  // Métodos utilitários
  const getEligibleStocks = useCallback((recommendation = "Comprar") => 
    stocksWithDetails.filter(stock => stock.userRecommendation === recommendation),
    [stocksWithDetails]
  )

  const getUnderweightStocks = useCallback(() => 
    stocksWithDetails.filter(stock => stock.currentPercentage < stock.targetPercentage),
    [stocksWithDetails]
  )

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
    isRefreshing,
    lastUpdated
  }
}