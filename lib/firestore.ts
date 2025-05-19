import { doc, getDoc, updateDoc, deleteField, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "./firebase"

export interface Stock {
  ticker: string
  quantity: number
  targetPercentage: number
  userRecommendation: string
}

export interface Portfolio {
  [ticker: string]: {
    quantity: number
    targetPercentage: number
    userRecommendation: string
  }
}

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
