import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Portfolio } from "./types"

export interface SimulationAllocation {
  ticker: string
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  currentQuantity: number
  investmentAmount: number
  newQuantity: number
  quantityToAcquire: number
  currentPrice: number
  userRecommendation: string
}

export interface Simulation {
  id?: string
  date: Date
  investmentAmount: number
  portfolioValueBefore: number
  portfolioValueAfter: number
  allocations: SimulationAllocation[]
}

export interface WatchlistItem {
  ticker: string
  targetPrice: number | null
  notes: string
}

// Obter a carteira do usuário
export async function getUserPortfolio(userId: string): Promise<Portfolio> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      return userDoc.data().portfolio || {}
    }

    return {}
  } catch (error) {
    console.error("Erro ao obter carteira do usuário:", error)
    throw error
  }
}

// Adicionar ou atualizar uma ação na carteira
export async function updateStock(
  userId: string,
  ticker: string,
  data: {
    quantity: number
    targetPercentage: number
    userRecommendation: string
  },
): Promise<void> {
  try {
    console.log(`Atualizando ação ${ticker} para o usuário ${userId}`, data)
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`portfolio.${ticker}`]: data,
    })
  } catch (error) {
    console.error(`Erro ao atualizar ação ${ticker}:`, error)
    throw error
  }
}

// Remover uma ação da carteira
export async function removeStock(userId: string, ticker: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`portfolio.${ticker}`]: deleteField(),
    })
  } catch (error) {
    console.error(`Erro ao remover ação ${ticker}:`, error)
    throw error
  }
}

// Atualizar a recomendação do usuário para uma ação
export async function updateUserRecommendation(userId: string, ticker: string, recommendation: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`portfolio.${ticker}.userRecommendation`]: recommendation,
    })
  } catch (error) {
    console.error(`Erro ao atualizar recomendação para ${ticker}:`, error)
    throw error
  }
}

// Salvar uma recomendação manual
export async function saveManualRecommendation(userId: string, ticker: string, recommendation: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`portfolio.${ticker}.manualRecommendation`]: recommendation,
    })
  } catch (error) {
    console.error(`Erro ao salvar recomendação manual para ${ticker}:`, error)
    throw error
  }
}

// Salvar uma simulação no histórico
export async function saveSimulation(userId: string, simulation: Simulation): Promise<string> {
  try {
    const simulationsRef = collection(db, "users", userId, "simulations")

    const docRef = await addDoc(simulationsRef, {
      date: simulation.date,
      investmentAmount: simulation.investmentAmount,
      portfolioValueBefore: simulation.portfolioValueBefore,
      portfolioValueAfter: simulation.portfolioValueAfter,
      allocations: simulation.allocations,
    })

    return docRef.id
  } catch (error) {
    console.error("Erro ao salvar simulação:", error)
    throw error
  }
}

// Obter o histórico de simulações
export async function getSimulations(userId: string): Promise<Simulation[]> {
  try {
    const simulationsRef = collection(db, "users", userId, "simulations")
    const q = query(simulationsRef, orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    const simulations: Simulation[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      simulations.push({
        id: doc.id,
        date: data.date.toDate(),
        investmentAmount: data.investmentAmount,
        portfolioValueBefore: data.portfolioValueBefore,
        portfolioValueAfter: data.portfolioValueAfter,
        allocations: data.allocations,
      })
    })

    return simulations
  } catch (error) {
    console.error("Erro ao obter histórico de simulações:", error)
    throw error
  }
}

// Obter uma simulação específica
export async function getSimulation(userId: string, simulationId: string): Promise<Simulation | null> {
  try {
    const simulationRef = doc(db, "users", userId, "simulations", simulationId)
    const simulationDoc = await getDoc(simulationRef)

    if (simulationDoc.exists()) {
      const data = simulationDoc.data()
      return {
        id: simulationDoc.id,
        date: data.date.toDate(),
        investmentAmount: data.investmentAmount,
        portfolioValueBefore: data.portfolioValueBefore,
        portfolioValueAfter: data.portfolioValueAfter,
        allocations: data.allocations,
      }
    }

    return null
  } catch (error) {
    console.error(`Erro ao obter simulação ${simulationId}:`, error)
    throw error
  }
}

// Obter a watchlist do usuário
export async function getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists() && userDoc.data().watchlist) {
      return Object.entries(userDoc.data().watchlist).map(([ticker, data]) => ({
        ticker,
        ...(data as { targetPrice: number | null; notes: string }),
      }))
    }

    return []
  } catch (error) {
    console.error("Erro ao obter watchlist do usuário:", error)
    throw error
  }
}

// Adicionar item à watchlist
export async function addToWatchlist(
  userId: string,
  item: {
    ticker: string
    targetPrice: number | null
    notes: string
  },
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`watchlist.${item.ticker}`]: {
        targetPrice: item.targetPrice,
        notes: item.notes,
      },
    })
  } catch (error) {
    console.error(`Erro ao adicionar ${item.ticker} à watchlist:`, error)
    throw error
  }
}

// Atualizar item da watchlist
export async function updateWatchlistItem(
  userId: string,
  ticker: string,
  data: {
    targetPrice: number | null
    notes: string
  },
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`watchlist.${ticker}`]: {
        targetPrice: data.targetPrice,
        notes: data.notes,
      },
    })
  } catch (error) {
    console.error(`Erro ao atualizar ${ticker} na watchlist:`, error)
    throw error
  }
}

// Remover item da watchlist
export async function removeFromWatchlist(userId: string, ticker: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      [`watchlist.${ticker}`]: deleteField(),
    })
  } catch (error) {
    console.error(`Erro ao remover ${ticker} da watchlist:`, error)
    throw error
  }
}

// Salvar preferências do usuário
export async function saveUserPreferences(
  userId: string,
  preferences: {
    theme: "light" | "dark"
    // Outras preferências podem ser adicionadas aqui
  },
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    // Verificar se o documento do usuário existe
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      // Atualizar o documento existente
      await updateDoc(userRef, {
        preferences,
      })
    } else {
      // Criar um novo documento
      await setDoc(userRef, {
        preferences,
        portfolio: {},
        watchlist: {},
      })
    }
  } catch (error) {
    console.error("Erro ao salvar preferências do usuário:", error)
    throw error
  }
}

// Obter preferências do usuário
export async function getUserPreferences(userId: string): Promise<{ theme: "light" | "dark" } | null> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists() && userDoc.data().preferences) {
      return userDoc.data().preferences
    }

    return null
  } catch (error) {
    console.error("Erro ao obter preferências do usuário:", error)
    throw error
  }
}

// Validação de entrada do usuário antes de salvar no banco de dados
export function validateUserInput(data: {
  quantity: number
  targetPercentage: number
  userRecommendation: string
}): void {
  if (data.quantity <= 0) {
    throw new Error("A quantidade deve ser maior que zero.")
  }

  if (data.targetPercentage <= 0 || data.targetPercentage > 100) {
    throw new Error("O percentual META deve estar entre 0 e 100.")
  }

  const validRecommendations = ["Comprar", "Vender", "Aguardar"]
  if (!validRecommendations.includes(data.userRecommendation)) {
    throw new Error("Recomendação inválida.")
  }
}

// Salvar ação no banco de dados
export async function saveStockToDatabase(stock: {
  ticker: string
  quantity: number
  targetPercentage: number
}): Promise<void> {
  try {
    const userRef = doc(db, "users", stock.ticker)
    await updateDoc(userRef, {
      quantity: stock.quantity,
      targetPercentage: stock.targetPercentage,
    })
  } catch (error) {
    console.error("Erro ao salvar ação no banco de dados:", error)
    throw error
  }
}

export { saveStockToDatabase }
