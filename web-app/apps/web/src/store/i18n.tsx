import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ID } from '../i18n/id';

export type Lang = 'en' | 'id';
interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Translate an English UI string. Falls back to the English text itself, so
   *  anything not yet in the dictionary still renders (in English). */
  t: (en: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);
const KEY = 'wms-lang';
const DICTS: Record<Lang, Record<string, string>> = { en: {}, id: ID };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s === 'en' || s === 'id') return s;
    } catch { /* ignore */ }
    return 'en';
  });

  const value = useMemo<I18nCtx>(() => {
    const setLang = (l: Lang) => {
      setLangState(l);
      try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
      document.documentElement.setAttribute('lang', l);
    };
    return {
      lang,
      setLang,
      toggle: () => setLang(lang === 'en' ? 'id' : 'en'),
      t: (en: string) => DICTS[lang][en] ?? en,
    };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
