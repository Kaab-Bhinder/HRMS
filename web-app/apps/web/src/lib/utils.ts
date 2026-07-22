/** Lightweight className combiner (no external dep). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function initials(name: string | null | undefined): string {
  // Null-safe: a null/blank name (e.g. an unassigned reviewer) must never crash
  // the Avatar and take down the whole page — return a neutral placeholder.
  if (!name || typeof name !== 'string' || !name.trim()) return '·';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '·';
}

/** Deterministic color index for avatars/badges from a string. */
export function hashIndex(str: string | null | undefined, mod: number): number {
  if (!str || typeof str !== 'string') return 0;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function debounce<A extends unknown[]>(fn: (...a: A) => void, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...a: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
