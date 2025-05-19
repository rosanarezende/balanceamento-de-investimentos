"use client"

import { useState, useEffect } from "react"
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
    async function loadPortfolio() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const userPortfolio = await getUserPortfolio(user.uid)
        setPortfolio(userPortfolio)
      } catch (error) {
        console.error("Erro ao carregar carteira:", error)
        setError("Não foi possível carregar sua carteira. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [user])

  // Calcular detalhes da carteira quando o portfolio mudar
  useEffect(() => {
    async function calculatePortfolioDetails() {
      if (!user || Object.keys(portfolio).length === 0) {
        setStocksWithDetails([])
        setTotalPortfolioValue(0)
        return
      }

      setLoading(true)
      setError(null)

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

        setTotalPortfolioValue(totalValue)

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

        setStocksWithDetails(detailedStocks)
      } catch (error) {
        console.error("Erro ao calcular detalhes da carteira:", error)
        setError("Não foi possível calcular os detalhes da sua carteira. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    calculatePortfolioDetails()
  }, [portfolio, user])

  // Adicionar ou atualizar uma ação
  const addOrUpdateStock = async (
    ticker: string,
    quantity: number,
    targetPercentage: number,
    userRecommendation = "Comprar",
  ) => {
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
  }

  // Remover uma ação
  const removeStockFromPortfolio = async (ticker: string) => {
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
  }

  // Atualizar a recomendação do usuário
  const updateRecommendation = async (ticker: string, recommendation: string) => {
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
  }
}
