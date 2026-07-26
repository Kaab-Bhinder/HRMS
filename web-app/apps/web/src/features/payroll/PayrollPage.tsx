import { useMemo, useState } from 'react';
import { Wallet, MinusCircle, AlertTriangle, CalendarDays, Lock, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Progress } from '../../components/ui/Misc';
import { StatCard } from '../../components/charts/StatCard';
import { useQuery } from '../../hooks/useQuery';
import { usePermission } from '../../store/auth';
import { useToast } from '../../store/toast';
import { payrollService, type PayrollRow } from '../../services';
import { PayslipModal } from './PayslipModal';

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}
/** Money formatter bound to the org's currency (falls back to a plain number). */
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

export default function PayrollPage() {
  const toast = useToast();
  const canFinalize = usePermission('payroll:create');
  const [month, setMonth] = useState(currentMonthValue());
  const [year, mon] = useMemo(() => month.split('-').map(Number), [month]);
  const [selected, setSelected] = useState<PayrollRow | null>(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const { data, loading, error, refetch } = useQuery(() => payrollService.register(year, mon), [year, mon]);
  const fmt = moneyFmt(data?.currency);

  const rows = data?.rows ?? [];
  const totalNet = rows.reduce((s, r) => s + r.netPay, 0);
  const totalDeductions = rows.reduce((s, r) => s + r.deductions, 0);
  const notConfigured = rows.filter((r) => (r.compensationType === 'monthly' ? r.basicSalary == null : r.payPerHour == null)).length;
  const finalizedCount = rows.filter((r) => r.finalized).length;
  const allFinalized = rows.length > 0 && finalizedCount === rows.length;

  // "Days remaining" only makes sense for the live (current) month. Past months
  // are closed; a finalized month shows its locked state instead.
  const now = new Date();
  const isCurrentMonth = year === now.getUTCFullYear() && mon === now.getUTCMonth() + 1;
  const isPastMonth = year < now.getUTCFullYear() || (year === now.getUTCFullYear() && mon < now.getUTCMonth() + 1);
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const daysRemaining = isCurrentMonth ? daysInMonth - now.getUTCDate() : 0;

  const finalize = async () => {
    setFinalizing(true);
    try {
      const res = await payrollService.finalize(year, mon);
      toast.success('Payroll finalized', `${res.finalized} payslip(s) locked${res.alreadyFinalized ? `, ${res.alreadyFinalized} already finalized` : ''}.`);
      setConfirmFinalize(false);
      refetch();
    } catch (e) {
      toast.error('Could not finalize', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setFinalizing(false);
    }
  };

  const columns: Column<PayrollRow>[] = [
    {
      key: 'employeeName', header: 'Employee',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{r.employeeName}</p>
            <p className="truncate text-xs text-muted-foreground">{r.employeeCode} · {r.departmentName ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'compensationType', header: 'Basis', align: 'right',
      render: (r) => {
        const unset = r.compensationType === 'monthly' ? r.basicSalary == null : r.payPerHour == null;
        if (unset) return <Badge tone="warning">Not set</Badge>;
        return r.compensationType === 'monthly'
          ? <span className="font-mono text-sm">{fmt(r.basicSalary)}<span className="text-muted-foreground">/mo</span></span>
          : <span className="font-mono text-sm">{fmt(r.payPerHour)}<span className="text-muted-foreground">/hr</span></span>;
      },
    },
    { key: 'daysPresent', header: 'Present', align: 'right', render: (r) => <span className="text-foreground">{r.daysPresent}</span> },
    {
      key: 'deductions', header: 'Deductions', align: 'right',
      render: (r) => r.deductions > 0
        ? <span className="font-mono text-sm text-danger">−{fmt(r.deductions)}<span className="block text-[10px] text-muted-foreground">{r.unpaidLeaveDays}d unpaid leave</span></span>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'progress', header: isCurrentMonth ? 'Accrual' : 'Status',
      render: (r) => (
        <div className="w-32">
          <Progress value={r.progressPct} tone={r.finalized ? 'success' : r.progressPct >= 90 ? 'success' : 'primary'} />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {r.compensationType === 'monthly' ? `${r.progressPct}% of salary` : `${r.progressPct}% of potential`}
          </p>
        </div>
      ),
    },
    {
      key: 'netPay', header: 'Net pay', align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {r.finalized && <Lock className="h-3 w-3 text-muted-foreground" />}
          <span className="font-semibold text-foreground">{fmt(r.netPay)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payroll"
        description="Monthly salary and hourly pay, computed live from attendance and unpaid leave. Finalize a month to lock its payslips."
        actions={
          <div className="flex items-center gap-2">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[11rem]" leftIcon={<CalendarDays className="h-4 w-4" />} />
            {canFinalize && (
              <Button variant={allFinalized ? 'secondary' : 'primary'} disabled={allFinalized || rows.length === 0 || (!isPastMonth && !isCurrentMonth)} onClick={() => setConfirmFinalize(true)}>
                {allFinalized ? <><CheckCircle2 className="mr-1.5 h-4 w-4" /> Finalized</> : <><Lock className="mr-1.5 h-4 w-4" /> Finalize month</>}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Net payable" value={fmt(totalNet)} icon={<Wallet />} accent="primary" loading={loading} />
        <StatCard label="Deductions (unpaid leave)" value={fmt(totalDeductions)} icon={<MinusCircle />} accent={totalDeductions ? 'warning' : 'success'} loading={loading} />
        <StatCard
          label={isCurrentMonth ? 'Days to payday' : allFinalized ? 'Month finalized' : 'Month status'}
          value={isCurrentMonth ? String(daysRemaining) : allFinalized ? `${finalizedCount}/${rows.length}` : isPastMonth ? 'Open' : 'Upcoming'}
          icon={allFinalized ? <Lock /> : <CalendarDays />}
          accent={allFinalized ? 'success' : 'info'}
          loading={loading}
        />
        <StatCard label="Salary/rate not set" value={String(notConfigured)} icon={<AlertTriangle />} accent={notConfigured ? 'warning' : 'success'} loading={loading} />
      </div>

      <Card>
        <CardHeader
          title={`Payroll register · ${data ? `${data.workingDaysTotal} working days` : ''}`}
          description={
            data
              ? isCurrentMonth
                ? `${data.officeHoursPerDay}h office day · ${daysRemaining} day(s) to month-end · click a row for the full payslip`
                : `${data.officeHoursPerDay}h office day · ${allFinalized ? 'finalized — figures are locked' : 'click a row for the full payslip'}`
              : 'Loading…'
          }
        />
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={data?.rows}
            loading={loading}
            error={error}
            onRetry={refetch}
            rowKey={(r) => r.employeeId}
            onRowClick={(r) => setSelected(r)}
            empty={{ title: 'No employees in scope', description: 'Payroll shows the employees you can see.' }}
          />
        </CardBody>
      </Card>

      <PayslipModal open={!!selected} onClose={() => setSelected(null)} employee={selected} year={year} month={mon} />

      <Modal open={confirmFinalize} onClose={() => setConfirmFinalize(false)} title="Finalize payroll" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This locks payslips for <span className="font-medium text-foreground">{monthLabel(year, mon)}</span>. Finalized figures never change afterward — even if an employee's salary or attendance is edited later. New employees can still be finalized on a later run.
          </p>
          {!allFinalized && finalizedCount > 0 && (
            <p className="rounded-md bg-info/10 p-2.5 text-xs text-info">{finalizedCount} already finalized · {rows.length - finalizedCount} will be locked now.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmFinalize(false)}>Cancel</Button>
            <Button variant="primary" loading={finalizing} onClick={finalize}><Lock className="mr-1.5 h-4 w-4" /> Finalize {rows.length - finalizedCount} payslip(s)</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
