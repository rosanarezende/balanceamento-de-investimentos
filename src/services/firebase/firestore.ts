"use client";

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
} from "firebase/firestore";
import { db } from "./config";
import type {
  Portfolio,
  Simulation,
  WatchlistItem,
  UserPreferences
} from "@/types";
import {
  shouldUseMockData,
  mockDelay,
  mockPortfolioData,
  mockWatchlistData,
  mockSimulations,
  devLog
} from "@/__mocks__";

/**
 * Serviço para interação com o Firestore
 * 
 * Este módulo contém todas as funções para interagir com o Firestore,
 * organizadas por domínio (portfólio, watchlist, simulações, preferências).
 */

// ===== PORTFÓLIO =====

/**
 * Obtém a carteira do usuário
 */
export async function getUserPortfolio(userId: string): Promise<Portfolio> {
  // Em modo de desenvolvimento, retornar dados mock
  if (shouldUseMockData()) {
    devLog("Usando dados mock para portfólio");
    await mockDelay(500);
    return mockPortfolioData;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().portfolio || {};
    }

    return {};
  } catch (error) {
    console.error("Erro ao obter carteira do usuário:", error);
    throw error;
  }
}

/**
 * Adiciona ou atualiza uma ação na carteira
 */
export async function updateStock(
  userId: string,
  ticker: string,
  data: {
    quantity: number;
    targetPercentage: number;
    userRecommendation: string;
  }
): Promise<void> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog(`Simulando atualização de ação: ${ticker}`, data);
    await mockDelay(300);
    return;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // Validar dados antes de salvar
    validateUserInput(data);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`portfolio.${ticker}`]: data,
    });
  } catch (error) {
    console.error(`Erro ao atualizar ação ${ticker}:`, error);
    throw error;
  }
}

/**
 * Remove uma ação da carteira
 */
export async function removeStock(userId: string, ticker: string): Promise<void> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog(`Simulando remoção de ação: ${ticker}`);
    await mockDelay(300);
    return;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`portfolio.${ticker}`]: deleteField(),
    });
  } catch (error) {
    console.error(`Erro ao remover ação ${ticker}:`, error);
    throw error;
  }
}

/**
 * Atualiza a recomendação do usuário para uma ação
 */
export async function updateUserRecommendation(
  userId: string,
  ticker: string,
  recommendation: string
): Promise<void> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog(`Simulando atualização de recomendação para ${ticker}: ${recommendation}`);
    await mockDelay(300);
    return;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`portfolio.${ticker}.userRecommendation`]: recommendation,
    });
  } catch (error) {
    console.error(`Erro ao atualizar recomendação para ${ticker}:`, error);
    throw error;
  }
}

/**
 * Salva uma recomendação manual
 */
export async function saveManualRecommendation(
  userId: string,
  ticker: string,
  recommendation: string
): Promise<void> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`portfolio.${ticker}.manualRecommendation`]: recommendation,
    });
  } catch (error) {
    console.error(`Erro ao salvar recomendação manual para ${ticker}:`, error);
    throw error;
  }
}

// ===== SIMULAÇÕES =====

/**
 * Salva uma simulação no histórico
 */
export async function saveSimulation(userId: string, simulation: Simulation): Promise<string> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog("Simulando salvamento de simulação", simulation);
    await mockDelay(400);
    return `mock-simulation-${Date.now()}`;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const simulationsRef = collection(db, "users", userId, "simulations");
    const docRef = await addDoc(simulationsRef, {
      date: simulation.date,
      investmentAmount: simulation.investmentAmount,
      portfolioValueBefore: simulation.portfolioValueBefore,
      portfolioValueAfter: simulation.portfolioValueAfter,
      allocations: simulation.allocations,
    });

    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar simulação:", error);
    throw error;
  }
}

/**
 * Obtém o histórico de simulações
 */
export async function getSimulations(userId: string): Promise<Simulation[]> {
  // Em modo de desenvolvimento, retornar dados mock
  if (shouldUseMockData()) {
    devLog("Usando dados mock para simulações");
    await mockDelay(500);
    return mockSimulations;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const simulationsRef = collection(db, "users", userId, "simulations");
    const q = query(simulationsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    const simulations: Simulation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      simulations.push({
        id: doc.id,
        date: data.date.toDate(),
        investmentAmount: data.investmentAmount,
        portfolioValueBefore: data.portfolioValueBefore,
        portfolioValueAfter: data.portfolioValueAfter,
        allocations: data.allocations,
      });
    });

    return simulations;
  } catch (error) {
    console.error("Erro ao obter histórico de simulações:", error);
    throw error;
  }
}

/**
 * Obtém uma simulação específica
 */
export async function getSimulation(userId: string, simulationId: string): Promise<Simulation | null> {
  // Em modo de desenvolvimento, retornar dados mock
  if (shouldUseMockData()) {
    devLog(`Buscando simulação mock: ${simulationId}`);
    await mockDelay(300);
    const simulation = mockSimulations.find(s => s.id === simulationId);
    return simulation || null;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const simulationRef = doc(db, "users", userId, "simulations", simulationId);
    const simulationDoc = await getDoc(simulationRef);

    if (simulationDoc.exists()) {
      const data = simulationDoc.data();
      return {
        id: simulationDoc.id,
        date: data.date.toDate(),
        investmentAmount: data.investmentAmount,
        portfolioValueBefore: data.portfolioValueBefore,
        portfolioValueAfter: data.portfolioValueAfter,
        allocations: data.allocations,
      };
    }

    return null;
  } catch (error) {
    console.error(`Erro ao obter simulação ${simulationId}:`, error);
    throw error;
  }
}

// ===== WATCHLIST =====

/**
 * Obtém a watchlist do usuário
 */
export async function getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
  // Em modo de desenvolvimento, retornar dados mock
  if (shouldUseMockData()) {
    devLog("Usando dados mock para watchlist");
    await mockDelay(400);
    return Object.entries(mockWatchlistData).map(([ticker, data]) => ({
      ticker,
      targetPrice: data.targetPrice,
      notes: data.notes,
    }));
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().watchlist) {
      return Object.entries(userDoc.data().watchlist).map(([ticker, data]) => ({
        ticker,
        ...(data as { targetPrice: number | null; notes: string }),
      }));
    }

    return [];
  } catch (error) {
    console.error("Erro ao obter watchlist do usuário:", error);
    throw error;
  }
}

/**
 * Adiciona item à watchlist
 */
export async function addToWatchlist(
  userId: string,
  item: {
    ticker: string;
    targetPrice: number | null;
    notes: string;
  }
): Promise<void> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog(`Simulando adição à watchlist: ${item.ticker}`, item);
    await mockDelay(300);
    return;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`watchlist.${item.ticker}`]: {
        targetPrice: item.targetPrice,
        notes: item.notes,
      },
    });
  } catch (error) {
    console.error(`Erro ao adicionar ${item.ticker} à watchlist:`, error);
    throw error;
  }
}

/**
 * Atualiza item da watchlist
 */
export async function updateWatchlistItem(
  userId: string,
  ticker: string,
  data: {
    targetPrice: number | null;
    notes: string;
  }
): Promise<void> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog(`Simulando atualização na watchlist: ${ticker}`, data);
    await mockDelay(300);
    return;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`watchlist.${ticker}`]: {
        targetPrice: data.targetPrice,
        notes: data.notes,
      },
    });
  } catch (error) {
    console.error(`Erro ao atualizar ${ticker} na watchlist:`, error);
    throw error;
  }
}

/**
 * Remove item da watchlist
 */
export async function removeFromWatchlist(userId: string, ticker: string): Promise<void> {
  // Em modo de desenvolvimento, simular operação
  if (shouldUseMockData()) {
    devLog(`Simulando remoção da watchlist: ${ticker}`);
    await mockDelay(300);
    return;
  }

  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`watchlist.${ticker}`]: deleteField(),
    });
  } catch (error) {
    console.error(`Erro ao remover ${ticker} da watchlist:`, error);
    throw error;
  }
}

// ===== PREFERÊNCIAS DO USUÁRIO =====

/**
 * Salva preferências do usuário
 */
export async function saveUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<void> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Atualizar o documento existente
      await updateDoc(userRef, {
        preferences,
      });
    } else {
      // Criar um novo documento
      await setDoc(userRef, {
        preferences,
        portfolio: {},
        watchlist: {},
      });
    }
  } catch (error) {
    console.error("Erro ao salvar preferências do usuário:", error);
    throw error;
  }
}

/**
 * Obtém preferências do usuário
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().preferences) {
      return userDoc.data().preferences;
    }

    return null;
  } catch (error) {
    console.error("Erro ao obter preferências do usuário:", error);
    throw error;
  }
}

// ===== UTILITÁRIOS =====

/**
 * Validação de entrada do usuário antes de salvar no banco de dados
 */
export function validateUserInput(data: {
  quantity: number;
  targetPercentage: number;
  userRecommendation: string;
}): void {
  if (data.quantity <= 0) {
    throw new Error("A quantidade deve ser maior que zero.");
  }

  if (data.targetPercentage <= 0 || data.targetPercentage > 100) {
    throw new Error("O percentual META deve estar entre 0 e 100.");
  }

  const validRecommendations = ["Comprar", "Vender", "Aguardar"];
  if (!validRecommendations.includes(data.userRecommendation)) {
    throw new Error("Recomendação inválida.");
  }
}
