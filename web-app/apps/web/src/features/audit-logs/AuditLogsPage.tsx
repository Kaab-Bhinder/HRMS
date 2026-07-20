import { useMemo, useState } from 'react';
import { Download, Eye, ShieldCheck, Activity, LogIn, PencilRuler, FileDown, Lock } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useQuery } from '../../hooks/useQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { auditService } from '../../services';
import { useToast } from '../../store/toast';
import { exportCsv, datedFilename, type CsvColumn } from '../../lib/csv';
import { pluralize } from '../../lib/format';
import { formatDateTime, relativeTime } from '../../lib/format';
import type { AuditLog } from '../../lib/types';

type Action = AuditLog['action'];
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const ACTION_TONE: Record<Action, Tone> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  login: 'neutral',
  logout: 'neutral',
  export: 'accent',
  approve: 'success',
  reject: 'danger',
};

const ACTION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'export', label: 'Export' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
];

const ENTITY_OPTIONS = [
  { value: 'Employee', label: 'Employee' },
  { value: 'Leave Request', label: 'Leave Request' },
  { value: 'Task', label: 'Task' },
  { value: 'Role', label: 'Role' },
  { value: 'Department', label: 'Department' },
  { value: 'Attendance', label: 'Attendance' },
];

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/**
 * Upper bound on a single export. Audit tables grow without limit, so an
 * unbounded request would eventually time out or exhaust browser memory; the
 * user is told when the cap is hit rather than silently receiving a truncated
 * file.
 */
const EXPORT_LIMIT = 5000;

const AUDIT_CSV_COLUMNS: CsvColumn<AuditLog>[] = [
  { header: 'Timestamp (UTC)', value: (r) => new Date(r.createdAt).toISOString() },
  { header: 'Actor', value: (r) => r.actorName },
  { header: 'Action', value: (r) => r.action },
  { header: 'Entity type', value: (r) => r.entityType },
  { header: 'Entity', value: (r) => r.entityLabel },
  { header: 'IP address', value: (r) => r.ipAddress },
];

export default function AuditLogsPage() {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ action: 'all', entityType: 'all' });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'createdAt', order: 'desc' });
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const params = useMemo(
    () => ({ page, limit: 12, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data, loading, error, refetch } = useQuery(() => auditService.list(params), [params]);

  const rows = data?.data ?? [];
  const stats = useMemo(() => {
    const logins = rows.filter((r) => r.action === 'login').length;
    const changes = rows.filter((r) => ['create', 'update', 'delete'].includes(r.action)).length;
    const exports = rows.filter((r) => r.action === 'export').length;
    return { logins, changes, exports };
  }, [rows]);

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'desc' ? 'asc' : 'desc' }));
  const setFilter = (key: string, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const clear = () => { setSearch(''); setFilters({ action: 'all', entityType: 'all' }); setPage(1); };

  // Exports every row matching the current search and filters, not just the
  // visible page — "export" on a filtered table means the filtered set. The
  // list endpoint is paginated, so this re-requests with a high limit rather
  // than exporting the 12 rows on screen.
  const [exporting, setExporting] = useState(false);
  const exportLogs = async () => {
    setExporting(true);
    try {
      const all = await auditService.list({ ...params, page: 1, limit: EXPORT_LIMIT });
      const logs = all?.data ?? [];
      if (!logs.length) {
        toast.error('Nothing to export', 'No audit entries match the current filters.');
        return;
      }
      exportCsv(datedFilename('audit-logs'), logs, AUDIT_CSV_COLUMNS);
      const capped = (all?.meta?.total ?? logs.length) > logs.length;
      toast.success(
        `Exported ${logs.length} ${pluralize(logs.length, 'entry', 'entries')}`,
        capped
          ? `Capped at the most recent ${EXPORT_LIMIT}. Narrow the filters to export older entries.`
          : 'Downloaded as CSV.',
      );
    } catch (e) {
      toast.error('Export failed', (e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'actorName', header: 'Actor', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.actorName} src={r.actorAvatar} size="sm" />
          <span className="truncate font-medium text-foreground">{r.actorName}</span>
        </div>
      ),
    },
    {
      key: 'action', header: 'Action', sortable: true,
      render: (r) => <Badge tone={ACTION_TONE[r.action]}>{r.action}</Badge>,
    },
    {
      key: 'entityType', header: 'Entity', sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{r.entityType}</p>
          <p className="truncate text-xs text-muted-foreground">{r.entityLabel}</p>
        </div>
      ),
    },
    {
      key: 'ipAddress', header: 'IP Address',
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ipAddress}</span>,
    },
    {
      key: 'createdAt', header: 'Timestamp', sortable: true, align: 'right',
      render: (r) => (
        <div className="text-right">
          <p className="text-foreground">{formatDateTime(r.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{relativeTime(r.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>
          <Eye className="h-4 w-4" /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        description="A tamper-evident trail of every action across the platform."
        actions={
          <Button variant="outline" size="sm" onClick={exportLogs} loading={exporting}>
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-3.5 py-2.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        Audit entries are immutable and append-only — records cannot be edited or deleted, only exported.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={data?.meta.total ?? 0} icon={<Activity />} accent="primary" hint="Today" loading={loading} />
        <StatCard label="Logins" value={stats.logins} icon={<LogIn />} accent="info" hint="This page" loading={loading} />
        <StatCard label="Changes" value={stats.changes} icon={<PencilRuler />} accent="warning" hint="Create · update · delete" loading={loading} />
        <StatCard label="Exports" value={stats.exports} icon={<FileDown />} accent="accent" hint="Data extractions" loading={loading} />
      </div>

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search actor, entity, IP…"
        filters={[
          { key: 'action', placeholder: 'All actions', value: filters.action, options: ACTION_OPTIONS },
          { key: 'entityType', placeholder: 'All entities', value: filters.entityType, options: ENTITY_OPTIONS },
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
        onRowClick={(r) => setSelected(r)}
        sort={sort}
        onSortChange={onSort}
        empty={{ title: 'No audit events found', description: 'Adjust your filters or widen the time range to see activity.' }}
        pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
      />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Audit event detail"
        description={selected ? `Event ${selected.id}` : undefined}
        size="lg"
        footer={<Button variant="outline" onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Actor">
                <div className="flex items-center gap-2.5">
                  <Avatar name={selected.actorName} src={selected.actorAvatar} size="sm" />
                  <span className="text-sm font-medium text-foreground">{selected.actorName}</span>
                </div>
              </Field>
              <Field label="Action"><Badge tone={ACTION_TONE[selected.action]}>{selected.action}</Badge></Field>
              <Field label="Entity">
                <p className="text-sm text-foreground">{selected.entityType}</p>
                <p className="text-xs text-muted-foreground">{selected.entityLabel}</p>
              </Field>
              <Field label="IP address"><span className="font-mono text-sm text-foreground">{selected.ipAddress}</span></Field>
              <Field label="Timestamp">
                <p className="text-sm text-foreground">{formatDateTime(selected.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{relativeTime(selected.createdAt)}</p>
              </Field>
              <Field label="User agent"><span className="text-xs text-muted-foreground">{USER_AGENT}</span></Field>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Raw record
              </p>
              <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-surface-2/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
{JSON.stringify(
  {
    id: selected.id,
    actor: selected.actorName,
    action: selected.action,
    entity: { type: selected.entityType, label: selected.entityLabel },
    ip: selected.ipAddress,
    userAgent: USER_AGENT,
    timestamp: selected.createdAt,
  },
  null,
  2,
)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
