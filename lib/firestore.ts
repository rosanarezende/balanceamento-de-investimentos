import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore"
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
