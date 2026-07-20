import { type ReactNode } from 'react';
import { ChevronDown, ChevronsUpDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TableSkeleton, EmptyState, ErrorState } from '../feedback/States';
import { useI18n } from '../../store/i18n';

export interface Column<T> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: { key: string; order: 'asc' | 'desc' };
  onSortChange?: (key: string) => void;
  empty?: { title: string; description?: string; action?: ReactNode };
  pagination?: { page: number; totalPages: number; total: number; limit: number; onPage: (p: number) => void };
}

export function DataTable<T>({ columns, rows, loading, error, onRetry, rowKey, onRowClick, sort, onSortChange, empty, pagination }: DataTableProps<T>) {
  const { t } = useI18n();
  const align = (a?: string) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');
  const th = (h: ReactNode) => (typeof h === 'string' ? t(h) : h);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/60">
              {columns.map((c) => (
                <th key={c.key} className={cn('px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground', align(c.align), c.className)}>
                  {c.sortable && onSortChange ? (
                    <button onClick={() => onSortChange(c.key)} className={cn('inline-flex items-center gap-1 hover:text-foreground', c.align === 'right' && 'flex-row-reverse')}>
                      {th(c.header)}
                      {sort?.key === c.key ? (
                        sort.order === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    th(c.header)
                  )}
                </th>
              ))}
            </tr>
          </thead>
          {!loading && !error && rows && rows.length > 0 && (
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-accent/[0.06]')}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-4 text-foreground', align(c.align), c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {loading && <TableSkeleton cols={columns.length} />}
      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}
      {!loading && !error && rows && rows.length === 0 && (
        <EmptyState title={t(empty?.title ?? 'No records found')} description={t(empty?.description ?? 'Try adjusting your filters or search.')} action={empty?.action} />
      )}

      {pagination && !loading && !error && rows && rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t('Showing')} <span className="font-medium text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span>–
            <span className="font-medium text-foreground">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> {t('of')}{' '}
            <span className="font-medium text-foreground">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPage(pagination.page - 1)}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-40 focus-ring"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> {t('Prev')}
            </button>
            {pageNumbers(pagination.page, pagination.totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="px-1.5 text-xs text-muted-foreground">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => pagination.onPage(p as number)}
                  className={cn('h-8 min-w-8 rounded-md px-2 text-xs font-medium transition-colors focus-ring', p === pagination.page ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-surface-2')}
                >
                  {p}
                </button>
              ),
            )}
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPage(pagination.page + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-40 focus-ring"
            >
              {t('Next')} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  if (current > 3) out.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) out.push(p);
  if (current < total - 2) out.push('…');
  out.push(total);
  return out;
}
