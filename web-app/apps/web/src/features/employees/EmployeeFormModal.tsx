import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Monitor, Smartphone } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label } from '../../components/ui/Input';
import { DynamicCustomField, validateCustomFields } from '../../components/forms/DynamicCustomField';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { customFieldsService, departmentsService, designationsService, employeesService, rolesService } from '../../services';
import { useToast } from '../../store/toast';
import type { Employee, Role } from '../../lib/types';

const EMPTY = {
  firstName: '', lastName: '', workEmail: '', phone: '', gender: 'male',
  departmentId: '', designationId: '', employmentType: 'full_time', status: 'probation',
  dateOfJoining: new Date().toISOString().slice(0, 10), payPerHour: '',
};

interface CreatedAccount { name: string; email: string; role: string; password: string | null; }

export function EmployeeFormModal({ open, onClose, employee, onSaved }: { open: boolean; onClose: () => void; employee?: Employee | null; onSaved: () => void }) {
  const toast = useToast();
  const isEdit = !!employee;
  const { data: cfDefs } = useQuery(() => customFieldsService.list('employee'), []);
  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  const { data: desigs } = useQuery(() => designationsService.list(), []);
  const { data: roles } = useQuery(() => rolesService.list(), []);

  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [custom, setCustom] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // Account section (create only)
  const [accountRoleId, setAccountRoleId] = useState('');
  const [passwordStrategy, setPasswordStrategy] = useState<'generate' | 'invite'>('generate');
  const [created, setCreated] = useState<CreatedAccount | null>(null);

  const defaultRoleId = useMemo(() => roles?.find((r) => r.slug === 'employee')?.id ?? roles?.[0]?.id ?? '', [roles]);
  const selectedRole = useMemo(() => roles?.find((r) => r.id === (accountRoleId || defaultRoleId)), [roles, accountRoleId, defaultRoleId]);

  useEffect(() => {
    if (open) {
      setForm(employee ? {
        firstName: employee.firstName, lastName: employee.lastName, workEmail: employee.workEmail,
        phone: employee.phone, gender: employee.gender ?? 'male', departmentId: employee.departmentId,
        designationId: employee.designationId, employmentType: employee.employmentType, status: employee.status,
        dateOfJoining: employee.dateOfJoining.slice(0, 10), payPerHour: employee.payPerHour != null ? String(employee.payPerHour) : '',
      } : { ...EMPTY, departmentId: depts?.[0]?.id ?? '', designationId: desigs?.[0]?.id ?? '' });
      setCustom(employee ? { ...employee.customFields } : {});
      setErrors({});
      setAccountRoleId('');
      setPasswordStrategy('generate');
      setCreated(null);
    }
  }, [open, employee, depts, desigs]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setCf = (k: string, v: unknown) => setCustom((c) => ({ ...c, [k]: v }));

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.workEmail)) errs.workEmail = 'Valid work email required';
    // On edit, don't force required custom fields that were never filled — you
    // shouldn't have to complete an unrelated field just to save a change.
    const cfErrs = isEdit ? {} : validateCustomFields(cfDefs ?? [], custom);
    const all = { ...errs, ...cfErrs };
    setErrors(all);
    if (Object.keys(all).length) return;

    setSaving(true);
    const dept = depts?.find((d) => d.id === form.departmentId);
    const desig = desigs?.find((d) => d.id === form.designationId);
    const payload: Record<string, unknown> = {
      ...form,
      gender: form.gender as Employee['gender'],
      employmentType: form.employmentType as Employee['employmentType'],
      status: form.status as Employee['status'],
      departmentName: dept?.name ?? '',
      designationName: desig?.title ?? '',
      customFields: custom,
    };
    // Optional UUID selectors: omit when empty so the backend treats them as
    // "not provided" (an empty string fails @IsUUID validation).
    for (const k of ['departmentId', 'designationId', 'managerId', 'locationId']) {
      if (!payload[k]) delete payload[k];
    }
    // Pay per hour: numeric, or omit when blank.
    if (form.payPerHour === '' || form.payPerHour == null) delete payload.payPerHour;
    else payload.payPerHour = Number(form.payPerHour);
    try {
      if (isEdit) {
        await employeesService.update(employee!.id, payload as Partial<Employee>);
        toast.success('Employee updated', `${form.firstName} ${form.lastName} was saved.`);
        onSaved();
        onClose();
      } else {
        const res = await employeesService.create({
          ...payload,
          createAccount: true,
          accountRoleId: accountRoleId || defaultRoleId || undefined,
          accountPasswordStrategy: passwordStrategy,
        });
        onSaved();
        // Reveal the one-time password (if generated) so HR can hand it over.
        setCreated({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: res.accountEmail ?? form.workEmail,
          role: res.accountRoles?.[0] ?? selectedRole?.name ?? 'Employee',
          password: res.generatedPassword ?? null,
        });
      }
    } catch (e) {
      toast.error(isEdit ? 'Could not update employee' : 'Could not create employee', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // After a successful create, show the account summary / one-time password.
  if (!isEdit && created) {
    return (
      <Modal
        open={open}
        onClose={() => { setCreated(null); onClose(); }}
        size="lg"
        title="Employee created"
        description={`${created.name}’s HR record and login account are ready.`}
        footer={<Button onClick={() => { setCreated(null); onClose(); }}>Done</Button>}
      >
        <AccountCreated info={created} />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      description={isEdit ? `Editing ${employee?.fullName}` : 'Create a new employee record and login account.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>{isEdit ? 'Save changes' : 'Create employee'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic Information</h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="First name" required error={errors.firstName}><Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} invalid={!!errors.firstName} /></Field>
            <Field label="Last name" required error={errors.lastName}><Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} invalid={!!errors.lastName} /></Field>
            <Field label="Work email" required error={errors.workEmail}><Input type="email" value={form.workEmail} onChange={(e) => set('workEmail', e.target.value)} invalid={!!errors.workEmail} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+92 3xx-xxxxxxx" /></Field>
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Date of joining"><Input type="date" value={form.dateOfJoining} onChange={(e) => set('dateOfJoining', e.target.value)} /></Field>
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employment</h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Department">
              <Select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
                {(depts ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Designation">
              <Select value={form.designationId} onChange={(e) => set('designationId', e.target.value)}>
                <option value="">— None —</option>
                {(desigs ?? []).map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </Select>
            </Field>
            <Field label="Employment type">
              <Select value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
                <option value="full_time">Full-time</option><option value="part_time">Part-time</option>
                <option value="contract">Contract</option><option value="intern">Intern</option><option value="consultant">Consultant</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="probation">Probation</option><option value="active">Active</option>
                <option value="on_leave">On Leave</option><option value="suspended">Suspended</option>
              </Select>
            </Field>
            <Field label="Pay per hour">
              <Input type="number" min={0} step="any" value={form.payPerHour} onChange={(e) => set('payPerHour', e.target.value)} placeholder="e.g. 500 — for payroll" />
            </Field>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custom Fields</h4>
            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">admin-defined</span>
          </div>
          {!cfDefs ? (
            <Skeleton className="h-24 w-full" />
          ) : cfDefs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom fields defined. Add them under Custom Fields.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {cfDefs.map((def) => (
                <DynamicCustomField key={def.id} def={def} value={custom[def.fieldKey]} onChange={setCf} error={errors[def.fieldKey]} />
              ))}
            </div>
          )}
        </section>

        {/* Account — a linked login is provisioned with the employee (create only) */}
        {!isEdit && (
          <section className="rounded-lg border border-border bg-surface-2/30 p-3.5">
            <div className="mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h4>
              <p className="mt-1 text-xs text-muted-foreground">A login account is created automatically. The employee signs in with their work email.</p>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Login email">
                <Input value={form.workEmail} disabled placeholder="Fills from work email above" />
              </Field>
              <Field label="Role">
                <Select value={accountRoleId || defaultRoleId} onChange={(e) => setAccountRoleId(e.target.value)}>
                  {(roles ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
            </div>
            {selectedRole && <PlatformHint role={selectedRole} />}
            <div className="mt-3">
              <Label>Initial password</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <StrategyOption
                  active={passwordStrategy === 'generate'}
                  onClick={() => setPasswordStrategy('generate')}
                  title="Generate automatically"
                  desc="Creates a one-time password to share with the employee."
                />
                <StrategyOption
                  active={passwordStrategy === 'invite'}
                  onClick={() => setPasswordStrategy('invite')}
                  title="Send invitation"
                  desc="Account starts as invited; the employee sets their own password."
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}

function PlatformHint({ role }: { role: Role }) {
  return (
    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
      <span>Can sign in to:</span>
      {role.canAccessWeb && <span className="inline-flex items-center gap-1"><Monitor className="h-3.5 w-3.5" /> Web</span>}
      {role.canAccessMobile && <span className="inline-flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Mobile</span>}
      {!role.canAccessWeb && !role.canAccessMobile && <span className="text-warning">No app access — pick another role</span>}
    </div>
  );
}

function StrategyOption({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2.5 text-left transition-colors focus-ring ${active ? 'border-primary bg-primary/5 ring-1 ring-primary/40' : 'border-border hover:bg-surface-2/60'}`}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function AccountCreated({ info }: { info: CreatedAccount }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!info.password) return;
    try { await navigator.clipboard.writeText(info.password); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface-2/30 p-3.5 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-muted-foreground">Login email</dt><dd className="font-medium text-foreground">{info.email}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Role</dt><dd className="font-medium text-foreground">{info.role}</dd></div>
      </dl>
      {info.password ? (
        <div>
          <Label>One-time password</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground">{info.password}</code>
            <Button variant="outline" size="sm" onClick={copy}>{copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}</Button>
          </div>
          <p className="mt-2 text-xs text-warning">Copy this now — it won’t be shown again. Share it securely; the employee should change it on first login.</p>
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-2/30 px-3.5 py-2.5 text-sm text-muted-foreground">
          The account was created as <span className="font-medium text-foreground">invited</span>. The employee will set their own password
          (email delivery is wired up when the email provider is connected — until then, use “Reset password” on the Users page to set one).
        </p>
      )}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
