export function formatMoney(cents: number): string {
  const rub = cents / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rub);
}

export function rubToCents(rub: number): number {
  return Math.round(rub * 100);
}

export function centsToRub(cents: number): number {
  return cents / 100;
}
