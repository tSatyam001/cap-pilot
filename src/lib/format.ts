export function formatNumber(n: number, currency?: '$' | '₹'): string {
  if (currency) {
    return `${currency}${n.toLocaleString('en-US')}`;
  }
  return n.toLocaleString('en-US');
}

export function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function formatCompact(n: number, currency?: '$' | '₹'): string {
  const prefix = currency || '';
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`;
  return `${prefix}${n}`;
}
