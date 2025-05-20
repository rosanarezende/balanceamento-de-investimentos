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
        const userPortfolio = await getUserPortfolio(user.uid)
        if (isMounted) {
          setPortfolio(userPortfolio || {})
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

        for (const ticker of Object.keys(portfolio)) {
          try {
            stockPrices[ticker] = await fetchStockPrice(ticker)
          } catch (err) {
            console.error(`Erro ao buscar preço para ${ticker}:`, err)
            failedStocks.push(ticker)
            // Usar um preço simulado mesmo em caso de erro
            stockPrices[ticker] = 0
          }
        }

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

  return {
    portfolio,
    stocksWithDetails,
    loading,
    error,
    totalPortfolioValue,
    addOrUpdateStock,
    removeStockFromPortfolio,
    updateRecommendation,
  }
}
