import { useEffect, useState } from 'react';
import { Plus, Pencil, MapPin } from 'lucide-react';
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
import { timezoneGroups, DEFAULT_TIMEZONE } from '../../lib/timezones';
import type { OfficeLocationDto } from '../../services';


// Only fields the platform actually consumes. Registration no., fiscal year
// start, locale and default currency were dropped: nothing read them, so they
// were controls that appeared to configure the system and configured nothing.
type GeneralSettings = {
  name: string;
  legalName: string;
  timezone: string;
};

const SEED_GENERAL: GeneralSettings = {
  name: '',
  legalName: '',
  timezone: DEFAULT_TIMEZONE,
};

// Branding was removed rather than wired: the logo was never rendered anywhere
// and the brand colour was labelled "cosmetic preview" because nothing applied
// it. Restore the tab alongside an implementation that actually uses them.
const TABS = [
  { value: 'general', label: 'General' },
  { value: 'locations', label: 'Locations' },
];

export default function OrganizationPage() {
  const [tab, setTab] = useState('general');

  return (
    <div className="space-y-5">
      <PageHeader title="Organization" description="Company profile, offices and branding for your HR workspace." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'general' && <GeneralTab />}
      {tab === 'locations' && <LocationsTab />}
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
    setForm({
      name: org.name ?? '',
      legalName: org.legalName ?? '',
      timezone: org.timezone ?? SEED_GENERAL.timezone,
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
          <Row label="Timezone">
            <Select value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              {timezoneGroups(form.timezone).map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </optgroup>
              ))}
            </Select>
          </Row>
        </div>
        <p className="text-xs text-muted-foreground">
          Timezone drives the working day, late arrivals and auto-checkout across web and mobile.
        </p>
        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={save} loading={saving} disabled={loading}>Save changes</Button>
        </div>
      </CardBody>
    </Card>
  );
}

const EMPTY_LOCATION: OfficeLocationDto = {
  id: '', name: '', address: '', latitude: null, longitude: null,
  radiusMeters: 100, timezone: DEFAULT_TIMEZONE, isActive: true,
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
            <Select value={draft.timezone ?? DEFAULT_TIMEZONE} onChange={(e) => setD('timezone', e.target.value)}>
              {timezoneGroups(draft.timezone).map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </optgroup>
              ))}
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

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
