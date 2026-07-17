export function formatDate(value?: string | Date | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', opts ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
}

export function formatDateTime(value?: string | Date | null): string {
  return formatDate(value, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatTime(value?: string | Date | null): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(d);
}

export function relativeTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536e6], ['month', 2592e6], ['day', 864e5],
    ['hour', 36e5], ['minute', 6e4], ['second', 1e3],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === 'second') return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural ?? singular + 's'}`;
}
