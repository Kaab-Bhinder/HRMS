import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
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
  const [email, setEmail] = useState('ayesha.malik@acmebank.com');
  const [password, setPassword] = useState('demo1234');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(700px 300px at 80% 0%, rgba(230,181,61,0.18), transparent 60%)' }} />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 22V10l7 5 7-5v12" /></svg>
          </div>
          <span className="font-semibold">Workforce Admin</span>
        </div>
        <div className="relative">
          <h1 className="max-w-md text-3xl font-semibold leading-tight">Run your entire workforce from one intelligent console.</h1>
          <p className="mt-4 max-w-md text-white/80">Employees, attendance, leave, tasks, performance and analytics — unified, secure, and AI-ready.</p>
          <div className="mt-8 flex gap-6 text-sm text-white/80">
            <div><p className="text-2xl font-semibold text-white">600+</p>employees</div>
            <div><p className="text-2xl font-semibold text-white">12</p>modules</div>
            <div><p className="text-2xl font-semibold text-white">99.9%</p>uptime target</div>
          </div>
        </div>
        <p className="relative text-xs text-white/60">© 2026 Workforce Management System · Confidential</p>
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
              <Input id="email" type="email" leftIcon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>Password</Label>
                <button type="button" className="mb-1.5 text-xs font-medium text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Input id="password" type={show ? 'text' : 'password'} leftIcon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-ring rounded">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={remember} onChange={setRemember} /> Keep me signed in
            </label>
            <Button type="submit" size="lg" loading={loading} className="w-full">Sign in</Button>
          </form>
          <p className="mt-6 rounded-lg border border-dashed border-border bg-surface-2/50 p-3 text-center text-xs text-muted-foreground">
            Demo build · credentials are pre-filled. Click <span className="font-medium text-foreground">Sign in</span> to explore.
          </p>
        </div>
      </div>
    </div>
  );
}
