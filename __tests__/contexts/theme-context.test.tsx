"use client"

import type React from "react"

import { render, screen, act, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"
import { saveUserPreferences, getUserPreferences } from "@/lib/firestore"

// Mock do localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
})

// Mock do AuthContext
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "test-user-id" },
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock do Firestore
jest.mock("@/lib/firestore", () => ({
  saveUserPreferences: jest.fn(),
  getUserPreferences: jest.fn(),
}))

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-btn">
        Toggle Theme
      </button>
    </div>
  )
}

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  it("should provide default theme", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    // Verificar se o tema padrão é "dark"
    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("dark")
    })

    // Verificar se a classe "dark" foi adicionada ao documento
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("should load theme from localStorage", async () => {
    // Configurar localStorage com tema "light"
    mockLocalStorage.setItem("theme", "light")

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    // Verificar se o tema foi carregado do localStorage
    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("light")
    })

    // Verificar se a classe "dark" foi removida do documento
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("should load theme from Firestore if not in localStorage", async () => {
    // Configurar getUserPreferences para retornar tema "light"
    ;(getUserPreferences as jest.Mock).mockResolvedValueOnce({ theme: "light" })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    // Verificar se o tema foi carregado do Firestore
    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("light")
    })

    // Verificar se getUserPreferences foi chamado
    expect(getUserPreferences).toHaveBeenCalledWith("test-user-id")

    // Verificar se o tema foi salvo no localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light")
  })

  it("should toggle theme", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("dark")
    })

    // Clicar no botão de alternar tema
    await act(async () => {
      userEvent.click(screen.getByTestId("toggle-btn"))
    })

    // Verificar se o tema foi alterado para "light"
    expect(screen.getByTestId("theme").textContent).toBe("light")

    // Verificar se a classe "dark" foi removida do documento
    expect(document.documentElement.classList.contains("dark")).toBe(false)

    // Verificar se o tema foi salvo no localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light")

    // Verificar se o tema foi salvo no Firestore
    expect(saveUserPreferences).toHaveBeenCalledWith("test-user-id", { theme: "light" })

    // Clicar novamente no botão de alternar tema
    await act(async () => {
      userEvent.click(screen.getByTestId("toggle-btn"))
    })

    // Verificar se o tema foi alterado de volta para "dark"
    expect(screen.getByTestId("theme").textContent).toBe("dark")

    // Verificar se a classe "dark" foi adicionada ao documento
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })
})
