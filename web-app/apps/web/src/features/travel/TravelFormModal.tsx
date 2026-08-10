import { useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label, Textarea } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Switch';
import { useQuery } from '../../hooks/useQuery';
import { travelService, clientsService, employeesService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { formatNumber } from '../../lib/format';
import { useEmployeeOptions } from '../../hooks/useEmployeeOptions';

const TRANSPORT = [
  { value: 'flight', label: 'Flight' },
  { value: 'train', label: 'Train' },
  { value: 'car', label: 'Car' },
  { value: 'bus', label: 'Bus' },
  { value: 'other', label: 'Other' },
];

/** Step 1 of the spec. Employee details are auto-populated server-side from
 *  the signed-in account, so they are not asked for here. */
export function TravelFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const canSeeClients = usePermission('clients:read');
  const canFileForOthers = usePermission('employees:update');
  const { data: clients } = useQuery(() => (canSeeClients ? clientsService.list() : Promise.resolve(null)), [canSeeClients]);
  const { employees } = useEmployeeOptions();

  const [form, setForm] = useState({
    employeeId: '', destinationCity: '', clientId: '', purpose: '',
    startDate: today, endDate: today, transportation: 'flight', hotelNeeded: false,
    requestedTransport: '', requestedHotel: '', requestedAllowance: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const total = useMemo(
    () => Number(form.requestedTransport || 0) + Number(form.requestedHotel || 0) + Number(form.requestedAllowance || 0),
    [form.requestedTransport, form.requestedHotel, form.requestedAllowance],
  );

  const submit = async (andSubmit: boolean) => {
    const errs: Record<string, string> = {};
    if (!form.destinationCity.trim()) errs.destinationCity = 'Destination is required';
    if (!form.purpose.trim()) errs.purpose = 'Purpose is required';
    if (new Date(form.endDate) < new Date(form.startDate)) errs.endDate = 'Return date cannot be before departure';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const created = await travelService.create({
        ...(form.employeeId ? { employeeId: form.employeeId } : {}),
        destinationCity: form.destinationCity.trim(),
        ...(form.clientId ? { clientId: form.clientId } : {}),
        purpose: form.purpose.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        transportation: form.transportation,
        hotelNeeded: form.hotelNeeded,
        estimatedCost: total,
        requestedTransport: Number(form.requestedTransport || 0),
        requestedHotel: Number(form.requestedHotel || 0),
        requestedAllowance: Number(form.requestedAllowance || 0),
      });
      if (andSubmit) await travelService.submit(created.id);
      toast.success(andSubmit ? 'Request submitted' : 'Draft saved', `${created.reference} · ${created.destinationCity}`);
      onSaved();
    } catch (e) {
      toast.error('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New travel request" description="Your name, ID and department are filled in automatically." size="lg">
      <div className="space-y-4">
        {canFileForOthers && (
          <div>
            <Label>Traveller</Label>
            <Select value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)}>
              <option value="">Myself</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Destination city" required error={errors.destinationCity}>
            <Input value={form.destinationCity} onChange={(e) => set('destinationCity', e.target.value)} placeholder="Surabaya" />
          </Field>
          {canSeeClients && (
            <Field label="Client">
              <Select value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
                <option value="">No client</option>
                {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          )}
        </div>

        <Field label="Purpose" required error={errors.purpose}>
          <Textarea rows={2} value={form.purpose} onChange={(e) => set('purpose', e.target.value)} placeholder="Client review meeting and site visit" />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Departure date"><Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
          <Field label="Return date" error={errors.endDate}><Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Transportation">
            <Select value={form.transportation} onChange={(e) => set('transportation', e.target.value)}>
              {TRANSPORT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          <div className="flex items-end gap-2 pb-2">
            <Checkbox checked={form.hotelNeeded} onChange={(v) => set('hotelNeeded', v)} />
            <span className="text-sm text-foreground">Hotel needed</span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Requested advance (IDR)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Transportation"><Input type="number" min={0} value={form.requestedTransport} onChange={(e) => set('requestedTransport', e.target.value)} placeholder="1000000" /></Field>
            <Field label="Hotel"><Input type="number" min={0} value={form.requestedHotel} onChange={(e) => set('requestedHotel', e.target.value)} placeholder="2000000" /></Field>
            <Field label="Allowance"><Input type="number" min={0} value={form.requestedAllowance} onChange={(e) => set('requestedAllowance', e.target.value)} placeholder="500000" /></Field>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Total advance requested: <span className="font-semibold text-foreground">IDR {formatNumber(total)}</span>
            <span className="ml-2 text-xs">Finance may approve, adjust or reduce this.</span>
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="outline" onClick={() => void submit(false)} disabled={saving}>Save draft</Button>
          <Button onClick={() => void submit(true)} disabled={saving}>{saving ? 'Saving…' : 'Submit for approval'}</Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}{required && <span className="text-danger"> *</span>}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
