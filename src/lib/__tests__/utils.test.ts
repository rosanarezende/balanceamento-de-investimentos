import { formatCurrency } from '../utils';

describe('formatCurrency', () => {
  it('deve formatar valores positivos corretamente', () => {
    const result1 = formatCurrency(1234.56);
    const result2 = formatCurrency(10);
    const result3 = formatCurrency(0.99);
    
    // Testa se a formatação contém os elementos corretos
    expect(result1).toMatch(/R\$\s?1\.234,56/);
    expect(result2).toMatch(/R\$\s?10,00/);
    expect(result3).toMatch(/R\$\s?0,99/);
    
    // Testa se não há caracteres inválidos
    expect(result1).not.toContain('undefined');
    expect(result1).not.toContain('NaN');
  });

  it('deve formatar valores negativos corretamente', () => {
    const result1 = formatCurrency(-1234.56);
    const result2 = formatCurrency(-10);
    const result3 = formatCurrency(-0.99);
    
    expect(result1).toMatch(/-?R\$\s?1\.234,56/);
    expect(result2).toMatch(/-?R\$\s?10,00/);
    expect(result3).toMatch(/-?R\$\s?0,99/);
  });

  it('deve formatar zero corretamente', () => {
    const result1 = formatCurrency(0);
    const result2 = formatCurrency(-0);
    
    expect(result1).toMatch(/R\$\s?0,00/);
    expect(result2).toMatch(/R\$\s?0,00/);
  });

  it('deve lidar com valores muito grandes', () => {
    expect(formatCurrency(1234567890.12)).toMatch(/R\$\s*1\.234\.567\.890,12/);
    expect(formatCurrency(999999999999.99)).toMatch(/R\$\s*999\.999\.999\.999,99/);
  });

  it('deve lidar com valores muito pequenos', () => {
    expect(formatCurrency(0.01)).toMatch(/R\$\s*0,01/);
    expect(formatCurrency(0.001)).toMatch(/R\$\s*0,00/); // Arredondado para 2 casas decimais
  });

  it('deve arredondar corretamente para 2 casas decimais', () => {
    expect(formatCurrency(10.125)).toMatch(/R\$\s*10,13/); // Arredondado para cima
    expect(formatCurrency(10.124)).toMatch(/R\$\s*10,12/); // Arredondado para baixo
    expect(formatCurrency(10.999)).toMatch(/R\$\s*11,00/); // Arredondado para cima
  });

  it('deve lidar com números decimais longos', () => {
    expect(formatCurrency(123.456789123)).toMatch(/R\$\s*123,46/);
    expect(formatCurrency(999.999999)).toMatch(/R\$\s*1\.000,00/);
  });

  it('deve lidar com valores especiais', () => {
    expect(formatCurrency(NaN)).toBe('R$ 0,00');
    expect(formatCurrency(Infinity)).toBe('R$ 0,00');
    expect(formatCurrency(-Infinity)).toBe('R$ 0,00');
  });

  it('deve manter formatação brasileira', () => {
    const formatted = formatCurrency(1234567.89);
    
    // Verifica separador de milhares (ponto)
    expect(formatted).toContain('1.234.567');
    
    // Verifica separador decimal (vírgula)
    expect(formatted).toContain(',89');
    
    // Verifica símbolo da moeda
    expect(formatted).toContain('R$');
  });

  it('deve ser consistente com múltiplas chamadas', () => {
    const value = 12345.67;
    const formatted1 = formatCurrency(value);
    const formatted2 = formatCurrency(value);
    
    expect(formatted1).toBe(formatted2);
    expect(formatted1).toMatch(/R\$\s*12\.345,67/);
  });

  it('deve lidar com strings numéricas (se convertível)', () => {
    // Testa se a função lida com tipos de entrada variados
    expect(formatCurrency(Number('123.45'))).toMatch(/R\$\s*123,45/);
    expect(formatCurrency(Number('0'))).toMatch(/R\$\s*0,00/);
  });

  describe('Casos edge específicos para o contexto de investimentos', () => {
    it('deve formatar valores típicos de ações', () => {
      expect(formatCurrency(25.50)).toMatch(/R\$\s*25,50/); // Preço típico de ação
      expect(formatCurrency(12.75)).toMatch(/R\$\s*12,75/); // Preço fracionário
      expect(formatCurrency(100.00)).toMatch(/R\$\s*100,00/); // Preço redondo
    });

    it('deve formatar valores de carteira', () => {
      expect(formatCurrency(50000.00)).toMatch(/R\$\s*50\.000,00/); // Carteira pequena
      expect(formatCurrency(250000.00)).toMatch(/R\$\s*250\.000,00/); // Carteira média
      expect(formatCurrency(1000000.00)).toMatch(/R\$\s*1\.000\.000,00/); // Carteira grande
    });

    it('deve formatar centavos corretamente', () => {
      expect(formatCurrency(0.05)).toMatch(/R\$\s*0,05/); // 5 centavos
      expect(formatCurrency(0.50)).toMatch(/R\$\s*0,50/); // 50 centavos
      expect(formatCurrency(0.99)).toMatch(/R\$\s*0,99/); // 99 centavos
    });

    it('deve formatar diferenças de investimento', () => {
      expect(formatCurrency(125.75)).toMatch(/R\$\s*125,75/); // Diferença positiva
      expect(formatCurrency(-75.25)).toMatch(/-R\$\s*75,25/); // Diferença negativa
    });
  });

  describe('Performance e estabilidade', () => {
    it('deve ser rápido para múltiplas chamadas', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        formatCurrency(Math.random() * 10000);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200); // Deve ser rápido (menos de 200ms para 1000 chamadas)
    });

    it('deve produzir output consistente para o mesmo input', () => {
      const testValues = [0, 1, -1, 1234.56, -9876.54, 0.01, 999999.99];
      
      testValues.forEach(value => {
        const result1 = formatCurrency(value);
        const result2 = formatCurrency(value);
        const result3 = formatCurrency(value);
        
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });
});
