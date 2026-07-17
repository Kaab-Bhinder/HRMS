import { useEffect, useState } from 'react';
import { AlertTriangle, Camera } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { attendanceService } from '../../services';
import { fetchBlobUrl } from '../../services/client';
import { formatDate, formatTime } from '../../lib/format';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  present: 'success', late: 'warning', half_day: 'info', absent: 'danger', on_leave: 'info', weekly_off: 'neutral', holiday: 'neutral',
};

function monthBounds(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const from = `${month}-01`;
  const to = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { from, to };
}
function currentMonthValue(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, '0')}`;
}
function fmtHM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Detailed per-employee attendance slip for a chosen month. */
export function AttendanceSlipModal({ open, onClose, employeeId, employeeName }: {
  open: boolean; onClose: () => void; employeeId: string | null; employeeName?: string;
}) {
  const [month, setMonth] = useState(currentMonthValue());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { from, to } = monthBounds(month);
  const { data, loading } = useQuery(
    () => (employeeId ? attendanceService.slip(employeeId, from, to) : Promise.resolve(null)),
    [employeeId, from, to, open],
  );
  if (!employeeId) return null;

  const t = data?.totals;
  return (
    <Modal open={open} onClose={onClose} title="Attendance Slip" size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{data?.employee.name ?? employeeName}</h3>
            <p className="text-sm text-muted-foreground">{data?.employee.employeeCode} · {data?.employee.departmentName ?? '—'}</p>
          </div>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[10rem]" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Days present" value={String(t?.present ?? 0)} />
          <Stat label="Late days" value={String(t?.late ?? 0)} tone={t?.late ? 'warning' : undefined} />
          <Stat label="Absent" value={String(t?.absent ?? 0)} tone={t?.absent ? 'danger' : undefined} />
          <Stat label="Worked" value={`${t?.workedHours ?? 0}h`} />
        </div>

        {loading ? (
          <Skeleton className="h-56" />
        ) : (
          <div className="max-h-96 overflow-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">In</th>
                  <th className="px-3 py-2 font-medium">Out</th>
                  <th className="px-3 py-2 text-right font-medium">Worked</th>
                  <th className="px-3 py-2 text-right font-medium">Late</th>
                  <th className="px-3 py-2 text-right font-medium">Break</th>
                  <th className="px-3 py-2 text-center font-medium">Photo</th>
                  <th className="px-3 py-2 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data?.days ?? []).map((d) => (
                  <tr key={d.workDate} className={d.isFlagged ? 'bg-danger/5' : ''}>
                    <td className="px-3 py-2 text-foreground">{formatDate(d.workDate)}</td>
                    <td className="px-3 py-2"><Badge tone={STATUS_TONE[d.status] ?? 'neutral'}>{d.status.replace('_', ' ')}</Badge></td>
                    <td className="px-3 py-2 tabular-nums text-foreground">{formatTime(d.firstInAt)}</td>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{formatTime(d.lastOutAt)}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{fmtHM(d.workedMinutes)}</td>
                    <td className={`px-3 py-2 text-right font-mono text-xs ${d.lateMinutes ? 'text-warning' : 'text-muted-foreground'}`}>{d.lateMinutes || '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{d.breakMinutes || '—'}</td>
                    <td className="px-3 py-2 text-center"><SelfieThumb captureId={d.selfieCaptureId} onOpen={setLightbox} /></td>
                    <td className="px-3 py-2">
                      {d.isFlagged
                        ? <span title={d.flagReason ?? ''}><Badge tone="danger"><AlertTriangle className="h-3 w-3" /> Flag</Badge></span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
                {!loading && (data?.days.length ?? 0) === 0 && (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">No attendance recorded this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lightbox && <Lightbox captureId={lightbox} onClose={() => setLightbox(null)} />}
    </Modal>
  );
}

/** Small check-in selfie thumbnail; click to enlarge. */
function SelfieThumb({ captureId, onOpen }: { captureId: string | null; onOpen: (id: string) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!captureId) return;
    let alive = true;
    let created: string | null = null;
    fetchBlobUrl(`/attendance/captures/${captureId}/image`).then((u) => { if (alive) { created = u; setUrl(u); } }).catch(() => {});
    return () => { alive = false; if (created) URL.revokeObjectURL(created); };
  }, [captureId]);

  if (!captureId) return <span className="text-muted-foreground">—</span>;
  return url ? (
    <button type="button" onClick={() => onOpen(captureId)} className="mx-auto block h-8 w-8 overflow-hidden rounded-full ring-1 ring-border hover:ring-primary">
      <img src={url} alt="Check-in selfie" className="h-full w-full object-cover" />
    </button>
  ) : (
    <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground"><Camera className="h-3.5 w-3.5" /></span>
  );
}

/** Full-size selfie overlay. */
function Lightbox({ captureId, onClose }: { captureId: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let created: string | null = null;
    fetchBlobUrl(`/attendance/captures/${captureId}/image`).then((u) => { if (alive) { created = u; setUrl(u); } }).catch(() => {});
    return () => { alive = false; if (created) URL.revokeObjectURL(created); };
  }, [captureId]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      {url
        ? <img src={url} alt="Check-in selfie" className="max-h-[80vh] max-w-full rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        : <div className="text-white">Loading…</div>}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warning' | 'danger' }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-semibold ${tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
