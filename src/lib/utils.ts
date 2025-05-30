export function formatCurrency(value: number): string {
  // Verificar se o valor é um número válido
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('Tentativa de formatar valor não numérico:', value);
    return 'R$ 0,00'; // Valor padrão seguro
  }
  
  try {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } catch (error) {
    console.error('Erro ao formatar valor:', error);
    return 'R$ 0,00'; // Fallback em caso de erro
  }
}

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}
