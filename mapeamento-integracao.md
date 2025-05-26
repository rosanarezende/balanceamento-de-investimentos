# Mapeamento de Pontos de Integração UI-Backend

Este documento mapeia os pontos onde a UI precisa ser integrada com os novos serviços de back-end refatorados, além de identificar arquivos potencialmente obsoletos.

## Pontos de Integração Necessários

### 1. Hooks

#### 1.1. `/hooks/use-portfolio.ts`
- **Status**: Precisa ser migrado para `/src/hooks/use-portfolio.ts`
- **Integrações necessárias**:
  - Substituir importação de `@/lib/firestore` por `@/services/firebase/firestore`
  - Substituir chamada direta à API por `@/services/api/stockPrice`
  - Implementar cache usando `@/utils/client/cache`
- **Funções a serem atualizadas**:
  - `getPortfolio` → `getUserPortfolio`
  - `fetchStockPrice` → usar `getStockPrice` de `@/services/api/stockPrice`
  - `fetchStockPrices` → usar `getMultipleStockPrices` de `@/services/api/stockPrice`
  - `isDevelopment` → usar função de `@/services/api/stockPrice`

### 2. Contextos

#### 2.1. `/contexts/auth-context.tsx`
- **Status**: Já migrado para `/src/contexts/auth-context.tsx`
- **Verificação necessária**: Garantir que todos os componentes estão importando do novo caminho

#### 2.2. `/contexts/theme-context.tsx`
- **Status**: Já migrado para `/src/contexts/theme-context.tsx`
- **Verificação necessária**: Garantir que todos os componentes estão importando do novo caminho

#### 2.3. `/contexts/preview-auth-context.tsx`
- **Status**: Precisa ser avaliado se ainda é necessário ou pode ser removido

### 3. Componentes UI

#### 3.1. `/app/calculadora-balanceamento/page.tsx`
- **Integrações necessárias**:
  - Atualizar importação de `usePortfolio` para o novo caminho
  - Verificar se todas as importações de componentes estão corretas

#### 3.2. Outros componentes em `/app/`
- **Ação necessária**: Verificar todos os componentes em `/app/` que importam:
  - Hooks antigos de `/hooks/`
  - Serviços antigos de `/lib/`
  - Contextos antigos de `/contexts/`

### 4. API Routes

#### 4.1. `/app/api/stock-price/route.ts`
- **Status**: Já migrado para `/src/app/api/stock-price/route.ts`
- **Verificação necessária**: Garantir que não há chamadas à versão antiga

#### 4.2. `/app/api/ai-recommendation/route.ts`
- **Status**: Já migrado para `/src/app/api/ai-recommendation/route.ts`
- **Verificação necessária**: Garantir que não há chamadas à versão antiga

## Arquivos Potencialmente Obsoletos

### 1. Diretório `/lib/`
- `/lib/api.ts` - Substituído por `/src/services/api/stockPrice.ts`
- `/lib/firebase.ts` - Substituído por `/src/services/firebase/config.ts`
- `/lib/firestore.ts` - Substituído por `/src/services/firebase/firestore.ts`
- `/lib/ai.ts` - Substituído por `/src/services/ai/textGeneration.ts`
- `/lib/cache.ts` - Substituído por `/src/utils/client/cache.ts`
- `/lib/types.ts` - Substituído por `/src/types/index.ts`
- `/lib/utils.ts` - Avaliar se foi migrado para `/src/utils/`
- `/lib/client-utils/` - Avaliar se foi migrado para `/src/utils/client/`
- `/lib/server/` - Avaliar se foi migrado para `/src/utils/server/`

### 2. Diretório `/contexts/`
- `/contexts/auth-context.tsx` - Substituído por `/src/contexts/auth-context.tsx`
- `/contexts/theme-context.tsx` - Substituído por `/src/contexts/theme-context.tsx`
- `/contexts/preview-auth-context.tsx` - Avaliar se ainda é necessário

### 3. Diretório `/hooks/`
- `/hooks/use-portfolio.ts` - Precisa ser migrado para `/src/hooks/use-portfolio.ts`
- Outros hooks em `/hooks/` - Avaliar se ainda são necessários

### 4. Diretório `/app/api/`
- `/app/api/stock-price/route.ts` - Substituído por `/src/app/api/stock-price/route.ts`
- `/app/api/ai-recommendation/route.ts` - Substituído por `/src/app/api/ai-recommendation/route.ts`

## Próximos Passos

1. Migrar o hook `use-portfolio.ts` para a nova estrutura
2. Atualizar todos os componentes para usar os novos caminhos de importação
3. Verificar e atualizar outros hooks e componentes que não foram identificados neste mapeamento inicial
4. Após a integração completa, remover os arquivos obsoletos
