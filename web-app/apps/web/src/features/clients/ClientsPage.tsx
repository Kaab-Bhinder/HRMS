import { useEffect, useState } from 'react';
import { Handshake, Users, Building2, Plus, Pencil, Trash2, ClipboardList, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label, Textarea } from '../../components/ui/Input';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Progress } from '../../components/ui/Misc';
import { StatCard } from '../../components/charts/StatCard';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { usePermission } from '../../store/auth';
import { useToast } from '../../store/toast';
import { formatDate } from '../../lib/format';
import { clientsService, departmentsService, type Client, type ClientPerformance, type ClientStatus } from '../../services';

const STATUS_TONE: Record<ClientStatus, 'success' | 'neutral' | 'info'> = {
  active: 'success',
  inactive: 'neutral',
  prospect: 'info',
};

export default function ClientsPage() {
  const canManage = usePermission('clients:create');
  const { data, loading, error, refetch } = useQuery(() => clientsService.list(), []);
  const [editing, setEditing] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [removing, setRemoving] = useState<Client | null>(null);

  const clients = data ?? [];
  const active = clients.filter((c) => c.status === 'active').length;
  const deptCount = new Set(clients.map((c) => c.departmentId).filter(Boolean)).size;

  const columns: Column<Client>[] = [
    {
      key: 'name', header: 'Client', sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{c.name}</p>
            <p className="truncate text-xs text-muted-foreground">{c.code ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'departmentName', header: 'Serving team',
      render: (c) => c.departmentName
        ? (
          <div>
            <p className="text-foreground">{c.departmentName}</p>
            <p className="text-xs text-muted-foreground">{c.headName ? `Lead: ${c.headName}` : 'No head assigned'} · {c.teamSize} member(s)</p>
          </div>
        )
        : <Badge tone="warning">No team assigned</Badge>,
    },
    { key: 'contactPerson', header: 'Contact', render: (c) => (
      <div className="min-w-0">
        <p className="truncate text-foreground">{c.contactPerson ?? '—'}</p>
        <p className="truncate text-xs text-muted-foreground">{c.contactEmail ?? c.contactPhone ?? ''}</p>
      </div>
    ) },
    { key: 'status', header: 'Status', sortable: true, render: (c) => <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge> },
    { key: 'createdAt', header: 'Since', align: 'right', render: (c) => <span className="text-muted-foreground">{formatDate(c.createdAt)}</span> },
    ...(canManage
      ? [{
          key: 'actions', header: '', align: 'right' as const,
          render: (c: Client) => (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setFormOpen(true); }} aria-label="Edit client"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setRemoving(c)} aria-label="Delete client"><Trash2 className="h-4 w-4 text-danger" /></Button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        description="Companies you serve, each backed by one of your teams. Clients never get platform access — this view is for tracking how each team performs for them."
        actions={canManage && (
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> New client</Button>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total clients" value={String(clients.length)} icon={<Handshake />} accent="primary" loading={loading} />
        <StatCard label="Active" value={String(active)} icon={<Users />} accent="success" loading={loading} />
        <StatCard label="Teams serving" value={String(deptCount)} icon={<Building2 />} accent="info" loading={loading} />
      </div>

      <Card>
        <CardHeader title="Client portfolio" description="Click a client to see the serving team's live performance." />
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={data ?? undefined}
            loading={loading}
            error={error}
            onRetry={refetch}
            rowKey={(c) => c.id}
            onRowClick={(c) => setViewing(c)}
            empty={{ title: 'No clients yet', description: 'Add your first client and link the team that serves them.' }}
          />
        </CardBody>
      </Card>

      <ClientFormModal open={formOpen} onClose={() => setFormOpen(false)} client={editing} onSaved={refetch} />
      <ClientPerformanceModal open={!!viewing} onClose={() => setViewing(null)} client={viewing} />
      <RemoveClientDialog client={removing} onClose={() => setRemoving(null)} onRemoved={refetch} />
    </div>
  );
}

const EMPTY_FORM = { name: '', code: '', contactPerson: '', contactEmail: '', contactPhone: '', status: 'active', notes: '', departmentId: '' };

function ClientFormModal({ open, onClose, client, onSaved }: { open: boolean; onClose: () => void; client: Client | null; onSaved: () => void }) {
  const toast = useToast();
  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  const [form, setForm] = useState<Record<string, string>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(client ? {
        name: client.name, code: client.code ?? '', contactPerson: client.contactPerson ?? '',
        contactEmail: client.contactEmail ?? '', contactPhone: client.contactPhone ?? '',
        status: client.status, notes: client.notes ?? '', departmentId: client.departmentId ?? '',
      } : { ...EMPTY_FORM });
    }
  }, [open, client]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Name required', 'The client needs a name.');
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = { ...form };
    // Optional fields: omit blanks so the API treats them as "not provided";
    // departmentId '' would fail @IsUUID.
    for (const k of ['code', 'contactPerson', 'contactEmail', 'contactPhone', 'notes', 'departmentId']) {
      if (!payload[k]) delete payload[k];
    }
    try {
      if (client) {
        await clientsService.update(client.id, payload as Partial<Client>);
        toast.success('Client updated', `${form.name} was saved.`);
      } else {
        await clientsService.create(payload as Partial<Client>);
        toast.success('Client added', `${form.name} is now tracked.`);
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Edit client' : 'New client'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label required>Client name</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. PT Nusantara Retail" />
          </div>
          <div>
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. NUSA" />
          </div>
          <div>
            <Label>Serving team (department)</Label>
            <Select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
              <option value="">Not assigned yet</option>
              {(depts ?? []).map((d: { id: string; name: string }) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div>
            <Label>Contact person</Label>
            <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
          </div>
          <div>
            <Label>Contact phone</Label>
            <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Engagement scope, SLAs, anything the team should know…" />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>{client ? 'Save changes' : 'Add client'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function ClientPerformanceModal({ open, onClose, client }: { open: boolean; onClose: () => void; client: Client | null }) {
  const { data, loading } = useQuery<ClientPerformance | null>(
    () => (client ? clientsService.performance(client.id) : Promise.resolve(null)),
    [client?.id, open],
  );
  if (!client) return null;
  const team = data?.team;

  return (
    <Modal open={open} onClose={onClose} title="Client performance" size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
            <p className="text-sm text-muted-foreground">
              {client.departmentName ? `Served by ${client.departmentName}` : 'No team assigned yet'}
              {client.headName ? ` · Lead: ${client.headName}` : ''}
            </p>
          </div>
          <Badge tone={STATUS_TONE[client.status]}>{client.status}</Badge>
        </div>

        {loading ? (
          <Skeleton className="h-64" />
        ) : !team ? (
          <p className="rounded-md bg-warning/10 p-3 text-sm text-warning">
            Assign a serving team (department) to this client to see attendance, tasks and roster here.
          </p>
        ) : (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Team attendance this month</span>
                <span>{team.attendance.presentRate != null ? `${team.attendance.presentRate}% present` : 'No records yet'}</span>
              </div>
              <Progress value={team.attendance.presentRate ?? 0} tone={(team.attendance.presentRate ?? 0) >= 85 ? 'success' : 'primary'} />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {team.attendance.presentDays} present · {team.attendance.lateDays} late · {team.attendance.absentDays} absent · {team.attendance.onLeaveDays} on leave
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PerfStat label="Open tasks" value={team.tasks.open} />
              <PerfStat label="In progress" value={team.tasks.inProgress} />
              <PerfStat label="Done" value={team.tasks.done} />
              <PerfStat label="Overdue" value={team.tasks.overdue} warn={team.tasks.overdue > 0} />
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Team roster · {team.memberCount}</h4>
              <div className="max-h-48 overflow-auto rounded-md border border-border">
                {team.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
                    <Avatar name={m.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.designation ?? m.employeeCode}</p>
                    </div>
                    <Badge tone="neutral">{m.status.replace('_', ' ')}</Badge>
                  </div>
                ))}
                {team.members.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No members in this team yet.</p>}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent reports from this team</h4>
              {team.recentReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing filed yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {team.recentReports.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-sm">
                      <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-foreground">{r.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{r.periodLabel ?? formatDate(r.submittedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function PerfStat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-semibold ${warn ? 'text-danger' : 'text-foreground'}`}>
        {warn && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}{value}
      </p>
    </div>
  );
}

function RemoveClientDialog({ client, onClose, onRemoved }: { client: Client | null; onClose: () => void; onRemoved: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmDialog
      open={!!client}
      onClose={onClose}
      onConfirm={async () => {
        if (!client) return;
        setBusy(true);
        try {
          await clientsService.remove(client.id);
          toast.success('Client removed', `${client.name} is no longer tracked.`);
          onRemoved();
          onClose();
        } catch (e) {
          toast.error('Could not remove', e instanceof Error ? e.message : 'Please try again.');
        } finally {
          setBusy(false);
        }
      }}
      title="Remove client?"
      message={client ? `${client.name} will be removed from the portfolio. The serving department and its data are untouched.` : ''}
      confirmLabel="Remove"
      danger
      loading={busy}
    />
  );
}
