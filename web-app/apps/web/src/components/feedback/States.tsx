import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useI18n } from '../../store/i18n';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="text-sm font-semibold text-foreground">{t(title)}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t(description)}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-foreground">{t('Something went wrong')}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message ?? t('We couldn’t load this data. Please try again.')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> {t('Retry')}
        </Button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-4', c === 0 ? 'w-40' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}
