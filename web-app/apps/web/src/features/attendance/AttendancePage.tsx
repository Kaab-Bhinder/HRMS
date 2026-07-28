import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, CalendarDays, UserCheck, Clock, UserX, Home, ShieldAlert } from 'lucide-react';
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
import { Input } from '../../components/ui/Input';
import { useQuery } from '../../hooks/useQuery';
import { exportCsv, datedFilename, type CsvColumn } from '../../lib/csv';
import { attendanceService, analyticsService, departmentsService, clientsService, type AttendanceEmployeeSummaryRow } from '../../services';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePermission } from '../../store/auth';
import { useToast } from '../../store/toast';
import { formatDate } from '../../lib/format';

/**
 * Org-wide attendance is a MONTHLY SCORECARD — one row per employee with their
 * present/late/absent/flagged day counts — not a flood of day entries. The
 * day-by-day log lives on each employee's own page (click a row). Filters:
 * department, client (resolves to the client's serving department — same
 * client→team model as everywhere else), and free search.
 */

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

const SCORECARD_CSV: CsvColumn<AttendanceEmployeeSummaryRow>[] = [
  { header: 'Employee code', value: (r) => r.employeeCode },
  { header: 'Employee', value: (r) => r.employeeName },
  { header: 'Department', value: (r) => r.departmentName ?? '' },
  { header: 'Work site', value: (r) => r.siteName ?? '' },
  { header: 'Present days', value: (r) => r.presentDays },
  { header: 'Late days', value: (r) => r.lateDays },
  { header: 'Absent days', value: (r) => r.absentDays },
  { header: 'On leave days', value: (r) => r.onLeaveDays },
  { header: 'Flagged days', value: (r) => r.flaggedDays },
  { header: 'Worked hours', value: (r) => r.workedHours },
  { header: 'Late minutes', value: (r) => r.lateMinutes },
];

export default function AttendancePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const canSeeClients = usePermission('clients:read');

  const [month, setMonth] = useState(currentMonthValue());
  const [year, mon] = useMemo(() => month.split('-').map(Number), [month]);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ departmentId: 'all', clientId: 'all' });
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'employeeName', order: 'asc' });

  const { data: summary, loading: summaryLoading } = useQuery(() => attendanceService.summary(), []);
  const { data: overview, loading: chartLoading } = useQuery(() => analyticsService.overview(), []);
  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  const { data: clients } = useQuery(() => (canSeeClients ? clientsService.list() : Promise.resolve(null)), [canSeeClients]);

  // The client filter is sugar over the department filter: a client is served
  // by one department, so picking a client scopes to that team.
  const effectiveDeptId = useMemo(() => {
    if (filters.clientId !== 'all') {
      const c = (clients ?? []).find((x) => x.id === filters.clientId);
      return c?.departmentId ?? undefined;
    }
    return filters.departmentId !== 'all' ? filters.departmentId : undefined;
  }, [filters, clients]);

  const { data, loading, error, refetch } = useQuery(
    () => attendanceService.employeeSummary({ year, month: mon, departmentId: effectiveDeptId, search: debounced || undefined }),
    [year, mon, effectiveDeptId, debounced],
  );

  const rows = useMemo(() => {
    const list = [...(data?.rows ?? [])];
    const dir = sort.order === 'asc' ? 1 : -1;
    const key = sort.key as keyof AttendanceEmployeeSummaryRow;
    list.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
    return list;
  }, [data, sort]);

  const [exporting, setExporting] = useState(false);
  const exportRows = () => {
    setExporting(true);
    try {
      if (!rows.length) {
        toast.error('Nothing to export', 'No employees match the current filters.');
        return;
      }
      exportCsv(datedFilename('attendance-scorecard'), rows, SCORECARD_CSV);
      toast.success(`Exported ${rows.length} employee${rows.length === 1 ? '' : 's'}`, 'Downloaded as CSV.');
    } finally {
      setExporting(false);
    }
  };

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const setFilter = (key: string, value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: value,
      // dept and client filters are mutually exclusive — picking one resets the other
      ...(key === 'departmentId' ? { clientId: 'all' } : {}),
      ...(key === 'clientId' ? { departmentId: 'all' } : {}),
    }));
  };
  const clear = () => { setSearch(''); setFilters({ departmentId: 'all', clientId: 'all' }); };

  const today = formatDate(new Date(), { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  const num = (v: number, tone?: string) => (
    <span className={v ? `font-semibold tabular-nums ${tone ?? 'text-foreground'}` : 'tabular-nums text-muted-foreground'}>{v}</span>
  );

  const columns: Column<AttendanceEmployeeSummaryRow>[] = [
    {
      key: 'employeeName', header: 'Employee', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{r.employeeName}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{r.employeeCode}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName', header: 'Department', sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{r.departmentName ?? '—'}</p>
          {r.siteName && <p className="truncate text-xs text-muted-foreground">@ {r.siteName}</p>}
        </div>
      ),
    },
    { key: 'presentDays', header: 'Present', sortable: true, align: 'right', render: (r) => num(r.presentDays, 'text-success') },
    { key: 'lateDays', header: 'Late', sortable: true, align: 'right', render: (r) => num(r.lateDays, 'text-warning') },
    { key: 'absentDays', header: 'Absent', sortable: true, align: 'right', render: (r) => num(r.absentDays, 'text-danger') },
    { key: 'onLeaveDays', header: 'On leave', sortable: true, align: 'right', render: (r) => num(r.onLeaveDays) },
    {
      key: 'flaggedDays', header: 'Flagged', sortable: true, align: 'right',
      render: (r) => r.flaggedDays
        ? <Badge tone="danger">{r.flaggedDays}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    { key: 'workedHours', header: 'Worked (h)', sortable: true, align: 'right', render: (r) => <span className="tabular-nums text-foreground">{r.workedHours}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Monitoring"
        description="Monthly scorecard per employee — click a row for their day-by-day log."
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-surface-2/40 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              <CalendarDays className="h-3.5 w-3.5" /> {today}
            </span>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[10.5rem]" leftIcon={<CalendarDays className="h-4 w-4" />} />
            <Button variant="outline" size="sm" onClick={exportRows} loading={exporting}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard loading={summaryLoading} label="Present" value={summary?.present ?? 0} icon={<UserCheck />} accent="success" hint="Today" />
        <StatCard loading={summaryLoading} label="Late" value={summary?.late ?? 0} icon={<Clock />} accent="warning" hint="Today" />
        <StatCard loading={summaryLoading} label="Absent" value={summary?.absent ?? 0} icon={<UserX />} accent="info" hint="Today" />
        <StatCard loading={summaryLoading} label="WFH" value={summary?.wfh ?? 0} icon={<Home />} accent="primary" hint="Today" />
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
        onSearch={setSearch}
        searchPlaceholder="Search by name or employee code…"
        filters={[
          { key: 'departmentId', placeholder: 'All departments', value: filters.departmentId, options: (depts ?? []).map((d) => ({ value: d.id, label: d.name })) },
          ...(canSeeClients
            ? [{
                key: 'clientId', placeholder: 'All clients', value: filters.clientId,
                options: (clients ?? []).filter((c) => c.departmentId).map((c) => ({ value: c.id, label: c.name })),
              }]
            : []),
        ]}
        onFilterChange={setFilter}
        onClear={clear}
      />

      <DataTable
        columns={columns}
        rows={data ? rows : undefined}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(r) => r.employeeId}
        onRowClick={(r) => navigate(`/attendance/employee/${r.employeeId}`)}
        sort={sort}
        onSortChange={onSort}
        empty={{ title: 'No employees in scope', description: 'No one matches your current filters for this month.' }}
      />
    </div>
  );
}
