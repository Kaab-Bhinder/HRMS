import { useMemo, useState } from 'react';
import { Plus, MoreHorizontal, Pencil, KeyRound, UserCheck, UserX, Trash2, ShieldAlert, LogOut, Users, Mail } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { ConfirmDialog } from '../../components/ui/Modal';
import { UserFormModal } from './UserFormModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { useQuery } from '../../hooks/useQuery';
import { usersService, rolesService, sessionsService } from '../../services';
import { useToast } from '../../store/toast';
import { useAuth, usePermission } from '../../store/auth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDate, relativeTime } from '../../lib/format';
import type { UserAccount } from '../../lib/types';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' }, { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' }, { value: 'disabled', label: 'Disabled' },
];

export default function UsersPage() {
  const toast = useToast();
  const { user: me } = useAuth();
  const canCreate = usePermission('users:create');
  const canUpdate = usePermission('users:update');
  const canDelete = usePermission('users:delete');

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all', roleId: 'all' });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'createdAt', order: 'desc' });

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selected, setSelected] = useState<UserAccount | null>(null);
  const [toDelete, setToDelete] = useState<UserAccount | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: roles } = useQuery(() => rolesService.list(), []);
  // Unfiltered headline counts (limit:1 — only meta.total is read), so the KPI
  // row stays stable while the table below is filtered.
  const { data: totals, loading: totalsLoading } = useQuery(async () => {
    const [all, active, invited, disabled] = await Promise.all([
      usersService.list({ page: 1, limit: 1 }),
      usersService.list({ page: 1, limit: 1, filters: { status: 'active' } }),
      usersService.list({ page: 1, limit: 1, filters: { status: 'invited' } }),
      usersService.list({ page: 1, limit: 1, filters: { status: 'disabled' } }),
    ]);
    return { all: all.meta.total, active: active.meta.total, invited: invited.meta.total, disabled: disabled.meta.total };
  }, []);
  const params = useMemo(
    () => ({ page, limit: 10, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data, loading, error, refetch } = useQuery(() => usersService.list(params), [params]);

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const setFilter = (key: string, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const clear = () => { setSearch(''); setFilters({ status: 'all', roleId: 'all' }); setPage(1); };

  const changeStatus = async (u: UserAccount, status: 'active' | 'suspended') => {
    try {
      await usersService.update(u.id, { status });
      toast.success(status === 'active' ? 'User reactivated' : 'User suspended', `${u.fullName} is now ${status}.`);
      refetch();
    } catch (e) {
      toast.error('Could not update status', (e as Error).message);
    }
  };

  const signOutAll = async (u: UserAccount) => {
    try {
      const res = await sessionsService.revokeAllForUser(u.id);
      toast.success('Sessions revoked', `${u.fullName} was signed out of ${res.revoked} session(s).`);
    } catch (e) {
      toast.error('Could not revoke sessions', (e as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await usersService.remove(toDelete.id);
      toast.success('User removed', `${toDelete.fullName} was disabled and signed out.`);
      setToDelete(null);
      refetch();
    } catch (e) {
      toast.error('Could not delete user', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<UserAccount>[] = [
    {
      key: 'fullName', header: 'User', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.fullName} src={u.avatarUrl ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
              {u.fullName}
              {u.isSuperAdmin && <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-accent" aria-label="Super admin" />}
              {me?.id === u.id && <span className="rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">you</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles', header: 'Roles',
      render: (u) => u.roles.length ? (
        <div className="flex flex-wrap gap-1">{u.roles.map((r) => <Badge key={r.id} tone="neutral">{r.name}</Badge>)}</div>
      ) : <span className="text-xs text-muted-foreground">No roles</span>,
    },
    { key: 'status', header: 'Status', sortable: true, render: (u) => <StatusBadge value={u.status} /> },
    { key: 'lastLoginAt', header: 'Last login', sortable: true, render: (u) => <span className="text-muted-foreground">{u.lastLoginAt ? relativeTime(u.lastLoginAt) : 'Never'}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, align: 'right', render: (u) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (u) => (
        <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
          {canUpdate && <DropdownItem icon={<Pencil />} onClick={() => { setSelected(u); setFormOpen(true); }}>Edit &amp; roles</DropdownItem>}
          {canUpdate && <DropdownItem icon={<KeyRound />} onClick={() => { setSelected(u); setResetOpen(true); }}>Reset password</DropdownItem>}
          {canUpdate && <DropdownItem icon={<LogOut />} onClick={() => signOutAll(u)}>Sign out all sessions</DropdownItem>}
          {canUpdate && me?.id !== u.id && (
            u.status === 'suspended'
              ? <DropdownItem icon={<UserCheck />} onClick={() => changeStatus(u, 'active')}>Reactivate</DropdownItem>
              : u.status === 'active'
                ? <DropdownItem icon={<UserX />} onClick={() => changeStatus(u, 'suspended')}>Suspend</DropdownItem>
                : null
          )}
          {canDelete && me?.id !== u.id && <><DropdownSeparator /><DropdownItem icon={<Trash2 />} danger onClick={() => setToDelete(u)}>Delete</DropdownItem></>}
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Manage login accounts, assign roles, and control access to the admin panel."
        actions={canCreate && <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add User</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard loading={totalsLoading} label="Total Users" value={totals?.all ?? 0} icon={<Users />} accent="accent" />
        <StatCard loading={totalsLoading} label="Active" value={totals?.active ?? 0} icon={<UserCheck />} accent="success" />
        <StatCard loading={totalsLoading} label="Invited" value={totals?.invited ?? 0} icon={<Mail />} accent="info" />
        <StatCard loading={totalsLoading} label="Disabled" value={totals?.disabled ?? 0} icon={<UserX />} accent="danger" />
      </div>

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search name or email…"
        filters={[
          { key: 'status', placeholder: 'All statuses', value: filters.status, options: STATUS_OPTIONS },
          { key: 'roleId', placeholder: 'All roles', value: filters.roleId, options: (roles ?? []).map((r) => ({ value: r.id, label: r.name })) },
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
        rowKey={(u) => u.id}
        sort={sort}
        onSortChange={onSort}
        empty={{ title: 'No users found', description: 'Adjust filters or add your first user.', action: canCreate ? <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add User</Button> : undefined }}
        pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
      />

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} user={selected} onSaved={refetch} />
      <ResetPasswordModal open={resetOpen} onClose={() => setResetOpen(false)} user={selected} onDone={refetch} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        danger
        title="Delete user?"
        message={`This disables ${toDelete?.fullName}'s account and revokes all their sessions. This cannot be undone from the UI.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
