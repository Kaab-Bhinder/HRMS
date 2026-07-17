import { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { usersService } from '../../services';
import { useToast } from '../../store/toast';
import type { UserAccount } from '../../lib/types';

export function ResetPasswordModal({ open, onClose, user, onDone }: { open: boolean; onClose: () => void; user?: UserAccount | null; onDone: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setPassword(''); setConfirm(''); setError(''); } }, [open]);

  const submit = async () => {
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setSaving(true);
    try {
      await usersService.resetPassword(user!.id, password);
      toast.success('Password reset', `${user?.fullName} must sign in again with the new password.`);
      onDone();
      onClose();
    } catch (e) {
      toast.error('Could not reset password', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Reset password"
      description={user ? `Set a new password for ${user.fullName}. This signs them out of all active sessions.` : ''}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Reset password</Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <Label required>New password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!error} autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
        <div>
          <Label required>Confirm password</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={!!error} autoComplete="new-password" />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
