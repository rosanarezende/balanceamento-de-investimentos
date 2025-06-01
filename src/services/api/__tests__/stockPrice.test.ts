import { 
  getStockPrice, 
  getMultipleStockPrices, 
  saveManualRecommendation,
  fetchDailyChange,
  RECOMMENDATION_TYPES,
  RECOMMENDATION_DESCRIPTIONS
} from '../stockPrice';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do cache
jest.mock('../../../utils/client/cache', () => ({
  getCachedStockPrice: jest.fn(() => null), // Sempre retorna null para forçar fetch
  setCachedStockPrice: jest.fn(),
  clearStockPriceCache: jest.fn(),
}));

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

describe('Stock Price API', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe('getStockPrice', () => {
    it('deve retornar preço de ação válida', async () => {
      const mockPrice = 25.50;
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: mockPrice })
      } as Response);

      const price = await getStockPrice('PETR4');
      
      expect(price).toBe(mockPrice);
      expect(fetch).toHaveBeenCalledWith('/api/stock-price?ticker=PETR4.SA', {
        signal: expect.any(AbortSignal)
      });
    });

    it('deve adicionar sufixo .SA para ações brasileiras', async () => {
      const mockPrice = 65.30;
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: mockPrice })
      } as Response);

      await getStockPrice('VALE3');
      
      expect(fetch).toHaveBeenCalledWith('/api/stock-price?ticker=VALE3.SA', {
        signal: expect.any(AbortSignal)
      });
    });

    it('não deve adicionar sufixo se já existir', async () => {
      const mockPrice = 25.50;
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: mockPrice })
      } as Response);

      await getStockPrice('PETR4.SA');
      
      expect(fetch).toHaveBeenCalledWith('/api/stock-price?ticker=PETR4.SA', {
        signal: expect.any(AbortSignal)
      });
    });

    it('deve retornar valor padrão em caso de erro de rede', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const price = await getStockPrice('PETR4');
      
      expect(price).toBe(50); // DEFAULT_STOCK_PRICE
    });

    it('deve retornar valor padrão quando API retorna erro', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      } as Response);

      const price = await getStockPrice('INVALID');
      
      expect(price).toBe(50); // DEFAULT_STOCK_PRICE
    });

    it('deve retornar valor padrão quando resposta não tem preço válido', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Price not available' })
      } as Response);

      const price = await getStockPrice('PETR4');
      
      expect(price).toBe(50); // DEFAULT_STOCK_PRICE
    });

    it('deve usar cache para requisições repetidas', async () => {
      const mockPrice = 25.50;
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: mockPrice })
      } as Response);

      // Primeira chamada
      const price1 = await getStockPrice('PETR4');
      // Segunda chamada (deve usar cache)
      const price2 = await getStockPrice('PETR4');
      
      expect(price1).toBe(mockPrice);
      expect(price2).toBe(mockPrice);
      expect(fetch).toHaveBeenCalledTimes(1); // Apenas uma chamada ao fetch
    });

    it('deve lidar com timeout adequadamente', async () => {
      // Mock de uma requisição que nunca resolve
      (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(
        () => new Promise(() => {}) // Promise que nunca resolve
      );

      const price = await getStockPrice('TIMEOUT_TEST');
      
      expect(price).toBe(50); // DEFAULT_STOCK_PRICE
    }, 10000); // Timeout do teste maior que o timeout da função
  });

  describe('getMultipleStockPrices', () => {
    it('deve retornar preços para múltiplas ações', async () => {
      const tickers = ['PETR4', 'VALE3', 'ITUB4'];
      const prices = [25.50, 65.30, 30.20];
      
      // Mock das respostas para cada ticker
      prices.forEach((price) => {
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price })
        } as Response);
      });

      const result = await getMultipleStockPrices(tickers);
      
      expect(result).toEqual({
        'PETR4': 25.50,
        'VALE3': 65.30,
        'ITUB4': 30.20
      });
    });

    it('deve processar ações em lotes', async () => {
      const tickers = Array(12).fill(0).map((_, i) => `STOCK${i}`);
      const mockPrice = 50;
      
      // Mock de todas as respostas
      tickers.forEach(() => {
        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: mockPrice })
        } as Response);
      });

      const result = await getMultipleStockPrices(tickers);
      
      expect(Object.keys(result)).toHaveLength(12);
      expect(fetch).toHaveBeenCalledTimes(12);
    }, 10000); // Aumentar timeout para 10 segundos

    it('deve lidar com falhas parciais', async () => {
      const tickers = ['PETR4', 'INVALID', 'VALE3'];
      
      // Primeira chamada - sucesso
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: 25.50 })
      } as Response);
      
      // Segunda chamada - falha
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      // Terceira chamada - sucesso
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: 65.30 })
      } as Response);

      const result = await getMultipleStockPrices(tickers);
      
      expect(result).toEqual({
        'PETR4': 25.50,
        'INVALID': 50, // DEFAULT_STOCK_PRICE para falha
        'VALE3': 65.30
      });
    });

    it('deve retornar objeto vazio para array vazio', async () => {
      const result = await getMultipleStockPrices([]);
      
      expect(result).toEqual({});
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('saveManualRecommendation', () => {
    it('deve salvar recomendação com sucesso', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true
      } as Response);

      await expect(
        saveManualRecommendation('PETR4', 'Comprar')
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/save-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker: 'PETR4', recommendation: 'Comprar' }),
        signal: expect.any(AbortSignal)
      });
    });

    it('deve lidar com erro do servidor', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(
        saveManualRecommendation('PETR4', 'Comprar')
      ).resolves.not.toThrow(); // Não deve lançar erro, apenas logar
    });

    it('deve lidar com erro de rede', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        saveManualRecommendation('PETR4', 'Comprar')
      ).resolves.not.toThrow(); // Não deve lançar erro, apenas logar
    });
  });

  describe('fetchDailyChange', () => {
    it('deve retornar variação simulada entre -5% e +5%', async () => {
      const variations = [];
      
      // Testar múltiplas chamadas para verificar randomização
      for (let i = 0; i < 100; i++) {
        const variation = await fetchDailyChange('PETR4');
        variations.push(variation);
        
        expect(variation).toBeGreaterThanOrEqual(-5);
        expect(variation).toBeLessThanOrEqual(5);
      }
      
      // Verificar se há variação (não todos iguais)
      const uniqueValues = new Set(variations);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    it('deve aceitar qualquer ticker', async () => {
      const tickers = ['PETR4', 'VALE3', 'INVALID', ''];
      
      for (const ticker of tickers) {
        const variation = await fetchDailyChange(ticker);
        expect(typeof variation).toBe('number');
        expect(variation).toBeGreaterThanOrEqual(-5);
        expect(variation).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Constantes', () => {
    it('deve exportar tipos de recomendação corretos', () => {
      expect(RECOMMENDATION_TYPES).toEqual(['Comprar', 'Vender', 'Aguardar']);
      expect(RECOMMENDATION_TYPES).toHaveLength(3);
    });

    it('deve exportar descrições para todos os tipos', () => {
      expect(RECOMMENDATION_DESCRIPTIONS).toHaveProperty('Comprar');
      expect(RECOMMENDATION_DESCRIPTIONS).toHaveProperty('Vender');
      expect(RECOMMENDATION_DESCRIPTIONS).toHaveProperty('Aguardar');
      
      // Verificar se as descrições são strings não vazias
      Object.values(RECOMMENDATION_DESCRIPTIONS).forEach(description => {
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('deve ter descrições coerentes com os tipos', () => {
      RECOMMENDATION_TYPES.forEach(type => {
        expect(RECOMMENDATION_DESCRIPTIONS).toHaveProperty(type);
      });
    });
  });

  describe('Cache interno da API', () => {
    it('deve usar cache interno para chamadas repetidas rápidas', async () => {
      const mockPrice = 25.50;
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: mockPrice })
      } as Response);

      // Chamadas rápidas consecutivas
      const [price1, price2, price3] = await Promise.all([
        getStockPrice('PETR4'),
        getStockPrice('PETR4'),
        getStockPrice('PETR4')
      ]);
      
      expect(price1).toBe(mockPrice);
      expect(price2).toBe(mockPrice);
      expect(price3).toBe(mockPrice);
      expect(fetch).toHaveBeenCalledTimes(1); // Cache interno evita chamadas redundantes
    });
  });
});
