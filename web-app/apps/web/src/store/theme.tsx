import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = 'wms-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    try {
      localStorage.setItem(KEY, t);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <Ctx.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
