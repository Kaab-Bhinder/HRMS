import { useState, type ReactNode } from 'react';
import {
  Settings2, ShieldCheck, Bell, Palette, Plug, Save, Sun, Moon, Check, Info,
  Calendar, MessageSquare, Slack, Fingerprint, Rows3, Rows2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { Input, Select, Label } from '../../components/ui/Input';
import { Divider } from '../../components/ui/Misc';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../store/toast';
import { useTheme } from '../../store/theme';
import { cn } from '../../lib/utils';

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'security', label: 'Security' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'integrations', label: 'Integrations' },
];

const TAB_ICON: Record<string, ReactNode> = {
  general: <Settings2 className="h-4 w-4" />,
  security: <ShieldCheck className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  appearance: <Palette className="h-4 w-4" />,
  integrations: <Plug className="h-4 w-4" />,
};

export default function SettingsPage() {
  const [tab, setTab] = useState('general');

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Configure workspace defaults, security policies and integrations for your organization." />

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left rail on desktop */}
        <nav className="hidden shrink-0 lg:block lg:w-56">
          <div className="sticky top-5 space-y-1">
            {TABS.map((t) => {
              const active = t.value === tab;
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
                  )}
                >
                  <span className={active ? 'text-primary' : 'text-muted-foreground'}>{TAB_ICON[t.value]}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Top tabs on mobile/tablet */}
        <div className="lg:hidden">
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
        </div>

        <div className="min-w-0 flex-1">
          {tab === 'general' && <GeneralSection />}
          {tab === 'security' && <SecuritySection />}
          {tab === 'notifications' && <NotificationsSection />}
          {tab === 'appearance' && <AppearanceSection />}
          {tab === 'integrations' && <IntegrationsSection />}
        </div>
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */

function SettingRow({ title, description, control, className }: { title: string; description?: string; control: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-3.5', className)}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3.5">
      <p className="mr-auto text-xs text-muted-foreground">Changes apply across the workspace.</p>
      <Button size="sm" onClick={onSave} loading={saving}><Save className="h-4 w-4" /> Save changes</Button>
    </div>
  );
}

/* ---------- General ---------- */

function GeneralSection() {
  const toast = useToast();
  const [form, setForm] = useState({
    appName: 'Meezan HR Console',
    language: 'en',
    timezone: 'Asia/Karachi',
    dateFormat: 'dd-MMM-yyyy',
    firstDay: 'monday',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card>
      <CardHeader title="General" description="Basic workspace identity and regional defaults." />
      <CardBody className="space-y-4">
        <div>
          <Label htmlFor="appName">Application display name</Label>
          <Input id="appName" value={form.appName} onChange={(e) => set('appName', e.target.value)} placeholder="e.g. Meezan HR Console" />
          <p className="mt-1.5 text-xs text-muted-foreground">Shown in the sidebar, browser tab and outbound emails.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="language">Default language</Label>
            <Select id="language" value={form.language} onChange={(e) => set('language', e.target.value)}>
              <option value="en">English (UK)</option>
              <option value="ur">Urdu (اردو)</option>
              <option value="ar">Arabic (العربية)</option>
              <option value="fr">French (Français)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select id="timezone" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              <option value="Asia/Karachi">(GMT+5) Pakistan — Karachi</option>
              <option value="Asia/Dubai">(GMT+4) Gulf — Dubai</option>
              <option value="Asia/Riyadh">(GMT+3) Saudi Arabia — Riyadh</option>
              <option value="Europe/London">(GMT+0) United Kingdom — London</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateFormat">Date format</Label>
            <Select id="dateFormat" value={form.dateFormat} onChange={(e) => set('dateFormat', e.target.value)}>
              <option value="dd-MMM-yyyy">09-Jul-2026</option>
              <option value="dd/MM/yyyy">09/07/2026</option>
              <option value="MM/dd/yyyy">07/09/2026</option>
              <option value="yyyy-MM-dd">2026-07-09</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="firstDay">First day of week</Label>
            <Select id="firstDay" value={form.firstDay} onChange={(e) => set('firstDay', e.target.value)}>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </Select>
          </div>
        </div>
      </CardBody>
      <SaveBar onSave={() => toast.success('General settings saved', 'Workspace defaults have been updated.')} />
    </Card>
  );
}

/* ---------- Security ---------- */

function SecuritySection() {
  const toast = useToast();
  const [mfa, setMfa] = useState(true);
  const [rotation, setRotation] = useState(true);
  const [rateLimit, setRateLimit] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  return (
    <Card>
      <CardHeader title="Security" description="Authentication and access policies enforced for all users." />
      <CardBody className="divide-y divide-border py-0">
        <SettingRow
          title="Enforce multi-factor authentication"
          description="Require a TOTP or SMS second factor at sign-in for every employee."
          control={<Switch checked={mfa} onChange={setMfa} label="Enforce MFA" />}
        />
        <SettingRow
          title="Periodic password rotation"
          description="Prompt users to reset their password every 90 days."
          control={<Switch checked={rotation} onChange={setRotation} label="Password rotation" />}
        />
        <SettingRow
          title="Session timeout"
          description="Automatically sign out idle sessions after this duration."
          control={
            <Select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-36">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </Select>
          }
        />
        <SettingRow
          title="Login rate limiting"
          description="Throttle repeated failed attempts and temporarily lock the account."
          control={<Switch checked={rateLimit} onChange={setRateLimit} label="Login rate-limit" />}
        />
      </CardBody>
      <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-lg border border-border bg-surface-2/50 p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        <p className="text-xs text-muted-foreground">
          Sessions are issued as short-lived JWT access tokens paired with rotating refresh tokens. Refresh tokens are single-use and
          revoked on reuse — this policy is managed by the platform and cannot be disabled.
        </p>
      </div>
      <SaveBar onSave={() => toast.success('Security policy saved', 'Access controls have been updated for all users.')} />
    </Card>
  );
}

/* ---------- Notifications ---------- */

const CHANNELS = ['Email', 'SMS', 'Push', 'WhatsApp', 'In-app'] as const;
const EVENTS = ['Leave', 'Attendance', 'Payroll', 'Tasks'] as const;
type Channel = (typeof CHANNELS)[number];
type EventType = (typeof EVENTS)[number];

const DEFAULT_MATRIX: Record<EventType, Record<Channel, boolean>> = {
  Leave: { Email: true, SMS: false, Push: true, WhatsApp: true, 'In-app': true },
  Attendance: { Email: false, SMS: true, Push: true, WhatsApp: false, 'In-app': true },
  Payroll: { Email: true, SMS: true, Push: false, WhatsApp: false, 'In-app': true },
  Tasks: { Email: true, SMS: false, Push: true, WhatsApp: false, 'In-app': true },
};

function NotificationsSection() {
  const toast = useToast();
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);

  const toggle = (ev: EventType, ch: Channel) =>
    setMatrix((m) => ({ ...m, [ev]: { ...m[ev], [ch]: !m[ev][ch] } }));

  return (
    <Card>
      <CardHeader title="Notifications" description="Choose how employees are alerted for each type of event." />
      <CardBody className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">Event</th>
              {CHANNELS.map((ch) => (
                <th key={ch} className="px-3 py-3 text-center font-medium text-muted-foreground">{ch}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {EVENTS.map((ev) => (
              <tr key={ev} className="hover:bg-surface-2/40">
                <td className="px-5 py-3.5 font-medium text-foreground">{ev}</td>
                {CHANNELS.map((ch) => (
                  <td key={ch} className="px-3 py-3.5 text-center">
                    <div className="flex justify-center">
                      <Switch checked={matrix[ev][ch]} onChange={() => toggle(ev, ch)} label={`${ev} via ${ch}`} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
      <SaveBar onSave={() => toast.success('Notification preferences saved', 'Delivery channels have been updated.')} />
    </Card>
  );
}

/* ---------- Appearance ---------- */

function AppearanceSection() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const themes = [
    { value: 'light' as const, label: 'Light', icon: <Sun className="h-5 w-5" />, hint: 'Bright, high-contrast interface.' },
    { value: 'dark' as const, label: 'Dark', icon: <Moon className="h-5 w-5" />, hint: 'Dimmed palette for low-light use.' },
  ];
  const densities = [
    { value: 'comfortable' as const, label: 'Comfortable', icon: <Rows2 className="h-5 w-5" />, hint: 'Roomier spacing across tables and lists.' },
    { value: 'compact' as const, label: 'Compact', icon: <Rows3 className="h-5 w-5" />, hint: 'Fit more rows on screen at once.' },
  ];

  return (
    <Card>
      <CardHeader title="Appearance" description="Personalize how the console looks on this device." />
      <CardBody className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Theme</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {themes.map((t) => {
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-ring',
                    active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40 hover:bg-surface-2/50',
                  )}
                >
                  <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground')}>{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.hint}</p>
                  </div>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Density</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {densities.map((d) => {
              const active = density === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setDensity(d.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-ring',
                    active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40 hover:bg-surface-2/50',
                  )}
                >
                  <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground')}>{d.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.hint}</p>
                  </div>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </CardBody>
      <SaveBar onSave={() => toast.success('Appearance saved', 'Your display preferences have been updated.')} />
    </Card>
  );
}

/* ---------- Integrations ---------- */

interface Integration {
  key: string;
  name: string;
  description: string;
  icon: ReactNode;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  { key: 'gcal', name: 'Google Calendar', description: 'Sync leave, interviews and shift schedules to team calendars.', icon: <Calendar className="h-5 w-5" />, connected: true },
  { key: 'm365', name: 'Microsoft 365', description: 'Single sign-on and directory sync with Azure AD.', icon: <MessageSquare className="h-5 w-5" />, connected: true },
  { key: 'slack', name: 'Slack', description: 'Post approvals and attendance alerts to workspace channels.', icon: <Slack className="h-5 w-5" />, connected: false },
  { key: 'wa', name: 'WhatsApp Business', description: 'Send payroll slips and leave updates over WhatsApp.', icon: <MessageSquare className="h-5 w-5" />, connected: false },
  { key: 'zkteco', name: 'ZKTeco Biometric', description: 'Pull punch-in/out events from biometric attendance devices.', icon: <Fingerprint className="h-5 w-5" />, connected: true },
];

function IntegrationsSection() {
  const toast = useToast();
  const [items, setItems] = useState(INITIAL_INTEGRATIONS);

  const toggle = (key: string) =>
    setItems((list) =>
      list.map((i) => {
        if (i.key !== key) return i;
        const connected = !i.connected;
        toast.success(connected ? `${i.name} connected` : `${i.name} disconnected`, connected ? 'The integration is now active.' : 'The integration has been removed.');
        return { ...i, connected };
      }),
    );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((i) => (
        <Card key={i.key} className="flex flex-col">
          <CardBody className="flex flex-1 flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{i.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{i.name}</p>
                  <Badge tone={i.connected ? 'success' : 'neutral'} dot>{i.connected ? 'Connected' : 'Not connected'}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
              </div>
            </div>
            <div className="mt-auto flex justify-end pt-1">
              <Button variant={i.connected ? 'outline' : 'primary'} size="sm" onClick={() => toggle(i.key)}>
                {i.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
