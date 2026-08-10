import { useMemo, useState } from 'react';
import {
  MoreHorizontal, Eye, Check, X, Clock, CalendarCheck, UserMinus, Inbox,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Progress } from '../../components/ui/Misc';
import { Card, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/charts/StatCard';
import { useQuery } from '../../hooks/useQuery';
import { leaveService } from '../../services';
import { useToast } from '../../store/toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDate, relativeTime } from '../../lib/format';
import type { LeaveRequest, LeaveStatus } from '../../lib/types';

const TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// Only Annual and Sick exist by policy; the type list is fetched from the API
// rather than hardcoded so this page can never drift from what the system
// actually offers (the previous hardcoded Casual/Unpaid did exactly that).
type BarTone = 'primary' | 'success' | 'warning' | 'danger';
const TYPE_TONE: Record<string, BarTone> = { Annual: 'primary', Sick: 'success' };
function typeTone(name: string): BarTone {
  return TYPE_TONE[name] ?? 'warning';
}

export default function LeavePage() {
  const toast = useToast();

  const [tab, setTab] = useState<'all' | LeaveStatus>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'appliedAt', order: 'desc' });

  const [detail, setDetail] = useState<LeaveRequest | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const filters = useMemo<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    if (tab !== 'all') f.status = tab;
    if (typeFilter !== 'all') f.leaveType = typeFilter;
    return f;
  }, [tab, typeFilter]);

  const params = useMemo(
    () => ({ page, limit: 10, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data, loading, error, refetch } = useQuery(() => leaveService.list(params), [params]);

  // Headline stats come from the server aggregate, not from counting rows here.
  const { data: summary, loading: statsLoading } = useQuery(() => leaveService.summary(), []);
  const { data: leaveTypes } = useQuery(() => leaveService.types(), []);

  const typeOptions = (leaveTypes ?? []).map((t) => ({ value: t.name, label: t.name }));

  // Org-wide per-type summary, derived from actual requests — approved days and
  // still-pending days across everyone. No invented allowance.
  const typeSummary = (leaveTypes ?? []).map((t) => {
    const row = summary?.byType.find((b) => b.leaveTypeId === t.id);
    return { name: t.name, approved: row?.approved ?? 0, pending: row?.pending ?? 0, tone: typeTone(t.name) };
  });
  const stats = {
    pending: summary?.pending ?? 0,
    approvedMonth: summary?.approvedMonth ?? 0,
    onLeaveToday: summary?.onLeaveToday ?? 0,
    total: summary?.total ?? 0,
  };

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const clear = () => { setSearch(''); setTypeFilter('all'); setPage(1); };
  const changeTab = (v: string) => { setTab(v as 'all' | LeaveStatus); setPage(1); };

  const act = async (req: LeaveRequest, action: 'approve' | 'reject') => {
    setActingId(req.id);
    await leaveService.act(req.id, action);
    setActingId(null);
    if (action === 'approve') toast.success('Leave approved', `${req.employeeName}'s ${req.leaveType.toLowerCase()} leave was approved.`);
    else toast.success('Leave rejected', `${req.employeeName}'s request was rejected.`);
    refetch();
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'employeeName', header: 'Employee', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} src={r.avatarUrl} size="sm" />
          <span className="truncate font-medium text-foreground">{r.employeeName}</span>
        </div>
      ),
    },
    { key: 'departmentName', header: 'Department', render: (r) => <span className="text-muted-foreground">{r.departmentName}</span> },
    { key: 'leaveType', header: 'Type', render: (r) => <Badge tone={r.leaveType === 'Sick' ? 'info' : 'primary'}>{r.leaveType}</Badge> },
    {
      key: 'startDate', header: 'Dates', sortable: true,
      render: (r) => <span className="whitespace-nowrap text-foreground">{formatDate(r.startDate)} – {formatDate(r.endDate)}</span>,
    },
    { key: 'days', header: 'Days', align: 'center', sortable: true, render: (r) => <span className="tabular-nums text-foreground">{r.days}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge value={r.status} /> },
    { key: 'appliedAt', header: 'Applied', sortable: true, render: (r) => <span className="text-muted-foreground">{relativeTime(r.appliedAt)}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex items-center justify-end gap-1.5">
            <Button variant="subtle" size="sm" loading={actingId === r.id} onClick={() => act(r, 'approve')} className="text-success">
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button variant="ghost" size="sm" disabled={actingId === r.id} onClick={() => act(r, 'reject')} className="text-danger hover:bg-danger/10">
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        ) : (
          <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
            <DropdownItem icon={<Eye />} onClick={() => setDetail(r)}>View</DropdownItem>
          </Dropdown>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave Management"
        description="Review, approve and track time-off requests across the organization."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={statsLoading} label="Pending Requests" value={stats.pending} icon={<Clock />} accent="warning" hint="Awaiting your review" />
        <StatCard loading={statsLoading} label="Approved (This Month)" value={stats.approvedMonth} icon={<CalendarCheck />} accent="success" />
        <StatCard loading={statsLoading} label="On Leave Today" value={stats.onLeaveToday} icon={<UserMinus />} accent="info" />
        <StatCard loading={statsLoading} label="Total Requests" value={stats.total} icon={<Inbox />} accent="primary" />
      </div>

      <Card>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {typeSummary.length === 0 ? (
            <span className="text-sm text-muted-foreground">No leave types configured.</span>
          ) : (
            typeSummary.map((b) => {
              const total = b.approved + b.pending;
              return (
                <div key={b.name}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-foreground">{b.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {b.approved} approved · {b.pending} pending
                    </span>
                  </div>
                  <Progress value={total === 0 ? 0 : (b.approved / total) * 100} tone={b.tone} className="mt-2" />
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      <Tabs tabs={TABS} value={tab} onChange={changeTab} />

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search employee, department…"
        filters={[{ key: 'leaveType', placeholder: 'All leave types', value: typeFilter, options: typeOptions }]}
        onFilterChange={(_, v) => { setTypeFilter(v); setPage(1); }}
        onClear={clear}
      />

      <DataTable
        columns={columns}
        rows={data?.data}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(r) => r.id}
        onRowClick={(r) => setDetail(r)}
        sort={sort}
        onSortChange={onSort}
        empty={{ title: 'No leave requests', description: 'Nothing matches the current tab and filters.' }}
        pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
      />

      <LeaveDetailModal
        request={detail}
        onClose={() => setDetail(null)}
        acting={detail ? actingId === detail.id : false}
        onAct={(action) => { if (detail) { act(detail, action); setDetail(null); } }}
      />
    </div>
  );
}

function LeaveDetailModal({
  request, onClose, onAct, acting,
}: {
  request: LeaveRequest | null;
  onClose: () => void;
  onAct: (action: 'approve' | 'reject') => void;
  acting: boolean;
}) {
  if (!request) return null;
  const isPending = request.status === 'pending';
  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title="Leave Request"
      description={`Applied ${relativeTime(request.appliedAt)}`}
      footer={
        isPending ? (
          <>
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="danger" loading={acting} onClick={() => onAct('reject')}><X className="h-4 w-4" /> Reject</Button>
            <Button loading={acting} onClick={() => onAct('approve')}><Check className="h-4 w-4" /> Approve</Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar name={request.employeeName} src={request.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{request.employeeName}</p>
            <p className="truncate text-sm text-muted-foreground">{request.departmentName}</p>
          </div>
          <div className="ml-auto"><StatusBadge value={request.status} /></div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Detail label="Type" value={<Badge tone={request.leaveType === 'Sick' ? 'info' : 'primary'}>{request.leaveType}</Badge>} />
          <Detail label="Duration" value={<span className="text-foreground">{request.days} {request.days === 1 ? 'day' : 'days'}</span>} />
          <Detail label="Start Date" value={<span className="text-foreground">{formatDate(request.startDate)}</span>} />
          <Detail label="End Date" value={<span className="text-foreground">{formatDate(request.endDate)}</span>} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</p>
          <p className="rounded-lg border border-border bg-surface-2/40 px-3.5 py-3 text-sm text-foreground">{request.reason || 'No reason provided.'}</p>
        </div>
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}
