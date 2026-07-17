import type { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { useI18n } from '../store/i18n';

export function PageHeader({ title, description, actions, className }: { title: string; description?: string; actions?: ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t(title)}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{t(description)}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
