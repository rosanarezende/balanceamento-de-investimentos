/**
 * Componente wrapper reutilizável para testes com todos os providers necessários
 */

import React from 'react'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/core/state/auth-context'
import { ThemeProvider } from '@/core/state/theme-context'
import { PortfolioProvider } from '@/core/state/portfolio-context'

export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PortfolioProvider>
          {children}
          <Toaster />
        </PortfolioProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
