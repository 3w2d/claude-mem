export const fmt = (n: number, d = 0): string =>
  Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '—';

export const fmtCurrency = (n: number): string =>
  Number.isFinite(n) ? `${fmt(Math.round(n))} ر.س` : '—';

export const fmtCompact = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return fmt(n);
};
