# 🧪 Guia de Implementação dos Mocks Centralizados

Este documento explica como usar o sistema de mocks centralizados para testes no EquilibreInvest.

## 📁 Estrutura dos Mocks

```
src/__mocks__/
├── index.ts                 # Export centralizado de todos os mocks
├── data/                    # Dados mock organizados
│   ├── user.ts             # Dados de usuário mock
│   ├── portfolio.ts        # Dados de portfólio mock
│   ├── stocks.ts           # Preços de ações mock
│   └── simulations.ts      # Simulações mock
├── services/               # Mocks de serviços
│   ├── firebase.ts         # Helpers para Firebase Auth/Firestore
│   └── stock-price.ts      # Helpers para API de preços
└── utils/                  # Utilitários para testes
    └── helpers.ts          # Funções auxiliares
```

## ⚙️ Configuração no jest.setup.js

O arquivo `jest.setup.js` mantém uma **configuração mínima** - apenas garante que os mocks existam:

```javascript
// Mocks simples - valores configurados nos testes
jest.mock('@/services/firebase/firestore', () => ({
  getUserPortfolio: jest.fn(),
  updateStock: jest.fn(),
  // ... outras funções
}))
```

## 🎯 Como Usar nos Testes

### 1. Import das Funções Mock

```typescript
import {
  // Dados mock
  mockUser,
  mockPortfolioData,
  
  // Helpers de configuração
  mockAuthenticatedUser,
  resetAuthMocks,
  setupFirestoreMocks,
  setupStockPricesMock,
  
  // Serviços mockados
  mockFirestoreService,
  mockAuth
} from '@/__mocks__'
```

### 2. Setup no beforeEach

```typescript
beforeEach(() => {
  // Reset dos mocks
  resetAuthMocks()
  
  // Configurar usuário autenticado
  mockAuthenticatedUser()
  
  // Configurar mocks dos serviços com valores específicos
  setupFirestoreMocks()
  setupStockPricesMock()
  
  // Configurações específicas do teste
  mockFirestoreService.getUserPortfolio.mockResolvedValue(mockPortfolioData)
})
```

### 3. Configurações Específicas no Teste

```typescript
it('deve carregar portfólio vazio', async () => {
  // Sobrescrever mock para este teste específico
  mockFirestoreService.getUserPortfolio.mockResolvedValue({})
  
  render(<ListaAtivos />)
  
  await waitFor(() => {
    expect(screen.getByText(/portfólio vazio/i)).toBeInTheDocument()
  })
})
```

## 🔧 Funções Utilitárias Disponíveis

### Autenticação
- `mockAuthenticatedUser()` - Simula usuário logado
- `mockUnauthenticatedUser()` - Simula usuário não logado
- `resetAuthMocks()` - Reset dos mocks de auth
- `setupSuccessfulAuth()` - Configurar auth bem-sucedida
- `setupAuthErrors()` - Configurar erros de auth

### Firestore
- `setupFirestoreMocks()` - Setup padrão do Firestore
- `mockFirestoreService` - Acesso direto aos mocks

### API de Preços
- `setupStockPricesMock()` - Setup padrão da API
- `setupStockPriceMock(ticker)` - Setup para ticker específico
- `resetStockPriceMocks()` - Reset dos mocks

## 📊 Dados Mock Disponíveis

### Usuário
```typescript
const mockUser = {
  uid: 'dev-user-123',
  email: 'dev@example.com',
  displayName: 'Usuário de Desenvolvimento'
}
```

### Portfólio
```typescript
const mockPortfolioData = {
  'AAPL': { quantity: 10, targetPercentage: 30, userRecommendation: 'Comprar' },
  'GOOGL': { quantity: 5, targetPercentage: 25, userRecommendation: 'Aguardar' },
  // ... outras ações
}
```

### Preços
```typescript
const mockStockPrices = {
  'AAPL': 15.00,
  'GOOGL': 25.00,
  'MSFT': 30.00,
  // ... outros preços
}
```

## 🎯 Exemplos Práticos

### Teste de Carregamento de Dados
```typescript
it('deve carregar portfólio do usuário', async () => {
  // Setup específico
  mockFirestoreService.getUserPortfolio.mockResolvedValue(mockPortfolioData)
  
  render(<TestWrapper><ListaAtivos /></TestWrapper>)
  
  // Verificar se dados aparecem na tela
  await waitFor(() => {
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('10 ações')).toBeInTheDocument()
  })
})
```

### Teste de Erro
```typescript
it('deve tratar erro ao carregar portfólio', async () => {
  // Simular erro
  mockFirestoreService.getUserPortfolio.mockRejectedValue(
    new Error('Erro ao carregar portfólio')
  )
  
  render(<TestWrapper><ListaAtivos /></TestWrapper>)
  
  await expectErrorToast('erro.*carregar')
})
```

### Teste de Interação
```typescript
it('deve adicionar nova ação', async () => {
  const user = userEvent.setup()
  
  // Configurar mock para retornar sucesso
  mockFirestoreService.updateStock.mockResolvedValue(true)
  
  render(<TestWrapper><AddStockForm /></TestWrapper>)
  
  // Preencher formulário
  await user.type(screen.getByLabelText(/ticker/i), 'NVDA')
  await user.type(screen.getByLabelText(/quantidade/i), '5')
  await user.click(screen.getByRole('button', { name: /adicionar/i }))
  
  // Verificar se serviço foi chamado
  expect(mockFirestoreService.updateStock).toHaveBeenCalledWith(
    'dev-user-123',
    'NVDA',
    expect.objectContaining({
      quantity: 5
    })
  )
})
```

## ✅ Benefícios da Abordagem

1. **Configuração Simples**: `jest.setup.js` apenas garante que mocks existem
2. **Flexibilidade**: Valores configurados conforme necessidade de cada teste
3. **Reutilização**: Funções utilitárias para cenários comuns
4. **Manutenibilidade**: Dados centralizados em uma única fonte
5. **Legibilidade**: Testes expressam claramente suas intenções

## 🔄 Migration de Testes Existentes

Para migrar testes existentes:

1. **Remover** configurações de mock inline
2. **Importar** funções do `@/__mocks__`
3. **Usar** `setupFirestoreMocks()` no `beforeEach`
4. **Configurar** valores específicos quando necessário

---

**Esta abordagem garante testes mais limpos, organizados e fáceis de manter!** 🚀
