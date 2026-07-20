import { useEffect, useState } from 'react';
import { Plus, Pencil, Building2, MapPin, Upload, Check, Globe } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Label } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { useToast } from '../../store/toast';
import { useAuth } from '../../store/auth';
import { useQuery } from '../../hooks/useQuery';
import { organizationService, locationsService } from '../../services';
import type { OfficeLocationDto } from '../../services';

const TIMEZONES = ['Asia/Karachi', 'Asia/Dubai', 'Asia/Riyadh', 'Europe/London', 'America/New_York', 'UTC'];
const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' },
  { value: 'ar', label: 'Arabic' },
];
const CURRENCIES = [
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'GBP', label: 'GBP — Pound Sterling' },
];
const FISCAL_STARTS = [
  { value: '01-01', label: 'January (Calendar year)' },
  { value: '07-01', label: 'July (FY Jul–Jun)' },
  { value: '04-01', label: 'April' },
];
const BRAND_COLORS = ['#2563eb', '#0ea5e9', '#059669', '#7c3aed', '#dc2626', '#d97706', '#0f766e', '#db2777'];

type GeneralSettings = {
  name: string;
  legalName: string;
  registrationNo: string;
  timezone: string;
  locale: string;
  currency: string;
  fiscalYearStart: string;
};

const SEED_GENERAL: GeneralSettings = {
  name: 'Acme Bank Ltd',
  legalName: 'Acme Bank Limited',
  registrationNo: 'SECP-0098231-4',
  timezone: 'Asia/Karachi',
  locale: 'en',
  currency: 'PKR',
  fiscalYearStart: '07-01',
};

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'locations', label: 'Locations' },
  { value: 'branding', label: 'Branding' },
];

export default function OrganizationPage() {
  const [tab, setTab] = useState('general');

  return (
    <div className="space-y-5">
      <PageHeader title="Organization" description="Company profile, offices and branding for your HR workspace." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'general' && <GeneralTab />}
      {tab === 'locations' && <LocationsTab />}
      {tab === 'branding' && <BrandingTab />}
    </div>
  );
}

function GeneralTab() {
  const toast = useToast();
  const { user } = useAuth();
  const { data: org, loading, error, refetch } = useQuery(() => organizationService.current(), []);
  const [form, setForm] = useState<GeneralSettings>(SEED_GENERAL);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof GeneralSettings>(k: K, v: GeneralSettings[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Populate from the API once it arrives. SEED_GENERAL is only the shape
  // placeholder for the first render — anything the organization has not set
  // falls back to it rather than rendering blank inputs.
  useEffect(() => {
    if (!org) return;
    const s = (org.settings ?? {}) as Record<string, string | undefined>;
    setForm({
      name: org.name ?? '',
      legalName: org.legalName ?? '',
      registrationNo: s.registrationNo ?? '',
      timezone: org.timezone ?? SEED_GENERAL.timezone,
      locale: org.locale ?? SEED_GENERAL.locale,
      currency: org.currency ?? SEED_GENERAL.currency,
      fiscalYearStart: s.fiscalYearStart ?? SEED_GENERAL.fiscalYearStart,
    });
  }, [org]);

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name required', 'The organization needs a name.');
      return;
    }
    setSaving(true);
    try {
      await organizationService.update(form, org?.settings);
      refetch();
      toast.success('Settings saved', `${form.name} was updated${user ? ` by ${user.fullName}` : ''}.`);
    } catch (e: any) {
      // Surface the real reason: a silent failure here previously looked like
      // success, which is how this page shipped without anyone noticing it
      // never saved.
      toast.error('Could not save', e?.message ?? 'The organization was not updated.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="General settings" description="Core identity and localization defaults applied across the platform." />
      <CardBody className="space-y-5">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
            Couldn’t load the organization: {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Row label="Organization name" required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Row>
          <Row label="Legal name">
            <Input value={form.legalName} onChange={(e) => set('legalName', e.target.value)} />
          </Row>
          <Row label="Registration no.">
            <Input value={form.registrationNo} onChange={(e) => set('registrationNo', e.target.value)} className="font-mono" />
          </Row>
          <Row label="Fiscal year start">
            <Select value={form.fiscalYearStart} onChange={(e) => set('fiscalYearStart', e.target.value)}>
              {FISCAL_STARTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
          </Row>
          <Row label="Timezone">
            <Select value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Row>
          <Row label="Locale">
            <Select value={form.locale} onChange={(e) => set('locale', e.target.value)}>
              {LOCALES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
          </Row>
          <Row label="Default currency">
            <Select value={form.currency} onChange={(e) => set('currency', e.target.value)}>
              {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Row>
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={save} loading={saving} disabled={loading}>Save changes</Button>
        </div>
      </CardBody>
    </Card>
  );
}

const EMPTY_LOCATION: OfficeLocationDto = {
  id: '', name: '', address: '', latitude: null, longitude: null,
  radiusMeters: 100, timezone: 'Asia/Karachi', isActive: true,
};

function LocationsTab() {
  const toast = useToast();
  const { data, loading, error, refetch } = useQuery(() => locationsService.list(), []);
  const locations = data ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OfficeLocationDto | null>(null);
  const [draft, setDraft] = useState<OfficeLocationDto>(EMPTY_LOCATION);
  const [busy, setBusy] = useState(false);

  const openAdd = () => { setEditing(null); setDraft(EMPTY_LOCATION); setModalOpen(true); };
  const openEdit = (loc: OfficeLocationDto) => { setEditing(loc); setDraft(loc); setModalOpen(true); };

  const toggleActive = async (loc: OfficeLocationDto, isActive: boolean) => {
    try {
      await locationsService.update(loc.id, { isActive });
      refetch();
      toast.success(isActive ? 'Location activated' : 'Location deactivated', loc.name);
    } catch (e: any) {
      toast.error('Could not update', e?.message ?? 'The location was not changed.');
    }
  };

  const saveDraft = async () => {
    if (!draft.name.trim()) { toast.error('Name required', 'Give the location a name.'); return; }
    // Coordinates are what makes the geofence work at all — a location without
    // them accepts check-ins from anywhere, which silently defeats the point.
    const hasCoords = draft.latitude != null && draft.longitude != null;
    if (!hasCoords && draft.isActive) {
      toast.error('Coordinates required', 'An active location needs latitude and longitude, or its geofence cannot be enforced.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await locationsService.update(editing.id, draft);
        toast.success('Location updated', `${draft.name} was saved.`);
      } else {
        await locationsService.create(draft);
        toast.success('Location added', `${draft.name} is now available for attendance.`);
      }
      refetch();
      setModalOpen(false);
    } catch (e: any) {
      toast.error('Could not save', e?.message ?? 'The location was not saved.');
    } finally {
      setBusy(false);
    }
  };

  const setD = <K extends keyof OfficeLocationDto>(k: K, v: OfficeLocationDto[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Empty string must become null, not 0 — 0,0 is a real place in the Atlantic.
  const num = (v: string): number | null => (v.trim() === '' ? null : Number(v));

  return (
    <Card>
      <CardHeader
        title="Office locations"
        description="Sites used for geofenced check-in and attendance."
        action={<Button variant="outline" size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Add location</Button>}
      />
      <CardBody className="p-0">
        {error && (
          <div className="m-5 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
            Couldn’t load locations: {error}
          </div>
        )}
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : locations.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No locations yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {locations.map((loc) => {
              const hasCoords = loc.latitude != null && loc.longitude != null;
              return (
                <li key={loc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">{loc.name}</span>
                      <Badge tone={loc.isActive ? 'success' : 'neutral'} dot>{loc.isActive ? 'Active' : 'Inactive'}</Badge>
                      {!hasCoords && <Badge tone="warning">No geofence</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {loc.address || 'No address'}
                      {hasCoords && ` · ${Number(loc.latitude).toFixed(5)}, ${Number(loc.longitude).toFixed(5)}`}
                    </p>
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <p>Geofence {loc.radiusMeters ?? 0} m</p>
                    <p>{loc.timezone || '—'}</p>
                  </div>
                  <Switch checked={!!loc.isActive} onChange={(v) => toggleActive(loc, v)} label={`Toggle ${loc.name}`} />
                  <Button variant="ghost" size="icon" aria-label="Edit location" onClick={() => openEdit(loc)}><Pencil className="h-4 w-4" /></Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="md"
        title={editing ? 'Edit location' : 'Add location'}
        description="Attendance is geofenced within the configured radius."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={saveDraft} loading={busy}>{editing ? 'Save changes' : 'Add location'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Row label="Location name" required><Input value={draft.name} onChange={(e) => setD('name', e.target.value)} placeholder="e.g. Jakarta Head Office" /></Row>
          </div>
          <div className="sm:col-span-2">
            <Row label="Address"><Input value={draft.address ?? ''} onChange={(e) => setD('address', e.target.value)} /></Row>
          </div>
          <Row label="Latitude" required>
            <Input type="number" step="any" value={draft.latitude ?? ''} placeholder="-6.20876"
              onChange={(e) => setD('latitude', num(e.target.value))} className="font-mono" />
          </Row>
          <Row label="Longitude" required>
            <Input type="number" step="any" value={draft.longitude ?? ''} placeholder="106.84560"
              onChange={(e) => setD('longitude', num(e.target.value))} className="font-mono" />
          </Row>
          <div className="sm:col-span-2 -mt-1">
            <p className="text-xs text-muted-foreground">
              Right-click the office in Google Maps and choose the coordinates to copy them.
            </p>
          </div>
          <Row label="Geofence radius (m)">
            <Input type="number" min={0} value={draft.radiusMeters ?? 0} onChange={(e) => setD('radiusMeters', Number(e.target.value))} />
          </Row>
          <Row label="Timezone">
            <Select value={draft.timezone ?? 'Asia/Karachi'} onChange={(e) => setD('timezone', e.target.value)}>
              {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Row>
          <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-border bg-surface-2/40 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">Allow check-ins at this location.</p>
            </div>
            <Switch checked={!!draft.isActive} onChange={(v) => setD('isActive', v)} label="Active" />
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function BrandingTab() {
  const toast = useToast();
  const [primary, setPrimary] = useState(BRAND_COLORS[0]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Logo" description="Displayed in the sidebar, emails and PDF reports." />
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Acme Bank Ltd</p>
              <p className="text-xs text-muted-foreground">PNG or SVG, at least 256×256px, max 2 MB.</p>
              <Button variant="outline" size="sm" onClick={() => toast.success('Logo uploaded', 'Your new logo is now live.')}>
                <Upload className="h-4 w-4" /> Upload logo
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Brand color" description="Used for primary buttons, links and highlights (cosmetic preview)." />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            {BRAND_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPrimary(c)}
                aria-label={`Select ${c}`}
                className="relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition"
                style={{ backgroundColor: c, boxShadow: primary === c ? `0 0 0 2px ${c}` : undefined }}
              >
                {primary === c && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/40 p-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Preview</span>
            <span className="rounded-md px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: primary }}>Primary button</span>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => toast.success('Branding saved', 'Your brand color was updated.')}>Save branding</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
