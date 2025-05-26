import {
  getUserPortfolio,
  updateStock,
  removeStock,
  updateUserRecommendation,
  saveSimulation,
  saveManualRecommendation,
  getSimulations,
  getSimulation,
  getUserWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  saveUserPreferences,
  getUserPreferences,
} from "@/lib/firestore"
import { doc, getDoc, updateDoc, deleteField, collection, addDoc, setDoc, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Mock do Firebase Firestore
jest.mock("firebase/firestore")
jest.mock("@/lib/firebase", () => ({
  db: {},
}))

describe("Firestore", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getUserPortfolio", () => {
    it("should return portfolio when user exists", async () => {
      // Configurar o mock para simular usuário existente
      const mockPortfolio = {
        PETR4: { quantity: 10, targetPercentage: 20, userRecommendation: "Comprar" },
      }
        ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ portfolio: mockPortfolio }),
        })

      const portfolio = await getUserPortfolio("user123")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se getDoc foi chamado com a referência correta
      expect(getDoc).toHaveBeenCalledWith("userRef")

      // Verificar se o portfólio foi retornado corretamente
      expect(portfolio).toEqual(mockPortfolio)
    })

    it("should return empty object when user does not exist", async () => {
      // Configurar o mock para simular usuário inexistente
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => false,
        })

      const portfolio = await getUserPortfolio("user123")

      // Verificar se o portfólio está vazio
      expect(portfolio).toEqual({})
    })

    it("should return empty object when portfolio is undefined", async () => {
      // Configurar o mock para simular portfólio indefinido
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({}),
        })

      const portfolio = await getUserPortfolio("user123")

      // Verificar se o portfólio está vazio
      expect(portfolio).toEqual({})
    })

    it("should throw error when getDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(getUserPortfolio("user123")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(getUserPortfolio("")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(getUserPortfolio("user123")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("updateStock", () => {
    it("should update stock correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

      const stockData = {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      }

      await updateStock("user123", "PETR4", stockData)

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "portfolio.PETR4": stockData,
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      const stockData = {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      }

      // Verificar se a função lança um erro
      await expect(updateStock("user123", "PETR4", stockData)).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      const stockData = {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      }

      await expect(updateStock("", "PETR4", stockData)).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid ticker", async () => {
      const stockData = {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      }

      await expect(updateStock("user123", "", stockData)).rejects.toThrow("ticker não pode estar vazio")
    })

    it("should handle invalid stock data", async () => {
      const stockData = {
        quantity: -10,
        targetPercentage: 200,
        userRecommendation: "Invalid",
      }

      await expect(updateStock("user123", "PETR4", stockData)).rejects.toThrow("Dados de ação inválidos")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      const stockData = {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      }

      await expect(updateStock("user123", "PETR4", stockData)).rejects.toThrow("Unexpected Error")
    })
  })

  describe("removeStock", () => {
    it("should remove stock correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)
        ; (deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")

      await removeStock("user123", "PETR4")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se deleteField foi chamado
      expect(deleteField).toHaveBeenCalled()

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "portfolio.PETR4": "DELETE_FIELD",
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(removeStock("user123", "PETR4")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(removeStock("", "PETR4")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid ticker", async () => {
      await expect(removeStock("user123", "")).rejects.toThrow("ticker não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(removeStock("user123", "PETR4")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("updateUserRecommendation", () => {
    it("should update recommendation correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

      await updateUserRecommendation("user123", "PETR4", "Vender")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "portfolio.PETR4.userRecommendation": "Vender",
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(updateUserRecommendation("user123", "PETR4", "Vender")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(updateUserRecommendation("", "PETR4", "Vender")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid ticker", async () => {
      await expect(updateUserRecommendation("user123", "", "Vender")).rejects.toThrow("ticker não pode estar vazio")
    })

    it("should handle invalid recommendation", async () => {
      await expect(updateUserRecommendation("user123", "PETR4", "Invalid")).rejects.toThrow("Recomendação inválida")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(updateUserRecommendation("user123", "PETR4", "Vender")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("saveSimulation", () => {
    it("should save simulation correctly", async () => {
      // Configurar o mock
      ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (addDoc as jest.Mock).mockResolvedValueOnce({ id: "sim123" })

      const simulation = {
        date: new Date("2023-01-01"),
        investmentAmount: 1000,
        portfolioValueBefore: 5000,
        portfolioValueAfter: 6000,
        allocations: [
          {
            ticker: "PETR4",
            currentValue: 500,
            currentPercentage: 10,
            targetPercentage: 15,
            currentQuantity: 10,
            investmentAmount: 250,
            newQuantity: 15,
            quantityToAcquire: 5,
            currentPrice: 50,
            userRecommendation: "Comprar",
          },
        ],
      }

      const id = await saveSimulation("user123", simulation)

      // Verificar se collection foi chamado com os parâmetros corretos
      expect(collection).toHaveBeenCalledWith(db, "users", "user123", "simulations")

      // Verificar se addDoc foi chamado com os parâmetros corretos
      expect(addDoc).toHaveBeenCalledWith("simulationsRef", simulation)

      // Verificar se o ID foi retornado corretamente
      expect(id).toBe("sim123")
    })

    it("should throw error when addDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (addDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      const simulation = {
        date: new Date(),
        investmentAmount: 1000,
        portfolioValueBefore: 5000,
        portfolioValueAfter: 6000,
        allocations: [],
      }

      // Verificar se a função lança um erro
      await expect(saveSimulation("user123", simulation)).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      const simulation = {
        date: new Date(),
        investmentAmount: 1000,
        portfolioValueBefore: 5000,
        portfolioValueAfter: 6000,
        allocations: [],
      }

      await expect(saveSimulation("", simulation)).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid simulation data", async () => {
      const simulation = {
        date: new Date(),
        investmentAmount: -1000,
        portfolioValueBefore: 5000,
        portfolioValueAfter: 6000,
        allocations: [],
      }

      await expect(saveSimulation("user123", simulation)).rejects.toThrow("Dados de simulação inválidos")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (addDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      const simulation = {
        date: new Date(),
        investmentAmount: 1000,
        portfolioValueBefore: 5000,
        portfolioValueAfter: 6000,
        allocations: [],
      }

      await expect(saveSimulation("user123", simulation)).rejects.toThrow("Unexpected Error")
    })
  })

  describe("saveManualRecommendation", () => {
    it("should save manual recommendation correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

      const recommendationData = {
        ticker: "PETR4",
        recommendation: "Comprar",
      }

      await saveManualRecommendation("user123", "PETR4", "Comprar")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "manualRecommendations.PETR4": recommendationData,
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(saveManualRecommendation("user123", "PETR4", "Comprar")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(saveManualRecommendation("", "PETR4", "Comprar")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid recommendation data", async () => {
      await expect(saveManualRecommendation("user123", "PETR4", "Invalid")).rejects.toThrow("Recomendação inválida")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(saveManualRecommendation("user123", "PETR4", "Comprar")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("getSimulations", () => {
    it("should return simulations when user has simulations", async () => {
      // Configurar o mock para simular simulações existentes
      const mockSimulations = [
        {
          id: "sim1",
          date: new Date("2023-01-01"),
          investmentAmount: 1000,
          portfolioValueBefore: 5000,
          portfolioValueAfter: 6000,
          allocations: [
            {
              ticker: "PETR4",
              currentValue: 500,
              currentPercentage: 10,
              targetPercentage: 15,
              currentQuantity: 10,
              investmentAmount: 250,
              newQuantity: 15,
              quantityToAcquire: 5,
              currentPrice: 50,
              userRecommendation: "Comprar",
            },
          ],
        },
      ]
        ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (query as jest.Mock).mockReturnValueOnce("queryRef")
        ; (getDocs as jest.Mock).mockResolvedValueOnce({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          forEach: (callback: (doc: any) => void) => {
            mockSimulations.forEach((simulation) => {
              callback({
                id: simulation.id,
                data: () => ({
                  date: {
                    toDate: () => simulation.date,
                  },
                  investmentAmount: simulation.investmentAmount,
                  portfolioValueBefore: simulation.portfolioValueBefore,
                  portfolioValueAfter: simulation.portfolioValueAfter,
                  allocations: simulation.allocations,
                }),
              })
            })
          },
        })

      const simulations = await getSimulations("user123")

      // Verificar se collection foi chamado com os parâmetros corretos
      expect(collection).toHaveBeenCalledWith(db, "users", "user123", "simulations")

      // Verificar se query foi chamado com os parâmetros corretos
      expect(query).toHaveBeenCalledWith("simulationsRef", orderBy("date", "desc"))

      // Verificar se as simulações foram retornadas corretamente
      expect(simulations).toEqual(mockSimulations)
    })

    it("should return empty array when user has no simulations", async () => {
      // Configurar o mock para simular ausência de simulações
      ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (query as jest.Mock).mockReturnValueOnce("queryRef")
        ; (getDocs as jest.Mock).mockResolvedValueOnce({
          forEach: () => {
            // Não chamar o callback para simular ausência de simulações
          },
        })

      const simulations = await getSimulations("user123")

      // Verificar se as simulações estão vazias
      expect(simulations).toEqual([])
    })

    it("should throw error when getDocs fails", async () => {
      // Configurar o mock para simular erro
      ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (query as jest.Mock).mockReturnValueOnce("queryRef")
        ; (getDocs as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(getSimulations("user123")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(getSimulations("")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (collection as jest.Mock).mockReturnValueOnce("simulationsRef")
        ; (query as jest.Mock).mockReturnValueOnce("queryRef")
        ; (getDocs as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(getSimulations("user123")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("getSimulation", () => {
    it("should return simulation when simulation exists", async () => {
      // Configurar o mock para simular simulação existente
      const mockSimulation = {
        id: "sim1",
        date: new Date("2023-01-01"),
        investmentAmount: 1000,
        portfolioValueBefore: 5000,
        portfolioValueAfter: 6000,
        allocations: [
          {
            ticker: "PETR4",
            currentValue: 500,
            currentPercentage: 10,
            targetPercentage: 15,
            currentQuantity: 10,
            investmentAmount: 250,
            newQuantity: 15,
            quantityToAcquire: 5,
            currentPrice: 50,
            userRecommendation: "Comprar",
          },
        ],
      }
        ; (doc as jest.Mock).mockReturnValueOnce("simulationRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({
            date: {
              toDate: () => mockSimulation.date,
            },
            investmentAmount: mockSimulation.investmentAmount,
            portfolioValueBefore: mockSimulation.portfolioValueBefore,
            portfolioValueAfter: mockSimulation.portfolioValueAfter,
            allocations: mockSimulation.allocations,
          }),
        })

      const simulation = await getSimulation("user123", "sim1")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123", "simulations", "sim1")

      // Verificar se a simulação foi retornada corretamente
      expect(simulation).toEqual(mockSimulation)
    })

    it("should return null when simulation does not exist", async () => {
      // Configurar o mock para simular ausência de simulação
      ; (doc as jest.Mock).mockReturnValueOnce("simulationRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => false,
        })

      const simulation = await getSimulation("user123", "sim1")

      // Verificar se a simulação é nula
      expect(simulation).toBeNull()
    })

    it("should throw error when getDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("simulationRef")
        ; (getDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(getSimulation("user123", "sim1")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(getSimulation("", "sim1")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid simulationId", async () => {
      await expect(getSimulation("user123", "")).rejects.toThrow("simulationId não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("simulationRef")
        ; (getDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(getSimulation("user123", "sim1")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("getUserWatchlist", () => {
    it("should return watchlist when user has watchlist", async () => {
      // Configurar o mock para simular watchlist existente
      const mockWatchlist = {
        PETR4: { targetPrice: 50, notes: "Comprar quando atingir R$ 50" },
      }
        ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ watchlist: mockWatchlist }),
        })

      const watchlist = await getUserWatchlist("user123")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se getDoc foi chamado com a referência correta
      expect(getDoc).toHaveBeenCalledWith("userRef")

      // Verificar se a watchlist foi retornada corretamente
      expect(watchlist).toEqual([
        { ticker: "PETR4", targetPrice: 50, notes: "Comprar quando atingir R$ 50" },
      ])
    })

    it("should return empty array when user has no watchlist", async () => {
      // Configurar o mock para simular ausência de watchlist
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({}),
        })

      const watchlist = await getUserWatchlist("user123")

      // Verificar se a watchlist está vazia
      expect(watchlist).toEqual([])
    })

    it("should return empty array when user does not exist", async () => {
      // Configurar o mock para simular usuário inexistente
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => false,
        })

      const watchlist = await getUserWatchlist("user123")

      // Verificar se a watchlist está vazia
      expect(watchlist).toEqual([])
    })

    it("should throw error when getDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(getUserWatchlist("user123")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(getUserWatchlist("")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(getUserWatchlist("user123")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("addToWatchlist", () => {
    it("should add item to watchlist correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

      const watchlistItem = {
        ticker: "PETR4",
        targetPrice: 50,
        notes: "Comprar quando atingir R$ 50",
      }

      await addToWatchlist("user123", watchlistItem)

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "watchlist.PETR4": {
          targetPrice: 50,
          notes: "Comprar quando atingir R$ 50",
        },
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      const watchlistItem = {
        ticker: "PETR4",
        targetPrice: 50,
        notes: "Comprar quando atingir R$ 50",
      }

      // Verificar se a função lança um erro
      await expect(addToWatchlist("user123", watchlistItem)).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      const watchlistItem = {
        ticker: "PETR4",
        targetPrice: 50,
        notes: "Comprar quando atingir R$ 50",
      }

      await expect(addToWatchlist("", watchlistItem)).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid watchlist item data", async () => {
      const watchlistItem = {
        ticker: "PETR4",
        targetPrice: -50,
        notes: "Comprar quando atingir R$ 50",
      }

      await expect(addToWatchlist("user123", watchlistItem)).rejects.toThrow("Dados de item de watchlist inválidos")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      const watchlistItem = {
        ticker: "PETR4",
        targetPrice: 50,
        notes: "Comprar quando atingir R$ 50",
      }

      await expect(addToWatchlist("user123", watchlistItem)).rejects.toThrow("Unexpected Error")
    })
  })

  describe("updateWatchlistItem", () => {
    it("should update watchlist item correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

      const watchlistItem = {
        targetPrice: 55,
        notes: "Atualizar preço alvo para R$ 55",
      }

      await updateWatchlistItem("user123", "PETR4", watchlistItem)

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "watchlist.PETR4": {
          targetPrice: 55,
          notes: "Atualizar preço alvo para R$ 55",
        },
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      const watchlistItem = {
        targetPrice: 55,
        notes: "Atualizar preço alvo para R$ 55",
      }

      // Verificar se a função lança um erro
      await expect(updateWatchlistItem("user123", "PETR4", watchlistItem)).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      const watchlistItem = {
        targetPrice: 55,
        notes: "Atualizar preço alvo para R$ 55",
      }

      await expect(updateWatchlistItem("", "PETR4", watchlistItem)).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid ticker", async () => {
      const watchlistItem = {
        targetPrice: 55,
        notes: "Atualizar preço alvo para R$ 55",
      }

      await expect(updateWatchlistItem("user123", "", watchlistItem)).rejects.toThrow("ticker não pode estar vazio")
    })

    it("should handle invalid watchlist item data", async () => {
      const watchlistItem = {
        targetPrice: -55,
        notes: "Atualizar preço alvo para R$ 55",
      }

      await expect(updateWatchlistItem("user123", "PETR4", watchlistItem)).rejects.toThrow("Dados de item de watchlist inválidos")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      const watchlistItem = {
        targetPrice: 55,
        notes: "Atualizar preço alvo para R$ 55",
      }

      await expect(updateWatchlistItem("user123", "PETR4", watchlistItem)).rejects.toThrow("Unexpected Error")
    })
  })

  describe("removeFromWatchlist", () => {
    it("should remove item from watchlist correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)
        ; (deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")

      await removeFromWatchlist("user123", "PETR4")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se deleteField foi chamado
      expect(deleteField).toHaveBeenCalled()

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        "watchlist.PETR4": "DELETE_FIELD",
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(removeFromWatchlist("user123", "PETR4")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(removeFromWatchlist("", "PETR4")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid ticker", async () => {
      await expect(removeFromWatchlist("user123", "")).rejects.toThrow("ticker não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(removeFromWatchlist("user123", "PETR4")).rejects.toThrow("Unexpected Error")
    })
  })

  describe("saveUserPreferences", () => {
    it("should save user preferences correctly", async () => {
      // Configurar o mock
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
        })
        ; (updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

      const preferences = {
        theme: "dark",
      }

      await saveUserPreferences("user123", { theme: "dark" })

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se getDoc foi chamado com a referência correta
      expect(getDoc).toHaveBeenCalledWith("userRef")

      // Verificar se updateDoc foi chamado com os parâmetros corretos
      expect(updateDoc).toHaveBeenCalledWith("userRef", {
        preferences,
      })
    })

    it("should create new user document if it does not exist", async () => {
      // Configurar o mock para simular ausência de documento do usuário
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => false,
        })
        ; (setDoc as jest.Mock).mockResolvedValueOnce(undefined)

      const preferences = {
        theme: "dark",
      }

      await saveUserPreferences("user123", { theme: "dark" })

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se getDoc foi chamado com a referência correta
      expect(getDoc).toHaveBeenCalledWith("userRef")

      // Verificar se setDoc foi chamado com os parâmetros corretos
      expect(setDoc).toHaveBeenCalledWith("userRef", {
        preferences,
        portfolio: {},
        watchlist: {},
      })
    })

    it("should throw error when updateDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
        })
        ; (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(saveUserPreferences("user123", { theme: "dark" })).rejects.toThrow("Firestore error")
    })

    it("should throw error when setDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => false,
        })
        ; (setDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(saveUserPreferences("user123", { theme: "dark" })).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(saveUserPreferences("", { theme: "dark" })).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle invalid preferences data", async () => {
      // @ts-expect-error Testando valor de tema inválido
      await expect(saveUserPreferences("user123", { theme: "invalid" })).rejects.toThrow("Dados de preferências inválidos")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
        })
        ; (updateDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(saveUserPreferences("user123", { theme: "dark" })).rejects.toThrow("Unexpected Error")
    })
  })

  describe("getUserPreferences", () => {
    it("should return user preferences when user has preferences", async () => {
      // Configurar o mock para simular preferências existentes
      const mockPreferences = {
        theme: "dark",
      }
        ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ preferences: mockPreferences }),
        })

      const preferences = await getUserPreferences("user123")

      // Verificar se doc foi chamado com os parâmetros corretos
      expect(doc).toHaveBeenCalledWith(db, "users", "user123")

      // Verificar se getDoc foi chamado com a referência correta
      expect(getDoc).toHaveBeenCalledWith("userRef")

      // Verificar se as preferências foram retornadas corretamente
      expect(preferences).toEqual(mockPreferences)
    })

    it("should return null when user has no preferences", async () => {
      // Configurar o mock para simular ausência de preferências
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => true,
          data: () => ({}),
        })

      const preferences = await getUserPreferences("user123")

      // Verificar se as preferências são nulas
      expect(preferences).toBeNull()
    })

    it("should return null when user does not exist", async () => {
      // Configurar o mock para simular usuário inexistente
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockResolvedValueOnce({
          exists: () => false,
        })

      const preferences = await getUserPreferences("user123")

      // Verificar se as preferências são nulas
      expect(preferences).toBeNull()
    })

    it("should throw error when getDoc fails", async () => {
      // Configurar o mock para simular erro
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(getUserPreferences("user123")).rejects.toThrow("Firestore error")
    })

    // New tests for edge cases and error handling
    it("should handle invalid userId", async () => {
      await expect(getUserPreferences("")).rejects.toThrow("userId não pode estar vazio")
    })

    it("should handle unexpected errors gracefully", async () => {
      ; (doc as jest.Mock).mockReturnValueOnce("userRef")
        ; (getDoc as jest.Mock).mockImplementationOnce(() => {
          throw new Error("Unexpected Error")
        })

      await expect(getUserPreferences("user123")).rejects.toThrow("Unexpected Error")
    })
  })
})
