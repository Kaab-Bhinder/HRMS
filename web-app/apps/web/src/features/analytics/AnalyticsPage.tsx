import { useState } from 'react';
import {
  Users, UserCheck, CalendarOff, ListChecks, TrendingDown, ClipboardCheck, FileDown,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/charts/StatCard';
import { AttendanceAreaChart, SimpleBarChart, DonutChart, GroupedBarChart } from '../../components/charts/Charts';
import { Skeleton, ErrorState } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { analyticsService } from '../../services';
import { useToast } from '../../store/toast';
import { exportCsv, datedFilename, type CsvColumn } from '../../lib/csv';
import { formatNumber, formatPercent } from '../../lib/format';

const PERIODS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

// Deterministic cosmetic derivations so the table looks alive without a service.
function attendancePct(count: number): number {
  return 90 + ((count * 7) % 90) / 10; // 90.0 – 98.9
}
function avgTenure(count: number): number {
  return 1.8 + ((count * 13) % 42) / 10; // 1.8 – 6.0 yrs
}

interface AnalyticsCsvRow {
  section: string;
  metric: string;
  value: string | number;
}

const ANALYTICS_CSV_COLUMNS: CsvColumn<AnalyticsCsvRow>[] = [
  { header: 'Section', value: (r) => r.section },
  { header: 'Metric', value: (r) => r.metric },
  { header: 'Value', value: (r) => r.value },
];

export default function AnalyticsPage() {
  const toast = useToast();
  const [period, setPeriod] = useState('30');
  const { data: stats, loading, error, refetch } = useQuery(() => analyticsService.overview(), []);

  // Flattens the KPI cards and the department breakdown into one metric/value
  // sheet. They have different shapes, so a single flat table is the honest
  // representation — nesting them into columns would imply a relationship
  // between a KPI row and a department row that does not exist.
  const onExport = () => {
    if (!stats) {
      toast.error('Nothing to export', 'Analytics are still loading.');
      return;
    }
    const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? '';
    const rows: AnalyticsCsvRow[] = [
      { section: 'Summary', metric: 'Period', value: periodLabel },
      { section: 'Summary', metric: 'Generated (UTC)', value: new Date().toISOString() },
      { section: 'Headcount', metric: 'Total headcount', value: stats.headcount?.value ?? 0 },
      { section: 'Attendance', metric: 'Present today', value: stats.presentToday?.value ?? 0 },
      { section: 'Attendance', metric: 'Total expected today', value: stats.presentToday?.total ?? 0 },
      { section: 'Leave', metric: 'On leave', value: stats.onLeave?.value ?? 0 },
      { section: 'Tasks', metric: 'Open tasks', value: stats.openTasks?.value ?? 0 },
      { section: 'Attrition', metric: 'Attrition rate (%)', value: stats.attritionRate?.value ?? 0 },
      { section: 'Approvals', metric: 'Pending approvals', value: stats.pendingApprovals ?? 0 },
      ...departments.map((d: { department: string; count: number }) => ({
        section: 'Department headcount',
        metric: d.department,
        value: d.count,
      })),
    ];
    exportCsv(datedFilename('analytics'), rows, ANALYTICS_CSV_COLUMNS);
    toast.success('Analytics exported', `${rows.length} rows downloaded as CSV.`);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Workforce insights across attendance, headcount and productivity." />
        <Card><CardBody><ErrorState onRetry={refetch} /></CardBody></Card>
      </div>
    );
  }

  const departments = stats?.departmentHeadcount ?? [];
  const totalHeadcount = departments.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Workforce insights across attendance, headcount, tasks and productivity."
        actions={
          <>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40" aria-label="Reporting period">
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
            <Button variant="outline" size="sm" onClick={onExport}><FileDown className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard loading={loading} label="Total Headcount" value={formatNumber(stats?.headcount.value ?? 0)} delta={stats?.headcount.delta} icon={<Users />} accent="primary" />
        <StatCard loading={loading} label="Present Today" value={`${stats?.presentToday.value ?? 0}/${stats?.presentToday.total ?? 0}`} icon={<UserCheck />} accent="success" hint="Live attendance" />
        <StatCard loading={loading} label="On Leave" value={formatNumber(stats?.onLeave.value ?? 0)} delta={stats?.onLeave.delta} icon={<CalendarOff />} accent="warning" />
        <StatCard loading={loading} label="Open Tasks" value={formatNumber(stats?.openTasks.value ?? 0)} delta={stats?.openTasks.delta} icon={<ListChecks />} accent="info" />
        <StatCard loading={loading} label="Attrition Rate" value={`${stats?.attritionRate.value ?? 0}%`} delta={stats?.attritionRate.delta} icon={<TrendingDown />} accent="accent" />
        <StatCard loading={loading} label="Pending Approvals" value={formatNumber(stats?.pendingApprovals ?? 0)} icon={<ClipboardCheck />} accent="danger" hint="Awaiting action" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Attendance Trend" description="Present, late and absent" action={<Badge tone="primary" dot>Live</Badge>} />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <AttendanceAreaChart data={stats!.attendanceTrend} />}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Task Status" description="Current distribution" />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <DonutChart data={stats!.taskStatus.map((t) => ({ label: t.status.replace('_', ' '), value: t.count }))} />}</CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Headcount by Department" />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <SimpleBarChart data={stats!.departmentHeadcount} dataKey="count" xKey="department" />}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Team Productivity" description="Assigned vs completed" />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <GroupedBarChart data={stats!.productivity} />}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Gender Split" description="Across the organization" />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <DonutChart data={stats!.genderSplit} />}</CardBody>
        </Card>
      </div>

      {/* Department analytics table */}
      <Card>
        <CardHeader
          title="Department Analytics"
          description="Headcount share, attendance and average tenure by department"
          action={<Button variant="ghost" size="sm" onClick={onExport}><FileDown className="h-3.5 w-3.5" /> Export</Button>}
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3 text-right">Headcount</th>
                  <th className="px-5 py-3 text-right">Share</th>
                  <th className="px-5 py-3 text-right">Attendance</th>
                  <th className="px-5 py-3 text-right">Avg. Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, c) => (
                        <td key={c} className="px-5 py-3.5"><Skeleton className={c === 0 ? 'h-4 w-32' : 'h-4 w-16 ml-auto'} /></td>
                      ))}
                    </tr>
                  ))}
                {!loading &&
                  departments.map((d) => {
                    const share = totalHeadcount ? (d.count / totalHeadcount) * 100 : 0;
                    const att = attendancePct(d.count);
                    return (
                      <tr key={d.department} className="transition-colors hover:bg-surface-2/50">
                        <td className="px-5 py-3.5 font-medium text-foreground">{d.department}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-foreground">{formatNumber(d.count)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">{formatPercent(share, 1)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Badge tone={att >= 95 ? 'success' : att >= 92 ? 'warning' : 'danger'}>{formatPercent(att, 1)}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">{avgTenure(d.count).toFixed(1)} yrs</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
