import { useEffect, useMemo, useState } from 'react';
import { Package, PackageCheck, PackageOpen, Wrench, Plus, Pencil, Trash2, UserPlus, Undo2, History } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label, Textarea } from '../../components/ui/Input';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { StatCard } from '../../components/charts/StatCard';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { usePermission } from '../../store/auth';
import { useToast } from '../../store/toast';
import { formatDate } from '../../lib/format';
import { assetsService, employeesService, type Asset, type AssetStatus } from '../../services';
import { useEmployeeOptions } from '../../hooks/useEmployeeOptions';

const STATUS_TONE: Record<AssetStatus, 'success' | 'primary' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  assigned: 'primary',
  in_repair: 'warning',
  lost: 'danger',
  retired: 'neutral',
};

const CATEGORY_SUGGESTIONS = ['Laptop', 'Phone', 'Monitor', 'Vehicle', 'Furniture', 'Software License', 'Other'];

export default function AssetsPage() {
  const canManage = usePermission('assets:update');
  const canCreate = usePermission('assets:create');
  const canDelete = usePermission('assets:delete');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useQuery(() => assetsService.list({ status: status || undefined, search: search || undefined }), [status, search]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [assigning, setAssigning] = useState<Asset | null>(null);
  const [returning, setReturning] = useState<Asset | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Asset | null>(null);
  const [removing, setRemoving] = useState<Asset | null>(null);

  const assets = data ?? [];
  const counts = useMemo(() => ({
    assigned: assets.filter((a) => a.status === 'assigned').length,
    available: assets.filter((a) => a.status === 'available').length,
    repair: assets.filter((a) => a.status === 'in_repair').length,
  }), [assets]);

  const columns: Column<Asset>[] = [
    {
      key: 'assetTag', header: 'Asset', sortable: true,
      render: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{a.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{a.assetTag}{a.serialNumber ? ` · SN ${a.serialNumber}` : ''}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortable: true, render: (a) => <span className="text-foreground">{a.category}</span> },
    {
      key: 'assignedToName', header: 'Holder',
      render: (a) => a.assignedToName
        ? (
          <div className="flex items-center gap-2">
            <Avatar name={a.assignedToName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{a.assignedToName}</p>
              <p className="truncate text-xs text-muted-foreground">{a.assignedToCode}</p>
            </div>
          </div>
        )
        : <span className="text-muted-foreground">—</span>,
    },
    { key: 'condition', header: 'Condition', render: (a) => <span className="text-muted-foreground">{a.condition ?? '—'}</span> },
    {
      key: 'warrantyUntil', header: 'Warranty', align: 'right',
      render: (a) => {
        if (!a.warrantyUntil) return <span className="text-muted-foreground">—</span>;
        const expired = new Date(a.warrantyUntil) < new Date();
        return <span className={expired ? 'text-danger' : 'text-muted-foreground'}>{formatDate(a.warrantyUntil)}</span>;
      },
    },
    { key: 'status', header: 'Status', sortable: true, render: (a) => <Badge tone={STATUS_TONE[a.status]}>{a.status.replace('_', ' ')}</Badge> },
    ...(canManage
      ? [{
          key: 'actions', header: '', align: 'right' as const,
          render: (a: Asset) => (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              {a.status === 'available' && (
                <Button variant="ghost" size="sm" onClick={() => setAssigning(a)} aria-label="Assign asset"><UserPlus className="h-4 w-4" /></Button>
              )}
              {a.status === 'assigned' && (
                <Button variant="ghost" size="sm" onClick={() => setReturning(a)} aria-label="Return asset"><Undo2 className="h-4 w-4" /></Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setEditing(a); setFormOpen(true); }} aria-label="Edit asset"><Pencil className="h-4 w-4" /></Button>
              {canDelete && (
                <Button variant="ghost" size="sm" onClick={() => setRemoving(a)} aria-label="Delete asset"><Trash2 className="h-4 w-4 text-danger" /></Button>
              )}
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assets"
        description="Company property registry. Assign items to employees and every issue and return is recorded — the history is what offboarding clearance checks."
        actions={canCreate && (
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> New asset</Button>
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total assets" value={String(assets.length)} icon={<Package />} accent="primary" loading={loading} />
        <StatCard label="Assigned" value={String(counts.assigned)} icon={<PackageCheck />} accent="info" loading={loading} />
        <StatCard label="Available" value={String(counts.available)} icon={<PackageOpen />} accent="success" loading={loading} />
        <StatCard label="In repair" value={String(counts.repair)} icon={<Wrench />} accent={counts.repair ? 'warning' : 'success'} loading={loading} />
      </div>

      <Card>
        <CardHeader
          title="Asset registry"
          description="Click a row for the issue/return history."
          action={
            <div className="flex items-center gap-2">
              <Input placeholder="Search tag, name, serial…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
              <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
                <option value="">All statuses</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="in_repair">In repair</option>
                <option value="lost">Lost</option>
                <option value="retired">Retired</option>
              </Select>
            </div>
          }
        />
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={data ?? undefined}
            loading={loading}
            error={error}
            onRetry={refetch}
            rowKey={(a) => a.id}
            onRowClick={(a) => setViewingHistory(a)}
            empty={{ title: 'No assets yet', description: 'Register your first company asset to start tracking it.' }}
          />
        </CardBody>
      </Card>

      <AssetFormModal open={formOpen} onClose={() => setFormOpen(false)} asset={editing} onSaved={refetch} />
      <AssignModal asset={assigning} onClose={() => setAssigning(null)} onDone={refetch} />
      <ReturnModal asset={returning} onClose={() => setReturning(null)} onDone={refetch} />
      <HistoryModal asset={viewingHistory} onClose={() => setViewingHistory(null)} />
      <RemoveAssetDialog asset={removing} onClose={() => setRemoving(null)} onRemoved={refetch} />
    </div>
  );
}

const EMPTY_FORM = {
  name: '', assetTag: '', category: 'Laptop', serialNumber: '', purchaseDate: '', purchaseCost: '',
  vendor: '', warrantyUntil: '', condition: 'new', notes: '',
};

function AssetFormModal({ open, onClose, asset, onSaved }: { open: boolean; onClose: () => void; asset: Asset | null; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState<Record<string, string>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(asset ? {
        name: asset.name, assetTag: asset.assetTag, category: asset.category,
        serialNumber: asset.serialNumber ?? '', purchaseDate: asset.purchaseDate?.slice(0, 10) ?? '',
        purchaseCost: asset.purchaseCost != null ? String(asset.purchaseCost) : '',
        vendor: asset.vendor ?? '', warrantyUntil: asset.warrantyUntil?.slice(0, 10) ?? '',
        condition: asset.condition ?? '', notes: asset.notes ?? '',
      } : { ...EMPTY_FORM });
    }
  }, [open, asset]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Name required', 'The asset needs a name.');
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = { ...form };
    for (const k of ['assetTag', 'serialNumber', 'purchaseDate', 'vendor', 'warrantyUntil', 'condition', 'notes']) {
      if (!payload[k]) delete payload[k];
    }
    payload.purchaseCost = form.purchaseCost === '' ? undefined : Number(form.purchaseCost);
    try {
      if (asset) {
        await assetsService.update(asset.id, payload as Partial<Asset>);
        toast.success('Asset updated', `${form.name} was saved.`);
      } else {
        await assetsService.create(payload as Partial<Asset>);
        toast.success('Asset registered', `${form.name} is now tracked.`);
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
    <Modal open={open} onClose={onClose} title={asset ? 'Edit asset' : 'New asset'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label required>Asset name</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder='e.g. MacBook Pro 14"' />
          </div>
          <div>
            <Label>Asset tag</Label>
            <Input value={form.assetTag} onChange={(e) => set('assetTag', e.target.value)} placeholder="Auto-generated when empty" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={CATEGORY_SUGGESTIONS.includes(form.category) ? form.category : 'Other'} onChange={(e) => set('category', e.target.value)}>
              {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Serial number</Label>
            <Input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} />
          </div>
          <div>
            <Label>Purchase date</Label>
            <Input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
          </div>
          <div>
            <Label>Purchase cost</Label>
            <Input type="number" min={0} step="any" value={form.purchaseCost} onChange={(e) => set('purchaseCost', e.target.value)} />
          </div>
          <div>
            <Label>Vendor</Label>
            <Input value={form.vendor} onChange={(e) => set('vendor', e.target.value)} />
          </div>
          <div>
            <Label>Warranty until</Label>
            <Input type="date" value={form.warrantyUntil} onChange={(e) => set('warrantyUntil', e.target.value)} />
          </div>
          <div>
            <Label>Condition</Label>
            <Select value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
            </Select>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={submit}>{asset ? 'Save changes' : 'Register asset'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function AssignModal({ asset, onClose, onDone }: { asset: Asset | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const { employees } = useEmployeeOptions();
  const [employeeId, setEmployeeId] = useState('');
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (asset) { setEmployeeId(''); setCondition(asset.condition ?? 'good'); setNotes(''); }
  }, [asset]);

  const submit = async () => {
    if (!asset || !employeeId) {
      toast.error('Pick an employee', 'Choose who receives this asset.');
      return;
    }
    setBusy(true);
    try {
      await assetsService.assign(asset.id, { employeeId, condition, notes: notes || undefined });
      toast.success('Asset assigned', `${asset.name} was issued.`);
      onDone();
      onClose();
    } catch (e) {
      toast.error('Could not assign', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!asset} onClose={onClose} title="Assign asset" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Issuing <span className="font-medium text-foreground">{asset?.name}</span> <span className="font-mono text-xs">({asset?.assetTag})</span>
        </p>
        <div>
          <Label required>Employee</Label>
          <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Select employee…</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} · {e.employeeCode}</option>)}
          </Select>
        </div>
        <div>
          <Label>Condition at issue</Label>
          <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </Select>
        </div>
        <div>
          <Label>Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. with charger and case" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={busy} onClick={submit}><UserPlus className="mr-1.5 h-4 w-4" /> Assign</Button>
        </div>
      </div>
    </Modal>
  );
}

function ReturnModal({ asset, onClose, onDone }: { asset: Asset | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [condition, setCondition] = useState('good');
  const [nextStatus, setNextStatus] = useState('available');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (asset) { setCondition(asset.condition ?? 'good'); setNextStatus('available'); setNotes(''); }
  }, [asset]);

  const submit = async () => {
    if (!asset) return;
    setBusy(true);
    try {
      await assetsService.return(asset.id, { condition, nextStatus, notes: notes || undefined });
      toast.success('Asset returned', `${asset.name} is now ${nextStatus.replace('_', ' ')}.`);
      onDone();
      onClose();
    } catch (e) {
      toast.error('Could not return', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!asset} onClose={onClose} title="Return asset" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Taking back <span className="font-medium text-foreground">{asset?.name}</span> from <span className="font-medium text-foreground">{asset?.assignedToName}</span>
        </p>
        <div>
          <Label>Condition at return</Label>
          <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="damaged">Damaged</option>
          </Select>
        </div>
        <div>
          <Label>Where does it go next?</Label>
          <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
            <option value="available">Back to stock (available)</option>
            <option value="in_repair">To repair</option>
            <option value="retired">Retire it</option>
            <option value="lost">Mark as lost</option>
          </Select>
        </div>
        <div>
          <Label>Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={busy} onClick={submit}><Undo2 className="mr-1.5 h-4 w-4" /> Return</Button>
        </div>
      </div>
    </Modal>
  );
}

function HistoryModal({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  const { data, loading } = useQuery(
    () => (asset ? assetsService.history(asset.id) : Promise.resolve(null)),
    [asset?.id],
  );

  return (
    <Modal open={!!asset} onClose={onClose} title="Asset history" size="lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{asset?.name}</h3>
          <p className="font-mono text-xs text-muted-foreground">{asset?.assetTag}{asset?.serialNumber ? ` · SN ${asset.serialNumber}` : ''}</p>
        </div>
        {loading ? (
          <Skeleton className="h-40" />
        ) : (data ?? []).length === 0 ? (
          <p className="rounded-md bg-surface-2/60 p-4 text-center text-sm text-muted-foreground">Never assigned — this asset has been in stock since registration.</p>
        ) : (
          <div className="max-h-80 overflow-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Employee</th>
                  <th className="px-3 py-2 font-medium">Issued</th>
                  <th className="px-3 py-2 font-medium">Returned</th>
                  <th className="px-3 py-2 font-medium">Out / In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data ?? []).map((h) => (
                  <tr key={h.id}>
                    <td className="px-3 py-2">
                      <p className="font-medium text-foreground">{h.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{h.employeeCode}</p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDate(h.assignedAt)}</td>
                    <td className="px-3 py-2">
                      {h.returnedAt ? <span className="text-muted-foreground">{formatDate(h.returnedAt)}</span> : <Badge tone="primary">Holding now</Badge>}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{h.conditionOut ?? '—'} → {h.conditionIn ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <History className="h-3.5 w-3.5" /> Every issue and return is recorded — this trail backs offboarding clearance.
        </div>
      </div>
    </Modal>
  );
}

function RemoveAssetDialog({ asset, onClose, onRemoved }: { asset: Asset | null; onClose: () => void; onRemoved: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmDialog
      open={!!asset}
      onClose={onClose}
      onConfirm={async () => {
        if (!asset) return;
        setBusy(true);
        try {
          await assetsService.remove(asset.id);
          toast.success('Asset removed', `${asset.name} was removed from the registry.`);
          onRemoved();
          onClose();
        } catch (e) {
          toast.error('Could not remove', e instanceof Error ? e.message : 'Please try again.');
        } finally {
          setBusy(false);
        }
      }}
      title="Remove asset?"
      message={asset ? `${asset.name} (${asset.assetTag}) will be removed from the registry. Its assignment history is kept.` : ''}
      confirmLabel="Remove"
      danger
      loading={busy}
    />
  );
}
