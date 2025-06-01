import { 
  StockSchema, 
  StockWithDetailsSchema, 
  PortfolioSchema, 
  SimulationAllocationSchema,
  SimulationSchema,
  PortfolioSummarySchema 
} from '../stock';

describe('Stock Schemas', () => {
  describe('StockSchema', () => {
    it('deve validar uma ação válida', () => {
      const validStock = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 15.5,
        userRecommendation: 'Comprar' as const
      };

      const result = StockSchema.safeParse(validStock);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validStock);
      }
    });

    it('deve validar ação sem recomendação (campo opcional)', () => {
      const stockWithoutRecommendation = {
        ticker: 'VALE3',
        quantity: 50,
        targetPercentage: 10.0
      };

      const result = StockSchema.safeParse(stockWithoutRecommendation);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar ticker vazio', () => {
      const invalidStock = {
        ticker: '',
        quantity: 100,
        targetPercentage: 15.5
      };

      const result = StockSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('ticker');
        expect(result.error.errors[0].message).toContain('obrigatório');
      }
    });

    it('deve rejeitar ticker muito longo', () => {
      const invalidStock = {
        ticker: 'TICKER_MUITO_LONGO',
        quantity: 100,
        targetPercentage: 15.5
      };

      const result = StockSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar quantidade negativa', () => {
      const invalidStock = {
        ticker: 'PETR4',
        quantity: -10,
        targetPercentage: 15.5
      };

      const result = StockSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar porcentagem alvo negativa', () => {
      const invalidStock = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: -5
      };

      const result = StockSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar porcentagem alvo maior que 100', () => {
      const invalidStock = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 150
      };

      const result = StockSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar recomendação inválida', () => {
      const invalidStock = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 15.5,
        userRecommendation: 'Manter' // Valor inválido
      };

      const result = StockSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });

    it('deve aceitar todas as recomendações válidas', () => {
      const recommendations = ['Comprar', 'Vender', 'Aguardar'] as const;
      
      recommendations.forEach(recommendation => {
        const stock = {
          ticker: 'PETR4',
          quantity: 100,
          targetPercentage: 15.5,
          userRecommendation: recommendation
        };

        const result = StockSchema.safeParse(stock);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('StockWithDetailsSchema', () => {
    it('deve validar ação com detalhes completos', () => {
      const stockWithDetails = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 15.5,
        userRecommendation: 'Comprar' as const,
        currentPrice: 25.50,
        currentValue: 2550.00,
        currentPercentage: 12.5,
        targetValue: 3000.00,
        targetDifference: 450.00,
        targetDifferencePercentage: 17.65
      };

      const result = StockWithDetailsSchema.safeParse(stockWithDetails);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar preço atual negativo', () => {
      const invalidStock = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 15.5,
        currentPrice: -25.50,
        currentValue: 2550.00,
        currentPercentage: 12.5,
        targetValue: 3000.00,
        targetDifference: 450.00,
        targetDifferencePercentage: 17.65
      };

      const result = StockWithDetailsSchema.safeParse(invalidStock);
      expect(result.success).toBe(false);
    });

    it('deve aceitar diferenças negativas', () => {
      const stockWithNegativeDifference = {
        ticker: 'PETR4',
        quantity: 100,
        targetPercentage: 15.5,
        currentPrice: 25.50,
        currentValue: 2550.00,
        currentPercentage: 12.5,
        targetValue: 2000.00,
        targetDifference: -550.00, // Diferença negativa deve ser aceita
        targetDifferencePercentage: -21.57
      };

      const result = StockWithDetailsSchema.safeParse(stockWithNegativeDifference);
      expect(result.success).toBe(true);
    });
  });

  describe('PortfolioSchema', () => {
    it('deve validar portfólio válido', () => {
      const portfolio = {
        'PETR4': {
          quantity: 100,
          targetPercentage: 15.5,
          userRecommendation: 'Comprar' as const
        },
        'VALE3': {
          quantity: 50,
          targetPercentage: 20.0,
          userRecommendation: 'Aguardar' as const
        }
      };

      const result = PortfolioSchema.safeParse(portfolio);
      expect(result.success).toBe(true);
    });

    it('deve validar portfólio vazio', () => {
      const emptyPortfolio = {};

      const result = PortfolioSchema.safeParse(emptyPortfolio);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar portfólio com dados inválidos', () => {
      const invalidPortfolio = {
        'PETR4': {
          quantity: -100, // Quantidade inválida
          targetPercentage: 15.5
        }
      };

      const result = PortfolioSchema.safeParse(invalidPortfolio);
      expect(result.success).toBe(false);
    });
  });

  describe('SimulationAllocationSchema', () => {
    it('deve validar alocação de simulação válida', () => {
      const allocation = {
        ticker: 'PETR4',
        currentValue: 2550.00,
        currentPercentage: 12.5,
        targetPercentage: 15.5,
        currentQuantity: 100,
        investmentAmount: 500.00,
        newQuantity: 120,
        quantityToAcquire: 20,
        currentPrice: 25.50,
        userRecommendation: 'Comprar' as const,
        isEligibleForInvestment: true
      };

      const result = SimulationAllocationSchema.safeParse(allocation);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar valores negativos onde não permitido', () => {
      const invalidAllocation = {
        ticker: 'PETR4',
        currentValue: -2550.00, // Valor inválido
        currentPercentage: 12.5,
        targetPercentage: 15.5,
        currentQuantity: 100,
        investmentAmount: 500.00,
        newQuantity: 120,
        quantityToAcquire: 20,
        currentPrice: 25.50,
        isEligibleForInvestment: true
      };

      const result = SimulationAllocationSchema.safeParse(invalidAllocation);
      expect(result.success).toBe(false);
    });
  });

  describe('SimulationSchema', () => {
    it('deve validar simulação completa', () => {
      const simulation = {
        id: 'sim-123',
        date: new Date('2024-01-15'),
        investmentAmount: 1000.00,
        portfolioValueBefore: 20000.00,
        portfolioValueAfter: 21000.00,
        allocations: [
          {
            ticker: 'PETR4',
            currentValue: 2550.00,
            currentPercentage: 12.5,
            targetPercentage: 15.5,
            currentQuantity: 100,
            investmentAmount: 500.00,
            newQuantity: 120,
            quantityToAcquire: 20,
            currentPrice: 25.50,
            userRecommendation: 'Comprar' as const,
            isEligibleForInvestment: true
          }
        ]
      };

      const result = SimulationSchema.safeParse(simulation);
      expect(result.success).toBe(true);
    });
  });

  describe('PortfolioSummarySchema', () => {
    it('deve validar resumo do portfólio', () => {
      const summary = {
        totalValue: 20000.00,
        stockCount: 5,
        hasEligibleStocks: true
      };

      const result = PortfolioSummarySchema.safeParse(summary);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar valores inválidos', () => {
      const invalidSummary = {
        totalValue: -20000.00, // Valor inválido
        totalStocks: 5,
        averagePerformance: 8.5
      };

      const result = PortfolioSummarySchema.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });
  });

  describe('Casos edge e integração', () => {
    it('deve lidar com números decimais extremos', () => {
      const stock = {
        ticker: 'PETR4',
        quantity: 0.001,
        targetPercentage: 0.01
      };

      const result = StockSchema.safeParse(stock);
      expect(result.success).toBe(true);
    });

    it('deve lidar com zeros', () => {
      const stock = {
        ticker: 'PETR4',
        quantity: 0,
        targetPercentage: 0
      };

      const result = StockSchema.safeParse(stock);
      expect(result.success).toBe(true);
    });

    it('deve preservar precisão decimal', () => {
      const stock = {
        ticker: 'PETR4',
        quantity: 100.123456,
        targetPercentage: 15.789123
      };

      const result = StockSchema.safeParse(stock);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.quantity).toBe(100.123456);
        expect(result.data.targetPercentage).toBe(15.789123);
      }
    });
  });
});
