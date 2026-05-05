export function formatVuv(n: number): string {
  return new Intl.NumberFormat('en-VU', {
    style: 'currency',
    currency: 'VUV',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatVuvMillions(n: number): string {
  const m = n / 1_000_000;
  return `${m.toFixed(1)}M VUV`;
}

export function formatInt(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}
