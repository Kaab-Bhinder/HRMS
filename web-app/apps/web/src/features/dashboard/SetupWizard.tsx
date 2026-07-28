import { useEffect, useState } from 'react';
import { Building2, Clock3, Wallet } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select, Label } from '../../components/ui/Input';
import { useQuery } from '../../hooks/useQuery';
import { usePermission } from '../../store/auth';
import { useToast } from '../../store/toast';
import { employeesService, organizationService } from '../../services';
import { timezoneGroups } from '../../lib/timezones';

/**
 * First-run setup. Shown once, to an admin, on a fresh workspace — the moment
 * to make the ONE decision that shapes everything downstream: the pay model.
 * Saving stamps `settings.setupCompleted`, so the wizard never reappears; the
 * same choices stay editable later under Organization → General.
 *
 * Deliberately three fields, not a five-step tour: pay model (the decision),
 * currency (formats every money figure), timezone (drives the working day).
 */
const CURRENCIES = ['IDR', 'USD', 'PKR', 'EUR', 'GBP', 'SGD', 'MYR', 'AUD', 'INR', 'AED'];

export function SetupWizard() {
  const canManage = usePermission('organizations:update');
  const { data: org, refetch } = useQuery(() => organizationService.current(), []);
  // A workspace with employees is obviously not a first run — never greet it,
  // even if it predates the wizard and lacks the setupCompleted flag.
  const { data: emps } = useQuery(() => employeesService.list({ limit: 1 }), []);
  const [dismissed, setDismissed] = useState(false);
  const [payModel, setPayModel] = useState<'monthly' | 'hourly'>('monthly');
  const [currency, setCurrency] = useState('IDR');
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Prefill from whatever the org already has, so finishing setup never
  // silently overwrites values someone configured by hand.
  useEffect(() => {
    if (!org) return;
    if (org.defaultCompensationType) setPayModel(org.defaultCompensationType);
    if (org.currency) setCurrency(org.currency);
    if (org.timezone) setTimezone(org.timezone);
  }, [org]);

  const isFreshWorkspace = !!emps && emps.meta.total === 0;
  const open =
    !!org &&
    (org.settings as Record<string, unknown> | null)?.setupCompleted !== true &&
    isFreshWorkspace &&
    canManage &&
    !dismissed;
  if (!open) return null;

  const finish = async () => {
    setSaving(true);
    try {
      await organizationService.update(
        { currency, timezone, defaultCompensationType: payModel, setupCompleted: true },
        org?.settings,
      );
      toast.success('Workspace ready', `Pay model: ${payModel === 'monthly' ? 'monthly salary' : 'hourly'} · ${currency}`);
      refetch();
      setDismissed(true);
    } catch (e) {
      toast.error('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={() => setDismissed(true)} title={`Welcome to ${org?.name ?? 'your workspace'}`} size="md">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Before you add your first employee, tell us how your organization pays people. New employees inherit this — you can still override it per person, and change any of it later in Organization settings.
        </p>

        <div>
          <Label required>How do you pay your team?</Label>
          <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPayModel('monthly')}
              className={`rounded-lg border p-4 text-left transition-colors ${payModel === 'monthly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40'}`}
            >
              <Wallet className={`mb-2 h-5 w-5 ${payModel === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-foreground">Monthly salary</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Fixed basic salary; only unpaid leave deducts. Banks & offices.</p>
            </button>
            <button
              type="button"
              onClick={() => setPayModel('hourly')}
              className={`rounded-lg border p-4 text-left transition-colors ${payModel === 'hourly' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40'}`}
            >
              <Clock3 className={`mb-2 h-5 w-5 ${payModel === 'hourly' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-foreground">Hourly</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Pay follows verified attendance hours. Retail & field staff.</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label>Currency</Label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {(CURRENCIES.includes(currency) ? CURRENCIES : [currency, ...CURRENCIES]).map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Timezone</Label>
            <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {timezoneGroups(timezone).map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </optgroup>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Next: add departments and your first employees.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setDismissed(true)}>Skip for now</Button>
            <Button loading={saving} onClick={finish}>Finish setup</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
