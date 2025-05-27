export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}
