# 🛠️ Modo de Desenvolvimento - Documentação Técnica

Este documento descreve em detalhes como o modo de desenvolvimento funciona no EquilibreInvest, permitindo execução local sem dependências externas.

## Arquitetura do Modo de Desenvolvimento

### Estrutura de Arquivos

```
src/core/utils/development.ts  # Configurações e dados mock centralizados
src/components/auth-guard.tsx  # Bypass de autenticação
src/core/state/auth-context.tsx  # Contexto de autenticação mock
src/services/firebase/firestore.ts  # Serviços de dados mock
src/services/api/stock-price.ts  # Preços de ações simulados
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_DEVELOPMENT_MODE` | Habilita o modo de desenvolvimento | `false` |
| `NEXT_PUBLIC_MOCK_AUTH` | Habilita autenticação simulada | `false` |
| `NEXT_PUBLIC_MOCK_DATA` | Habilita dados simulados | `false` |

## Componentes Principais

### 1. Utilitários de Desenvolvimento (`development.ts`)

**Funções de Verificação:**
- `isDevelopmentMode()`: Verifica se está em modo de desenvolvimento
- `shouldMockAuth()`: Verifica se deve usar autenticação mock
- `shouldUseMockData()`: Verifica se deve usar dados mock

**Dados Mock:**
- `mockUser`: Usuário fictício para desenvolvimento
- `mockPortfolioData`: Portfolio com 5 ações pré-configuradas
- `mockWatchlistData`: Lista de acompanhamento com NVDA e META
- `mockStockPrices`: Preços simulados para ações
- `mockSimulations`: Histórico de simulações

**Funções de Simulação:**
- `simulateStockPrices()`: Gera preços aleatórios para ações
- `simulateStockPrice()`:  Gera preço aleatório para uma ação específica (que não esteja previsto em `mockStockPrices`)

### 2. Bypass de Autenticação

**AuthGuard (`auth-guard.tsx`):**
```typescript
// Em modo de desenvolvimento com mock auth, permitir acesso sem autenticação
if (isDevMode && mockAuth) {
  return // Não redirecionar para login
}
```

**AuthContext (`auth-context.tsx`):**
```typescript
// Verificar se estamos em modo de desenvolvimento com mock auth
if (isDevelopmentMode() && shouldMockAuth()) {
  setUser(getMockUser() as User);
  setUserData(getMockUserData());
  return;
}
```

### 3. Dados Simulados

**Firestore (`firestore.ts`):**
```typescript
// Em todas as funções de dados
if (shouldUseMockData()) {
  devLog("Usando dados mock para [operação]");
  await mockDelay(500);
  return [dados_mock];
}
```

**Stock Price API (`stock-price.ts`):**
```typescript
// Preços de ações simulados
if (shouldUseMockData()) {
  devLog(`Usando preço mock para ${ticker}`);
  await mockDelay(200);
  return mockStockPrices[ticker] || DEFAULT_STOCK_PRICE;
}
```

## Dados Mock Detalhados

### Portfolio Mock
```typescript
{
  'AAPL': { quantity: 10, targetPercentage: 30, userRecommendation: 'Comprar' },
  'GOOGL': { quantity: 5, targetPercentage: 25, userRecommendation: 'Aguardar' },
  'MSFT': { quantity: 8, targetPercentage: 20, userRecommendation: 'Comprar' },
  'AMZN': { quantity: 3, targetPercentage: 15, userRecommendation: 'Aguardar' },
  'TSLA': { quantity: 4, targetPercentage: 10, userRecommendation: 'Vender' }
}
```

### Preços Mock
```typescript
{
  'AAPL': 15.00,   'GOOGL': 25.00,  'MSFT': 30.00,
  'AMZN': 32.00,   'TSLA': 80.00,   'NVDA': 4.50,
  'META': 28.00,   'NFLX': 4.20,    'AMD': 0.85
}
```

### Simulações Mock
```typescript
[
  {
    id: 'sim-1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    investmentAmount: 10000,
    portfolioValueBefore: 44000,
    portfolioValueAfter: 45000,
    allocations: [...]
  }
]
```

## Logs e Debugging

### Logs de Desenvolvimento
O sistema gera logs informativos quando em modo de desenvolvimento:

```javascript
[DEV MODE] Usando dados mock para portfólio
[DEV MODE] Usando preços mock para AAPL
[DEV MODE] Usando dados mock para watchlist
```

### Função de Log
```typescript
export const devLog = (message: string, data?: any): void => {
  if (isDevelopmentMode()) {
    console.log(`[DEV MODE] ${message}`, data || '');
  }
};
```

## Delays Simulados

Para tornar a experiência mais realista, delays são simulados:

- **Operações de dados**: 500ms
- **Preços de ações**: 200ms
- **Operações múltiplas**: 300ms
- **Delay customizável**: `mockDelay(ms)`

## Implementação de Novas Features

### Adicionando Dados Mock

1. **Adicione os dados** em `development.ts`:
```typescript
export const mockNewFeatureData = {
  // seus dados mock aqui
};
```

2. **Exporte no objeto default**:
```typescript
export default {
  // ...existing exports
  mockNewFeatureData,
};
```

3. **Use nos serviços**:
```typescript
if (shouldUseMockData()) {
  devLog("Usando dados mock para nova feature");
  await mockDelay(400);
  return mockNewFeatureData;
}
```

### Adicionando Funções de Simulação

```typescript
export const simulateNewFeature = (params: any): any => {
  devLog("Simulando nova feature", params);
  // lógica de simulação
  return result;
};
```

## Troubleshooting

### Problemas Comuns

1. **Dados não aparecem**:
   - Verifique se `NEXT_PUBLIC_DEVELOPMENT_MODE=true`
   - Verifique se `NEXT_PUBLIC_MOCK_DATA=true`
   - Confira os logs no console

2. **Autenticação não funciona**:
   - Verifique se `NEXT_PUBLIC_MOCK_AUTH=true`
   - Limpe o cache do navegador
   - Reinicie o servidor de desenvolvimento

3. **Tipos TypeScript**:
   - Os dados mock seguem os mesmos tipos da aplicação
   - Sempre importe os tipos corretos
   - Use type assertion quando necessário (`as User`)

### Verificação de Status

Para verificar se o modo de desenvolvimento está ativo:

```typescript
console.log("Development Mode:", isDevelopmentMode());
console.log("Mock Auth:", shouldMockAuth());
console.log("Mock Data:", shouldUseMockData());
```

## Segurança

### Considerações Importantes

- **Nunca deploy em produção** com modo de desenvolvimento ativo
- As variáveis `NEXT_PUBLIC_*` são expostas no cliente
- Dados mock são visíveis no código fonte
- Desabilite sempre antes do build de produção

### Verificação Pré-Deploy

```bash
# Verificar variáveis de ambiente antes do deploy
grep -r "NEXT_PUBLIC_DEVELOPMENT_MODE=true" .env*
# Deve retornar vazio em produção
```

## Performance

### Otimizações

- Delays simulados são menores que operações reais
- Cache desabilitado em desenvolvimento
- Logs apenas em modo de desenvolvimento
- Verificações de modo centralizadas para eficiência

### Monitoramento

```typescript
// Tempo de execução das operações mock
console.time('mock-operation');
await mockOperation();
console.timeEnd('mock-operation');
```

---

**Desenvolvido com foco na experiência de desenvolvimento e produtividade da equipe.**
