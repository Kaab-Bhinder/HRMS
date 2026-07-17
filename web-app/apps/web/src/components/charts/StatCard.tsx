import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Skeleton } from '../feedback/States';
import { useI18n } from '../../store/i18n';

export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  loading,
  accent = 'primary',
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  delta?: number;
  hint?: string;
  loading?: boolean;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'info';
}) {
  const { t } = useI18n();
  const accents = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/12 text-danger',
    accent: 'bg-accent/15 text-accent',
    info: 'bg-info/12 text-info',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5', accents[accent])}>{icon}</div>
        {delta !== undefined && !loading && (
          <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium', delta >= 0 ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger')}>
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="mt-3.5">
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{t(label)}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{t(hint)}</p>}
      </div>
    </Card>
  );
}
