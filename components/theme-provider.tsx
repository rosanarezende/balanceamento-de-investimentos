'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useTheme } from '@/contexts/theme-context'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme, fetchUserPreferences } = useTheme()

  React.useEffect(() => {
    fetchUserPreferences()
  }, [fetchUserPreferences])

  return (
    <NextThemesProvider {...props} attribute="class" defaultTheme={theme}>
      {children}
    </NextThemesProvider>
  )
}
