"use client"

import { render, screen, act, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup, signOut } from "firebase/auth"
import { getDoc, setDoc } from "firebase/firestore"

// Mock do Firebase Auth
jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  googleProvider: {},
}))

// Mock das funções do Firebase Auth
jest.mock("firebase/auth", () => ({
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null) // Inicialmente não autenticado
    return jest.fn() // Retorna uma função de cleanup
  }),
}))

// Mock do Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}))

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { user, loading, error, signInWithGoogle, signOut, clearError } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading ? "Loading" : "Not Loading"}</div>
      <div data-testid="user">{user ? user.email : "No User"}</div>
      <div data-testid="error">{error || "No Error"}</div>
      <button onClick={signInWithGoogle} data-testid="login-btn">
        Login
      </button>
      <button onClick={signOut} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={clearError} data-testid="clear-error-btn">
        Clear Error
      </button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should provide initial auth state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Inicialmente, o estado de loading deve ser true
    expect(screen.getByTestId("loading").textContent).toBe("Loading")

    // Após o onAuthStateChanged ser chamado, o loading deve ser false
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Inicialmente, não deve haver usuário
    expect(screen.getByTestId("user").textContent).toBe("No User")

    // Inicialmente, não deve haver erro
    expect(screen.getByTestId("error").textContent).toBe("No Error")
  })

  it("should handle sign in with Google", async () => {
    // Mock de usuário autenticado
    const mockUser = { uid: "123", email: "test@example.com", displayName: "Test User" }

    // Configurar o mock para simular login bem-sucedido
    ;(signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de login
    await act(async () => {
      userEvent.click(screen.getByTestId("login-btn"))
    })

    // Verificar se signInWithPopup foi chamado
    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider)
  })

  it("should handle sign out", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de logout
    await act(async () => {
      userEvent.click(screen.getByTestId("logout-btn"))
    })

    // Verificar se signOut foi chamado
    expect(signOut).toHaveBeenCalledWith(auth)
  })

  it("should handle sign in error", async () => {
    // Configurar o mock para simular erro de login
    const mockError = new Error("Auth Error")
    ;(signInWithPopup as jest.Mock).mockRejectedValueOnce(mockError)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de login
    await act(async () => {
      userEvent.click(screen.getByTestId("login-btn"))
    })

    // Verificar se o erro foi definido
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("Erro ao fazer login")
    })

    // Clicar no botão de limpar erro
    await act(async () => {
      userEvent.click(screen.getByTestId("clear-error-btn"))
    })

    // Verificar se o erro foi limpo
    expect(screen.getByTestId("error").textContent).toBe("No Error")
  })

  it("should create a new user document if it does not exist", async () => {
    // Mock de usuário autenticado
    const mockUser = { uid: "123", email: "test@example.com", displayName: "Test User" }

    // Configurar o mock para simular login bem-sucedido
    ;(signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    })

    // Configurar o mock para simular que o documento do usuário não existe
    ;(getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de login
    await act(async () => {
      userEvent.click(screen.getByTestId("login-btn"))
    })

    // Verificar se signInWithPopup foi chamado
    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider)

    // Verificar se setDoc foi chamado para criar um novo documento de usuário
    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), {
        email: mockUser.email,
        displayName: mockUser.displayName,
        portfolio: {},
        watchlist: {},
        preferences: {
          theme: "dark",
        },
      })
    })
  })

  it("should handle sign out error", async () => {
    // Configurar o mock para simular erro de logout
    const mockError = new Error("Logout Error")
    ;(signOut as jest.Mock).mockRejectedValueOnce(mockError)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de logout
    await act(async () => {
      userEvent.click(screen.getByTestId("logout-btn"))
    })

    // Verificar se o erro foi definido
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("Erro ao fazer logout")
    })

    // Clicar no botão de limpar erro
    await act(async () => {
      userEvent.click(screen.getByTestId("clear-error-btn"))
    })

    // Verificar se o erro foi limpo
    expect(screen.getByTestId("error").textContent).toBe("No Error")
  })

  it("should handle user state change", async () => {
    // Mock de usuário autenticado
    const mockUser = { uid: "123", email: "test@example.com", displayName: "Test User" }

    // Configurar o mock para simular mudança de estado de autenticação
    ;(signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Simular mudança de estado de autenticação
    act(() => {
      const callback = (onAuthStateChanged as jest.Mock).mock.calls[0][1]
      callback(mockUser)
    })

    // Verificar se o usuário foi atualizado
    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe(mockUser.email)
    })
  })

  it("should handle user state change error", async () => {
    // Configurar o mock para simular erro de mudança de estado de autenticação
    const mockError = new Error("Auth State Change Error")
    ;(onAuthStateChanged as jest.Mock).mockImplementationOnce((auth, callback) => {
      throw mockError
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Verificar se o erro foi definido
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("Erro ao verificar autenticação")
    })

    // Clicar no botão de limpar erro
    await act(async () => {
      userEvent.click(screen.getByTestId("clear-error-btn"))
    })

    // Verificar se o erro foi limpo
    expect(screen.getByTestId("error").textContent).toBe("No Error")
  })

  // New tests for edge cases and error handling
  it("should handle missing or invalid props", () => {
    // Verificar se o componente lança erro ao receber user inválido
    expect(() => render(<AuthProvider><TestComponent user={null} /></AuthProvider>)).toThrow(
      "user must be a valid object"
    )
  })

  it("should handle unexpected errors during sign in", async () => {
    // Configurar signInWithPopup para lançar um erro inesperado
    ;(signInWithPopup as jest.Mock).mockRejectedValueOnce(new Error("Unexpected Error"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de login
    await act(async () => {
      userEvent.click(screen.getByTestId("login-btn"))
    })

    // Verificar se o erro foi definido
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("Erro ao fazer login")
    })
  })

  it("should handle unexpected errors during sign out", async () => {
    // Configurar signOut para lançar um erro inesperado
    ;(signOut as jest.Mock).mockRejectedValueOnce(new Error("Unexpected Error"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("Not Loading")
    })

    // Clicar no botão de logout
    await act(async () => {
      userEvent.click(screen.getByTestId("logout-btn"))
    })

    // Verificar se o erro foi definido
    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("Erro ao fazer logout")
    })
  })
})
