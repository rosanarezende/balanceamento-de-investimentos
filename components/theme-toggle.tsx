"use client"

import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}
