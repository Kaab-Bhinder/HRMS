import { cn } from '../../lib/utils';
import { useI18n } from '../../store/i18n';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export function Tabs({ tabs, value, onChange, className }: { tabs: TabItem[]; value: string; onChange: (v: string) => void; className?: string }) {
  const { t: tr } = useI18n();
  return (
    <div className={cn('flex items-center gap-1 border-b border-border', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative -mb-px flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors focus-ring rounded-t',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tr(t.label)}
            {t.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-xs', active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>{t.count}</span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
