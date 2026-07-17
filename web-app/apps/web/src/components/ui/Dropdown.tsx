import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Dropdown({ trigger, children, align = 'right', width = 'w-48' }: { trigger: ReactNode; children: ReactNode; align?: 'left' | 'right'; width?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn('absolute z-40 mt-1.5 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-pop animate-scale-in', width, align === 'right' ? 'right-0' : 'left-0')}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger, icon }: { children: ReactNode; onClick?: () => void; danger?: boolean; icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-ring',
        danger ? 'text-danger hover:bg-danger/10' : 'text-foreground hover:bg-surface-2',
      )}
    >
      {icon && <span className="text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">{children}</div>;
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
