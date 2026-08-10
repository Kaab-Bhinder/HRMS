import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Switch';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../store/theme';
import { Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  // Start empty: prefilled demo credentials leak into client demos and stop
  // working the moment the seed data changes.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Editing either field clears the previous failure, so a stale message
   *  never sits under a form the person has already corrected. */
  const edit = (setter: (v: string) => void) => (v: string) => { setError(null); setter(v); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // Navigate only on success — a failed sign-in previously fell through
      // to navigate() as well.
      navigate('/');
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      // In a `finally`, so a rejected login can never leave the button
      // spinning forever with nothing explaining why.
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(700px 300px at 80% 0%, rgba(230,181,61,0.18), transparent 60%)' }} />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 22V10l7 5 7-5v12" /></svg>
          </div>
          <span className="font-semibold">Prima Admin</span>
        </div>
        <div className="relative">
          <h1 className="max-w-md text-3xl font-semibold leading-tight">Run your entire workforce from one intelligent console.</h1>
          <p className="mt-4 max-w-md text-primary-foreground/80">Employees, attendance, leave, tasks, performance and analytics — unified, secure, and AI-ready.</p>
          <div className="mt-8 flex gap-6 text-sm text-primary-foreground/80">
            <div><p className="text-2xl font-semibold text-primary-foreground">600+</p>employees</div>
            <div><p className="text-2xl font-semibold text-primary-foreground">12</p>modules</div>
            <div><p className="text-2xl font-semibold text-primary-foreground">99.9%</p>uptime target</div>
          </div>
        </div>
        <p className="relative text-xs text-primary-foreground/70">© 2026 Prima · Confidential</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <button onClick={toggle} className="absolute right-5 top-5 rounded-md p-2 text-muted-foreground hover:bg-surface-2 focus-ring">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your admin account to continue.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" required>Work email</Label>
              <Input id="email" type="email" leftIcon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => edit(setEmail)(e.target.value)} required />
            </div>
            <div>
              {/* No self-service reset: it needs an email provider (the email
                  channel is still a stub) plus single-use expiring tokens.
                  Until then an administrator resets the password from
                  Users → Reset password, so an inert link would only send
                  people down a dead end. */}
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Input id="password" type={show ? 'text' : 'password'} leftIcon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => edit(setPassword)(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-ring rounded">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={remember} onChange={setRemember} /> Keep me signed in
            </label>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} disabled={loading || !email || !password} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Turns an auth failure into something the person can act on. The API is
 * deliberately vague about *which* credential was wrong — saying "no such
 * user" would let anyone enumerate valid accounts — but the other cases are
 * safe to state plainly, and leaving them as a raw error helps nobody.
 */
function friendlyAuthError(err: unknown): string {
  const status = (err as { status?: number })?.status;
  const raw = (err as Error)?.message ?? '';

  if (status === 401 || /invalid credentials|unauthor/i.test(raw)) {
    return 'Incorrect email or password. Please try again.';
  }
  if (status === 403 || /not permitted|platform/i.test(raw)) {
    return raw || 'This account cannot sign in to the web app. Try the mobile app.';
  }
  if (status === 429 || /too many/i.test(raw)) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (status === 0 || /network|fetch|failed to fetch/i.test(raw)) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  return raw || 'Sign in failed. Please try again.';
}
