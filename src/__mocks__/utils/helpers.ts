/**
 * Funções utilitárias para mocks
 */

// Delay para simular operações assíncronas
export const mockDelay = (ms = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Logger para desenvolvimento
export const devLog = (message: string, data?: any): void => {
  if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true') {
    console.log(`[DEV MODE] ${message}`, data || '')
  }
}

// Helper para verificar se devemos usar dados mock
export const shouldUseMockData = (): boolean => {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true' && 
         process.env.NEXT_PUBLIC_MOCK_DATA === 'true'
}

// Helper para verificar se devemos usar auth mock
export const shouldMockAuth = (): boolean => {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true' && 
         process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
}

// Verificar se estamos em modo de desenvolvimento
export const isDevelopmentMode = (): boolean => {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true'
}

export const isMockAuth = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
}

export const isMockData = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_DATA === 'true'
}
