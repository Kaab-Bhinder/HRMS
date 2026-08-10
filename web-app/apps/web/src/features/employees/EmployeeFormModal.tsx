import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Check, Monitor, Smartphone, Lock, Pencil } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label } from '../../components/ui/Input';
import { DynamicCustomField, validateCustomFields } from '../../components/forms/DynamicCustomField';
import { EmployeePhoto } from '../../components/forms/EmployeePhoto';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { workEmailService, clientsService, customFieldsService, departmentsService, designationsService, employeesService, locationsService, organizationService, rolesService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import type { Employee, Role } from '../../lib/types';

const EMPTY = {
  firstName: '', lastName: '', workEmail: '', personalEmail: '', phone: '', gender: 'male', photoFileId: '',
  departmentId: '', designationId: '', locationId: '', employmentType: 'full_time', status: 'probation',
  dateOfJoining: new Date().toISOString().slice(0, 10),
  compensationType: 'hourly', basicSalary: '', payPerHour: '',
};

interface CreatedAccount { name: string; email: string; role: string; password: string | null; }

export function EmployeeFormModal({ open, onClose, employee, onSaved }: { open: boolean; onClose: () => void; employee?: Employee | null; onSaved: () => void }) {
  const toast = useToast();
  const isEdit = !!employee;
  const { data: cfDefs } = useQuery(() => customFieldsService.list('employee'), []);
  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  const { data: desigs } = useQuery(() => designationsService.list(), []);
  const { data: roles } = useQuery(() => rolesService.list(), []);
  const { data: org } = useQuery(() => organizationService.current(), []);
  const { data: sites } = useQuery(() => locationsService.list(), []);
  const canSeeClients = usePermission('clients:read');
  const { data: clients } = useQuery(() => (canSeeClients ? clientsService.list() : Promise.resolve(null)), [canSeeClients]);
  // Pay fields ride on payroll:read — without it the API masks them anyway, so
  // showing the inputs would render blanks and saving would try to write pay.
  const canSeePay = usePermission('payroll:read');

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
        phone: employee.phone, personalEmail: employee.personalEmail ?? '',
        gender: employee.gender ?? 'male', photoFileId: employee.photoFileId ?? '',
        departmentId: employee.departmentId,
        designationId: employee.designationId, locationId: employee.locationId ?? '',
        employmentType: employee.employmentType, status: employee.status,
        dateOfJoining: employee.dateOfJoining.slice(0, 10),
        compensationType: employee.compensationType ?? 'hourly',
        basicSalary: employee.basicSalary != null ? String(employee.basicSalary) : '',
        payPerHour: employee.payPerHour != null ? String(employee.payPerHour) : '',
      } : { ...EMPTY, compensationType: org?.defaultCompensationType ?? 'hourly', departmentId: depts?.[0]?.id ?? '', designationId: desigs?.[0]?.id ?? '' });
      setCustom(employee ? { ...employee.customFields } : {});
      setErrors({});
      setEmailTouched(false);
      setEmailLocked(!employee);
      setEmailTaken(false);
      setAccountRoleId('');
      setPasswordStrategy('generate');
      setCreated(null);
    }
    // Deliberately NOT keyed on depts/desigs/org: those queries resolving
    // after the modal opens must not re-run this reset and wipe half-typed
    // input. The effects below backfill their defaults non-destructively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee]);

  // Late-arriving defaults for a NEW employee: fill only fields the user
  // hasn't touched (still at their empty/seed value) — never overwrite input.
  useEffect(() => {
    if (!open || employee) return;
    setForm((f) => ({
      ...f,
      departmentId: f.departmentId || (depts?.[0]?.id ?? ''),
      designationId: f.designationId || (desigs?.[0]?.id ?? ''),
      compensationType: f.compensationType === EMPTY.compensationType && org?.defaultCompensationType ? org.defaultCompensationType : f.compensationType,
    }));
  }, [open, employee, depts, desigs, org]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // --- work e-mail: proposed from the name, then checked for collisions ------
  // Only ever auto-fills on CREATE, and only while the field is untouched —
  // silently rewriting an address someone typed would be worse than useless.
  const [emailTouched, setEmailTouched] = useState(false);
  /** Locked on create so nothing — browser autofill included — can overwrite
   *  the generated address by accident. Unlocked when editing an existing
   *  employee, whose address is already deliberate. */
  const [emailLocked, setEmailLocked] = useState(true);
  const [emailTaken, setEmailTaken] = useState(false);
  const debouncedName = useDebouncedValue(`${form.firstName}|${form.lastName}`, 400);

  useEffect(() => {
    // Only while the field is still locked (i.e. system-owned) and untouched.
    if (isEdit || emailTouched || !emailLocked) return;
    const [first, last] = debouncedName.split('|');
    if (!first?.trim() || !last?.trim()) return;
    let alive = true;
    workEmailService.suggest(first, last)
      .then((r) => { if (alive && r.email) setForm((f) => ({ ...f, workEmail: r.email! })); })
      .catch(() => {});
    return () => { alive = false; };
  }, [debouncedName, isEdit, emailTouched, emailLocked]);

  // Live collision check, so a duplicate is caught before saving rather than
  // as a 409 from the server.
  const debouncedEmail = useDebouncedValue(form.workEmail, 400);
  useEffect(() => {
    const value = debouncedEmail.trim();
    if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) { setEmailTaken(false); return; }
    let alive = true;
    workEmailService.check(value, employee?.id)
      .then((r) => { if (alive) setEmailTaken(!r.available); })
      .catch(() => {});
    return () => { alive = false; };
  }, [debouncedEmail, employee?.id]);

  // Serving-client awareness: when the chosen department is dedicated to a
  // client, surface it and preselect the client's site as the work site (the
  // backend would inherit it anyway — the form makes that visible/editable).
  const servingClient = useMemo(
    () => (clients ?? []).find((c) => c.departmentId && c.departmentId === form.departmentId) ?? null,
    [clients, form.departmentId],
  );
  const clientSite = useMemo(
    () => (servingClient ? (sites ?? []).find((s) => s.clientId === servingClient.id && s.isActive !== false) ?? null : null),
    [servingClient, sites],
  );
  const prevDeptRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      prevDeptRef.current = null;
      return;
    }
    const deptChanged = prevDeptRef.current !== null && prevDeptRef.current !== form.departmentId;
    prevDeptRef.current = form.departmentId;
    if (!clientSite) return;
    // Preselect on a dept switch, or when no site was chosen yet — never
    // overwrite a site the admin picked deliberately for this employee.
    if (deptChanged || !form.locationId) {
      setForm((f) => (f.locationId === clientSite.id ? f : { ...f, locationId: clientSite.id }));
    }
  }, [open, form.departmentId, clientSite]);
  const setCf = (k: string, v: unknown) => setCustom((c) => ({ ...c, [k]: v }));

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.workEmail)) errs.workEmail = 'Valid work email required';
    else if (emailTaken) errs.workEmail = 'That address is already in use.';
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
    // Except on edit: clearing the work site must persist as null, not vanish.
    if (isEdit && !form.locationId) payload.locationId = null;
    // Photo: an id, or null to remove it (omitting would mean "unchanged").
    payload.photoFileId = form.photoFileId || (isEdit ? null : undefined);
    if (payload.photoFileId === undefined) delete payload.photoFileId;
    // Compensation: send only the field that matches the chosen type, and null
    // out the other so switching type doesn't leave a stale amount behind.
    // Without payroll:read the fields never loaded (masked by the API), so
    // sending them would wipe real values — drop them from the payload instead.
    if (canSeePay) {
      const monthly = form.compensationType === 'monthly';
      payload.compensationType = form.compensationType;
      payload.basicSalary = monthly && form.basicSalary !== '' ? Number(form.basicSalary) : null;
      payload.payPerHour = !monthly && form.payPerHour !== '' ? Number(form.payPerHour) : null;
    } else {
      delete payload.compensationType;
      delete payload.basicSalary;
      delete payload.payPerHour;
    }
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
            <div className="sm:col-span-2">
              <EmployeePhoto
                fileId={form.photoFileId || null}
                name={`${form.firstName} ${form.lastName}`.trim()}
                onChange={(id) => set('photoFileId', id ?? '')}
              />
            </div>
            <Field label="First name" required error={errors.firstName}><Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} invalid={!!errors.firstName} /></Field>
            <Field label="Last name" required error={errors.lastName}><Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} invalid={!!errors.lastName} /></Field>
            <Field
              label="Work email"
              required
              error={errors.workEmail || (emailTaken ? 'That address is already in use.' : undefined)}
              hint={
                emailLocked
                  ? 'Generated from the name. Unlock to set it yourself.'
                  : 'Must be unique across the organisation.'
              }
            >
              <div className="flex gap-2">
                <Input
                  // A distinct, non-standard name and autoComplete value stops
                  // the browser filling this the moment someone accepts an
                  // autofill suggestion in the personal e-mail field below —
                  // Chrome otherwise treats every type="email" input alike.
                  name="employee-work-address"
                  autoComplete="off"
                  data-lpignore="true"
                  type="email"
                  className="flex-1"
                  readOnly={emailLocked}
                  value={form.workEmail}
                  onChange={(e) => { setEmailTouched(true); set('workEmail', e.target.value); }}
                  invalid={!!errors.workEmail || emailTaken}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmailLocked((v) => !v); setEmailTouched(true); }}
                >
                  {emailLocked ? <><Pencil className="h-3.5 w-3.5" /> Edit</> : <><Lock className="h-3.5 w-3.5" /> Lock</>}
                </Button>
              </div>
            </Field>
            <Field label="Personal email" hint="Where the invitation is sent — a new hire rarely has a working company mailbox yet.">
              <Input
                name="employee-personal-address"
                autoComplete="off"
                data-lpignore="true"
                type="email"
                value={form.personalEmail}
                onChange={(e) => set('personalEmail', e.target.value)}
                placeholder="name@gmail.com"
              />
            </Field>
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
            <Field label="Work site">
              {/* Where this person clocks in — a branch or a client's premises.
                  With the strict check-in policy their geofence answers to this
                  site; unassigned = validated at whichever site they're at. */}
              <Select value={form.locationId} onChange={(e) => set('locationId', e.target.value)}>
                <option value="">Any site (unassigned)</option>
                {(sites ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}{s.clientName ? ` — ${s.clientName}` : ''}</option>
                ))}
              </Select>
              {servingClient && (
                <p className="mt-1 text-xs text-muted-foreground">
                  This department serves <span className="font-medium text-foreground">{servingClient.name}</span>
                  {clientSite
                    ? <> — their site is preselected as the work site.</>
                    : <> (no client site registered yet — add one under Organization → Locations).</>}
                </p>
              )}
            </Field>
            {canSeePay && (
              <>
                <Field label="Compensation type">
                  <Select value={form.compensationType} onChange={(e) => set('compensationType', e.target.value)}>
                    <option value="monthly">Monthly salary</option>
                    <option value="hourly">Hourly (pay per hour)</option>
                  </Select>
                </Field>
                {form.compensationType === 'monthly' ? (
                  <Field label={`Basic salary${org?.currency ? ` (${org.currency}/month)` : ' (per month)'}`}>
                    <Input type="number" min={0} step="any" value={form.basicSalary} onChange={(e) => set('basicSalary', e.target.value)} placeholder="e.g. 12000000 — fixed monthly" />
                  </Field>
                ) : (
                  <Field label={`Pay per hour${org?.currency ? ` (${org.currency})` : ''}`}>
                    <Input type="number" min={0} step="any" value={form.payPerHour} onChange={(e) => set('payPerHour', e.target.value)} placeholder="e.g. 500 — for payroll" />
                  </Field>
                )}
              </>
            )}
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

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
