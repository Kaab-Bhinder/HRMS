import { useMemo, useState } from 'react';
import {
  CheckCheck, Check, Plane, Clock, ListChecks, Wallet, Bell, BellOff,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Tooltip } from '../../components/ui/Misc';
import { EmptyState, ErrorState, Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { notificationsService } from '../../services';
import { useToast } from '../../store/toast';
import { relativeTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { AppNotification, NotificationChannel } from '../../lib/types';

type Category = AppNotification['category'];

const CATEGORY_META: Record<Category, { icon: LucideIcon; tint: string; label: string }> = {
  leave: { icon: Plane, tint: 'bg-info/12 text-info', label: 'Leave' },
  attendance: { icon: Clock, tint: 'bg-warning/15 text-warning', label: 'Attendance' },
  task: { icon: ListChecks, tint: 'bg-primary/10 text-primary', label: 'Task' },
  payroll: { icon: Wallet, tint: 'bg-success/12 text-success', label: 'Payroll' },
  system: { icon: Bell, tint: 'bg-accent/15 text-accent', label: 'System' },
};

const CHANNEL_TONE: Record<NotificationChannel, 'primary' | 'info' | 'accent' | 'warning' | 'success'> = {
  in_app: 'primary',
  email: 'info',
  sms: 'accent',
  push: 'warning',
  whatsapp: 'success',
};

const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  whatsapp: 'WhatsApp',
};

const CATEGORY_OPTIONS = [
  { value: 'leave', label: 'Leave' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'task', label: 'Task' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'system', label: 'System' },
];

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: 'In-app' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function NotificationsPage() {
  const toast = useToast();

  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ category: 'all', channel: 'all' });
  const [markingAll, setMarkingAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(() => notificationsService.list(), []);

  const all = useMemo(() => data ?? [], [data]);
  const unreadCount = useMemo(() => all.filter((n) => !n.read).length, [all]);

  const visible = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return all.filter((n) => {
      if (tab === 'unread' && n.read) return false;
      if (filters.category !== 'all' && n.category !== filters.category) return false;
      if (filters.channel !== 'all' && n.channel !== filters.channel) return false;
      if (q && !(`${n.title} ${n.body}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [all, tab, filters, debounced]);

  const setFilter = (key: string, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const clear = () => { setSearch(''); setFilters({ category: 'all', channel: 'all' }); };

  const markRead = async (n: AppNotification) => {
    if (n.read || busyId) return;
    setBusyId(n.id);
    try {
      await notificationsService.markRead(n.id);
      await refetch();
    } catch {
      toast.error('Could not update notification', 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    if (!unreadCount || markingAll) return;
    setMarkingAll(true);
    try {
      await notificationsService.markAllRead();
      await refetch();
      toast.success('All caught up', 'Every notification is now marked as read.');
    } catch {
      toast.error('Could not mark all as read', 'Please try again.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Alerts across leave, attendance, tasks, payroll and system events."
        actions={
          <Button size="sm" variant="outline" onClick={markAllRead} loading={markingAll} disabled={!unreadCount}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <Tabs
        tabs={[
          { value: 'all', label: 'All', count: all.length },
          { value: 'unread', label: 'Unread', count: unreadCount },
        ]}
        value={tab}
        onChange={(v) => setTab(v as 'all' | 'unread')}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search notifications…"
        filters={[
          { key: 'category', placeholder: 'All categories', value: filters.category, options: CATEGORY_OPTIONS },
          { key: 'channel', placeholder: 'All channels', value: filters.channel, options: CHANNEL_OPTIONS },
        ]}
        onFilterChange={setFilter}
        onClear={clear}
      />

      <Card>
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3.5 px-5 py-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<BellOff className="h-6 w-6" />}
            title={tab === 'unread' ? 'No unread notifications' : 'No notifications found'}
            description={
              tab === 'unread'
                ? 'You are all caught up — new alerts will appear here.'
                : 'Adjust your filters or check back later for new activity.'
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((n) => {
              const meta = CATEGORY_META[n.category];
              const Icon = meta.icon;
              const busy = busyId === n.id;
              return (
                <li
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={cn(
                    'group flex cursor-pointer items-start gap-3.5 px-5 py-4 transition-colors',
                    n.read ? 'hover:bg-surface-2/50' : 'bg-primary/[0.04] hover:bg-primary/[0.07]',
                  )}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&>svg]:h-5 [&>svg]:w-5', meta.tint)}>
                    <Icon />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                      <p className={cn('truncate text-sm', n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>
                        {n.title}
                      </p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={CHANNEL_TONE[n.channel]}>{CHANNEL_LABEL[n.channel]}</Badge>
                      <Badge tone="neutral">{meta.label}</Badge>
                      <span className="text-xs text-muted-foreground/80">{relativeTime(n.createdAt)}</span>
                    </div>
                  </div>

                  {!n.read && (
                    <Tooltip content="Mark as read">
                      <Button
                        variant="ghost"
                        size="icon"
                        loading={busy}
                        aria-label="Mark as read"
                        onClick={(e) => { e.stopPropagation(); markRead(n); }}
                        className="shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
