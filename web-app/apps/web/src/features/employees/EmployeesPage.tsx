import { useMemo, useState } from 'react';
import { Plus, Upload, Download, MoreHorizontal, Eye, Pencil, Trash2, Users, UserCheck, Clock, Building2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/ui/Button';
import { EmployeeAvatar } from '../../components/EmployeeAvatar';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { useQuery } from '../../hooks/useQuery';
import { employeesService, departmentsService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDate } from '../../lib/format';
import type { Employee } from '../../lib/types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' }, { value: 'probation', label: 'Probation' },
  { value: 'on_leave', label: 'On Leave' }, { value: 'suspended', label: 'Suspended' },
];

/** Access-level badge derived from the linked login's roles, and a rank so the
 *  list can put leaders (admin → HR → head) above regular employees. */
function accessBadge(roles?: string[]): { label: string; tone: 'danger' | 'accent' | 'primary' | 'neutral' } {
  const r = roles ?? [];
  if (r.includes('Super Admin')) return { label: 'Admin', tone: 'danger' };
  if (r.includes('HR Manager')) return { label: 'HR', tone: 'accent' };
  if (r.includes('Department Head')) return { label: 'Dept Head', tone: 'primary' };
  if (r.length) return { label: 'Employee', tone: 'neutral' };
  return { label: 'No login', tone: 'neutral' };
}
function accessRank(roles?: string[]): number {
  const r = roles ?? [];
  if (r.includes('Super Admin')) return 0;
  if (r.includes('HR Manager')) return 1;
  if (r.includes('Department Head')) return 2;
  if (r.length) return 3;
  return 4;
}

export default function EmployeesPage() {
  const toast = useToast();
  const canCreate = usePermission('employees:create');
  const canUpdate = usePermission('employees:update');
  const canDelete = usePermission('employees:delete');

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all', departmentId: 'all' });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'fullName', order: 'asc' });

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [toDelete, setToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  // Unfiltered headline counts (limit:1 — we only read meta.total, not the rows),
  // so the KPI row stays stable while the table below is filtered/searched.
  const { data: totals, loading: totalsLoading } = useQuery(async () => {
    const [all, active, probation] = await Promise.all([
      employeesService.list({ page: 1, limit: 1 }),
      employeesService.list({ page: 1, limit: 1, filters: { status: 'active' } }),
      employeesService.list({ page: 1, limit: 1, filters: { status: 'probation' } }),
    ]);
    return { all: all.meta.total, active: active.meta.total, probation: probation.meta.total };
  }, []);
  const params = useMemo(
    () => ({ page, limit: 10, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data, loading, error, refetch } = useQuery(() => employeesService.list(params), [params]);

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const setFilter = (key: string, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const clear = () => { setSearch(''); setFilters({ status: 'all', departmentId: 'all' }); setPage(1); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await employeesService.remove(toDelete.id);
    setDeleting(false);
    toast.success('Employee removed', `${toDelete.fullName} was soft-deleted.`);
    setToDelete(null);
    refetch();
  };

  const columns: Column<Employee>[] = [
    {
      key: 'fullName', header: 'Employee', sortable: true,
      render: (e) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={e.fullName} fileId={e.photoFileId} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{e.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{e.workEmail}</p>
          </div>
        </div>
      ),
    },
    { key: 'employeeCode', header: 'Code', sortable: true, render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.employeeCode}</span> },
    { key: 'departmentName', header: 'Department', sortable: true, render: (e) => <span className="text-foreground">{e.departmentName}</span> },
    { key: 'designationName', header: 'Designation', render: (e) => <span className="text-muted-foreground">{e.designationName}</span> },
    {
      key: 'accessRoles', header: 'Role',
      render: (e) => { const b = accessBadge(e.accountRoles); return <Badge tone={b.tone} dot={b.tone !== 'neutral'}>{b.label}</Badge>; },
    },
    { key: 'employmentType', header: 'Type', render: (e) => <Badge tone="neutral">{e.employmentType.replace('_', ' ')}</Badge> },
    { key: 'status', header: 'Status', sortable: true, render: (e) => <StatusBadge value={e.status} /> },
    { key: 'dateOfJoining', header: 'Joined', sortable: true, align: 'right', render: (e) => <span className="text-muted-foreground">{formatDate(e.dateOfJoining)}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (e) => (
        <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
          <DropdownItem icon={<Eye />} onClick={() => { setSelected(e); setDetailOpen(true); }}>View profile</DropdownItem>
          {canUpdate && <DropdownItem icon={<Pencil />} onClick={() => { setSelected(e); setFormOpen(true); }}>Edit</DropdownItem>}
          {canDelete && <><DropdownSeparator /><DropdownItem icon={<Trash2 />} danger onClick={() => setToDelete(e)}>Delete</DropdownItem></>}
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        description="Manage your organization’s people, profiles and custom fields."
        actions={
          <>
            <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            {canCreate && <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Employee</Button>}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard loading={totalsLoading} label="Total Employees" value={totals?.all ?? 0} icon={<Users />} accent="accent" />
        <StatCard loading={totalsLoading} label="Active" value={totals?.active ?? 0} icon={<UserCheck />} accent="success" />
        <StatCard loading={totalsLoading} label="On Probation" value={totals?.probation ?? 0} icon={<Clock />} accent="warning" />
        <StatCard loading={!depts} label="Departments" value={depts?.length ?? 0} icon={<Building2 />} accent="info" />
      </div>

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search name, email, code…"
        filters={[
          { key: 'status', placeholder: 'All statuses', value: filters.status, options: STATUS_OPTIONS },
          { key: 'departmentId', placeholder: 'All departments', value: filters.departmentId, options: (depts ?? []).map((d) => ({ value: d.id, label: d.name })) },
        ]}
        onFilterChange={setFilter}
        onClear={clear}
      />

      <DataTable
        columns={columns}
        rows={data?.data ? [...data.data].sort((a, b) => accessRank(a.accountRoles) - accessRank(b.accountRoles) || a.fullName.localeCompare(b.fullName)) : undefined}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(e) => e.id}
        onRowClick={(e) => { setSelected(e); setDetailOpen(true); }}
        sort={sort}
        onSortChange={onSort}
        empty={{ title: 'No employees found', description: 'Adjust filters or add your first employee.', action: canCreate ? <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Employee</Button> : undefined }}
        pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
      />

      <EmployeeFormModal open={formOpen} onClose={() => setFormOpen(false)} employee={selected} onSaved={refetch} />
      <EmployeeDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        employee={selected}
        onEdit={() => { setDetailOpen(false); setFormOpen(true); }}
        onDelete={canDelete ? () => { setDetailOpen(false); setToDelete(selected); } : undefined}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Delete employee?"
        message={`This will soft-delete ${toDelete?.fullName}. You can restore them later from the audit trail.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
