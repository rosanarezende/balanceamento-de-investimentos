"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  // Carregar tema do localStorage ao montar o componente
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null

    // Verificar preferência do sistema se não houver tema salvo
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      return
    }

    setTheme(savedTheme || "light")

    // Aplicar classe ao body
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light"

      // Salvar no localStorage
      localStorage.setItem("theme", newTheme)

      // Aplicar classe ao html
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      return newTheme
    })
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider")
  }
  return context
}
