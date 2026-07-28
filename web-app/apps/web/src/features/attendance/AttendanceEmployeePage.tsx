import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UserCheck, Clock, UserX, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/charts/StatCard';
import { Skeleton, EmptyState } from '../../components/feedback/States';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { useQuery } from '../../hooks/useQuery';
import { usePermission } from '../../store/auth';
import { useToast } from '../../store/toast';
import { attendanceService, type AttendanceSlipDay } from '../../services';
import { formatDate, formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';

/**
 * One employee's attendance, day by day, for a month — the drill-down behind
 * the org-wide scorecard. Filter chips slice the log (present/late/absent/
 * on-leave/flagged) client-side: a month is ≤31 rows, no server round-trip
 * needed. Flag review lives here too, next to the day it concerns.
 */

type Chip = 'all' | 'present' | 'late' | 'absent' | 'on_leave' | 'flagged';

const CHIPS: { key: Chip; label: string }[] = [
  { key: 'all', label: 'All days' },
  { key: 'present', label: 'Present' },
  { key: 'late', label: 'Late' },
  { key: 'absent', label: 'Absent' },
  { key: 'on_leave', label: 'On leave' },
  { key: 'flagged', label: 'Flagged' },
];

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthBounds(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}

function fmtHM(min: number): string {
  const h = Math.floor(min / 60);
  return h ? `${h}h ${min % 60}m` : `${min}m`;
}

export default function AttendanceEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const canResolve = usePermission('attendance:update');

  const [month, setMonth] = useState(currentMonthValue());
  const [chip, setChip] = useState<Chip>('all');
  const { from, to } = useMemo(() => monthBounds(month), [month]);

  const { data: slip, loading, error, refetch } = useQuery(
    () => (id ? attendanceService.slip(id, from, to) : Promise.resolve(null)),
    [id, from, to],
  );

  const days = useMemo(() => {
    const all = slip?.days ?? [];
    if (chip === 'all') return all;
    if (chip === 'flagged') return all.filter((d) => d.isFlagged);
    if (chip === 'present') return all.filter((d) => ['present', 'late', 'half_day'].includes(d.status));
    return all.filter((d) => d.status === chip);
  }, [slip, chip]);

  // Flag review (same action as before, now living next to the day it concerns)
  const [toReview, setToReview] = useState<AttendanceSlipDay | null>(null);
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const resolveFlag = async () => {
    if (!toReview) return;
    setResolving(true);
    try {
      await attendanceService.resolveFlag(toReview.id, note.trim() || undefined);
      toast.success('Flag resolved', `${formatDate(toReview.workDate)} was reviewed.`);
      setToReview(null);
      setNote('');
      refetch();
    } catch (e) {
      toast.error('Could not resolve', (e as Error).message);
    } finally {
      setResolving(false);
    }
  };

  const t = slip?.totals;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')} aria-label="Back to attendance">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar name={slip?.employee.name ?? '·'} size="md" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{slip?.employee.name ?? 'Attendance detail'}</h1>
            <p className="text-sm text-muted-foreground">
              {slip
                ? `${slip.employee.employeeCode}${slip.employee.departmentName ? ` · ${slip.employee.departmentName}` : ''}${slip.employee.designationName ? ` · ${slip.employee.designationName}` : ''}`
                : 'Daily attendance log'}
            </p>
          </div>
        </div>
        <Input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setChip('all'); }} className="w-[11rem]" leftIcon={<CalendarDays className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard loading={loading} label="Present days" value={t?.present ?? 0} icon={<UserCheck />} accent="success" />
        <StatCard loading={loading} label="Late days" value={t?.late ?? 0} icon={<Clock />} accent="warning" />
        <StatCard loading={loading} label="Absent days" value={t?.absent ?? 0} icon={<UserX />} accent="info" />
        <StatCard loading={loading} label="Worked hours" value={t ? `${t.workedHours}h` : '0h'} icon={<CalendarDays />} accent="primary" />
        <StatCard loading={loading} label="Flagged" value={t?.flagged ?? 0} icon={<ShieldAlert />} accent={t?.flagged ? 'danger' : 'success'} hint={t?.flagged ? 'Needs review' : undefined} />
      </div>

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setChip(c.key)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              chip === c.key ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground hover:text-foreground',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-5"><Skeleton className="h-64 w-full" /></div>
          ) : error ? (
            <div className="m-5 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
              Couldn't load the attendance log: {error}
              <Button variant="ghost" size="sm" className="ml-2" onClick={refetch}>Retry</Button>
            </div>
          ) : days.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No days match" description="Nothing recorded for this filter in the selected month." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Check In</th>
                    <th className="px-4 py-2.5 font-medium">Check Out</th>
                    <th className="px-4 py-2.5 text-right font-medium">Worked</th>
                    <th className="px-4 py-2.5 text-right font-medium">Late</th>
                    <th className="px-4 py-2.5 text-right font-medium">Flagged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {days.map((d) => (
                    <tr key={d.id} className={cn(d.isFlagged && 'bg-danger/5')}>
                      <td className="px-4 py-3 text-foreground">{formatDate(d.workDate)}</td>
                      <td className="px-4 py-3"><StatusBadge value={d.status} /></td>
                      <td className="px-4 py-3 tabular-nums text-foreground">{formatTime(d.firstInAt ?? undefined)}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatTime(d.lastOutAt ?? undefined)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{d.workedMinutes ? fmtHM(d.workedMinutes) : '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{d.lateMinutes ? `${d.lateMinutes}m` : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        {d.isFlagged ? (
                          <div className="flex items-center justify-end gap-2">
                            <span title={d.flagReason ?? ''}><Badge tone="danger"><AlertTriangle className="h-3 w-3" /> Flagged</Badge></span>
                            {canResolve && <Button variant="outline" size="sm" onClick={() => { setToReview(d); setNote(''); }}>Review</Button>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!toReview}
        onClose={() => setToReview(null)}
        title="Review flagged attendance"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToReview(null)}>Cancel</Button>
            <Button onClick={resolveFlag} loading={resolving}>Mark reviewed</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{slip?.employee.name}</p>
            <p className="text-xs text-muted-foreground">{toReview && formatDate(toReview.workDate)}</p>
          </div>
          <div className="rounded-md bg-danger/5 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-danger">Flag reason</p>
            <p className="mt-1 text-sm text-foreground">{toReview?.flagReason ?? 'Flagged for review'}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Review note (optional)</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Verified with employee — was at client site." />
          </div>
          <p className="text-xs text-muted-foreground">Marking as reviewed clears the flag and records who resolved it.</p>
        </div>
      </Modal>
    </div>
  );
}
