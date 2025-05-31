"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { ErrorInfo } from "@/core/types";

/**
 * Interface para o contexto de tratamento de erros global
 */
interface ErrorHandlingContextType {
  // Estado
  globalError: ErrorInfo | null;
  
  // Ações
  setGlobalError: (error: ErrorInfo | null) => void;
  clearGlobalError: () => void;
  handleError: (error: unknown, fallbackMessage?: string) => void;
}

// Criar contexto
const ErrorHandlingContext = createContext<ErrorHandlingContextType | undefined>(undefined);

/**
 * Provider para o contexto de tratamento de erros global
 */
export function ErrorHandlingProvider({ children }: { children: React.ReactNode }) {
  const [globalError, setGlobalError] = useState<ErrorInfo | null>(null);

  // Limpar erro global
  const clearGlobalError = () => {
    setGlobalError(null);
  };

  // Função para tratar erros de forma padronizada
  const handleError = (error: unknown, fallbackMessage = "Ocorreu um erro inesperado") => {
    console.error("Erro capturado:", error);
    
    let errorMessage: string;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = fallbackMessage;
    }
    
    // Mostrar toast para feedback imediato
    toast.error("Erro", {
      description: errorMessage
    });
    
    // Definir erro global para componentes que precisam reagir
    setGlobalError({
      message: errorMessage,
      details: error
    });
    
    // Opcionalmente, enviar para serviço de monitoramento
    // logErrorToService(error);
  };

  // Memoizar o valor do contexto para evitar renderizações desnecessárias
  const contextValue = {
    globalError,
    setGlobalError,
    clearGlobalError,
    handleError
  };

  return (
    <ErrorHandlingContext.Provider value={contextValue}>
      {children}
    </ErrorHandlingContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de tratamento de erros
 * @returns Contexto de tratamento de erros
 * @throws Erro se usado fora de um ErrorHandlingProvider
 */
export function useErrorHandling() {
  const context = useContext(ErrorHandlingContext);
  if (context === undefined) {
    throw new Error("useErrorHandling deve ser usado dentro de um ErrorHandlingProvider");
  }
  return context;
}

/**
 * Componente ErrorBoundary para capturar erros em componentes filhos
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro em componente filho:", error, errorInfo);
    
    // Chamar callback de erro se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Renderizar fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.resetErrorBoundary);
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Componente de exibição de erro com opção de recuperação
 */
interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorDisplay({ message, onRetry, isRetrying = false }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 my-4">
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erro</h3>
      <p className="text-red-700 dark:text-red-200 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          disabled={isRetrying}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isRetrying ? "Tentando recuperar..." : "Tentar novamente"}
        </button>
      )}
    </div>
  );
}

/**
 * Componente de exibição de aviso com opção de ação
 */
interface WarningDisplayProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function WarningDisplay({ message, actionText, onAction, isLoading = false }: WarningDisplayProps) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
      <p className="text-yellow-700 dark:text-yellow-300 text-sm">{message}</p>
      {onAction && actionText && (
        <button 
          className="mt-2 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-3 rounded-md text-sm disabled:opacity-50"
          onClick={onAction}
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : actionText}
        </button>
      )}
    </div>
  );
}
