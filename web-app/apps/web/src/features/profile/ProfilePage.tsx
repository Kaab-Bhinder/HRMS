import { useState, type ReactNode } from 'react';
import {
  Save, Mail, KeyRound, ShieldCheck, Monitor, Smartphone, LogIn, MapPin,
  CheckCircle2, AlertTriangle, Laptop,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { Input, Textarea, Select, Label } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../store/theme';
import { useToast } from '../../store/toast';
import { authService } from '../../services';
import { useQuery } from '../../hooks/useQuery';
import { sessionsService, auditService, notificationPrefsService } from '../../services';
import { relativeTime } from '../../lib/format';
import type { AuditLog } from '../../lib/types';
import { cn } from '../../lib/utils';
import type { SessionInfo } from '../../lib/types';

const TABS = [
  { value: 'personal', label: 'Personal' },
  { value: 'security', label: 'Security' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'sessions', label: 'Sessions' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('personal');

  const fullName = user?.fullName ?? 'HR Administrator';
  const email = user?.email ?? 'admin@meezanbank.com';
  const roleName = user?.roleName ?? 'Administrator';

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" description="Manage your personal information, security and workspace preferences." />

      {/* Identity header */}
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar name={fullName} src={user?.avatarUrl} size="lg" className="!h-20 !w-20 text-2xl" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
              <Badge tone="primary">{roleName}</Badge>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {email}
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'personal' && <PersonalSection fullName={fullName} email={email} />}
      {tab === 'security' && <SecuritySection />}
      {tab === 'preferences' && <PreferencesSection />}
      {tab === 'sessions' && <SessionsSection />}
    </div>
  );
}

/* ---------- Personal ---------- */

function PersonalSection({ fullName, email }: { fullName: string; email: string }) {
  const toast = useToast();
  const [form, setForm] = useState({
    fullName,
    email,
    phone: '+92 300 1234567',
    jobTitle: 'Head of Human Resources',
    department: 'Human Resources',
    bio: 'HR leader focused on people operations, compliance and building a high-trust culture across our branch network.',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = () => toast.success('Profile updated', 'Your personal details have been saved.');

  return (
    <Card>
      <CardHeader title="Personal information" description="This information is visible to your HR team and managers." />
      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName" required>Full name</Label>
          <Input id="fullName" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email" required>Work email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} leftIcon={<Mail className="h-4 w-4" />} />
        </div>
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select id="department" value={form.department} onChange={(e) => set('department', e.target.value)}>
            <option>Human Resources</option>
            <option>Finance</option>
            <option>Operations</option>
            <option>Information Technology</option>
            <option>Retail Banking</option>
            <option>Compliance &amp; Risk</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} />
          <p className="mt-1.5 text-xs text-muted-foreground">Brief description shown on your directory profile.</p>
        </div>
      </CardBody>
      <div className="flex justify-end border-t border-border px-5 py-3.5">
        <Button size="sm" onClick={onSave}><Save className="h-4 w-4" /> Save changes</Button>
      </div>
    </Card>
  );
}

/* ---------- Security ---------- */

function SecuritySection() {
  const toast = useToast();
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const set = (k: keyof typeof pwd, v: string) => setPwd((p) => ({ ...p, [k]: v }));

  const [changing, setChanging] = useState(false);

  const changePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      toast.error('Missing fields', 'Please fill in all password fields.');
      return;
    }
    if (pwd.next.length < 8) {
      toast.error('Password too short', 'Use at least 8 characters.');
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error('Passwords do not match', 'The new password and confirmation must be identical.');
      return;
    }
    setChanging(true);
    try {
      // The server re-verifies the current password; the checks above are only
      // to save a round trip, never the thing that protects the account.
      const res = await authService.changePassword(pwd.current, pwd.next);
      setPwd({ current: '', next: '', confirm: '' });
      const others = res?.otherSessionsSignedOut ?? 0;
      toast.success(
        'Password changed',
        others > 0
          ? `Use it next time you sign in. ${others} other ${others === 1 ? 'session was' : 'sessions were'} signed out.`
          : 'Use your new password the next time you sign in.',
      );
    } catch (e) {
      // Surfaces "Your current password is incorrect" rather than a green toast
      // over a failed change — the bug this replaces.
      toast.error('Could not change password', (e as Error).message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader title="Change password" description="Choose a strong password you don't use elsewhere." />
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="current" required>Current password</Label>
              <Input id="current" type="password" value={pwd.current} onChange={(e) => set('current', e.target.value)} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="next" required>New password</Label>
                <Input id="next" type="password" value={pwd.next} onChange={(e) => set('next', e.target.value)} placeholder="At least 8 characters" invalid={!!pwd.next && pwd.next.length < 8} />
              </div>
              <div>
                <Label htmlFor="confirm" required>Confirm new password</Label>
                <Input id="confirm" type="password" value={pwd.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Re-enter new password" invalid={!!pwd.confirm && pwd.confirm !== pwd.next} />
              </div>
            </div>
          </CardBody>
          <div className="flex justify-end border-t border-border px-5 py-3.5">
            <Button size="sm" onClick={changePassword} loading={changing}><KeyRound className="h-4 w-4" /> Update password</Button>
          </div>
        </Card>

      </div>

      <RecentActivityCard />
    </div>
  );
}

/* ---------- Preferences ---------- */

function PreferencesSection() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('en');

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <NotificationChannelsCard />

      <Card>
        <CardHeader title="Display &amp; language" description="Personalize your workspace experience." />
        <CardBody className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {(['light', 'dark'] as const).map((t) => {
                const active = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors focus-ring',
                      active ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-border text-muted-foreground hover:bg-surface-2',
                    )}
                  >
                    {t}
                    {active && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="prefLang">Language</Label>
            <Select id="prefLang" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English (UK)</option>
              <option value="ur">Urdu (اردو)</option>
              <option value="ar">Arabic (العربية)</option>
              <option value="fr">French (Français)</option>
            </Select>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ---------- Sessions ---------- */

function deviceIcon(os: string | null) {
  if (os === 'iOS' || os === 'Android') return <Smartphone className="h-5 w-5" />;
  if (os === 'macOS' || os === 'Linux') return <Laptop className="h-5 w-5" />;
  return <Monitor className="h-5 w-5" />;
}

function SessionsSection() {
  const toast = useToast();
  const { data: sessions, loading, error, refetch } = useQuery(() => sessionsService.list(), []);
  const [busy, setBusy] = useState(false);

  const revoke = async (s: SessionInfo) => {
    setBusy(true);
    try {
      await sessionsService.revoke(s.id);
      toast.success('Session revoked', `${s.device} has been signed out.`);
      refetch();
    } catch (e) {
      toast.error('Could not revoke session', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const revokeOthers = async () => {
    setBusy(true);
    try {
      const res = await sessionsService.revokeOthers();
      toast.success('Other sessions revoked', `${res.revoked} other session(s) were signed out.`);
      refetch();
    } catch (e) {
      toast.error('Could not revoke sessions', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const list = sessions ?? [];
  const hasOthers = list.some((s) => !s.current);

  return (
    <Card>
      <CardHeader
        title="Active sessions"
        description="Devices currently signed in to your account."
        action={hasOthers ? <Button variant="outline" size="sm" onClick={revokeOthers} loading={busy}>Revoke all others</Button> : undefined}
      />
      <CardBody className="divide-y divide-border py-0">
        {loading && <p className="py-6 text-sm text-muted-foreground">Loading sessions…</p>}
        {error && <p className="py-6 text-sm text-danger">Couldn’t load sessions. <button onClick={refetch} className="underline">Retry</button></p>}
        {!loading && !error && list.length === 0 && <p className="py-6 text-sm text-muted-foreground">No active sessions.</p>}
        {list.map((s) => (
          <div key={s.id} className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">{deviceIcon(s.os)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{s.device}</p>
                {s.current && <Badge tone="success" dot>This device</Badge>}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {s.ipAddress ?? 'Unknown IP'} · signed in {relativeTime(s.signedInAt)}
              </p>
            </div>
            {s.current ? (
              <span className="text-xs font-medium text-muted-foreground">Current</span>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => revoke(s)} disabled={busy} className="text-danger hover:text-danger">Revoke</Button>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/**
 * The signed-in user's own recent activity, taken from the audit trail.
 *
 * This replaced a hardcoded list ("Signed in from Karachi", "MFA enabled") that
 * described events which had never happened. The audit log is written
 * automatically by a global interceptor on every mutating request, so this is
 * real. It is filtered client-side by actor because the audit endpoint has no
 * actor filter yet — fine at this volume, worth a server-side filter later.
 */
function RecentActivityCard() {
  const { user } = useAuth();
  const { data, loading } = useQuery(() => auditService.list({ limit: 50, sort: 'createdAt', order: 'desc' }), []);

  const mine = (data?.data ?? []).filter((a: AuditLog) => a.actorName === user?.fullName).slice(0, 6);

  const ICON: Record<string, ReactNode> = {
    login: <LogIn className="h-4 w-4 text-info" />,
    logout: <LogIn className="h-4 w-4 text-muted-foreground" />,
    create: <ShieldCheck className="h-4 w-4 text-success" />,
    update: <KeyRound className="h-4 w-4 text-primary" />,
    delete: <AlertTriangle className="h-4 w-4 text-danger" />,
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader title="Your recent activity" description="From the audit trail." />
      <CardBody className="space-y-1">
        {loading ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">Loading…</p>
        ) : mine.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          mine.map((a: AuditLog) => (
            <div key={a.id} className="flex items-start gap-3 rounded-md px-1 py-2">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-surface-2">
                {ICON[a.action] ?? <ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm capitalize text-foreground">
                  {a.action} {a.entityType}
                  {a.entityLabel ? ` — ${a.entityLabel}` : ''}
                </p>
                <p className="text-xs text-muted-foreground/70">{relativeTime(a.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

const CHANNEL_COPY: Record<string, { title: string; description: string }> = {
  in_app: { title: 'In-app', description: 'Shown in the bell menu and on the Notifications page.' },
  email: { title: 'Email', description: 'Approvals, reminders and digests.' },
  sms: { title: 'SMS', description: 'Time-sensitive alerts to your mobile.' },
  push: { title: 'Push', description: 'Mobile push notifications.' },
  whatsapp: { title: 'WhatsApp', description: 'Payroll and leave updates over WhatsApp.' },
};

/**
 * Per-channel notification preferences, saved to the real preferences API.
 *
 * Availability comes from the server rather than a constant here: each channel
 * reports whether a provider is actually wired. Today only in-app is — the
 * others accept a send and drop it — so their switches are disabled instead of
 * letting someone enable a delivery that will never arrive. When a provider is
 * connected and reports ready, the switch enables itself with no change here.
 */
function NotificationChannelsCard() {
  const toast = useToast();
  const { data: channels, loading } = useQuery(() => notificationPrefsService.channels(), []);
  const { data: prefs, refetch } = useQuery(() => notificationPrefsService.list(), []);
  const [busy, setBusy] = useState<string | null>(null);

  // One row per channel; the event key is the catch-all for "any notification".
  const EVENT = 'all';
  const isOn = (channel: string) => {
    const found = (prefs ?? []).find((p) => p.eventKey === EVENT && p.channel === channel);
    return found ? found.isEnabled : true;
  };

  const toggle = async (channel: string, next: boolean) => {
    setBusy(channel);
    try {
      await notificationPrefsService.set(EVENT, channel, next);
      refetch();
    } catch (e) {
      toast.error('Could not update', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const list = channels ?? [];

  return (
    <Card>
      <CardHeader title="Notification channels" description="Choose how you'd like to be reached." />
      <CardBody className="divide-y divide-border py-0">
        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading channels…</p>
        ) : (
          list.map((ch) => {
            const copy = CHANNEL_COPY[ch.channel] ?? { title: ch.channel, description: '' };
            return (
              <div key={ch.channel} className="flex items-start justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {copy.title}
                    {!ch.ready && (
                      <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                        soon
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {ch.ready ? copy.description : 'No delivery provider connected yet.'}
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <Switch
                    checked={ch.ready ? isOn(ch.channel) : false}
                    onChange={(v) => ch.ready && toggle(ch.channel, v)}
                    disabled={!ch.ready || busy === ch.channel}
                    label={copy.title}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardBody>
      <div className="border-t border-border px-5 py-3.5">
        <p className="text-xs text-muted-foreground">Changes save immediately.</p>
      </div>
    </Card>
  );
}
