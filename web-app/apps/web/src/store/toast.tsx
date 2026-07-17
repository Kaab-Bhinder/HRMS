import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { cn, uid } from '../lib/utils';

type ToastKind = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}
interface ToastCtx {
  toast: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const COLORS: Record<ToastKind, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = uid('toast');
      setToasts((ts) => [...ts, { ...t, id }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value: ToastCtx = {
    toast,
    success: (title, description) => toast({ kind: 'success', title, description }),
    error: (title, description) => toast({ kind: 'error', title, description }),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5 shadow-pop animate-slide-up"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', COLORS[t.kind])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
              </div>
              <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground focus-ring rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
