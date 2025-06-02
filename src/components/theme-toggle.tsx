"use client"

import { useEffect } from 'react'
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useTheme } from "@/core/state/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  // O ThemeProvider agora carrega as preferências automaticamente
  useEffect(() => {
    // efeito de montagem apenas
  }, [])

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}
