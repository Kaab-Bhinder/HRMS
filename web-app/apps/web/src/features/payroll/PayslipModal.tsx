import { Lock } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Misc';
import { Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { payrollService, type PayrollRow } from '../../services';
import { formatDate } from '../../lib/format';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function moneyFmt(currency?: string) {
  return (n: number | null): string => {
    if (n == null) return '—';
    try {
      return n.toLocaleString(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 });
    } catch {
      return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  };
}
const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  present: 'success', late: 'warning', half_day: 'info', absent: 'danger', on_leave: 'info', weekly_off: 'neutral', holiday: 'neutral',
};

export function PayslipModal({ open, onClose, employee, year, month }: {
  open: boolean; onClose: () => void; employee: PayrollRow | null; year: number; month: number;
}) {
  const { data, loading } = useQuery(
    () => (employee ? payrollService.payslip(employee.employeeId, year, month) : Promise.resolve(null)),
    [employee?.employeeId, year, month, open],
  );
  if (!employee) return null;

  const money = moneyFmt(data?.currency);
  const monthly = (data?.compensationType ?? employee.compensationType) === 'monthly';
  const finalized = data?.finalized ?? employee.finalized;
  const netPay = data?.netPay ?? employee.netPay;
  const basicSalary = data?.basicSalary ?? employee.basicSalary;
  const deductions = data?.deductions ?? employee.deductions;
  const unpaidLeaveDays = data?.unpaidLeaveDays ?? employee.unpaidLeaveDays;
  const progressPct = data?.progressPct ?? employee.progressPct;
  const salaryUnset = monthly ? basicSalary == null : employee.payPerHour == null;

  return (
    <Modal open={open} onClose={onClose} title="Payslip" size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{employee.employeeName}</h3>
            <p className="text-sm text-muted-foreground">{employee.employeeCode} · {employee.departmentName ?? '—'}</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{MONTHS[month]} {year}</p>
              <Badge tone={monthly ? 'primary' : 'info'}>{monthly ? 'Monthly' : 'Hourly'}</Badge>
              {finalized && <Badge tone="success"><Lock className="mr-1 h-3 w-3" /> Finalized</Badge>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{money(netPay)}</p>
            <p className="text-xs text-muted-foreground">{monthly ? 'net pay' : 'earned so far'}</p>
          </div>
        </div>

        {monthly ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Basic salary" value={money(basicSalary)} />
              <Stat label="Unpaid leave" value={`${unpaidLeaveDays} day(s)`} />
              <Stat label="Deductions" value={deductions > 0 ? `−${money(deductions)}` : '—'} />
              <Stat label="Days present" value={String(data?.daysPresent ?? employee.daysPresent)} />
            </div>
            {/* Salary math, spelled out: fixed salary minus unpaid-leave days. */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-surface-2/40 p-3 text-sm">
              <span className="text-muted-foreground">Basic</span>
              <span className="font-mono font-medium text-foreground">{money(basicSalary)}</span>
              <span className="text-muted-foreground">−</span>
              <span className="text-muted-foreground">unpaid leave ({unpaidLeaveDays}d)</span>
              <span className="font-mono font-medium text-danger">{deductions > 0 ? money(deductions) : money(0)}</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-mono font-semibold text-foreground">{money(netPay)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Rate / hour" value={money(employee.payPerHour)} />
              <Stat label="Payable hours" value={String(data?.payableHours ?? employee.payableHours)} />
              <Stat label="Days present" value={String(data?.daysPresent ?? employee.daysPresent)} />
              <Stat label="Late (min)" value={String(data?.lateMinutes ?? employee.lateMinutes)} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Month progress</span>
                <span>{progressPct}% · projected {money(data?.potentialPay ?? employee.potentialPay)}</span>
              </div>
              <Progress value={progressPct} tone="primary" />
            </div>
          </>
        )}

        {salaryUnset && (
          <p className="rounded-md bg-warning/10 p-3 text-sm text-warning">
            {monthly
              ? 'No basic salary set for this employee — set “Basic salary” on their profile to compute pay.'
              : 'No hourly rate set for this employee — set “Pay per hour” on their profile to compute pay.'}
          </p>
        )}

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {monthly ? 'Attendance this month' : 'Daily breakdown'}
          </h4>
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="max-h-80 overflow-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 text-right font-medium">Worked</th>
                    {!monthly && <th className="px-3 py-2 text-right font-medium">Payable</th>}
                    {!monthly && <th className="px-3 py-2 text-right font-medium">Pay</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data?.days ?? []).map((d) => (
                    <tr key={d.workDate} className={d.isFlagged ? 'bg-danger/5' : ''}>
                      <td className="px-3 py-2 text-foreground">{formatDate(d.workDate)}</td>
                      <td className="px-3 py-2"><Badge tone={STATUS_TONE[d.status] ?? 'neutral'}>{d.status.replace('_', ' ')}</Badge></td>
                      <td className="px-3 py-2 text-right font-mono text-xs">{fmtHM(d.workedMinutes)}</td>
                      {!monthly && <td className="px-3 py-2 text-right font-mono text-xs">{fmtHM(d.payableMinutes)}</td>}
                      {!monthly && <td className="px-3 py-2 text-right font-mono">{money(d.pay)}</td>}
                    </tr>
                  ))}
                  {!loading && (data?.days.length ?? 0) === 0 && (
                    <tr><td colSpan={monthly ? 3 : 5} className="px-3 py-8 text-center text-muted-foreground">No attendance recorded this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
function fmtHM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
