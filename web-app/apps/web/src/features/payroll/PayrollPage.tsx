import { useMemo, useState } from 'react';
import { Wallet, Clock, AlertTriangle, CalendarDays } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Misc';
import { StatCard } from '../../components/charts/StatCard';
import { useQuery } from '../../hooks/useQuery';
import { payrollService, type PayrollRow } from '../../services';
import { PayslipModal } from './PayslipModal';

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}
function fmtMoney(n: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function PayrollPage() {
  const [month, setMonth] = useState(currentMonthValue());
  const [year, mon] = useMemo(() => month.split('-').map(Number), [month]);
  const [selected, setSelected] = useState<PayrollRow | null>(null);

  const { data, loading, error, refetch } = useQuery(() => payrollService.register(year, mon), [year, mon]);

  const totalEarned = data?.rows.reduce((s, r) => s + r.earnedPay, 0) ?? 0;
  const totalPotential = data?.rows.reduce((s, r) => s + r.potentialPay, 0) ?? 0;
  const withoutRate = data?.rows.filter((r) => r.payPerHour == null).length ?? 0;

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
    { key: 'payPerHour', header: 'Rate/hr', align: 'right', render: (r) => (r.payPerHour == null ? <Badge tone="warning">Not set</Badge> : <span className="font-mono text-sm">{fmtMoney(r.payPerHour)}</span>) },
    { key: 'payableHours', header: 'Payable hrs', align: 'right', render: (r) => <span className="font-mono text-sm">{r.payableHours}</span> },
    { key: 'daysPresent', header: 'Present', align: 'right', render: (r) => <span className="text-foreground">{r.daysPresent}</span> },
    { key: 'daysAbsent', header: 'Absent', align: 'right', render: (r) => <span className={r.daysAbsent ? 'text-danger' : 'text-muted-foreground'}>{r.daysAbsent}</span> },
    { key: 'lateMinutes', header: 'Late (min)', align: 'right', render: (r) => <span className={r.lateMinutes ? 'text-warning' : 'text-muted-foreground'}>{r.lateMinutes}</span> },
    {
      key: 'progress', header: 'Month progress',
      render: (r) => (
        <div className="w-36">
          <Progress value={r.progressPct} tone={r.progressPct >= 90 ? 'success' : 'primary'} />
          <p className="mt-1 text-[11px] text-muted-foreground">{r.progressPct}% of potential</p>
        </div>
      ),
    },
    { key: 'earnedPay', header: 'Earned', align: 'right', render: (r) => <span className="font-semibold text-foreground">{fmtMoney(r.earnedPay)}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payroll"
        description="Hourly pay computed live from attendance — capped at office hours. Month-to-date, so figures grow as the month goes on."
        actions={
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[11rem]" leftIcon={<CalendarDays className="h-4 w-4" />} />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Earned so far" value={fmtMoney(totalEarned)} icon={<Wallet />} accent="primary" loading={loading} />
        <StatCard label="Projected (full month)" value={fmtMoney(totalPotential)} icon={<Clock />} accent="info" loading={loading} />
        <StatCard label="Missing pay rate" value={String(withoutRate)} icon={<AlertTriangle />} accent={withoutRate ? 'warning' : 'success'} loading={loading} />
      </div>

      <Card>
        <CardHeader
          title={`Payroll register · ${data ? `${data.workingDaysTotal} working days` : ''}`}
          description={data ? `${data.officeHoursPerDay}h office day · click a row for the full payslip` : 'Loading…'}
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
    </div>
  );
}
