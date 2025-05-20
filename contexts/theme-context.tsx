"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { saveUserPreferences, getUserPreferences } from "@/lib/firestore"
import { useAuth } from "@/contexts/auth-context"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Carregar tema do localStorage ou Firestore ao montar o componente
  useEffect(() => {
    setMounted(true)

    const loadTheme = async () => {
      // Primeiro, verificar se há um tema salvo no localStorage
      const savedTheme = localStorage.getItem("theme") as Theme | null

      if (savedTheme) {
        setTheme(savedTheme)
        applyTheme(savedTheme)
      } else if (user) {
        // Se não houver tema no localStorage, mas o usuário estiver logado,
        // tentar buscar do Firestore
        try {
          const userPreferences = await getUserPreferences(user.uid)
          if (userPreferences && userPreferences.theme) {
            setTheme(userPreferences.theme)
            applyTheme(userPreferences.theme)
            // Salvar no localStorage também
            localStorage.setItem("theme", userPreferences.theme)
          } else {
            // Se não houver preferências salvas, usar o tema escuro como padrão
            setTheme("dark")
            applyTheme("dark")
          }
        } catch (error) {
          console.error("Erro ao carregar preferências de tema:", error)
          // Em caso de erro, usar o tema escuro como padrão
          setTheme("dark")
          applyTheme("dark")
        }
      } else {
        // Se não houver usuário logado, usar o tema escuro como padrão
        setTheme("dark")
        applyTheme("dark")
      }
    }

    loadTheme()
  }, [user])

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"

    // Atualizar o estado
    setTheme(newTheme)

    // Aplicar o tema ao documento
    applyTheme(newTheme)

    // Salvar no localStorage
    localStorage.setItem("theme", newTheme)

    // Se o usuário estiver logado, salvar no Firestore
    if (user) {
      try {
        await saveUserPreferences(user.uid, { theme: newTheme })
      } catch (error) {
        console.error("Erro ao salvar preferências de tema:", error)
      }
    }
  }

  // Evitar renderização no servidor para prevenir erros de hidratação
  if (!mounted) {
    return <>{children}</>
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
