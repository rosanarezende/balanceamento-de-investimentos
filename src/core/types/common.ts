/**
 * Tipos utilitários e comuns para toda a aplicação
 */

export type CacheItem<T> = {
  value: T;
  timestamp: number;
};

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  loading: boolean;
  error: ErrorInfo | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | null;
}
