import type { ReactNode } from 'react';
import { ThemeProvider } from '../store/theme';
import { I18nProvider } from '../store/i18n';
import { AutoTranslate } from '../i18n/AutoTranslate';
import { AuthProvider } from '../store/auth';
import { ToastProvider } from '../store/toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AutoTranslate />
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
