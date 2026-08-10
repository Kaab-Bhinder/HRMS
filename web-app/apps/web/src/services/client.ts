/**
 * Real API client. Talks to the NestJS backend, attaches the JWT access token,
 * transparently refreshes on 401 (rotating refresh cookie), and unwraps the
 * uniform response envelope ({success,data} / {success,data,meta}).
 *
 * Set VITE_USE_MOCKS=true to run the UI on the in-memory dataset instead.
 */
import type { ListParams, Paginated } from '../lib/types';

export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true';
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const json = await res.json();
    accessToken = json?.data?.accessToken ?? null;
    return !!accessToken;
  } catch {
    return false;
  }
}

async function request(path: string, init: RequestInit, retry = true): Promise<Response> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && path !== '/auth/login' && path !== '/auth/refresh') {
    if (await tryRefresh()) return request(path, init, false);
  }
  return res;
}

/** Core request. Returns unwrapped `data`, or `{data, meta}` for list endpoints. */
export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await request(path, init);
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const err = json?.error;
    const e = new Error(err?.message ?? res.statusText) as Error & {
      code?: string; fields?: unknown; status?: number;
    };
    e.code = err?.code;
    e.fields = err?.fields;
    // Callers need the HTTP status to tell a wrong password (401) from a
    // blocked account (403) or rate limiting (429) — the message alone is
    // deliberately vague on the first of those.
    e.status = res.status;
    throw e;
  }
  return (json?.meta !== undefined ? { data: json.data, meta: json.meta } : json?.data) as T;
}

export const api = {
  get: <T>(path: string) => http<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => http<T>(path, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => http<T>(path, { method: 'PATCH', body: body != null ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => http<T>(path, { method: 'PUT', body: body != null ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => http<T>(path, { method: 'DELETE' }),
  // multipart upload — request() skips the JSON Content-Type for FormData bodies
  upload: <T>(path: string, form: FormData) => http<T>(path, { method: 'POST', body: form }),
};

/** Fetch an authenticated binary (file download) and save it in the browser. */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const res = await request(path, { method: 'GET' });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Fetch an authenticated image/binary and return a blob object URL for inline
 *  display. Caller should URL.revokeObjectURL(url) when done. */
export async function fetchBlobUrl(path: string): Promise<string> {
  const res = await request(path, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load image');
  return URL.createObjectURL(await res.blob());
}

/** Serialize ListParams into a query string. `filters` become query params;
 *  `cf.<key>` filters map to the backend's cfKey/cfValue pair. */
export function qs(params?: ListParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.search) sp.set('search', params.search);
  if (params.sort) sp.set('sort', params.sort);
  if (params.order) sp.set('order', params.order);
  for (const [k, v] of Object.entries(params.filters ?? {})) {
    if (v == null || v === '' || v === 'all') continue;
    if (k.startsWith('cf.')) { sp.set('cfKey', k.slice(3)); sp.set('cfValue', String(v)); }
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// --- retained for the mock layer (used only when USE_MOCKS) ---
export function mockResult<T>(data: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));
}
export function paginate<T extends Record<string, any>>(rows: T[], params: ListParams | undefined, searchFields: (keyof T)[]): Paginated<T> {
  const { page = 1, limit = 10, search = '', sort, order = 'asc', filters = {} } = params ?? {};
  let result = [...rows];
  if (search) { const q = search.toLowerCase(); result = result.filter((r) => searchFields.some((f) => String(r[f] ?? '').toLowerCase().includes(q))); }
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined || val === '' || val === 'all') continue;
    if (key.startsWith('cf.')) { const cfKey = key.slice(3); result = result.filter((r) => String((r.customFields ?? {})[cfKey] ?? '') === val); }
    else result = result.filter((r) => String(r[key] ?? '') === val);
  }
  if (sort) result.sort((a, b) => { const av = a[sort], bv = b[sort]; if (av == null) return 1; if (bv == null) return -1; const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv)); return order === 'asc' ? cmp : -cmp; });
  const total = result.length; const start = (page - 1) * limit;
  return { data: result.slice(start, start + limit), meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}
