import { useEffect, useMemo, useState } from 'react';
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2, Building2, Users, Network, Boxes, CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { StatCard } from '../../components/charts/StatCard';
import { Skeleton, EmptyState, ErrorState } from '../../components/feedback/States';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Input, Select, Label } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { useQuery } from '../../hooks/useQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { departmentsService, employeesService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { formatNumber } from '../../lib/format';
import type { Department, Employee } from '../../lib/types';
import { Copy, Check, ArrowRight, ArrowLeft } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function DepartmentsPage() {
  const toast = useToast();
  const canCreate = usePermission('departments:create');
  const canUpdate = usePermission('departments:update');
  const canDelete = usePermission('departments:delete');

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all' });
  const [view, setView] = useState<'list' | 'hierarchy'>('list');

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [toDelete, setToDelete] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: depts, loading, error, refetch } = useQuery(() => departmentsService.tree(), []);

  const setFilter = (key: string, value: string) => setFilters((f) => ({ ...f, [key]: value }));
  const clear = () => { setSearch(''); setFilters({ status: 'all' }); };

  const stats = useMemo(() => {
    const list = depts ?? [];
    const totalMembers = list.reduce((sum, d) => sum + d.memberCount, 0);
    const active = list.filter((d) => d.isActive).length;
    return {
      total: list.length,
      members: totalMembers,
      avg: list.length ? Math.round(totalMembers / list.length) : 0,
      active,
    };
  }, [depts]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return (depts ?? []).filter((d) => {
      if (filters.status === 'active' && !d.isActive) return false;
      if (filters.status === 'inactive' && d.isActive) return false;
      if (q && !`${d.name} ${d.code} ${d.costCenter ?? ''} ${d.headName ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [depts, debounced, filters]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await departmentsService.remove(toDelete.id);
    setDeleting(false);
    toast.success('Department removed', `${toDelete.name} was deleted.`);
    setToDelete(null);
    refetch();
  };

  const openCreate = () => { setSelected(null); setFormOpen(true); };
  const openEdit = (d: Department) => { setSelected(d); setFormOpen(true); };

  const columns: Column<Department>[] = [
    {
      key: 'name', header: 'Department',
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{d.name}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{d.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'head', header: 'Head',
      render: (d) => d.headName ? (
        <div className="flex items-center gap-2.5">
          <Avatar name={d.headName} size="sm" />
          <span className="text-foreground">{d.headName}</span>
        </div>
      ) : <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      key: 'memberCount', header: 'Members', align: 'center',
      render: (d) => <Badge tone="neutral">{formatNumber(d.memberCount)}</Badge>,
    },
    {
      key: 'costCenter', header: 'Cost Center',
      render: (d) => <span className="font-mono text-xs text-muted-foreground">{d.costCenter ?? '—'}</span>,
    },
    {
      key: 'parentName', header: 'Parent',
      render: (d) => d.parentName ? <span className="text-muted-foreground">{d.parentName}</span> : <span className="text-muted-foreground/60">Top level</span>,
    },
    {
      key: 'isActive', header: 'Status',
      render: (d) => <Badge tone={d.isActive ? 'success' : 'neutral'} dot>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (d) => (
        <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
          <DropdownItem icon={<Eye />} onClick={() => openEdit(d)}>View details</DropdownItem>
          {canUpdate && <DropdownItem icon={<Pencil />} onClick={() => openEdit(d)}>Edit</DropdownItem>}
          {canDelete && <><DropdownSeparator /><DropdownItem icon={<Trash2 />} danger onClick={() => setToDelete(d)}>Delete</DropdownItem></>}
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Organize teams, reporting lines and cost centers across the bank."
        actions={canCreate ? <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Department</Button> : undefined}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard loading={loading} label="Total Departments" value={formatNumber(stats.total)} icon={<Building2 />} accent="primary" />
        <StatCard loading={loading} label="Total Members" value={formatNumber(stats.members)} icon={<Users />} accent="info" hint="Across all teams" />
        <StatCard loading={loading} label="Avg Team Size" value={formatNumber(stats.avg)} icon={<Boxes />} accent="accent" />
        <StatCard loading={loading} label="Active" value={formatNumber(stats.active)} icon={<CheckCircle2 />} accent="success" />
      </div>

      <Tabs
        tabs={[
          { value: 'list', label: 'List', count: stats.total },
          { value: 'hierarchy', label: 'Hierarchy' },
        ]}
        value={view}
        onChange={(v) => setView(v as 'list' | 'hierarchy')}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, code, cost center…"
        filters={[{ key: 'status', placeholder: 'All statuses', value: filters.status, options: STATUS_OPTIONS }]}
        onFilterChange={setFilter}
        onClear={clear}
      />

      {view === 'list' ? (
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          error={error}
          onRetry={refetch}
          rowKey={(d) => d.id}
          onRowClick={openEdit}
          empty={{
            title: 'No departments found',
            description: 'Adjust your filters or create your first department.',
            action: canCreate ? <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Department</Button> : undefined,
          }}
        />
      ) : (
        <HierarchyView depts={filtered} loading={loading} error={error} onRetry={refetch} onEdit={openEdit} />
      )}

      <DepartmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        department={selected}
        allDepts={depts ?? []}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Delete department?"
        message={`This will remove ${toDelete?.name}. Members and sub-departments must be reassigned first.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function HierarchyView({
  depts, loading, error, onRetry, onEdit,
}: {
  depts: Department[]; loading: boolean; error?: string; onRetry: () => void; onEdit: (d: Department) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
      </div>
    );
  }
  if (error) return <Card className="p-2"><ErrorState message={error} onRetry={onRetry} /></Card>;
  if (depts.length === 0) return <Card className="p-2"><EmptyState icon={<Network className="h-6 w-6" />} title="No departments to show" description="Adjust your filters to see the org structure." /></Card>;

  const ids = new Set(depts.map((d) => d.id));
  const roots = depts.filter((d) => !d.parentId || !ids.has(d.parentId));
  const childrenOf = (id: string) => depts.filter((d) => d.parentId === id);

  return (
    <div className="space-y-3">
      {roots.map((root) => {
        const kids = childrenOf(root.id);
        return (
          <div key={root.id} className="space-y-2">
            <DeptNode dept={root} onEdit={onEdit} />
            {kids.length > 0 && (
              <div className="ml-4 space-y-2 border-l border-border pl-4 sm:ml-6 sm:pl-6">
                {kids.map((child) => <DeptNode key={child.id} dept={child} nested onEdit={onEdit} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeptNode({ dept, nested, onEdit }: { dept: Department; nested?: boolean; onEdit: (d: Department) => void }) {
  return (
    <button
      onClick={() => onEdit(dept)}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left shadow-card transition-colors hover:border-primary/40 hover:bg-surface-2/50 focus-ring"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${nested ? 'bg-accent/15 text-accent' : 'bg-primary/10 text-primary'}`}>
        <Building2 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-foreground">{dept.name}</p>
          <span className="font-mono text-xs text-muted-foreground">{dept.code}</span>
          {!dept.isActive && <Badge tone="neutral">Inactive</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {dept.headName ? `Head: ${dept.headName}` : 'Head: Unassigned'} · {dept.costCenter ?? 'No cost center'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone="primary" dot>{formatNumber(dept.memberCount)} members</Badge>
      </div>
    </button>
  );
}

const EMPTY_FORM = { name: '', code: '', parentId: '', costCenter: '', isActive: true };
const EMPTY_HEAD = { firstName: '', lastName: '', workEmail: '', phone: '' };

/** Add Department is a two-step wizard: details → assign a (compulsory) head,
 *  either an existing employee or a new one created inline. Edit is a single
 *  form that can also (re)assign the head. */
function DepartmentFormModal({
  open, onClose, department, allDepts, onSaved,
}: {
  open: boolean; onClose: () => void; department?: Department | null; allDepts: Department[]; onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!department;
  const { data: empPage } = useQuery(() => employeesService.list({ page: 1, limit: 100 }), []);
  const employees: Employee[] = empPage?.data ?? [];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [headMode, setHeadMode] = useState<'new' | 'existing'>('new');
  const [headEmployeeId, setHeadEmployeeId] = useState('');
  const [newHead, setNewHead] = useState(EMPTY_HEAD);
  const [pwStrategy, setPwStrategy] = useState<'generate' | 'invite'>('generate');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string | null } | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm(department ? {
      name: department.name, code: department.code, parentId: department.parentId ?? '',
      costCenter: department.costCenter ?? '', isActive: department.isActive,
    } : EMPTY_FORM);
    setHeadMode('new');
    setHeadEmployeeId(department?.headEmployeeId ?? '');
    setNewHead(EMPTY_HEAD);
    setPwStrategy('generate');
    setErrors({});
    setCreated(null);
  }, [open, department]);

  const set = (k: keyof typeof EMPTY_FORM, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const setHead = (k: keyof typeof EMPTY_HEAD, v: string) => setNewHead((h) => ({ ...h, [k]: v }));
  const parentOptions = allDepts.filter((d) => d.id !== department?.id);

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Department name is required';
    if (!form.code.trim()) errs.code = 'A short code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateHead = () => {
    const errs: Record<string, string> = {};
    if (headMode === 'existing') {
      if (!headEmployeeId) errs.headEmployeeId = 'Select an employee to lead this department';
    } else {
      if (!newHead.firstName.trim()) errs.firstName = 'First name is required';
      if (!newHead.lastName.trim()) errs.lastName = 'Last name is required';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newHead.workEmail)) errs.workEmail = 'Valid work email required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => { if (validateDetails()) { setErrors({}); setStep(2); } };

  const basePayload = () => ({
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    parentId: form.parentId || undefined,
    costCenter: form.costCenter.trim() || undefined,
    isActive: form.isActive,
  });

  const saveEdit = async () => {
    if (!validateDetails()) return;
    setSaving(true);
    try {
      await departmentsService.update(department!.id, { ...basePayload(), headEmployeeId: headEmployeeId || undefined } as Partial<Department>);
      toast.success('Department updated', `${form.name} was saved.`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error('Could not update department', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const createDept = async () => {
    if (!validateHead()) return;
    setSaving(true);
    const head = headMode === 'existing'
      ? { employeeId: headEmployeeId }
      : { newEmployee: { firstName: newHead.firstName.trim(), lastName: newHead.lastName.trim(), workEmail: newHead.workEmail.trim().toLowerCase(), phone: newHead.phone.trim() || undefined, accountPasswordStrategy: pwStrategy } };
    try {
      const res = await departmentsService.create({ ...basePayload(), head });
      onSaved();
      if (headMode === 'new' && res.generatedPassword) {
        setCreated({ email: newHead.workEmail.trim().toLowerCase(), password: res.generatedPassword });
      } else {
        toast.success('Department created', `${form.name} was created with its head.`);
        onClose();
      }
    } catch (e) {
      toast.error('Could not create department', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const footer = created ? (
    <Button onClick={onClose}>Done</Button>
  ) : isEdit ? (
    <><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={saveEdit} loading={saving}>Save changes</Button></>
  ) : step === 1 ? (
    <><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={goNext}>Next <ArrowRight className="h-4 w-4" /></Button></>
  ) : (
    <><Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button><Button onClick={createDept} loading={saving}>Create department</Button></>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isEdit ? 'Edit Department' : 'Add Department'}
      description={isEdit ? `Editing ${department?.name}` : (step === 1 ? 'Step 1 of 2 · Department details' : 'Step 2 of 2 · Assign the head')}
      footer={footer}
    >
      {created ? (
        <HeadCreated email={created.email} password={created.password} deptName={form.name} />
      ) : (isEdit || step === 1) ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label required>Department name</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} invalid={!!errors.name} placeholder="e.g. Retail Banking" />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
            </div>
            <div>
              <Label required>Code</Label>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} invalid={!!errors.code} placeholder="e.g. RB" className="font-mono uppercase" />
              {errors.code && <p className="mt-1 text-xs text-danger">{errors.code}</p>}
            </div>
            <div>
              <Label>Parent department</Label>
              <Select value={form.parentId} onChange={(e) => set('parentId', e.target.value)}>
                <option value="">None (top level)</option>
                {parentOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Cost center</Label>
              <Input value={form.costCenter} onChange={(e) => set('costCenter', e.target.value)} placeholder="e.g. CC-700" className="font-mono" />
            </div>
          </div>

          {isEdit && (
            <div>
              <Label>Head of department</Label>
              <Select value={headEmployeeId} onChange={(e) => setHeadEmployeeId(e.target.value)}>
                <option value="">— Select head —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} · {e.employeeCode}</option>)}
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">Reassigning grants the Department Head role and moves them into this department.</p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active department</p>
              <p className="text-xs text-muted-foreground">Inactive departments are hidden from assignment lists.</p>
            </div>
            <Switch checked={form.isActive} onChange={(v) => set('isActive', v)} label="Active department" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Every department has a head who leads the team. They get the <span className="font-medium text-foreground">Department Head</span> role (web + mobile), and new members of this department will report to them.</p>

          <div className="grid grid-cols-2 gap-2">
            <SegBtn active={headMode === 'new'} onClick={() => { setHeadMode('new'); setErrors({}); }} title="New employee" desc="Create the head now" />
            <SegBtn active={headMode === 'existing'} onClick={() => { setHeadMode('existing'); setErrors({}); }} title="Existing employee" desc="Pick from your team" />
          </div>

          {headMode === 'existing' ? (
            <div>
              <Label required>Head</Label>
              <Select value={headEmployeeId} onChange={(e) => setHeadEmployeeId(e.target.value)}>
                <option value="">— Select an employee —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} · {e.employeeCode}</option>)}
              </Select>
              {errors.headEmployeeId && <p className="mt-1 text-xs text-danger">{errors.headEmployeeId}</p>}
              {employees.length === 0 && <p className="mt-1 text-xs text-warning">No employees yet — create one as the head instead.</p>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <Label required>First name</Label>
                  <Input value={newHead.firstName} onChange={(e) => setHead('firstName', e.target.value)} invalid={!!errors.firstName} />
                  {errors.firstName && <p className="mt-1 text-xs text-danger">{errors.firstName}</p>}
                </div>
                <div>
                  <Label required>Last name</Label>
                  <Input value={newHead.lastName} onChange={(e) => setHead('lastName', e.target.value)} invalid={!!errors.lastName} />
                  {errors.lastName && <p className="mt-1 text-xs text-danger">{errors.lastName}</p>}
                </div>
                <div>
                  <Label required>Work email</Label>
                  <Input type="email" value={newHead.workEmail} onChange={(e) => setHead('workEmail', e.target.value)} invalid={!!errors.workEmail} placeholder="name@company.com" />
                  {errors.workEmail && <p className="mt-1 text-xs text-danger">{errors.workEmail}</p>}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={newHead.phone} onChange={(e) => setHead('phone', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Password</Label>
                <div className="grid grid-cols-2 gap-2">
                  <SegBtn active={pwStrategy === 'generate'} onClick={() => setPwStrategy('generate')} title="Generate" desc="One-time password to share" />
                  <SegBtn active={pwStrategy === 'invite'} onClick={() => setPwStrategy('invite')} title="Invite" desc="They set their own" />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function SegBtn({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-left transition-colors focus-ring ${active ? 'border-primary bg-primary/5 ring-1 ring-primary/40' : 'border-border hover:bg-surface-2/60'}`}>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function HeadCreated({ email, password, deptName }: { email: string; password: string | null; deptName: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (!password) return; try { await navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3.5 py-2.5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <p className="text-sm text-foreground"><span className="font-medium">{deptName}</span> was created with its head.</p>
      </div>
      <div>
        <Label>Head login email</Label>
        <Input value={email} disabled />
      </div>
      {password && (
        <div>
          <Label>One-time password</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground">{password}</code>
            <Button variant="outline" size="sm" onClick={copy}>{copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}</Button>
          </div>
          <p className="mt-2 text-xs text-warning">Copy this now — it won’t be shown again. Share it securely; they should change it on first login.</p>
        </div>
      )}
    </div>
  );
}
