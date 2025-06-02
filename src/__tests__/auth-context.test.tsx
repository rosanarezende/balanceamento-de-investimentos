/**
 * Teste simples para verificar se o AuthProvider está funcionando
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '@/core/state/auth-context'
import { ThemeProvider } from '@/core/state/theme-context'

// Mock dos serviços
jest.mock('@/services/firebase/config')
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

// Componente de teste simples
const TestComponent: React.FC = () => {
  return <div>Test Component</div>
}

// Componente wrapper para testes
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}

describe('AuthProvider Context Test', () => {
  beforeEach(() => {
    // Mock do Firebase Auth
    const mockAuth = jest.requireMock('firebase/auth')
    mockAuth.onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
      // Simular usuário autenticado
      setTimeout(() => {
        callback({
          uid: 'test-user-123',
          email: 'test@example.com',
          displayName: 'Test User'
        })
      }, 0)
      return jest.fn() // unsubscribe function
    })

    // Mock do Firestore
    const mockFirestore = jest.requireMock('firebase/firestore')
    mockFirestore.doc.mockReturnValue({})
    mockFirestore.getDoc.mockResolvedValue({
      exists: () => false
    })
    mockFirestore.setDoc.mockResolvedValue(undefined)
  })

  it('deve renderizar componente dentro do AuthProvider sem erros', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })
})
