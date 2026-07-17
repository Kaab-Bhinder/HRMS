import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Lock, Search, Filter,
  Asterisk, Fingerprint, EyeOff, Database, X, GripVertical, ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { Input, Textarea, Select, Label } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Tooltip } from '../../components/ui/Misc';
import { Skeleton, EmptyState, ErrorState } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { customFieldsService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import type { CustomFieldDefinition, CustomFieldType, CustomFieldEntity, CustomFieldOption } from '../../lib/types';

const ENTITY_TABS: { value: CustomFieldEntity; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'department', label: 'Department' },
  { value: 'task', label: 'Task' },
  { value: 'asset', label: 'Asset' },
  { value: 'document', label: 'Document' },
];

const DATA_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text area' },
  { value: 'number', label: 'Number' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'boolean', label: 'Boolean (toggle)' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & time' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'select', label: 'Select (single)' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'file', label: 'File' },
  { value: 'json', label: 'JSON' },
];

const TYPE_TONE: Partial<Record<CustomFieldType, 'primary' | 'success' | 'warning' | 'info' | 'accent' | 'neutral'>> = {
  text: 'neutral', textarea: 'neutral', number: 'info', decimal: 'info', boolean: 'success',
  date: 'accent', datetime: 'accent', email: 'primary', phone: 'primary', url: 'primary',
  select: 'warning', multiselect: 'warning', file: 'neutral', json: 'info',
};

const NUMERIC_TYPES: CustomFieldType[] = ['number', 'decimal'];
const LENGTH_TYPES: CustomFieldType[] = ['text', 'textarea', 'email', 'phone', 'url'];

function slugify(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

type FieldForm = {
  label: string;
  fieldKey: string;
  dataType: CustomFieldType;
  helpText: string;
  placeholder: string;
  isRequired: boolean;
  isUnique: boolean;
  isVisible: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isEncrypted: boolean;
  options: CustomFieldOption[];
  minLength: string;
  maxLength: string;
  minValue: string;
  maxValue: string;
};

const EMPTY_FORM: FieldForm = {
  label: '', fieldKey: '', dataType: 'text', helpText: '', placeholder: '',
  isRequired: false, isUnique: false, isVisible: true, isSearchable: false,
  isFilterable: false, isEncrypted: false, options: [], minLength: '', maxLength: '',
  minValue: '', maxValue: '',
};

export default function CustomFieldsPage() {
  const toast = useToast();
  const canCreate = usePermission('custom_fields:create');
  const canUpdate = usePermission('custom_fields:update');
  const canDelete = usePermission('custom_fields:delete');

  const [entity, setEntity] = useState<CustomFieldEntity>('employee');
  const { data, loading, error, refetch } = useQuery(() => customFieldsService.list(entity), [entity]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomFieldDefinition | null>(null);
  const [toDelete, setToDelete] = useState<CustomFieldDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [data],
  );

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (def: CustomFieldDefinition) => { setEditing(def); setFormOpen(true); };

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = rows[index + dir];
    const current = rows[index];
    if (!target || !current) return;
    setReordering(current.id);
    try {
      await Promise.all([
        customFieldsService.update(current.id, { displayOrder: target.displayOrder }),
        customFieldsService.update(target.id, { displayOrder: current.displayOrder }),
      ]);
      toast.success('Order updated', `“${current.label}” moved ${dir < 0 ? 'up' : 'down'}.`);
      await refetch();
    } catch {
      toast.error('Could not reorder', 'Please try again.');
    } finally {
      setReordering(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await customFieldsService.remove(toDelete.id);
      toast.success('Field deleted', `“${toDelete.label}” was removed from ${entity} records.`);
      setToDelete(null);
      await refetch();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Custom Fields"
        description="Add fields to any module without code or migrations."
        actions={canCreate ? <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Field</Button> : undefined}
      />

      <Tabs
        tabs={ENTITY_TABS.map((t) => ({
          value: t.value,
          label: t.label,
          count: data && entity === t.value ? data.length : undefined,
        }))}
        value={entity}
        onChange={(v) => setEntity(v as CustomFieldEntity)}
      />

      <Card>
        <CardHeader
          title={`${ENTITY_TABS.find((t) => t.value === entity)?.label} fields`}
          description="Fields render on forms and detail views in the order shown below."
          action={canCreate ? <Button variant="outline" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add Field</Button> : undefined}
        />
        <CardBody className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : error ? (
            <div className="p-6"><ErrorState message="We couldn’t load custom fields for this module." onRetry={refetch} /></div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Database className="h-6 w-6" />}
                title="No custom fields yet"
                description={`Capture data unique to your bank on ${entity} records — no schema change required.`}
                action={canCreate ? <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add your first field</Button> : undefined}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((def, i) => (
                <li key={def.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
                  <div className="flex flex-col">
                    <button
                      className="text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                      disabled={i === 0 || !canUpdate || reordering === def.id}
                      onClick={() => reorder(i, -1)}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                      disabled={i === rows.length - 1 || !canUpdate || reordering === def.id}
                      onClick={() => reorder(i, 1)}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 sm:block" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-foreground">{def.label}</span>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{def.fieldKey}</code>
                      {def.isSystem && <Badge tone="neutral">System</Badge>}
                    </div>
                    {def.helpText && <p className="mt-0.5 truncate text-xs text-muted-foreground">{def.helpText}</p>}
                  </div>

                  <div className="hidden shrink-0 items-center gap-1.5 md:flex">
                    <Badge tone={TYPE_TONE[def.dataType] ?? 'neutral'}>{def.dataType}</Badge>
                  </div>

                  <div className="hidden shrink-0 flex-wrap items-center justify-end gap-1 lg:flex" style={{ maxWidth: 240 }}>
                    <FlagBadge on={def.isRequired} tone="danger" icon={<Asterisk className="h-3 w-3" />} label="Required" />
                    <FlagBadge on={def.isUnique} tone="warning" icon={<Fingerprint className="h-3 w-3" />} label="Unique" />
                    <FlagBadge on={def.isSearchable} tone="info" icon={<Search className="h-3 w-3" />} label="Searchable" />
                    <FlagBadge on={def.isFilterable} tone="primary" icon={<Filter className="h-3 w-3" />} label="Filterable" />
                    <FlagBadge on={def.isEncrypted} tone="accent" icon={<Lock className="h-3 w-3" />} label="Encrypted" />
                    <FlagBadge on={!def.isVisible} tone="neutral" icon={<EyeOff className="h-3 w-3" />} label="Hidden" />
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {canUpdate && (
                      <Tooltip content="Edit field">
                        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(def)}><Pencil className="h-4 w-4" /></Button>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip content={def.isSystem ? 'System fields can’t be deleted' : 'Delete field'}>
                        <span>
                          <Button variant="ghost" size="icon" aria-label="Delete" disabled={def.isSystem} onClick={() => setToDelete(def)}>
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card className="border-info/30 bg-info/5">
        <CardBody className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">How custom fields are stored</p>
            <p className="text-muted-foreground">
              Every value lives in a single JSONB column on the record — so new fields never require a migration or
              downtime. The <span className="font-medium text-foreground">Searchable</span> flag includes the field in
              global search indexing, while <span className="font-medium text-foreground">Filterable</span> exposes it as
              a filter on list screens. <span className="font-medium text-foreground">Encrypted</span> fields (e.g. CNIC,
              account numbers) are encrypted at rest and masked in exports.
            </p>
          </div>
        </CardBody>
      </Card>

      <FieldFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        entity={entity}
        editing={editing}
        existingKeys={rows.map((r) => r.fieldKey)}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title="Delete custom field?"
        message={`This permanently removes “${toDelete?.label}” and its stored values from all ${entity} records. This cannot be undone.`}
        confirmLabel="Delete field"
      />
    </div>
  );
}

function FlagBadge({ on, tone, icon, label }: { on: boolean; tone: 'danger' | 'warning' | 'info' | 'primary' | 'accent' | 'neutral'; icon: React.ReactNode; label: string }) {
  if (!on) return null;
  return (
    <Tooltip content={label}>
      <span className="inline-flex">
        <Badge tone={tone}>{icon}</Badge>
      </span>
    </Tooltip>
  );
}

function FieldFormModal({
  open, onClose, entity, editing, existingKeys, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  entity: CustomFieldEntity;
  editing: CustomFieldDefinition | null;
  existingKeys: string[];
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!editing;
  const [form, setForm] = useState<FieldForm>(EMPTY_FORM);
  const [keyTouched, setKeyTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        label: editing.label,
        fieldKey: editing.fieldKey,
        dataType: editing.dataType,
        helpText: editing.helpText ?? '',
        placeholder: editing.placeholder ?? '',
        isRequired: editing.isRequired,
        isUnique: editing.isUnique,
        isVisible: editing.isVisible,
        isSearchable: editing.isSearchable,
        isFilterable: editing.isFilterable,
        isEncrypted: editing.isEncrypted,
        options: editing.options ? editing.options.map((o) => ({ ...o })) : [],
        minLength: editing.minLength?.toString() ?? '',
        maxLength: editing.maxLength?.toString() ?? '',
        minValue: editing.minValue?.toString() ?? '',
        maxValue: editing.maxValue?.toString() ?? '',
      });
      setKeyTouched(true);
    } else {
      setForm(EMPTY_FORM);
      setKeyTouched(false);
    }
    setErrors({});
  }, [open, editing]);

  const set = <K extends keyof FieldForm>(k: K, v: FieldForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onLabelChange = (v: string) => {
    setForm((f) => ({ ...f, label: v, fieldKey: !isEdit && !keyTouched ? slugify(v) : f.fieldKey }));
  };

  const hasOptions = form.dataType === 'select' || form.dataType === 'multiselect';
  const isNumeric = NUMERIC_TYPES.includes(form.dataType);
  const isLength = LENGTH_TYPES.includes(form.dataType);

  const addOption = () => set('options', [...form.options, { value: '', label: '' }]);
  const updateOption = (i: number, patch: Partial<CustomFieldOption>) =>
    set('options', form.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const removeOption = (i: number) => set('options', form.options.filter((_, idx) => idx !== i));

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.label.trim()) errs.label = 'Label is required';
    const key = slugify(form.fieldKey);
    if (!key) errs.fieldKey = 'Field key is required';
    else if (!isEdit && existingKeys.includes(key)) errs.fieldKey = 'A field with this key already exists';
    if (hasOptions && form.options.filter((o) => o.value.trim() && o.label.trim()).length === 0) {
      errs.options = 'Add at least one option';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
    const payload: Partial<CustomFieldDefinition> = {
      entity,
      label: form.label.trim(),
      fieldKey: key,
      dataType: form.dataType,
      helpText: form.helpText.trim() || undefined,
      placeholder: form.placeholder.trim() || undefined,
      isRequired: form.isRequired,
      isUnique: form.isUnique,
      isVisible: form.isVisible,
      isSearchable: form.isSearchable,
      isFilterable: form.isFilterable,
      isEncrypted: form.isEncrypted,
      options: hasOptions ? form.options.filter((o) => o.value.trim() && o.label.trim()) : undefined,
      minLength: isLength ? num(form.minLength) : undefined,
      maxLength: isLength ? num(form.maxLength) : undefined,
      minValue: isNumeric ? num(form.minValue) : undefined,
      maxValue: isNumeric ? num(form.maxValue) : undefined,
    };

    setSaving(true);
    try {
      if (isEdit) await customFieldsService.update(editing!.id, payload);
      else await customFieldsService.create(payload);
      toast.success(isEdit ? 'Field updated' : 'Field created', `“${payload.label}” is now available on ${entity} forms.`);
      onSaved();
      onClose();
    } catch {
      toast.error('Save failed', 'Please review the field and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit custom field' : 'New custom field'}
      description={isEdit ? `Editing “${editing?.label}” on ${entity} records.` : `Define a new field captured on every ${entity} record.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>{isEdit ? 'Save changes' : 'Create field'}</Button>
        </>
      }
    >
      <div className="space-y-6">
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basics</h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormField label="Label" required error={errors.label}>
              <Input value={form.label} onChange={(e) => onLabelChange(e.target.value)} placeholder="e.g. CNIC Number" invalid={!!errors.label} />
            </FormField>
            <FormField label="Field key" required error={errors.fieldKey} hint="Stable identifier used in the JSONB store and API.">
              <Input
                value={form.fieldKey}
                onChange={(e) => { setKeyTouched(true); set('fieldKey', e.target.value); }}
                onBlur={(e) => set('fieldKey', slugify(e.target.value))}
                placeholder="cnic_number"
                className="font-mono"
                disabled={isEdit && editing?.isSystem}
                invalid={!!errors.fieldKey}
              />
            </FormField>
            <FormField label="Data type" required>
              <Select value={form.dataType} onChange={(e) => set('dataType', e.target.value as CustomFieldType)} disabled={isEdit && editing?.isSystem}>
                {DATA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Placeholder">
              <Input value={form.placeholder} onChange={(e) => set('placeholder', e.target.value)} placeholder="Shown inside the empty input" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Help text" hint="Guidance shown beneath the field on forms.">
                <Textarea value={form.helpText} onChange={(e) => set('helpText', e.target.value)} rows={2} placeholder="e.g. Enter the 13-digit CNIC without dashes." />
              </FormField>
            </div>
          </div>
        </section>

        {hasOptions && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Options</h4>
              <Button variant="outline" size="sm" onClick={addOption}><Plus className="h-3.5 w-3.5" /> Add option</Button>
            </div>
            {errors.options && <p className="mb-2 text-xs text-danger">{errors.options}</p>}
            {form.options.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                No options yet. Add the choices employees can pick from.
              </p>
            ) : (
              <div className="space-y-2">
                {form.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={o.label} onChange={(e) => updateOption(i, { label: e.target.value })} placeholder="Label (e.g. Head Office)" />
                    <Input value={o.value} onChange={(e) => updateOption(i, { value: e.target.value })} placeholder="value (e.g. head_office)" className="font-mono" />
                    <Button variant="ghost" size="icon" aria-label="Remove option" onClick={() => removeOption(i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {(isLength || isNumeric) && (
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {isNumeric ? 'Value range' : 'Length limits'}
            </h4>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {isNumeric ? (
                <>
                  <FormField label="Minimum value"><Input type="number" value={form.minValue} onChange={(e) => set('minValue', e.target.value)} /></FormField>
                  <FormField label="Maximum value"><Input type="number" value={form.maxValue} onChange={(e) => set('maxValue', e.target.value)} /></FormField>
                </>
              ) : (
                <>
                  <FormField label="Minimum length"><Input type="number" min={0} value={form.minLength} onChange={(e) => set('minLength', e.target.value)} /></FormField>
                  <FormField label="Maximum length"><Input type="number" min={0} value={form.maxLength} onChange={(e) => set('maxLength', e.target.value)} /></FormField>
                </>
              )}
            </div>
          </section>
        )}

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Behaviour</h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <SwitchRow label="Required" hint="Must be filled before saving." checked={form.isRequired} onChange={(v) => set('isRequired', v)} />
            <SwitchRow label="Unique" hint="No two records may share the same value." checked={form.isUnique} onChange={(v) => set('isUnique', v)} />
            <SwitchRow label="Visible" hint="Show on forms and detail views." checked={form.isVisible} onChange={(v) => set('isVisible', v)} />
            <SwitchRow label="Searchable" hint="Include in global search indexing." checked={form.isSearchable} onChange={(v) => set('isSearchable', v)} />
            <SwitchRow label="Filterable" hint="Expose as a filter on list screens." checked={form.isFilterable} onChange={(v) => set('isFilterable', v)} />
            <SwitchRow label="Encrypted" hint="Encrypt at rest and mask in exports." checked={form.isEncrypted} onChange={(v) => set('isEncrypted', v)} />
          </div>
        </section>
      </div>
    </Modal>
  );
}

function FormField({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SwitchRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/40 px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
