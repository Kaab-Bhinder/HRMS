import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BriefcaseBusiness, Users } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/charts/StatCard';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Input, Textarea, Label } from '../../components/ui/Input';
import { Skeleton, EmptyState, ErrorState } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { designationsService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import type { Designation } from '../../lib/types';

export default function DesignationsPage() {
  const canCreate = usePermission('designations:create');
  const canUpdate = usePermission('designations:update');
  const canDelete = usePermission('designations:delete');

  const { data, loading, error, refetch } = useQuery(() => designationsService.list(), []);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Designation | null>(null);
  const [toDelete, setToDelete] = useState<Designation | null>(null);
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await designationsService.remove(toDelete.id);
      toast.success('Designation removed', `${toDelete.title} was deleted.`);
      setToDelete(null);
      refetch();
    } catch (e) {
      toast.error('Could not delete', (e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Designations"
        description="Define the job titles employees can hold, e.g. Senior Engineer or Branch Manager."
        actions={canCreate ? <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Designation</Button> : undefined}
      />

      {/* Derived from the already-loaded list — no extra requests. */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard loading={loading} label="Job Titles" value={data?.length ?? 0} icon={<BriefcaseBusiness />} accent="accent" />
        <StatCard loading={loading} label="Employees Assigned" value={(data ?? []).reduce((s, d) => s + (d.employeeCount ?? 0), 0)} icon={<Users />} accent="success" />
        <StatCard loading={loading} label="Unused Titles" value={(data ?? []).filter((d) => !d.employeeCount).length} icon={<BriefcaseBusiness />} accent="warning" hint="No employees hold these" />
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}
      {!loading && error && <Card><CardBody><ErrorState message={error} onRetry={refetch} /></CardBody></Card>}
      {!loading && !error && data && data.length === 0 && (
        <Card>
          <CardBody>
            <EmptyState
              icon={<BriefcaseBusiness className="h-6 w-6" />}
              title="No designations yet"
              description="Create your first job title so it appears when adding employees."
              action={canCreate ? <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Designation</Button> : undefined}
            />
          </CardBody>
        </Card>
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((d) => (
            <Card key={d.id} className="group">
              <CardBody className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{d.title}</p>
                    {d.level != null && <Badge tone="neutral">L{d.level}</Badge>}
                  </div>
                  {d.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{d.description}</p>}
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> {d.employeeCount} {d.employeeCount === 1 ? 'employee' : 'employees'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {canUpdate && (
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => { setSelected(d); setFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setToDelete(d)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <DesignationFormModal open={formOpen} onClose={() => setFormOpen(false)} designation={selected} onSaved={refetch} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Delete designation?"
        message={`This removes “${toDelete?.title}”. Employees currently assigned to it will keep their record but lose this title.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function DesignationFormModal({ open, onClose, designation, onSaved }: { open: boolean; onClose: () => void; designation?: Designation | null; onSaved: () => void }) {
  const toast = useToast();
  const isEdit = !!designation;
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(designation?.title ?? '');
      setLevel(designation?.level != null ? String(designation.level) : '');
      setDescription(designation?.description ?? '');
      setError('');
    }
  }, [open, designation]);

  const submit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      const payload: Partial<Designation> = {
        title: title.trim(),
        level: level.trim() ? Number(level) : null,
        description: description.trim() || null,
      };
      if (isEdit) await designationsService.update(designation!.id, payload);
      else await designationsService.create(payload);
      toast.success(isEdit ? 'Designation updated' : 'Designation added', `${title.trim()} was saved.`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error(isEdit ? 'Could not update' : 'Could not create', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isEdit ? 'Edit Designation' : 'Add Designation'}
      description={isEdit ? `Editing ${designation?.title}` : 'Create a job title employees can be assigned.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>{isEdit ? 'Save changes' : 'Create designation'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label required>Title</Label>
          <Input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} invalid={!!error} placeholder="e.g. Senior Software Engineer" />
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
        <div>
          <Label>Level <span className="font-normal text-muted-foreground">(optional — higher = more senior)</span></Label>
          <Input type="number" min={1} value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. 3" />
        </div>
        <div>
          <Label>Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary of this role’s scope" rows={3} />
        </div>
      </div>
    </Modal>
  );
}
