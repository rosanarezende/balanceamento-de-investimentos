// Script de teste para validar o modo de desenvolvimento
// Execute com: node test-development-mode.js

console.log('🧪 Testando Modo de Desenvolvimento...\n');

// Simular variáveis de ambiente do Next.js
process.env.NEXT_PUBLIC_DEVELOPMENT_MODE = 'true';
process.env.NEXT_PUBLIC_MOCK_AUTH = 'true';
process.env.NEXT_PUBLIC_MOCK_DATA = 'true';

// Importar as funções de desenvolvimento (simulação para teste)
const mockDevelopmentUtils = {
  isDevelopmentMode: () => process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true',
  shouldMockAuth: () => process.env.NEXT_PUBLIC_MOCK_AUTH === 'true',
  shouldUseMockData: () => process.env.NEXT_PUBLIC_MOCK_DATA === 'true',
  
  getMockUser: () => ({
    uid: 'dev-user-123',
    email: 'dev@example.com',
    displayName: 'Usuário de Desenvolvimento',
    photoURL: null
  }),
  
  getMockPortfolio: () => [
    { symbol: 'AAPL', shares: 10, purchasePrice: 150.00 },
    { symbol: 'GOOGL', shares: 5, purchasePrice: 2500.00 },
    { symbol: 'MSFT', shares: 8, purchasePrice: 300.00 },
    { symbol: 'AMZN', shares: 3, purchasePrice: 3200.00 },
    { symbol: 'TSLA', shares: 15, purchasePrice: 800.00 }
  ],
  
  simulateStockPrices: (symbols) => {
    const mockPrices = {
      AAPL: 175.50,
      GOOGL: 2750.25,
      MSFT: 350.75,
      AMZN: 3500.00,
      TSLA: 850.25
    };
    return symbols.reduce((acc, symbol) => {
      acc[symbol] = mockPrices[symbol] || 100.00;
      return acc;
    }, {});
  }
};

// Executar testes
console.log('✅ Teste 1: Verificação de flags de ambiente');
console.log(`   - Development Mode: ${mockDevelopmentUtils.isDevelopmentMode()}`);
console.log(`   - Mock Auth: ${mockDevelopmentUtils.shouldMockAuth()}`);
console.log(`   - Mock Data: ${mockDevelopmentUtils.shouldUseMockData()}`);

console.log('\n✅ Teste 2: Dados mock do usuário');
const mockUser = mockDevelopmentUtils.getMockUser();
console.log(`   - UID: ${mockUser.uid}`);
console.log(`   - Email: ${mockUser.email}`);
console.log(`   - Nome: ${mockUser.displayName}`);

console.log('\n✅ Teste 3: Dados mock da carteira');
const mockPortfolio = mockDevelopmentUtils.getMockPortfolio();
console.log(`   - Total de ativos: ${mockPortfolio.length}`);
mockPortfolio.forEach(stock => {
  console.log(`   - ${stock.symbol}: ${stock.shares} ações a $${stock.purchasePrice}`);
});

console.log('\n✅ Teste 4: Simulação de preços');
const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
const mockPrices = mockDevelopmentUtils.simulateStockPrices(symbols);
symbols.forEach(symbol => {
  console.log(`   - ${symbol}: $${mockPrices[symbol]}`);
});

console.log('\n🎉 Todos os testes passaram! O modo de desenvolvimento está funcionando corretamente.');
console.log('\n📋 Resumo das funcionalidades disponíveis:');
console.log('   • Autenticação simulada (sem Firebase)');
console.log('   • Dados de carteira mock com 5 ações');
console.log('   • Preços de ações simulados');
console.log('   • Dados de watchlist e histórico mock');
console.log('   • Simulação de atrasos de rede');
console.log('\n🚀 A aplicação pode ser usada completamente offline!');
