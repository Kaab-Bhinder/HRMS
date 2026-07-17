import { type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Input, Select } from './ui/Input';
import { cn } from '../lib/utils';
import { useI18n } from '../store/i18n';

export interface SelectFilter {
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
}

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder = 'Search…',
  hideSearch = false,
  filters = [],
  onFilterChange,
  onClear,
  right,
  className,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  filters?: SelectFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onClear?: () => void;
  right?: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  const active = search || filters.some((f) => f.value && f.value !== 'all');
  return (
    <div className={cn('flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center', className)}>
      {!hideSearch && (
        <div className="w-full sm:max-w-xs">
          <Input leftIcon={<Search className="h-4 w-4" />} placeholder={t(searchPlaceholder)} value={search} onChange={(e) => onSearch(e.target.value)} />
        </div>
      )}
      {filters.map((f) => (
        <Select key={f.key} value={f.value} onChange={(e) => onFilterChange?.(f.key, e.target.value)} className="w-full sm:w-auto sm:min-w-[9rem]">
          <option value="all">{t(f.placeholder)}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{t(o.label)}</option>
          ))}
        </Select>
      ))}
      {active && onClear && (
        <button onClick={onClear} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-ring rounded px-1">
          <X className="h-3.5 w-3.5" /> {t('Clear')}
        </button>
      )}
      {right && <div className="sm:ml-auto">{right}</div>}
    </div>
  );
}
