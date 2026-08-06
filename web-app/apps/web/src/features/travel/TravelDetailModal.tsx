import { useState } from 'react';
import { Check, X, Paperclip, Plus, Trash2, Upload } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select, Label, Textarea } from '../../components/ui/Input';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { travelService, filesService, organizationService } from '../../services';
import { downloadFile } from '../../services/client';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { formatNumber, formatDate } from '../../lib/format';
import type { TravelRequest } from '../../lib/types';
import { TravelStatusBadge } from './TravelStatusBadge';

/**
 * The whole workflow in one place. Which panel is actionable depends on the
 * request's stage and the viewer's role, so a traveller never sees finance
 * controls and finance is never asked to file someone else's report.
 */
export function TravelDetailModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const isFinance = usePermission('payroll:create');
  const [version, setVersion] = useState(0);
  const { data: req, loading } = useQuery(() => travelService.get(id), [id, version]);
  const [busy, setBusy] = useState(false);

  const refresh = () => { setVersion((v) => v + 1); onChanged(); };
  const act = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    try { await fn(); toast.success(okMsg); refresh(); }
    catch (e) { toast.error('Action failed', (e as Error).message); }
    finally { setBusy(false); }
  };

  if (loading || !req) {
    return <Modal open onClose={onClose} title="Travel request" size="xl"><Skeleton className="h-64 w-full" /></Modal>;
  }

  const pendingStep = req.approvals?.find((s) => s.status === 'pending');

  return (
    <Modal open onClose={onClose} size="xl"
      title={`${req.reference} · ${req.destinationCity}`}
      description={`${req.employeeName} · ${req.departmentName}`}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <TravelStatusBadge status={req.status} />
          <span className="text-sm text-muted-foreground">
            {formatDate(req.startDate)} → {formatDate(req.endDate)} · {req.durationDays} day{req.durationDays === 1 ? '' : 's'}
          </span>
          {req.clientName && <span className="text-sm text-muted-foreground">· {req.clientName}</span>}
        </div>

        <Section title="Purpose"><p className="text-sm text-foreground">{req.purpose}</p></Section>

        {/* STEP 2 — approval chain */}
        {!!req.approvals?.length && (
          <Section title="Approval workflow">
            <ol className="space-y-2">
              {req.approvals.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    s.status === 'approved' ? 'bg-success/15 text-success'
                      : s.status === 'rejected' ? 'bg-danger/15 text-danger'
                        : 'bg-surface-2 text-muted-foreground',
                  ].join(' ')}>{i + 1}</span>
                  <span className="flex-1 text-foreground">
                    {['Supervisor', 'Department Head', 'Finance'][i] ?? `Step ${i + 1}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.status === 'pending' ? 'Waiting' : `${s.status}${s.actedAt ? ` · ${formatDate(s.actedAt)}` : ''}`}
                  </span>
                </li>
              ))}
            </ol>
            {pendingStep && req.status === 'submitted' && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" disabled={busy}
                  onClick={() => act(() => travelService.approve(req.id, pendingStep.id), 'Approved')}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="outline" disabled={busy}
                  onClick={() => act(() => travelService.reject(req.id, pendingStep.id), 'Rejected')}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
                <span className="self-center text-xs text-muted-foreground">Only the current step can act.</span>
              </div>
            )}
          </Section>
        )}

        {req.status === 'draft' && (
          <Button size="sm" disabled={busy} onClick={() => act(() => travelService.submit(req.id), 'Submitted for approval')}>
            Submit for approval
          </Button>
        )}

        {/* STEP 3 — advance */}
        <Section title="Travel advance">
          <Money rows={[
            ['Transportation', req.requestedTransport, req.approvedTransport],
            ['Hotel', req.requestedHotel, req.approvedHotel],
            ['Allowance', req.requestedAllowance, req.approvedAllowance],
          ]} totals={[req.requestedTotal, req.advanceTotal]} />
          {req.advancePaidAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Paid {formatDate(req.advancePaidAt)}{req.advancePaymentRef ? ` · ref ${req.advancePaymentRef}` : ''}
            </p>
          )}
          {isFinance && req.status === 'approved' && (
            <AdvancePanel req={req} busy={busy} act={act} />
          )}
        </Section>

        {/* STEP 4 — realization */}
        {(req.status === 'advance_paid' || req.status === 'approved') && (
          <RealizationPanel req={req} busy={busy} act={act} />
        )}

        {req.realizationSubmittedAt && (
          <Section title="Accountability report">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Fact label="Actual departure" value={req.actualDepartureDate ? formatDate(req.actualDepartureDate) : '—'} />
              <Fact label="Actual return" value={req.actualReturnDate ? formatDate(req.actualReturnDate) : '—'} />
              <Fact label="Transport used" value={req.transportUsed || '—'} />
              <Fact label="Hotel used" value={req.hotelUsed || '—'} />
            </div>
            <div className="mt-3">
              <Money rows={[
                ['Transportation', req.approvedTransport, req.actualTransport],
                ['Hotel', req.approvedHotel, req.actualHotel],
                ['Allowance', req.approvedAllowance, req.actualAllowance],
              ]} totals={[req.advanceTotal, req.actualTotal]} headers={['Advance', 'Actual']} />
            </div>
            {!!req.activities.length && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-foreground">Activity log</p>
                {groupByDate(req.activities).map(([date, items]) => (
                  <div key={date} className="mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{formatDate(date)}</p>
                    <ul className="mt-1 space-y-1">
                      {items.map((a) => (
                        <li key={a.id} className="flex gap-3 text-sm">
                          <span className="w-12 shrink-0 tabular-nums text-muted-foreground">{a.timeLabel}</span>
                          <span className="text-foreground">{a.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <EvidenceList req={req} busy={busy} act={act} />
          </Section>
        )}

        {/* STEP 5 — verification & settlement */}
        {isFinance && req.status === 'realization_submitted' && <VerifyPanel req={req} busy={busy} act={act} />}

        {req.verifiedAt && (
          <Section title="Finance verification">
            <p className="text-sm text-foreground">
              {req.verification === 'approved' ? 'Approved' : req.verification === 'partially_approved' ? 'Partially approved' : 'Rejected'}
              {req.verifiedAmount != null && <> · allowed <strong>IDR {formatNumber(req.verifiedAmount)}</strong></>}
            </p>
            {req.verificationNote && <p className="mt-1 text-sm text-muted-foreground">{req.verificationNote}</p>}
            {req.settlementAmount != null && req.settlementAmount !== 0 && (
              <p className="mt-2 text-sm">
                {req.settlementAmount > 0
                  ? <span className="text-success">Company owes the traveller IDR {formatNumber(req.settlementAmount)}</span>
                  : <span className="text-warning">Traveller returns IDR {formatNumber(Math.abs(req.settlementAmount))}</span>}
              </p>
            )}
            {req.settlementPaidAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Settled {formatDate(req.settlementPaidAt)}{req.settlementPaymentRef ? ` · ref ${req.settlementPaymentRef}` : ''}
              </p>
            )}
            {isFinance && req.status === 'verified' && (
              <PaymentPanel label="Record settlement" busy={busy}
                onSubmit={(p) => act(() => travelService.settle(req.id, p), 'Settlement recorded')} />
            )}
          </Section>
        )}
      </div>
    </Modal>
  );
}

// --- panels ---------------------------------------------------------------

function AdvancePanel({ req, busy, act }: PanelProps) {
  const [t, setT] = useState(String(req.requestedTransport ?? 0));
  const [h, setH] = useState(String(req.requestedHotel ?? 0));
  const [a, setA] = useState(String(req.requestedAllowance ?? 0));
  const [note, setNote] = useState('');
  const [paying, setPaying] = useState(false);
  return (
    <div className="mt-3 rounded-lg border border-border p-3">
      <p className="mb-2 text-sm font-medium text-foreground">Set the advance to release</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div><Label>Transportation</Label><Input type="number" min={0} value={t} onChange={(e) => setT(e.target.value)} /></div>
        <div><Label>Hotel</Label><Input type="number" min={0} value={h} onChange={(e) => setH(e.target.value)} /></div>
        <div><Label>Allowance</Label><Input type="number" min={0} value={a} onChange={(e) => setA(e.target.value)} /></div>
      </div>
      <div className="mt-2"><Label>Note</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for any reduction" /></div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy}
          onClick={() => act(() => travelService.setAdvance(req.id, { transport: Number(t), hotel: Number(h), allowance: Number(a), note }), 'Advance set')}>
          Save advance
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setPaying((v) => !v)}>Record payment</Button>
      </div>
      {paying && <PaymentPanel label="Record advance payment" busy={busy}
        onSubmit={(p) => act(() => travelService.payAdvance(req.id, p), 'Advance paid')} />}
    </div>
  );
}

function RealizationPanel({ req, busy, act }: PanelProps) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    actualDepartureDate: req.startDate.slice(0, 10),
    actualReturnDate: req.endDate.slice(0, 10),
    transportUsed: '', hotelUsed: '',
    actualTransport: String(req.approvedTransport ?? 0),
    actualHotel: String(req.approvedHotel ?? 0),
    actualAllowance: String(req.approvedAllowance ?? 0),
    note: '',
  });
  const [acts, setActs] = useState<{ date: string; time: string; description: string }[]>([]);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  if (!open) {
    return <Button size="sm" onClick={() => setOpen(true)}>File accountability report</Button>;
  }
  return (
    <Section title="File the accountability report">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><Label>Actual departure</Label><Input type="date" value={f.actualDepartureDate} onChange={(e) => set('actualDepartureDate', e.target.value)} /></div>
        <div><Label>Actual return</Label><Input type="date" value={f.actualReturnDate} onChange={(e) => set('actualReturnDate', e.target.value)} /></div>
        <div><Label>Transportation used</Label><Input value={f.transportUsed} onChange={(e) => set('transportUsed', e.target.value)} placeholder="Garuda Indonesia" /></div>
        <div><Label>Hotel used</Label><Input value={f.hotelUsed} onChange={(e) => set('hotelUsed', e.target.value)} placeholder="Harris Hotel" /></div>
      </div>
      <p className="mt-4 mb-2 text-sm font-medium text-foreground">Actual spend (IDR)</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div><Label>Transportation</Label><Input type="number" min={0} value={f.actualTransport} onChange={(e) => set('actualTransport', e.target.value)} /></div>
        <div><Label>Hotel</Label><Input type="number" min={0} value={f.actualHotel} onChange={(e) => set('actualHotel', e.target.value)} /></div>
        <div><Label>Allowance</Label><Input type="number" min={0} value={f.actualAllowance} onChange={(e) => set('actualAllowance', e.target.value)} /></div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Activity log</p>
          <Button size="sm" variant="outline"
            onClick={() => setActs((a) => [...a, { date: f.actualDepartureDate, time: '09:00', description: '' }])}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {acts.map((a, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <Input type="date" className="w-40" value={a.date} onChange={(e) => setActs((p) => p.map((x, j) => j === i ? { ...x, date: e.target.value } : x))} />
            <Input className="w-24" value={a.time} onChange={(e) => setActs((p) => p.map((x, j) => j === i ? { ...x, time: e.target.value } : x))} placeholder="08:00" />
            <Input className="flex-1" value={a.description} onChange={(e) => setActs((p) => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} placeholder="Meeting with Client HR Team" />
            <Button size="icon" variant="ghost" onClick={() => setActs((p) => p.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>

      <div className="mt-3"><Label>Note</Label><Textarea rows={2} value={f.note} onChange={(e) => set('note', e.target.value)} /></div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" disabled={busy} onClick={() => act(() => travelService.submitRealization(req.id, {
          ...f,
          actualTransport: Number(f.actualTransport), actualHotel: Number(f.actualHotel), actualAllowance: Number(f.actualAllowance),
          activities: acts.filter((a) => a.description.trim()),
        }), 'Report submitted')}>Submit report</Button>
      </div>
    </Section>
  );
}

function VerifyPanel({ req, busy, act }: PanelProps) {
  const [result, setResult] = useState('approved');
  const [amount, setAmount] = useState(String(req.actualTotal ?? 0));
  const [note, setNote] = useState('');
  const advance = req.advanceTotal ?? 0;
  const allowed = result === 'rejected' ? 0 : Number(amount || 0);
  const settlement = allowed - advance;
  return (
    <Section title="Finance verification">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Decision</Label>
          <Select value={result} onChange={(e) => setResult(e.target.value)}>
            <option value="approved">Approved</option>
            <option value="partially_approved">Partially approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
        {result !== 'rejected' && (
          <div>
            <Label>Amount allowed (IDR)</Label>
            <Input type="number" min={0} max={req.actualTotal} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        )}
      </div>
      <div className="mt-2"><Label>Note</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for any reduction" /></div>
      <p className="mt-3 text-sm text-muted-foreground">
        Claimed IDR {formatNumber(req.actualTotal)} · advance IDR {formatNumber(advance)} →{' '}
        {settlement === 0 ? <span className="text-foreground">nothing to settle</span>
          : settlement > 0 ? <span className="text-success">reimburse IDR {formatNumber(settlement)}</span>
            : <span className="text-warning">recover IDR {formatNumber(Math.abs(settlement))}</span>}
      </p>
      <Button className="mt-3" size="sm" disabled={busy}
        onClick={() => act(() => travelService.verify(req.id, {
          result,
          ...(result === 'rejected' ? {} : { verifiedAmount: Number(amount || 0) }),
          note,
        }), 'Report verified')}>Verify report</Button>
    </Section>
  );
}

function PaymentPanel({ label, busy, onSubmit }: { label: string; busy: boolean; onSubmit: (p: Record<string, string>) => void }) {
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  return (
    <div className="mt-3 rounded-lg border border-border p-3">
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div><Label>Date paid</Label><Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} /></div>
        <div><Label>Reference</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transfer / voucher no." /></div>
      </div>
      <Button className="mt-3" size="sm" disabled={busy} onClick={() => onSubmit({ paidAt, reference })}>Confirm payment</Button>
    </div>
  );
}

function EvidenceList({ req, busy, act }: PanelProps) {
  const toast = useToast();
  const { data: org } = useQuery(() => organizationService.current(), []);
  const [uploading, setUploading] = useState(false);

  const upload = async (file?: File) => {
    if (!file || !org?.id) return;
    setUploading(true);
    try {
      const att = await filesService.upload('organization', org.id, file);
      await travelService.addEvidence(req.id, att.id, file.name);
      toast.success('Evidence attached', file.name);
      act(async () => {}, 'Evidence attached');
    } catch (e) {
      toast.error('Upload failed', (e as Error).message);
    } finally { setUploading(false); }
  };

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-foreground">Supporting documents</p>
      {req.evidence.length === 0 && <p className="text-sm text-muted-foreground">Nothing attached yet.</p>}
      <ul className="space-y-1">
        {req.evidence.map((e) => (
          <li key={e.id} className="flex items-center gap-2 text-sm">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            <button type="button" className="flex-1 truncate text-left text-primary hover:underline"
              onClick={() => downloadFile(`/files/${e.fileId}/download`, e.caption || 'document')}>
              {e.caption || 'Document'}
            </button>
            <Button size="icon" variant="ghost" disabled={busy}
              onClick={() => act(() => travelService.removeEvidence(req.id, e.id), 'Removed')}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-surface-2">
        {uploading ? <Upload className="h-4 w-4 animate-pulse" /> : <Upload className="h-4 w-4" />}
        {uploading ? 'Uploading…' : 'Attach document'}
        <input type="file" className="hidden" accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={(e) => void upload(e.target.files?.[0] ?? undefined)} />
      </label>
      <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, JPG or PNG — photos, attendance lists, minutes of meeting.</p>
    </div>
  );
}

// --- small pieces ---------------------------------------------------------

interface PanelProps {
  req: TravelRequest;
  busy: boolean;
  act: (fn: () => Promise<unknown>, okMsg: string) => Promise<void>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm text-foreground">{value}</p></div>;
}

function Money({ rows, totals, headers = ['Requested', 'Approved'] }: {
  rows: [string, number, number][]; totals: [number, number]; headers?: [string, string] | string[];
}) {
  return (
    <table className="w-full text-sm">
      <thead className="text-xs uppercase tracking-wide text-muted-foreground">
        <tr><th className="py-1 text-left">Item</th><th className="py-1 text-right">{headers[0]}</th><th className="py-1 text-right">{headers[1]}</th></tr>
      </thead>
      <tbody>
        {rows.map(([label, a, b]) => (
          <tr key={label} className="border-t border-border/60">
            <td className="py-1.5 text-foreground">{label}</td>
            <td className="py-1.5 text-right tabular-nums text-muted-foreground">{formatNumber(a ?? 0)}</td>
            <td className="py-1.5 text-right tabular-nums text-foreground">{formatNumber(b ?? 0)}</td>
          </tr>
        ))}
        <tr className="border-t border-border font-semibold">
          <td className="py-1.5 text-foreground">Total</td>
          <td className="py-1.5 text-right tabular-nums text-muted-foreground">{formatNumber(totals[0] ?? 0)}</td>
          <td className="py-1.5 text-right tabular-nums text-foreground">{formatNumber(totals[1] ?? 0)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function groupByDate(items: TravelRequest['activities']): [string, TravelRequest['activities']][] {
  const map = new Map<string, TravelRequest['activities']>();
  for (const a of items) {
    const k = a.activityDate.slice(0, 10);
    map.set(k, [...(map.get(k) ?? []), a]);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
