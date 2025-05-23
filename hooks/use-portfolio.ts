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

  // Persistência local como backup
  useEffect(() => {
    if (Object.keys(portfolio).length > 0) {
      localStorage.setItem('userPortfolio', JSON.stringify(portfolio))
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
      if (cachedPortfolio) setPortfolio(JSON.parse(cachedPortfolio))

      // Buscar do Firestore
      const userPortfolio = await getUserPortfolio(user.uid)
      setPortfolio(userPortfolio || {})
      localStorage.setItem('userPortfolio', JSON.stringify(userPortfolio || {}))
    } catch (err) {
      setError("Não foi possível carregar sua carteira. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [user])

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
        if (!cancelled) setError("Não foi possível calcular os detalhes da sua carteira. Por favor, tente novamente.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    calculatePortfolioDetails()
    return () => { cancelled = true }
  }, [portfolio, user])

  // Adicionar ou atualizar uma ação
  const addOrUpdateStock = useCallback(
    async (ticker: string, quantity: number, targetPercentage: number, userRecommendation = "Comprar") => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        await updateStock(user.uid, ticker, { quantity, targetPercentage, userRecommendation })
        await loadPortfolio() // Sempre recarrega do Firestore após alteração
        return true
      } catch (err) {
        setError(`Erro ao adicionar/atualizar ação ${ticker}.`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, loadPortfolio]
  )

  // Remover uma ação
  const removeStockFromPortfolio = useCallback(
    async (ticker: string) => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        await removeStock(user.uid, ticker)
        await loadPortfolio()
      } catch (err) {
        setError(`Erro ao remover ação ${ticker}.`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, loadPortfolio]
  )

  // Atualizar recomendação
  const updateRecommendation = useCallback(
    async (ticker: string, recommendation: string) => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        await updateUserRecommendation(user.uid, ticker, recommendation)
        await loadPortfolio()
      } catch (err) {
        setError(`Erro ao atualizar recomendação para ${ticker}.`)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, loadPortfolio]
  )

  // Forçar atualização
  const refreshPortfolio = useCallback(async () => {
    if (!user || isRefreshing) return
    setIsRefreshing(true)
    setLoading(true)
    setError(null)
    try {
      await loadPortfolio()
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [user, isRefreshing, loadPortfolio])

  // Métodos utilitários
  const getEligibleStocks = (recommendation = "Comprar") =>
    stocksWithDetails.filter(stock => stock.userRecommendation === recommendation)

  const getUnderweightStocks = () =>
    stocksWithDetails.filter(stock => stock.currentPercentage < stock.targetPercentage)

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
