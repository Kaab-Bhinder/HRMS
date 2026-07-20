import { useEffect, useMemo, useState } from 'react';
import { Plus, ShieldCheck, Lock, Save, Users, RotateCcw, Monitor, Smartphone } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/charts/StatCard';
import { Checkbox, Switch } from '../../components/ui/Switch';
import { Modal } from '../../components/ui/Modal';
import { Input, Label } from '../../components/ui/Input';
import { Skeleton, EmptyState, ErrorState } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { rolesService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { cn } from '../../lib/utils';
import type { Role, Permission } from '../../lib/types';

const ACTION_ORDER = ['read', 'create', 'update', 'delete'];

function labelize(v: string) {
  return v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RolesPage() {
  const toast = useToast();
  const canUpdate = usePermission('roles:update');
  const canCreate = usePermission('roles:create');

  const { data: roles, loading, error, refetch } = useQuery(() => rolesService.list(), []);
  const { data: perms } = useQuery(() => rolesService.permissions(), []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (roles && roles.length && (!selectedId || !roles.some((r) => r.id === selectedId))) {
      setSelectedId(roles[0].id);
    }
  }, [roles, selectedId]);

  const selected = useMemo(() => roles?.find((r) => r.id === selectedId) ?? null, [roles, selectedId]);

  useEffect(() => {
    if (selected) setDraft(selected.permissions);
  }, [selected]);

  const dirty = useMemo(() => {
    if (!selected) return false;
    if (draft.length !== selected.permissions.length) return true;
    const set = new Set(selected.permissions);
    return draft.some((k) => !set.has(k));
  }, [draft, selected]);

  const editable = !!selected && !selected.isSystem && canUpdate;
  // Platform access is configurable on system roles too (except the locked Super Admin).
  const platformEditable = !!selected && canUpdate && selected.slug !== 'super-admin';
  const [savingPlatform, setSavingPlatform] = useState(false);

  const toggle = (key: string) => {
    setDraft((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]));
  };

  const setPlatform = async (patch: { canAccessWeb?: boolean; canAccessMobile?: boolean }) => {
    if (!selected) return;
    setSavingPlatform(true);
    try {
      await rolesService.update(selected.id, patch);
      toast.success('Platform access updated', `${selected.name}’s app access was changed.`);
      refetch();
    } catch (e) {
      toast.error('Could not update platform access', (e as Error).message);
    } finally {
      setSavingPlatform(false);
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await rolesService.update(selected.id, { permissions: draft });
    setSaving(false);
    toast.success('Permissions saved', `${selected.name} now has ${draft.length} permissions.`);
    refetch();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles & Permissions"
        description="Define access levels and control what each team can see and do."
        actions={canCreate ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create Role</Button> : undefined}
      />

      {/* Headline counts, derived from the already-loaded role list (no extra requests). */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard loading={loading} label="Roles" value={roles?.length ?? 0} icon={<ShieldCheck />} accent="accent" />
        <StatCard loading={loading} label="Web Access" value={(roles ?? []).filter((r) => r.canAccessWeb).length} icon={<Monitor />} accent="info" />
        <StatCard loading={loading} label="Mobile Access" value={(roles ?? []).filter((r) => r.canAccessMobile).length} icon={<Smartphone />} accent="success" />
        <StatCard loading={loading} label="Assigned Users" value={(roles ?? []).reduce((s, r) => s + (r.userCount ?? 0), 0)} icon={<Users />} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        {/* LEFT — role list */}
        <div className="space-y-3">
          {loading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          {!loading && error && <Card className="p-2"><ErrorState message={error} onRetry={refetch} /></Card>}
          {!loading && !error && roles && roles.length === 0 && (
            <Card className="p-2">
              <EmptyState
                icon={<ShieldCheck className="h-6 w-6" />}
                title="No roles yet"
                description="Create your first role to start assigning permissions."
                action={canCreate ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create Role</Button> : undefined}
              />
            </Card>
          )}
          {!loading && !error && (roles ?? []).map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              total={perms?.length ?? 0}
              active={role.id === selectedId}
              onSelect={() => setSelectedId(role.id)}
            />
          ))}
        </div>

        {/* RIGHT — permission matrix */}
        <Card>
          {loading || !selected ? (
            <>
              <CardHeader title="Permissions" description="Select a role to manage access." />
              <CardBody><Skeleton className="h-[320px] w-full" /></CardBody>
            </>
          ) : (
            <>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    {selected.name}
                    {selected.isSystem && <Badge tone="neutral"><Lock className="h-3 w-3" /> System</Badge>}
                  </span>
                }
                description={`${draft.length} of ${perms?.length ?? 0} permissions granted`}
                action={
                  editable ? (
                    <div className="flex items-center gap-2">
                      {dirty && (
                        <Button variant="ghost" size="sm" onClick={() => setDraft(selected.permissions)}>
                          <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </Button>
                      )}
                      <Button size="sm" onClick={save} loading={saving} disabled={!dirty}>
                        <Save className="h-4 w-4" /> Save changes
                      </Button>
                    </div>
                  ) : undefined
                }
              />
              <CardBody className="space-y-4">
                {/* Platform access — an auth-time gate, separate from permissions. */}
                <div className="rounded-lg border border-border bg-surface-2/30 p-3.5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Platform access</p>
                      <p className="text-xs text-muted-foreground">Which apps a user with this role may sign in to.</p>
                    </div>
                    {savingPlatform && <span className="text-xs text-muted-foreground">Saving…</span>}
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm text-foreground"><Monitor className="h-4 w-4 text-muted-foreground" /> Web admin app</span>
                      <Switch checked={selected.canAccessWeb} disabled={!platformEditable || savingPlatform} onChange={(v) => setPlatform({ canAccessWeb: v })} label="Web access" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm text-foreground"><Smartphone className="h-4 w-4 text-muted-foreground" /> Mobile app</span>
                      <Switch checked={selected.canAccessMobile} disabled={!platformEditable || savingPlatform} onChange={(v) => setPlatform({ canAccessMobile: v })} label="Mobile access" />
                    </div>
                  </div>
                  {selected.slug === 'super-admin' && (
                    <p className="mt-2 text-xs text-muted-foreground">The Super Admin role’s access is locked and cannot be changed.</p>
                  )}
                </div>

                {!editable && (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    {selected.isSystem
                      ? 'System roles’ permissions are read-only to protect core access. Duplicate it to customize.'
                      : 'You don’t have permission to edit roles. Viewing in read-only mode.'}
                  </div>
                )}
                <PermissionMatrix perms={perms} granted={draft} onToggle={toggle} disabled={!editable} />
              </CardBody>
            </>
          )}
        </Card>
      </div>

      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)} perms={perms} onCreated={refetch} />
    </div>
  );
}

function RoleCard({ role, total, active, onSelect }: { role: Role; total: number; active: boolean; onSelect: () => void }) {
  const pct = total ? Math.round((role.permissions.length / total) * 100) : 0;
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border bg-surface px-4 py-3.5 text-left shadow-card transition-colors focus-ring',
        active ? 'border-primary ring-1 ring-primary/40' : 'border-border hover:border-primary/40 hover:bg-surface-2/50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground')}>
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="font-medium text-foreground">{role.name}</p>
        </div>
        {role.isSystem && <Badge tone="neutral"><Lock className="h-3 w-3" /> System</Badge>}
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{role.description}</p>
      <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {role.userCount} users</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> {role.permissions.length} perms · {pct}%</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {role.canAccessWeb && <Badge tone="info"><Monitor className="h-3 w-3" /> Web</Badge>}
        {role.canAccessMobile && <Badge tone="accent"><Smartphone className="h-3 w-3" /> Mobile</Badge>}
        {!role.canAccessWeb && !role.canAccessMobile && <span className="text-xs text-muted-foreground/70">No app access</span>}
      </div>
    </button>
  );
}

function PermissionMatrix({ perms, granted, onToggle, disabled }: { perms?: Permission[]; granted: string[]; onToggle: (key: string) => void; disabled?: boolean }) {
  const grantedSet = useMemo(() => new Set(granted), [granted]);

  const { resources, actions, byResource } = useMemo(() => {
    const list = perms ?? [];
    const byResource = new Map<string, Map<string, Permission>>();
    const actionSet = new Set<string>();
    const order: string[] = [];
    for (const p of list) {
      if (!byResource.has(p.resource)) { byResource.set(p.resource, new Map()); order.push(p.resource); }
      byResource.get(p.resource)!.set(p.action, p);
      actionSet.add(p.action);
    }
    const actions = [
      ...ACTION_ORDER.filter((a) => actionSet.has(a)),
      ...[...actionSet].filter((a) => !ACTION_ORDER.includes(a)),
    ];
    return { resources: order, actions, byResource };
  }, [perms]);

  if (!perms) return <Skeleton className="h-64 w-full" />;
  if (resources.length === 0) return <EmptyState title="No permissions defined" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resource</th>
            {actions.map((a) => (
              <th key={a} className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">{labelize(a)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {resources.map((resource) => {
            const cells = byResource.get(resource)!;
            const count = actions.reduce((n, a) => {
              const p = cells.get(a);
              return n + (p && grantedSet.has(p.key) ? 1 : 0);
            }, 0);
            return (
              <tr key={resource} className="transition-colors hover:bg-surface-2/40">
                <td className="px-3 py-2.5">
                  <p className="font-medium text-foreground">{labelize(resource)}</p>
                  <p className="text-xs text-muted-foreground">{count}/{cells.size} granted</p>
                </td>
                {actions.map((a) => {
                  const p = cells.get(a);
                  if (!p) return <td key={a} className="px-3 py-2.5 text-center text-muted-foreground/40">—</td>;
                  return (
                    <td key={a} className="px-3 py-2.5">
                      <div className="flex justify-center">
                        <Checkbox checked={grantedSet.has(p.key)} onChange={() => onToggle(p.key)} disabled={disabled} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CreateRoleModal({ open, onClose, perms, onCreated }: { open: boolean; onClose: () => void; perms?: Permission[]; onCreated: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [granted, setGranted] = useState<string[]>([]);
  const [web, setWeb] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setName(''); setDescription(''); setGranted([]); setWeb(true); setMobile(false); setError(''); }
  }, [open]);

  const toggle = (key: string) => setGranted((g) => (g.includes(key) ? g.filter((k) => k !== key) : [...g, key]));

  const submit = async () => {
    if (!name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    try {
      await rolesService.create({ name: name.trim(), description: description.trim(), permissions: granted, canAccessWeb: web, canAccessMobile: mobile });
      toast.success('Role created', `${name.trim()} was added with ${granted.length} permissions.`);
      onCreated();
      onClose();
    } catch (e) {
      toast.error('Could not create role', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Create Role"
      description="Name the role and choose the permissions it grants."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Create role</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label required>Role name</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setError(''); }} invalid={!!error} placeholder="e.g. Branch Supervisor" />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary of this role" />
          </div>
        </div>
        <div>
          <Label>Platform access</Label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/30 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-foreground"><Monitor className="h-4 w-4 text-muted-foreground" /> Web admin app</span>
              <Switch checked={web} onChange={setWeb} label="Web access" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/30 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-foreground"><Smartphone className="h-4 w-4 text-muted-foreground" /> Mobile app</span>
              <Switch checked={mobile} onChange={setMobile} label="Mobile access" />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="mb-0">Permissions</Label>
            <span className="text-xs text-muted-foreground">{granted.length} selected</span>
          </div>
          <PermissionMatrix perms={perms} granted={granted} onToggle={toggle} />
        </div>
      </div>
    </Modal>
  );
}
