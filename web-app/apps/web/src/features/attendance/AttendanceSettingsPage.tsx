import { useEffect, useState } from 'react';
import { Clock, MapPin, ShieldCheck, CalendarDays, Save, Coffee, Info, Globe } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input, Select, Label } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/feedback/States';
import { useNavigate } from 'react-router-dom';
import { HolidayCalendar } from './HolidayCalendar';
import { Badge } from '../../components/ui/Badge';
import { useQuery } from '../../hooks/useQuery';
import { attendanceService, type AttendanceSettings, type SiteSettings } from '../../services';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { useToast } from '../../store/toast';
import { cn } from '../../lib/utils';
import { timezoneGroups } from '../../lib/timezones';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Full IANA list when the browser supports it, else a sensible shortlist. */

/** Current local time in a zone, e.g. "2:30 PM" — a live sanity check. */
function nowInZone(tz: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone: tz, hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(new Date());
  } catch {
    return '—';
  }
}

export default function AttendanceSettingsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, refetch } = useQuery(() => attendanceService.settings(), []);
  const { data: siteSettings, refetch: refetchSites } = useQuery(() => attendanceService.siteSettings(), []);
  const [form, setForm] = useState<AttendanceSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteSettings | null>(null);
  const [resetSite, setResetSite] = useState<SiteSettings | null>(null);

  useEffect(() => { if (data) setForm(structuredClone(data)); }, [data]);

  if (loading || !form) {
    return (
      <div className="space-y-5">
        <PageHeader title="Attendance Settings" description="Office hours, breaks, geofencing and leave policy." />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Object-valued sections only (not the top-level `timezone` string).
  type Section = 'officeHours' | 'policy' | 'office' | 'leave';
  const set = <S extends Section>(section: S, key: keyof AttendanceSettings[S], value: unknown) =>
    setForm((f) => (f ? { ...f, [section]: { ...f[section], [key]: value } } : f));

  const num = (v: string) => (v === '' ? 0 : Number(v));

  const toggleDay = (d: number) => {
    const cur = form.policy.weeklyOffDays;
    set('policy', 'weeklyOffDays', cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort());
  };

  const save = async () => {
    setSaving(true);
    try {
      // Sites are managed in Organization → Locations now — never send the
      // legacy office block from here, so this page can't fight that one.
      await attendanceService.updateSettings({ ...form, office: undefined });
      toast.success('Settings saved', 'Attendance policy updated for the whole organization.');
      refetch();
    } catch (e) {
      toast.error('Could not save settings', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Settings"
        description="Office hours, breaks, geofencing and leave policy — applies to the whole organization."
        actions={<Button onClick={save} loading={saving}><Save className="h-4 w-4" /> Save changes</Button>}
      />

      {/* Timezone — governs every time below */}
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Timezone</span>} description="All office hours, late detection and auto-checkout use this timezone" />
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="tz">Organization timezone</Label>
            <Select id="tz" value={form.timezone} onChange={(e) => setForm((f) => (f ? { ...f, timezone: e.target.value } : f))}>
              {timezoneGroups(form.timezone).map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </optgroup>
              ))}
            </Select>
          </div>
          <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Current time there: </span>
            <span className="font-medium text-foreground">{nowInZone(form.timezone)}</span>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Office hours */}
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Office hours</span>} description="When the working day starts and ends" />
          <CardBody className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" type="time" value={form.officeHours.startTime} onChange={(e) => set('officeHours', 'startTime', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" type="time" value={form.officeHours.endTime} onChange={(e) => set('officeHours', 'endTime', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="grace">Grace period (min)</Label>
              <Input id="grace" type="number" min={0} value={form.officeHours.graceMinutes} onChange={(e) => set('officeHours', 'graceMinutes', num(e.target.value))} />
              <p className="mt-1 text-xs text-muted-foreground">Late only after start + grace.</p>
            </div>
            <div>
              <Label htmlFor="break"><span className="inline-flex items-center gap-1"><Coffee className="h-3.5 w-3.5" /> Break allowance (min)</span></Label>
              <Input id="break" type="number" min={0} value={form.officeHours.breakMinutes} onChange={(e) => set('officeHours', 'breakMinutes', num(e.target.value))} />
              <p className="mt-1 text-xs text-muted-foreground">Longer breaks flag the day.</p>
            </div>
          </CardBody>
        </Card>

        {/* Policy */}
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Attendance rules</span>} description="Lateness, geofence and live tracking" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lateAfter">Mark late after (min)</Label>
                <Input id="lateAfter" type="number" min={0} value={form.policy.lateAfterMinutes} onChange={(e) => set('policy', 'lateAfterMinutes', num(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="halfDay">Half-day under (min)</Label>
                <Input id="halfDay" type="number" min={0} value={form.policy.halfDayMinutes} onChange={(e) => set('policy', 'halfDayMinutes', num(e.target.value))} />
              </div>
            </div>
            {/* ONE control for the whole off-site decision. It replaced an
                enforce/allow-remote pair that were logical inverses plus a
                separate strictness switch — three settings for one choice. */}
            <div>
              <Label htmlFor="offsite">If someone checks in outside every work site</Label>
              <Select id="offsite" value={form.policy.offSiteCheckIn ?? 'flag'} onChange={(e) => set('policy', 'offSiteCheckIn', e.target.value)}>
                <option value="allowed">Allow it — never flagged</option>
                <option value="flag">Flag it for review (recommended)</option>
                <option value="absent">Mark the day absent</option>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">A flagged or absent day always records the distance and site, so HR can regularize it.</p>
            </div>
            <div>
              <Label htmlFor="scope">Check-in scope</Label>
              <Select id="scope" value={form.policy.checkInScope ?? 'any_site'} onChange={(e) => set('policy', 'checkInScope', e.target.value)}>
                <option value="any_site">Any work site — nearest branch/client site validates</option>
                <option value="assigned_only">Assigned site only — employees answer to their own site</option>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">Employees without an assigned work site are always validated at the nearest site.</p>
            </div>
            <Row label="Mark absent when the face doesn’t match" hint="Off: the check-in is recorded and flagged for review">
              <Switch checked={form.policy.absentOnFaceMismatch ?? false} onChange={(v) => set('policy', 'absentOnFaceMismatch', v)} />
            </Row>
            <div>
              <Label htmlFor="track">Live-location interval (sec)</Label>
              <Input id="track" type="number" min={30} value={form.policy.trackingIntervalSec} onChange={(e) => set('policy', 'trackingIntervalSec', num(e.target.value))} />
            </div>
          </CardBody>
        </Card>

        {/* Work sites: each either INHERITS the default settings above or
            carries its own hours/rules. Coordinates & geofences themselves are
            managed in Organization → Locations (the map picker) — here you
            decide which RULES apply at each site. */}
        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Work sites & their rules</span>}
            description="Each site inherits the defaults unless you give it custom settings"
            action={<Button variant="outline" size="sm" onClick={() => navigate('/organization')}><MapPin className="h-4 w-4" /> Manage sites</Button>}
          />
          <CardBody className="space-y-3">
            {(siteSettings ?? []).length === 0 ? (
              <p className="rounded-md bg-warning/10 p-3 text-sm text-warning">
                No work sites yet — add your office under Organization → Locations to enable geofenced check-in.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {(siteSettings ?? []).map((s) => (
                  <li key={s.locationId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                        {s.clientName && <Badge tone="info">Client: {s.clientName}</Badge>}
                        {!s.isActive && <Badge tone="neutral">Inactive</Badge>}
                        {!s.hasGeofence && <Badge tone="warning">No geofence</Badge>}
                        {s.hasOverride ? <Badge tone="accent">Custom</Badge> : <Badge tone="neutral">Uses defaults</Badge>}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {s.effective.officeHours.startTime}–{s.effective.officeHours.endTime}
                        {' · '}late after {s.effective.policy.lateAfterMinutes}m
                        {' · '}off: {s.effective.policy.weeklyOffDays.map((d) => DAYS[d]).join(' ')}
                        {s.effective.policy.offSiteCheckIn === 'allowed' ? ' · off-site OK' : s.effective.policy.offSiteCheckIn === 'absent' ? ' · off-site = absent' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {s.hasOverride ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setEditingSite(s)}>Edit rules</Button>
                          <Button variant="ghost" size="sm" onClick={() => setResetSite(s)}>Use defaults</Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setEditingSite(s)}>Customize</Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Days worked at a customized site are scored by that site's hours and rules — lateness, half-days, weekly offs and geofence leniency. Everything else inherits the defaults above. Coordinates and radii live in Organization → Locations.</span>
            </div>
          </CardBody>
        </Card>

        {/* Weekly off + leaves */}
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Week & leave</span>} description="Non-working days and annual leave" />
          <CardBody className="space-y-4">
            <div>
              <Label>Weekly off days</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                      form.policy.weeklyOffDays.includes(i)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="leaves">Annual leave allowance (days)</Label>
              <Input id="leaves" type="number" min={0} value={form.leave.annualLeaveDays} onChange={(e) => set('leave', 'annualLeaveDays', num(e.target.value))} className="max-w-[10rem]" />
            </div>
          </CardBody>
        </Card>
      </div>

      <HolidayCalendar weeklyOffDays={form.policy.weeklyOffDays} />

      <div className="flex justify-end">
        <Button onClick={save} loading={saving}><Save className="h-4 w-4" /> Save changes</Button>
      </div>

      <SiteRulesModal site={editingSite} onClose={() => setEditingSite(null)} onSaved={refetchSites} />
      <ConfirmDialog
        open={!!resetSite}
        onClose={() => setResetSite(null)}
        onConfirm={async () => {
          if (!resetSite) return;
          try {
            await attendanceService.removeSiteSettings(resetSite.locationId);
            toast.success('Back to defaults', `${resetSite.name} now inherits the default settings.`);
            setResetSite(null);
            refetchSites();
          } catch (e) {
            toast.error('Could not reset', (e as Error).message);
          }
        }}
        title="Use default settings?"
        message={resetSite ? `${resetSite.name} will drop its custom hours and rules and inherit the defaults again.` : ''}
        confirmLabel="Use defaults"
      />
    </div>
  );
}

/**
 * Per-site rules editor — opens prefilled with the site's EFFECTIVE settings
 * (its own if custom, else the defaults), so the admin only changes what
 * differs. Saving creates/updates the site's own hours + rules.
 */
function SiteRulesModal({ site, onClose, onSaved }: { site: SiteSettings | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ startTime: '09:00', endTime: '17:00', graceMinutes: 10, breakMinutes: 60, lateAfterMinutes: 15, halfDayMinutes: 240, offSiteCheckIn: 'flag' as 'allowed' | 'flag' | 'absent', absentOnFaceMismatch: false, weeklyOffDays: [0, 6] as number[] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (site) {
      setF({
        startTime: site.effective.officeHours.startTime,
        endTime: site.effective.officeHours.endTime,
        graceMinutes: site.effective.officeHours.graceMinutes,
        breakMinutes: site.effective.officeHours.breakMinutes,
        lateAfterMinutes: site.effective.policy.lateAfterMinutes,
        halfDayMinutes: site.effective.policy.halfDayMinutes,
        offSiteCheckIn: site.effective.policy.offSiteCheckIn ?? 'flag',
        absentOnFaceMismatch: site.effective.policy.absentOnFaceMismatch ?? false,
        weeklyOffDays: [...site.effective.policy.weeklyOffDays],
      });
    }
  }, [site]);

  if (!site) return null;
  const set = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));
  const toggleDay = (i: number) => set('weeklyOffDays', f.weeklyOffDays.includes(i) ? f.weeklyOffDays.filter((d) => d !== i) : [...f.weeklyOffDays, i].sort());

  const saveSite = async () => {
    setBusy(true);
    try {
      await attendanceService.upsertSiteSettings(site.locationId, {
        officeHours: { startTime: f.startTime, endTime: f.endTime, graceMinutes: f.graceMinutes, breakMinutes: f.breakMinutes },
        policy: { lateAfterMinutes: f.lateAfterMinutes, halfDayMinutes: f.halfDayMinutes, offSiteCheckIn: f.offSiteCheckIn, absentOnFaceMismatch: f.absentOnFaceMismatch, weeklyOffDays: f.weeklyOffDays },
      });
      toast.success('Site rules saved', `${site.name} now has custom settings.`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error('Could not save', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Custom rules — ${site.name}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={saveSite} loading={busy}>Save site rules</Button>
        </>
      }
    >
      <div className="space-y-4">
        {site.clientName && (
          <p className="rounded-md bg-info/10 p-2.5 text-xs text-info">Client site — {site.clientName}. Days worked here will be scored by these rules.</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Start time</Label>
            <Input type="time" value={f.startTime} onChange={(e) => set('startTime', e.target.value)} />
          </div>
          <div>
            <Label>End time</Label>
            <Input type="time" value={f.endTime} onChange={(e) => set('endTime', e.target.value)} />
          </div>
          <div>
            <Label>Grace (min)</Label>
            <Input type="number" min={0} value={f.graceMinutes} onChange={(e) => set('graceMinutes', Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Break (min)</Label>
            <Input type="number" min={0} value={f.breakMinutes} onChange={(e) => set('breakMinutes', Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Mark late after (min)</Label>
            <Input type="number" min={0} value={f.lateAfterMinutes} onChange={(e) => set('lateAfterMinutes', Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Half-day under (min)</Label>
            <Input type="number" min={0} value={f.halfDayMinutes} onChange={(e) => set('halfDayMinutes', Number(e.target.value) || 0)} />
          </div>
        </div>
        <div>
          <Label>If someone checks in outside this site</Label>
          <Select value={f.offSiteCheckIn} onChange={(e) => set('offSiteCheckIn', e.target.value)}>
            <option value="allowed">Allow it — never flagged</option>
            <option value="flag">Flag it for review</option>
            <option value="absent">Mark the day absent</option>
          </Select>
        </div>
        <Row label="Mark absent when the face doesn’t match" hint="Off: recorded and flagged for review">
          <Switch checked={f.absentOnFaceMismatch} onChange={(v) => set('absentOnFaceMismatch', v)} />
        </Row>
        <div>
          <Label>Weekly off days</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  f.weeklyOffDays.includes(i) ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:text-foreground',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
