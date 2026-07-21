import { useEffect, useState, type ReactNode } from 'react';
import { Settings2, Bell, Palette, Save, Sun, Moon, Check, Info } from 'lucide-react';
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
import { useQuery } from '../../hooks/useQuery';
import { settingsService, notificationPrefsService, type GeneralSettings } from '../../services';
import { cn } from '../../lib/utils';

// Security and Integrations were removed rather than wired. Both presented
// controls nothing enforced: toggling "Enforce MFA" claimed a policy that was
// never applied at login, and three integrations were hardcoded as Connected
// when no provider exists. A control that reports success without acting is
// worse than an absent one — restore them alongside real implementations.
const TABS = [
  { value: 'general', label: 'General' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'appearance', label: 'Appearance' },
];

const TAB_ICON: Record<string, ReactNode> = {
  general: <Settings2 className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  appearance: <Palette className="h-4 w-4" />,
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
          {tab === 'notifications' && <NotificationsSection />}
          {tab === 'appearance' && <AppearanceSection />}
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
  const { data, loading, refetch } = useQuery(() => settingsService.section<GeneralSettings>('general'), []);
  const [form, setForm] = useState<GeneralSettings>({});
  const [saving, setSaving] = useState(false);

  // Timezone deliberately lives on Organization / Attendance Settings, not
  // here: it drives the attendance engine, and a second picker writing the
  // same column invites two screens disagreeing about the working day.
  useEffect(() => {
    if (!data) return;
    setForm({
      appName: data.appName ?? '',
      language: data.language ?? 'en',
      dateFormat: data.dateFormat ?? 'dd-MMM-yyyy',
      firstDay: data.firstDay ?? 'monday',
    });
  }, [data]);

  const set = (k: keyof GeneralSettings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await settingsService.save('general', form as Record<string, unknown>);
      refetch();
      toast.success('General settings saved', 'Workspace defaults have been updated.');
    } catch (e) {
      toast.error('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="General" description="Basic workspace identity and regional defaults." />
      <CardBody className="space-y-4">
        <div>
          <Label htmlFor="appName">Application display name</Label>
          <Input id="appName" value={form.appName ?? ''} onChange={(e) => set('appName', e.target.value)} placeholder="e.g. HR Console" />
          <p className="mt-1.5 text-xs text-muted-foreground">Shown in the sidebar and browser tab.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="language">Default language</Label>
            <Select id="language" value={form.language ?? 'en'} onChange={(e) => set('language', e.target.value)}>
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateFormat">Date format</Label>
            <Select id="dateFormat" value={form.dateFormat ?? 'dd-MMM-yyyy'} onChange={(e) => set('dateFormat', e.target.value)}>
              <option value="dd-MMM-yyyy">09-Jul-2026</option>
              <option value="dd/MM/yyyy">09/07/2026</option>
              <option value="MM/dd/yyyy">07/09/2026</option>
              <option value="yyyy-MM-dd">2026-07-09</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="firstDay">First day of week</Label>
            <Select id="firstDay" value={form.firstDay ?? 'monday'} onChange={(e) => set('firstDay', e.target.value)}>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Timezone is set in <strong>Attendance → Settings</strong>, where it drives the working day and auto-checkout.
        </p>
      </CardBody>
      <SaveBar onSave={save} saving={saving || loading} />
    </Card>
  );
}

/* ---------- Notifications ---------- */

/** Event keys the API stores preferences against. */
const EVENTS = [
  { key: 'leave', label: 'Leave' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'tasks', label: 'Tasks' },
] as const;

const CHANNEL_LABEL: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  whatsapp: 'WhatsApp',
};

function NotificationsSection() {
  const toast = useToast();
  // Readiness comes from the server, not a constant here: each channel reports
  // whether a provider is actually wired. Today only in-app is — the others
  // accept a send and silently drop it — so their switches are disabled rather
  // than letting an admin enable a delivery that will never happen.
  const { data: channels, loading: channelsLoading } = useQuery(() => notificationPrefsService.channels(), []);
  const { data: prefs, refetch } = useQuery(() => notificationPrefsService.list(), []);
  const [busy, setBusy] = useState<string | null>(null);

  const list = channels ?? [];
  const isEnabled = (eventKey: string, channel: string) => {
    const found = (prefs ?? []).find((p) => p.eventKey === eventKey && p.channel === channel);
    return found ? found.isEnabled : true; // absent preference means "not opted out"
  };

  const toggle = async (eventKey: string, channel: string, next: boolean) => {
    const id = `${eventKey}:${channel}`;
    setBusy(id);
    try {
      await notificationPrefsService.set(eventKey, channel, next);
      refetch();
    } catch (e) {
      toast.error('Could not update', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const pending = list.filter((c) => !c.ready).map((c) => CHANNEL_LABEL[c.channel] ?? c.channel);

  return (
    <Card>
      <CardHeader title="Notifications" description="Choose how employees are alerted for each type of event." />
      {pending.length > 0 && (
        <div className="flex items-start gap-2 border-b border-border bg-warning/5 px-5 py-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <p>
            {pending.join(', ')} {pending.length === 1 ? 'has' : 'have'} no delivery provider connected yet, so
            {pending.length === 1 ? ' it is' : ' they are'} shown disabled. In-app notifications are live.
          </p>
        </div>
      )}
      <CardBody className="overflow-x-auto p-0">
        {channelsLoading ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">Loading channels…</div>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Event</th>
                {list.map((c) => (
                  <th key={c.channel} className="px-3 py-3 text-center font-medium text-muted-foreground">
                    <span className={cn(!c.ready && 'opacity-50')}>{CHANNEL_LABEL[c.channel] ?? c.channel}</span>
                    {!c.ready && <span className="ml-1 text-[10px] uppercase tracking-wide text-warning">soon</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {EVENTS.map((ev) => (
                <tr key={ev.key} className="hover:bg-surface-2/40">
                  <td className="px-5 py-3.5 font-medium text-foreground">{ev.label}</td>
                  {list.map((c) => (
                    <td key={c.channel} className="px-3 py-3.5 text-center">
                      <div className={cn('flex justify-center', !c.ready && 'pointer-events-none opacity-40')}>
                        <Switch
                          checked={c.ready ? isEnabled(ev.key, c.channel) : false}
                          onChange={(v) => c.ready && toggle(ev.key, c.channel, v)}
                          label={`${ev.label} via ${CHANNEL_LABEL[c.channel] ?? c.channel}`}
                          disabled={!c.ready || busy === `${ev.key}:${c.channel}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
      <div className="border-t border-border px-5 py-3.5">
        <p className="text-xs text-muted-foreground">Changes save immediately.</p>
      </div>
    </Card>
  );
}

/* ---------- Appearance ---------- */

function AppearanceSection() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  // Density was removed: nothing in the app read the value, so the control
  // changed a stored string and no spacing. Theme is the only real setting
  // here — it applies instantly via the theme store and is per-device, so
  // there is nothing to save.

  const themes = [
    { value: 'light' as const, label: 'Light', icon: <Sun className="h-5 w-5" />, hint: 'Bright, high-contrast interface.' },
    { value: 'dark' as const, label: 'Dark', icon: <Moon className="h-5 w-5" />, hint: 'Dimmed palette for low-light use.' },
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

      </CardBody>
      <div className="border-t border-border px-5 py-3.5">
        <p className="text-xs text-muted-foreground">Theme applies immediately and is remembered on this device.</p>
      </div>
    </Card>
  );
}
