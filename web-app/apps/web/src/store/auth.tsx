import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CurrentUser } from '../lib/types';
import { api, setAccessToken } from '../services/client';

interface AuthCtx {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

/** Backend AuthUser → the CurrentUser shape the UI uses. */
interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
}
function mapUser(u: BackendUser): CurrentUser {
  const roleName = u.isSuperAdmin ? 'Super Admin' : titleCase(u.roles?.[0] ?? 'Member');
  return { id: u.id, fullName: u.fullName, email: u.email, roleName, permissions: u.permissions };
}
function titleCase(s: string) {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore a session from the refresh cookie (survives reloads).
    (async () => {
      try {
        const data = await api.post<{ accessToken: string; user: BackendUser }>('/auth/refresh');
        setAccessToken(data.accessToken);
        setUser(mapUser(data.user));
      } catch {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    // This is the web admin app — always identify as the "web" platform so the
    // backend can enforce per-role platform access (e.g. mobile-only accounts).
    const data = await api.post<{ accessToken: string; user: BackendUser }>('/auth/login', { email, password, platform: 'web' });
    setAccessToken(data.accessToken);
    setUser(mapUser(data.user));
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => undefined);
    setAccessToken(null);
    setUser(null);
  };

  const can = (permission: string) => !!user && (user.permissions.includes(permission) || user.permissions.includes('*'));

  return <Ctx.Provider value={{ user, loading, login, logout, can }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function usePermission(permission: string): boolean {
  return useAuth().can(permission);
}
