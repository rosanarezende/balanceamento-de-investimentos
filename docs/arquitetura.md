# Documentação da Arquitetura Modular

## Visão Geral

A arquitetura do projeto foi refatorada para seguir um modelo modular com separação clara de responsabilidades. A nova estrutura organiza o código em camadas lógicas, facilitando a manutenção, testabilidade e escalabilidade.

## Estrutura de Diretórios

```
src/
├── app/                  # Páginas e rotas da aplicação (Next.js)
├── components/           # Componentes de UI reutilizáveis
├── core/                 # Núcleo da aplicação
│   ├── state/            # Gerenciamento de estado global
│   ├── services/         # Serviços e integrações
│   ├── types/            # Definições de tipos
│   └── utils/            # Utilitários e funções auxiliares
├── hooks/                # Hooks específicos de componentes
├── lib/                  # Bibliotecas e configurações
└── services/             # Serviços legados (em migração para core/services)
```

## Camadas da Aplicação

### 1. Camada de Apresentação (UI)

- **Localização**: `src/app/` e `src/components/`
- **Responsabilidade**: Renderização de interfaces, interação com usuário
- **Características**: 
  - Componentes focados em apresentação
  - Mínimo de lógica de negócio
  - Consumo de hooks e contextos para dados

### 2. Camada de Estado

- **Localização**: `src/core/state/`
- **Responsabilidade**: Gerenciamento centralizado de estado
- **Características**:
  - Contextos React para estado global
  - Hooks customizados para lógica reutilizável
  - Separação de domínios (auth, portfolio, etc.)

### 3. Camada de Serviços

- **Localização**: `src/core/services/`
- **Responsabilidade**: Comunicação com APIs e serviços externos
- **Características**:
  - Abstração de chamadas de API
  - Tratamento de erros de comunicação
  - Cache e otimização de requisições

### 4. Camada de Utilidades

- **Localização**: `src/core/utils/`
- **Responsabilidade**: Funções auxiliares e utilitários
- **Características**:
  - Funções puras e reutilizáveis
  - Formatação, validação e manipulação de dados
  - Tratamento de erros

## Fluxo de Dados

```
UI (Components) ↔ Estado (Contexts/Hooks) ↔ Serviços ↔ APIs Externas
```

1. **Componentes UI** consomem dados e ações dos contextos e hooks
2. **Contextos e Hooks** gerenciam estado e chamam serviços quando necessário
3. **Serviços** comunicam com APIs externas e retornam dados/erros
4. **Utilitários** auxiliam em todas as camadas com funções específicas

## Principais Contextos e Hooks

### AuthContext

**Arquivo**: `src/core/state/auth-context.tsx`

**Propósito**: Gerenciar autenticação e dados do usuário

**Interface Principal**:
```typescript
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}
```

**Uso**:
```tsx
import { useAuth } from "@/core/state/auth-context";

function MyComponent() {
  const { user, loading, signInWithGoogle } = useAuth();
  
  if (loading) return <p>Carregando...</p>;
  
  return user ? (
    <p>Bem-vindo, {user.displayName}</p>
  ) : (
    <button onClick={signInWithGoogle}>Login com Google</button>
  );
}
```

### PortfolioContext

**Arquivo**: `src/core/state/portfolio-context.tsx`

**Propósito**: Gerenciar portfólio de investimentos do usuário

**Interface Principal**:
```typescript
interface PortfolioContextType {
  stocks: Record<string, Stock>;
  stocksWithDetails: StockWithDetails[];
  portfolioSummary: PortfolioSummary;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  addStockToPortfolio: (ticker: string, data: Omit<Stock, "ticker">) => Promise<boolean>;
  removeStockFromPortfolio: (ticker: string) => Promise<boolean>;
  updateStockInPortfolio: (ticker: string, data: Partial<Omit<Stock, "ticker">>) => Promise<boolean>;
}
```

**Uso**:
```tsx
import { usePortfolio } from "@/core/state/portfolio-context";

function PortfolioSummary() {
  const { portfolioSummary, loading, error } = usePortfolio();
  
  if (loading) return <p>Carregando portfólio...</p>;
  if (error) return <p>Erro: {error}</p>;
  
  return (
    <div>
      <h2>Resumo da Carteira</h2>
      <p>Valor Total: {formatCurrency(portfolioSummary.totalValue)}</p>
      <p>Quantidade de Ativos: {portfolioSummary.stockCount}</p>
    </div>
  );
}
```

### ErrorHandlingContext

**Arquivo**: `src/core/state/error-handling.tsx`

**Propósito**: Tratamento global de erros e exibição consistente

**Interface Principal**:
```typescript
interface ErrorHandlingContextType {
  globalError: ErrorInfo | null;
  setGlobalError: (error: ErrorInfo | null) => void;
  clearGlobalError: () => void;
  handleError: (error: unknown, fallbackMessage?: string) => void;
}
```

**Uso**:
```tsx
import { useErrorHandling, ErrorBoundary } from "@/core/state/error-handling";

function MyComponent() {
  const { handleError } = useErrorHandling();
  
  const handleRiskyOperation = async () => {
    try {
      await someRiskyOperation();
    } catch (error) {
      handleError(error, "Não foi possível completar a operação");
    }
  };
  
  return (
    <ErrorBoundary fallback={<p>Algo deu errado</p>}>
      {/* Conteúdo protegido */}
    </ErrorBoundary>
  );
}
```

## Utilitários Principais

### Formatação

**Arquivo**: `src/core/utils/formatting.ts`

**Funções**:
- `formatCurrency(value: number): string` - Formata valor para moeda brasileira
- `formatPercentage(value: number, precision?: number): string` - Formata valor percentual
- `formatNumber(value: number, precision?: number): string` - Formata número com separadores

### Tratamento de Erros

**Arquivo**: `src/core/utils/error.ts`

**Funções**:
- `createError(message: string, code?: string, details?: unknown): ErrorInfo` - Cria objeto de erro padronizado
- `handleError(error: unknown): ErrorInfo` - Captura e formata erros para exibição
- `isValidNumber(value: unknown): boolean` - Valida se um valor é um número válido

### Estilização

**Arquivo**: `src/core/utils/styling.ts`

**Funções**:
- `cn(...classes: string[]): string` - Concatena classes CSS, filtrando valores falsy
- `generateChartColors(count: number, isDarkMode?: boolean): string[]` - Gera cores para gráficos

## Boas Práticas

1. **Separação de Responsabilidades**
   - Componentes UI não devem conter lógica de negócio
   - Serviços não devem manipular estado global
   - Contextos devem ser específicos para domínios

2. **Tratamento de Erros**
   - Usar ErrorBoundary para componentes críticos
   - Centralizar tratamento de erros no ErrorHandlingContext
   - Fornecer feedback claro ao usuário

3. **Gerenciamento de Estado**
   - Minimizar estado local em componentes
   - Usar contextos para estado compartilhado
   - Memoizar valores de contexto para evitar renderizações desnecessárias

4. **Tipagem**
   - Definir interfaces claras para todos os componentes e funções
   - Centralizar tipos relacionados em arquivos dedicados
   - Evitar uso de `any` e tipos genéricos quando possível

## Exemplos de Integração

### Configuração de Providers

```tsx
// src/app/layout.tsx
import { AuthProvider } from "@/core/state/auth-context";
import { PortfolioProvider } from "@/core/state/portfolio-context";
import { ErrorHandlingProvider } from "@/core/state/error-handling";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorHandlingProvider>
          <AuthProvider>
            <PortfolioProvider>
              {children}
            </PortfolioProvider>
          </AuthProvider>
        </ErrorHandlingProvider>
      </body>
    </html>
  );
}
```

### Componente com Tratamento de Erro

```tsx
// src/components/dashboard/portfolio-summary.tsx
import { usePortfolio } from "@/core/state/portfolio-context";
import { ErrorBoundary, ErrorDisplay } from "@/core/state/error-handling";
import { formatCurrency } from "@/core/utils";

export function PortfolioSummary() {
  const { portfolioSummary, loading, error, refreshPortfolio } = usePortfolio();
  
  if (loading) {
    return <SkeletonLoader />;
  }
  
  if (error) {
    return (
      <ErrorDisplay 
        message={error} 
        onRetry={refreshPortfolio} 
      />
    );
  }
  
  return (
    <ErrorBoundary 
      fallback={<div>Não foi possível carregar o resumo da carteira</div>}
    >
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Resumo da Carteira</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold">
              {formatCurrency(portfolioSummary.totalValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quantidade de Ativos</p>
            <p className="text-xl font-bold">{portfolioSummary.stockCount}</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

## Migração e Compatibilidade

A refatoração foi implementada de forma incremental, mantendo compatibilidade com o código existente. Os seguintes padrões foram adotados:

1. **Re-exportação de APIs legadas** - Hooks e contextos antigos re-exportam as novas implementações
2. **Manutenção de interfaces** - Interfaces públicas foram preservadas para evitar quebras
3. **Migração gradual** - Componentes podem ser migrados um a um para a nova arquitetura

## Próximos Passos

1. **Migração completa de serviços** - Mover todos os serviços para `core/services`
2. **Testes automatizados** - Implementar testes para contextos e hooks
3. **Documentação de componentes** - Documentar interfaces de componentes UI
4. **Monitoramento de erros** - Integrar com serviço de monitoramento de erros
