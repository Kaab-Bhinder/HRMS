import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Progress({ value, className, tone = 'primary' }: { value: number; className?: string; tone?: 'primary' | 'success' | 'warning' | 'danger' }) {
  const tones = { primary: 'bg-primary', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' };
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div className={cn('h-full rounded-full transition-all', tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Tooltip({ children, content }: { children: ReactNode; content: string }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-surface-2 px-1 font-mono text-[10px] font-medium text-muted-foreground">{children}</kbd>;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5 animate-spin text-primary', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}
