import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockSchema } from '../lib/schemas/stock';
import { formatCurrency } from '@/core/utils';
import { 
  getCachedStockPrice, 
  setCachedStockPrice, 
  clearAllStockPriceCache 
} from '../utils/client/cache';

// Mock dos módulos externos
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  })
}));

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Integração: Schema + Cache + Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Fluxo completo de validação e cache', () => {
    it('deve validar ação, cachear preço e formatar valor corretamente', () => {
      // 1. Validar ação com schema Zod
      const stockData = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 15.5,
        userRecommendation: 'Comprar' as const
      };

      const validationResult = StockSchema.safeParse(stockData);
      expect(validationResult.success).toBe(true);

      if (validationResult.success) {
        const validStock = validationResult.data;
        
        // 2. Simular cache de preço
        const stockPrice = 25.50;
        setCachedStockPrice(validStock.ticker, stockPrice);
        
        // 3. Recuperar preço do cache
        const cachedPrice = getCachedStockPrice(validStock.ticker);
        expect(cachedPrice).toBe(stockPrice);
        
        // 4. Calcular valor atual e formatar
        const currentValue = validStock.quantity * stockPrice;
        const formattedValue = formatCurrency(currentValue);
        
        expect(currentValue).toBe(2550); // 100 * 25.50
        expect(formattedValue).toBe('R$ 2.550,00');
      }
    });

    it('deve lidar com múltiplas ações e cálculos de portfólio', () => {
      const stocks = [
        { ticker: 'PETR4', quantity: 100, targetPercentage: 30, price: 25.50 },
        { ticker: 'VALE3', quantity: 50, targetPercentage: 25, price: 65.30 },
        { ticker: 'ITUB4', quantity: 200, targetPercentage: 45, price: 30.20 }
      ];

      let totalValue = 0;
      const stocksWithDetails = [];

      for (const stock of stocks) {
        // Validar cada ação
        const validationResult = StockSchema.safeParse({
          ticker: stock.ticker,
          quantity: stock.quantity,
          targetPercentage: stock.targetPercentage,
          userRecommendation: 'Comprar' as const
        });

        expect(validationResult.success).toBe(true);

        if (validationResult.success) {
          // Cachear preço
          setCachedStockPrice(stock.ticker, stock.price);
          
          // Calcular valor
          const currentValue = stock.quantity * stock.price;
          totalValue += currentValue;
          
          stocksWithDetails.push({
            ...validationResult.data,
            currentPrice: stock.price,
            currentValue
          });
        }
      }

      // Verificar total da carteira
      expect(totalValue).toBe(12844); // 2550 + 3265 + 6040

      // Verificar formatação do total
      const formattedTotal = formatCurrency(totalValue);
      expect(formattedTotal).toBe('R$ 12.844,00');

      // Calcular percentuais atuais
      const stocksWithPercentages = stocksWithDetails.map(stock => ({
        ...stock,
        currentPercentage: (stock.currentValue / totalValue) * 100
      }));

      // Verificar se os percentuais somam aproximadamente 100%
      const totalPercentage = stocksWithPercentages.reduce(
        (sum, stock) => sum + stock.currentPercentage, 0
      );
      expect(Math.round(totalPercentage)).toBe(100);
    });

    it('deve gerenciar cache durante mudanças de portfólio', () => {
      const initialStocks = ['PETR4', 'VALE3', 'ITUB4'];
      const prices = [25.50, 65.30, 30.20];

      // Cachear preços iniciais
      initialStocks.forEach((ticker, index) => {
        setCachedStockPrice(ticker, prices[index]);
      });

      // Verificar se todos estão cacheados
      initialStocks.forEach((ticker, index) => {
        expect(getCachedStockPrice(ticker)).toBe(prices[index]);
      });

      // Simular remoção de uma ação do portfólio
      const removedStock = 'VALE3';
      clearAllStockPriceCache(); // Limpar todo cache ao atualizar portfólio

      // Verificar se cache foi limpo
      initialStocks.forEach(ticker => {
        expect(getCachedStockPrice(ticker)).toBeNull();
      });

      // Re-cachear apenas ações restantes
      const remainingStocks = initialStocks.filter(ticker => ticker !== removedStock);
      remainingStocks.forEach((ticker, index) => {
        const priceIndex = initialStocks.indexOf(ticker);
        setCachedStockPrice(ticker, prices[priceIndex]);
      });

      // Verificar estado final
      expect(getCachedStockPrice('PETR4')).toBe(25.50);
      expect(getCachedStockPrice('VALE3')).toBeNull();
      expect(getCachedStockPrice('ITUB4')).toBe(30.20);
    });

    it('deve validar e processar dados de simulação completa', () => {
      const portfolioData = {
        'PETR4': { quantity: 100, targetPercentage: 30, userRecommendation: 'Comprar' as const },
        'VALE3': { quantity: 50, targetPercentage: 25, userRecommendation: 'Aguardar' as const },
        'ITUB4': { quantity: 200, targetPercentage: 45, userRecommendation: 'Vender' as const }
      };

      const investmentAmount = 5000;
      const currentPrices = { 'PETR4': 25.50, 'VALE3': 65.30, 'ITUB4': 30.20 };

      // Validar estrutura do portfólio
      Object.entries(portfolioData).forEach(([ticker, stockData]) => {
        const validation = StockSchema.safeParse({
          ticker,
          ...stockData
        });
        expect(validation.success).toBe(true);
      });

      // Calcular simulação de investimento
      const simulation = Object.entries(portfolioData)
        .filter(([_, stock]) => stock.userRecommendation === 'Comprar')
        .map(([ticker, stock]) => {
          const currentPrice = currentPrices[ticker as keyof typeof currentPrices];
          const currentValue = stock.quantity * currentPrice;
          const investmentForStock = (stock.targetPercentage / 100) * investmentAmount;
          const newQuantity = stock.quantity + Math.floor(investmentForStock / currentPrice);
          
          return {
            ticker,
            currentValue,
            investmentAmount: investmentForStock,
            newQuantity,
            quantityToAcquire: newQuantity - stock.quantity,
            formattedCurrentValue: formatCurrency(currentValue),
            formattedInvestment: formatCurrency(investmentForStock)
          };
        });

      // Verificar se apenas ações marcadas como "Comprar" foram incluídas
      expect(simulation).toHaveLength(1); // Apenas PETR4
      expect(simulation[0].ticker).toBe('PETR4');
      
      // Verificar cálculos
      const petr4Simulation = simulation[0];
      expect(petr4Simulation.currentValue).toBe(2550); // 100 * 25.50
      expect(petr4Simulation.investmentAmount).toBe(1500); // 30% de 5000
      expect(petr4Simulation.quantityToAcquire).toBe(58); // floor(1500 / 25.50) = 58
      expect(petr4Simulation.formattedCurrentValue).toMatch(/R\$\s*2\.550,00/);
      expect(petr4Simulation.formattedInvestment).toMatch(/R\$\s*1\.500,00/);
    });
  });

  describe('Casos de erro e recuperação', () => {
    it('deve lidar graciosamente com dados inválidos', () => {
      // Dados inválidos que devem falhar na validação
      const invalidStock = {
        ticker: '', // Ticker vazio
        quantity: -10, // Quantidade negativa
        targetPercentage: 150 // Percentual inválido
      };

      const validation = StockSchema.safeParse(invalidStock);
      expect(validation.success).toBe(false);

      if (!validation.success) {
        expect(validation.error.errors.length).toBeGreaterThan(0);
        
        // Verificar se há erros específicos
        const errorMessages = validation.error.errors.map(e => e.message);
        expect(errorMessages.some(msg => msg.includes('obrigatório'))).toBe(true);
      }
    });

    it('deve manter consistência mesmo com cache corrompido', () => {
      const ticker = 'PETR4';
      
      // Simular cache corrompido
      localStorage.setItem(`stock_price_${ticker}`, 'dados-inválidos');
      
      // Tentar recuperar - deve retornar null
      const cachedPrice = getCachedStockPrice(ticker);
      expect(cachedPrice).toBeNull();
      
      // Deve permitir definir novo cache válido
      setCachedStockPrice(ticker, 25.50);
      expect(getCachedStockPrice(ticker)).toBe(25.50);
    });

    it('deve formatar valores extremos corretamente', () => {
      const extremeValues = [
        { value: 0, expected: 'R$ 0,00' },
        { value: 0.01, expected: 'R$ 0,01' },
        { value: 999999999.99, expected: 'R$ 999.999.999,99' },
        { value: -123456.78, expected: '-R$ 123.456,78' }
      ];

      extremeValues.forEach(({ value, expected }) => {
        expect(formatCurrency(value)).toMatch(new RegExp(expected.replace(/\$/g, '\\$').replace(/\s/g, '\\s*')));
      });

      // Valores especiais
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
      expect(formatCurrency(Infinity)).toBe('R$ 0,00');
    });
  });

  describe('Performance em cenários complexos', () => {
    it('deve processar portfólio grande eficientemente', () => {
      const start = Date.now();
      
      // Simular carteira com 100 ações
      const largePortfolio = Array(100).fill(0).map((_, index) => ({
        ticker: `STOCK${index.toString().padStart(3, '0')}`,
        quantity: Math.floor(Math.random() * 1000) + 1,
        targetPercentage: Math.random() * 10,
        userRecommendation: 'Comprar' as const,
        price: Math.random() * 100 + 10
      }));

      // Validar todas as ações
      const validStocks = largePortfolio.filter(stock => {
        const validation = StockSchema.safeParse(stock);
        return validation.success;
      });

      // Cachear todos os preços
      validStocks.forEach(stock => {
        setCachedStockPrice(stock.ticker, stock.price);
      });

      // Calcular valores totais
      const totalValue = validStocks.reduce((sum, stock) => {
        const value = stock.quantity * stock.price;
        return sum + value;
      }, 0);

      // Formatar resultado
      const formattedTotal = formatCurrency(totalValue);

      const duration = Date.now() - start;
      
      // Verificações
      expect(validStocks).toHaveLength(100); // Todas devem ser válidas
      expect(totalValue).toBeGreaterThan(0);
      expect(formattedTotal).toContain('R$');
      expect(duration).toBeLessThan(500); // Deve ser rápido (menos de 500ms)
    });
  });
});
