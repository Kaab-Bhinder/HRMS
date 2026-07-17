import { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label } from '../../components/ui/Input';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { rolesService, usersService } from '../../services';
import { useToast } from '../../store/toast';
import type { UserAccount } from '../../lib/types';

const EMPTY = { email: '', fullName: '', password: '' };

export function UserFormModal({ open, onClose, user, onSaved }: { open: boolean; onClose: () => void; user?: UserAccount | null; onSaved: () => void }) {
  const toast = useToast();
  const isEdit = !!user;
  const { data: roles } = useQuery(() => rolesService.list(), []);

  const [form, setForm] = useState(EMPTY);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [sendInvite, setSendInvite] = useState(false); // create-only: leave without a password
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(user ? { email: user.email, fullName: user.fullName, password: '' } : EMPTY);
    setRoleIds(user ? user.roles.map((r) => r.id) : []);
    setSendInvite(false);
    setErrors({});
  }, [open, user]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleRole = (id: string) => setRoleIds((ids) => (ids.includes(id) ? ids.filter((r) => r !== id) : [...ids, id]));

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!isEdit && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!isEdit && !sendInvite && form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (isEdit) {
        await usersService.update(user!.id, { fullName: form.fullName.trim(), roleIds });
        toast.success('User updated', `${form.fullName} was saved.`);
      } else {
        await usersService.create({
          email: form.email.trim().toLowerCase(),
          fullName: form.fullName.trim(),
          roleIds,
          ...(sendInvite ? {} : { password: form.password }),
        });
        toast.success(
          sendInvite ? 'User invited' : 'User created',
          sendInvite ? `${form.fullName} was created as invited — set a password to activate.` : `${form.fullName} can now sign in.`,
        );
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(isEdit ? 'Could not update user' : 'Could not create user', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit User' : 'Add User'}
      description={isEdit ? `Editing ${user?.fullName}` : 'Create a login account and assign roles.'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>{isEdit ? 'Save changes' : sendInvite ? 'Create invite' : 'Create user'}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h4>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Full name" required error={errors.fullName}>
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} invalid={!!errors.fullName} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={isEdit} invalid={!!errors.email} />
            </Field>
          </div>

          {!isEdit && (
            <div className="mt-3.5 space-y-3.5">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                Create as invited (no password now — set one later to activate)
              </label>
              {!sendInvite && (
                <Field label="Initial password" required error={errors.password}>
                  <Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} invalid={!!errors.password} placeholder="At least 8 characters" autoComplete="new-password" />
                </Field>
              )}
            </div>
          )}
        </section>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roles</h4>
          {!roles ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((r) => (
                <label key={r.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-2.5 hover:bg-muted/40">
                  <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} className="mt-0.5 h-4 w-4 rounded border-border accent-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{r.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.permissions.length} permissions</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Roles determine what this user can access. A user with no role can sign in but sees nothing.</p>
        </section>
      </div>
    </Modal>
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
