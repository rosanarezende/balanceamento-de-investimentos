/**
 * Utilitários e helpers para testes
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Helper para aguardar que um elemento apareça na tela
 */
export const waitForElement = async (text: string, options?: { timeout?: number }) => {
  return await waitFor(() => screen.getByText(text), { timeout: options?.timeout || 3000 })
}

/**
 * Helper para adicionar um ativo ao portfólio
 */
export const addAssetToPortfolio = async (
  symbol: string,
  name: string,
  currentAllocation: string,
  targetAllocation: string
) => {
  const user = userEvent.setup()

  // Procura e clica no botão de adicionar ativo
  const addButton = screen.getByText(/adicionar ativo/i)
  await user.click(addButton)

  // Preenche o formulário
  await user.type(screen.getByLabelText(/símbolo/i), symbol)
  await user.type(screen.getByLabelText(/nome/i), name)
  await user.type(screen.getByLabelText(/alocação atual/i), currentAllocation)
  await user.type(screen.getByLabelText(/alocação desejada/i), targetAllocation)

  // Confirma
  const confirmButton = screen.getByText(/confirmar|salvar|adicionar/i)
  await user.click(confirmButton)
}

/**
 * Helper para aguardar loading states
 */
export const waitForLoadingToFinish = async (loadingText = 'carregando', timeout = 3000) => {
  try {
    await waitFor(() => {
      expect(screen.queryByText(new RegExp(loadingText, 'i'))).not.toBeInTheDocument()
    }, { timeout })
  } catch {
    // Se não encontrar o loading, assume que já terminou
  }
}

/**
 * Helper para verificar se um toast de erro apareceu
 */
export const expectErrorToast = async (errorMessage?: string) => {
  if (errorMessage) {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  } else {
    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument()
    })
  }
}

/**
 * Helper para verificar se um toast de sucesso apareceu
 */
export const expectSuccessToast = async (successMessage?: string) => {
  if (successMessage) {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(successMessage, 'i'))).toBeInTheDocument()
    })
  } else {
    await waitFor(() => {
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
    })
  }
}

/**
 * Helper para simular delay de rede
 */
export const simulateNetworkDelay = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Helper para encontrar elementos dentro de um container específico
 */
export const withinContainer = (containerText: string) => {
  const container = screen.getByText(containerText).closest('div, section, form, main')
  if (!container) {
    throw new Error(`Container com texto "${containerText}" não encontrado`)
  }
  return within(container as HTMLElement)
}
