/**
 * Funções utilitárias para mocks
 */

// Estado interno para override em testes
let mockAuthOverride: boolean | null = null
let developmentModeOverride: boolean | null = null

// Delay para simular operações assíncronas
export const mockDelay = (ms = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Logger para desenvolvimento
export const devLog = (message: string, data?: any): void => {
  if (isDevelopmentMode()) {
    console.log(`[DEV MODE] ${message}`, data || '')
  }
}

// Helper para verificar se devemos usar dados mock
export const shouldUseMockData = (): boolean => {
  return isDevelopmentMode() && 
         process.env.NEXT_PUBLIC_MOCK_DATA === 'true'
}

// Helper para verificar se devemos usar auth mock (com override para testes)
export const shouldMockAuth = (): boolean => {
  if (mockAuthOverride !== null) {
    return mockAuthOverride
  }
  return isDevelopmentMode() && 
         process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
}

// Verificar se estamos em modo de desenvolvimento (com override para testes)
export const isDevelopmentMode = (): boolean => {
  if (developmentModeOverride !== null) {
    return developmentModeOverride
  }
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true'
}

// Funções para override em testes
export const setMockAuthOverride = (value: boolean | null): void => {
  mockAuthOverride = value
}

export const setDevelopmentModeOverride = (value: boolean | null): void => {
  developmentModeOverride = value
}

// Resetar overrides
export const resetOverrides = (): void => {
  mockAuthOverride = null
  developmentModeOverride = null
}

export const isMockAuth = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
}

export const isMockData = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_DATA === 'true'
}
