import { getUserPortfolio, updateStock, removeStock, updateUserRecommendation, saveSimulation } from "@/lib/firestore"
import { doc, getDoc, updateDoc, deleteField, collection, addDoc } from "firebase/firestore"
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
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(getDoc as jest.Mock).mockResolvedValueOnce({
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
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      })

      const portfolio = await getUserPortfolio("user123")

      // Verificar se o portfólio está vazio
      expect(portfolio).toEqual({})
    })

    it("should return empty object when portfolio is undefined", async () => {
      // Configurar o mock para simular portfólio indefinido
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({}),
      })

      const portfolio = await getUserPortfolio("user123")

      // Verificar se o portfólio está vazio
      expect(portfolio).toEqual({})
    })

    it("should throw error when getDoc fails", async () => {
      // Configurar o mock para simular erro
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(getDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(getUserPortfolio("user123")).rejects.toThrow("Firestore error")
    })
  })

  describe("updateStock", () => {
    it("should update stock correctly", async () => {
      // Configurar o mock
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

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
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      const stockData = {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      }

      // Verificar se a função lança um erro
      await expect(updateStock("user123", "PETR4", stockData)).rejects.toThrow("Firestore error")
    })
  })

  describe("removeStock", () => {
    it("should remove stock correctly", async () => {
      // Configurar o mock
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(updateDoc as jest.Mock).mockResolvedValueOnce(undefined)
      ;(deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")

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
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(deleteField as jest.Mock).mockReturnValueOnce("DELETE_FIELD")
      ;(updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(removeStock("user123", "PETR4")).rejects.toThrow("Firestore error")
    })
  })

  describe("updateUserRecommendation", () => {
    it("should update recommendation correctly", async () => {
      // Configurar o mock
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(updateDoc as jest.Mock).mockResolvedValueOnce(undefined)

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
      ;(doc as jest.Mock).mockReturnValueOnce("userRef")
      ;(updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

      // Verificar se a função lança um erro
      await expect(updateUserRecommendation("user123", "PETR4", "Vender")).rejects.toThrow("Firestore error")
    })
  })

  describe("saveSimulation", () => {
    it("should save simulation correctly", async () => {
      // Configurar o mock
      ;(collection as jest.Mock).mockReturnValueOnce("simulationsRef")
      ;(addDoc as jest.Mock).mockResolvedValueOnce({ id: "sim123" })

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
      ;(collection as jest.Mock).mockReturnValueOnce("simulationsRef")
      ;(addDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"))

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
  })

  // Testes adicionais para as outras funções do Firestore...
  // Por brevidade, não incluí todos os testes, mas seguiriam o mesmo padrão
})
