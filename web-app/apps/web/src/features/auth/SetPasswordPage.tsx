import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Skeleton } from '../../components/feedback/States';
import { accountService } from '../../services';

/**
 * Where an invitation or reset link lands. Public — the whole point is that the
 * person has no password yet, so they cannot be asked to sign in first.
 */
export default function SetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';

  const [account, setAccount] = useState<{ email: string; fullName: string; purpose: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Naming the account up front lets someone spot a wrong or stale link
  // before they type a password into it.
  useEffect(() => {
    if (!token) { setInvalid('This link is missing its token.'); setChecking(false); return; }
    accountService.inspectInvite(token)
      .then(setAccount)
      .catch((e) => setInvalid((e as Error).message))
      .finally(() => setChecking(false));
  }, [token]);

  const submit = async () => {
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setSaving(true);
    try {
      await accountService.setPassword(token, password);
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7 shadow-card">
        {checking ? (
          <Skeleton className="h-40 w-full" />
        ) : invalid ? (
          <Centered
            icon={<AlertCircle className="h-6 w-6 text-danger" />}
            title="This link cannot be used"
            body={invalid}
            action={<Button variant="outline" onClick={() => navigate('/login')}>Go to sign in</Button>}
          />
        ) : done ? (
          <Centered
            icon={<CheckCircle2 className="h-6 w-6 text-success" />}
            title="Password set"
            body={`You can now sign in as ${account?.email}.`}
            action={<Button onClick={() => navigate('/login')}>Sign in</Button>}
          />
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-foreground">
                  {account?.purpose === 'reset' ? 'Reset your password' : 'Set your password'}
                </h1>
                <p className="truncate text-sm text-muted-foreground">{account?.fullName} · {account?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label required>New password</Label>
                <Input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </div>
              <div>
                <Label required>Confirm password</Label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }} />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={() => void submit()} disabled={saving}>
                {saving ? 'Saving…' : 'Set password and continue'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Centered({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">{icon}</div>
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
