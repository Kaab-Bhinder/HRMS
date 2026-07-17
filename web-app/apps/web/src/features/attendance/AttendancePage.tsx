import { useMemo, useState } from 'react';
import {
  Download, CalendarDays, UserCheck, Clock, UserX, Home, ShieldAlert, AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/charts/StatCard';
import { AttendanceAreaChart } from '../../components/charts/Charts';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { AttendanceSlipModal } from './AttendanceSlipModal';
import { attendanceService, analyticsService, departmentsService } from '../../services';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { cn } from '../../lib/utils';
import { formatTime, formatDate } from '../../lib/format';
import type { AttendanceRecord } from '../../lib/types';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'wfh', label: 'Work From Home' },
  { value: 'on_leave', label: 'On Leave' },
];

const METHOD_TONE: Record<string, 'neutral' | 'primary' | 'success' | 'info' | 'warning' | 'accent'> = {
  face: 'info',
  facial: 'info',
  biometric: 'primary',
  fingerprint: 'primary',
  web: 'neutral',
  mobile: 'accent',
  geofence: 'success',
  manual: 'warning',
};

function formatMethod(method?: string): string {
  if (!method) return '—';
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all', departmentId: 'all' });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'checkInAt', order: 'desc' });

  const { data: summary, loading: summaryLoading } = useQuery(() => attendanceService.summary(), []);
  const { data: overview, loading: chartLoading } = useQuery(() => analyticsService.overview(), []);
  const { data: depts } = useQuery(() => departmentsService.tree(), []);

  const params = useMemo(
    () => ({ page, limit: 10, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data, loading, error, refetch } = useQuery(() => attendanceService.list(params), [params]);
  const [slipFor, setSlipFor] = useState<{ id: string; name: string } | null>(null);

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const setFilter = (key: string, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const clear = () => { setSearch(''); setFilters({ status: 'all', departmentId: 'all' }); setPage(1); };

  const today = formatDate(new Date(), { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employeeName', header: 'Employee', sortable: true,
      render: (r) => (
        <div className={cn('-mx-4 -my-3 flex items-center gap-3 px-4 py-3', r.isFlagged && 'border-l-2 border-danger bg-danger/5')}>
          <Avatar name={r.employeeName} src={r.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{r.employeeName}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{r.employeeCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'departmentName', header: 'Department', sortable: true, render: (r) => <span className="text-foreground">{r.departmentName}</span> },
    { key: 'checkInAt', header: 'Check In', sortable: true, render: (r) => <span className="tabular-nums text-foreground">{formatTime(r.checkInAt)}</span> },
    { key: 'checkOutAt', header: 'Check Out', render: (r) => <span className="tabular-nums text-muted-foreground">{formatTime(r.checkOutAt)}</span> },
    {
      key: 'checkInMethod', header: 'Method',
      render: (r) => r.checkInMethod
        ? <Badge tone={METHOD_TONE[r.checkInMethod] ?? 'neutral'}>{formatMethod(r.checkInMethod)}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge value={r.status} /> },
    {
      key: 'faceMatchScore', header: 'Face Match', align: 'right',
      render: (r) => r.faceMatchScore == null
        ? <span className="text-muted-foreground">—</span>
        : <span className={cn('font-medium tabular-nums', r.faceMatchScore < 90 ? 'text-warning' : 'text-success')}>{r.faceMatchScore.toFixed(1)}%</span>,
    },
    {
      key: 'isFlagged', header: 'Flagged', align: 'right',
      render: (r) => r.isFlagged
        ? <Badge tone="danger"><AlertTriangle className="h-3 w-3" /> Flagged</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Monitoring"
        description="Real-time check-ins, biometric verification and anomaly flags across the bank."
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-surface-2/40 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              <CalendarDays className="h-3.5 w-3.5" /> {today}
            </span>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard loading={summaryLoading} label="Present" value={summary?.present ?? 0} icon={<UserCheck />} accent="success" />
        <StatCard loading={summaryLoading} label="Late" value={summary?.late ?? 0} icon={<Clock />} accent="warning" />
        <StatCard loading={summaryLoading} label="Absent" value={summary?.absent ?? 0} icon={<UserX />} accent="info" />
        <StatCard loading={summaryLoading} label="WFH" value={summary?.wfh ?? 0} icon={<Home />} accent="primary" />
        <StatCard loading={summaryLoading} label="Flagged" value={summary?.flagged ?? 0} icon={<ShieldAlert />} accent="danger" hint="Needs review" />
      </div>

      <Card>
        <CardHeader title="Attendance Trend" description="Present, late and absent over the last 14 days" action={<StatusBadge value="present" dot />} />
        <CardBody>
          {chartLoading ? <Skeleton className="h-[260px] w-full" /> : <AttendanceAreaChart data={overview!.attendanceTrend} />}
        </CardBody>
      </Card>

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or employee code…"
        filters={[
          { key: 'status', placeholder: 'All statuses', value: filters.status, options: STATUS_OPTIONS },
          { key: 'departmentId', placeholder: 'All departments', value: filters.departmentId, options: (depts ?? []).map((d) => ({ value: d.id, label: d.name })) },
        ]}
        onFilterChange={setFilter}
        onClear={clear}
      />

      <DataTable
        columns={columns}
        rows={data?.data}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(r) => r.id}
        onRowClick={(r) => setSlipFor({ id: r.employeeId, name: r.employeeName })}
        sort={sort}
        onSortChange={onSort}
        empty={{ title: 'No attendance records', description: 'No check-ins match your current filters for this period.' }}
        pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
      />

      <AttendanceSlipModal open={!!slipFor} onClose={() => setSlipFor(null)} employeeId={slipFor?.id ?? null} employeeName={slipFor?.name} />
    </div>
  );
}
