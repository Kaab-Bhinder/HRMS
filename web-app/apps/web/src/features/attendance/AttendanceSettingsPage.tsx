import { useEffect, useState } from 'react';
import { Clock, MapPin, ShieldCheck, CalendarDays, Save, Coffee, Info, Globe } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input, Select, Label } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/feedback/States';
import { HolidayCalendar } from './HolidayCalendar';
import { useQuery } from '../../hooks/useQuery';
import { attendanceService, type AttendanceSettings } from '../../services';
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
  const { data, loading, refetch } = useQuery(() => attendanceService.settings(), []);
  const [form, setForm] = useState<AttendanceSettings | null>(null);
  const [saving, setSaving] = useState(false);

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
      await attendanceService.updateSettings(form);
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
            <Row label="Enforce geofence" hint="Flag check-ins outside the office radius">
              <Switch checked={form.policy.enforceGeofence} onChange={(v) => set('policy', 'enforceGeofence', v)} />
            </Row>
            <Row label="Allow remote check-in" hint="If on, out-of-range check-ins are NOT flagged">
              <Switch checked={form.policy.allowRemote} onChange={(v) => set('policy', 'allowRemote', v)} />
            </Row>
            <div>
              <Label htmlFor="track">Live-location interval (sec)</Label>
              <Input id="track" type="number" min={30} value={form.policy.trackingIntervalSec} onChange={(e) => set('policy', 'trackingIntervalSec', num(e.target.value))} />
            </div>
          </CardBody>
        </Card>

        {/* Office location */}
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Office location & geofence</span>} description="Employees must check in within this radius" />
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="offName">Office name</Label>
              <Input id="offName" value={form.office.name} onChange={(e) => set('office', 'name', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="offAddr">Address</Label>
              <Input id="offAddr" value={form.office.address ?? ''} onChange={(e) => set('office', 'address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" type="number" step="any" value={form.office.latitude ?? ''} onChange={(e) => set('office', 'latitude', e.target.value === '' ? null : Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" type="number" step="any" value={form.office.longitude ?? ''} onChange={(e) => set('office', 'longitude', e.target.value === '' ? null : Number(e.target.value))} />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">Geofence radius (meters)</Label>
              <Input id="radius" type="number" min={20} value={form.office.radiusMeters} onChange={(e) => set('office', 'radiusMeters', num(e.target.value))} />
            </div>
            <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>A visual map picker (drop a pin to set these coordinates) turns on once the Google Maps key is added. For now, paste the office coordinates — e.g. from Google Maps “right-click → copy coordinates”.</span>
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
    </div>
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
