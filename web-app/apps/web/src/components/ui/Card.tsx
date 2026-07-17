import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../store/i18n';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card-surface', className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  const tr = (x: ReactNode) => (typeof x === 'string' ? t(x) : x);
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-border px-5 py-4', className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{tr(title)}</h3>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{tr(description)}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}
