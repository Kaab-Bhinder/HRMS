import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, CalendarOff, ListChecks, TrendingDown, Plus, FileDown,
  CalendarPlus, UserPlus, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/charts/StatCard';
import { AttendanceAreaChart, SimpleBarChart, DonutChart, GroupedBarChart, RadialGauge } from '../../components/charts/Charts';
import { Progress } from '../../components/ui/Misc';
import { LiveOfficeMap } from '../attendance/LiveOfficeMap';
import { EmptyState, Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { analyticsService, leaveService } from '../../services';
import { useAuth } from '../../store/auth';
import { formatNumber, relativeTime, formatDate } from '../../lib/format';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const canTrack = can('attendance:track');
  const { data: stats, loading } = useQuery(() => analyticsService.overview(), []);
  const { data: deptAtt } = useQuery(() => analyticsService.departments(), []);
  const { data: activity } = useQuery(() => analyticsService.activity(), []);
  const { data: pending } = useQuery(() => leaveService.list({ filters: { status: 'pending' }, limit: 5 }), []);

  const presentRate = stats && stats.presentToday.total > 0 ? (stats.presentToday.value / stats.presentToday.total) * 100 : 0;

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.fullName.split(' ')[0]} 👋`}
        description="Here’s what’s happening across your organization today."
        actions={
          <>
            <Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => navigate('/employees')}><Plus className="h-4 w-4" /> Add Employee</Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard loading={loading} label="Total Headcount" value={formatNumber(stats?.headcount.value ?? 0)} delta={stats?.headcount.delta} icon={<Users />} accent="accent" />
        <StatCard loading={loading} label="Present Today" value={`${stats?.presentToday.value ?? 0}/${stats?.presentToday.total ?? 0}`} icon={<UserCheck />} accent="success" hint="Live attendance" />
        <StatCard loading={loading} label="On Leave" value={formatNumber(stats?.onLeave.value ?? 0)} delta={stats?.onLeave.delta} icon={<CalendarOff />} accent="warning" />
        <StatCard loading={loading} label="Open Tasks" value={formatNumber(stats?.openTasks.value ?? 0)} delta={stats?.openTasks.delta} icon={<ListChecks />} accent="info" />
        <StatCard loading={loading} label="Attrition Rate" value={`${stats?.attritionRate.value ?? 0}%`} delta={stats?.attritionRate.delta} icon={<TrendingDown />} accent="danger" />
      </div>

      {/* Live office map + workforce mix */}
      {canTrack && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Live Office — On Site Now" description="Checked-in employees around the office, updating live" action={<StatusBadge value="present" dot />} />
            <CardBody className="p-3"><LiveOfficeMap height={400} /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Workforce Mix" description="Active headcount by gender" />
            <CardBody>{loading ? <Skeleton className="h-[360px] w-full" /> : <DonutChart height={360} centerSub="employees" data={(stats?.genderSplit ?? []).map((g) => ({ label: g.label, value: g.value }))} />}</CardBody>
          </Card>
        </div>
      )}

      {/* Present rate + department attendance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Present Rate" description="On site vs headcount" />
          <CardBody className="flex flex-col items-center justify-center">
            {loading ? <Skeleton className="h-[220px] w-full" /> : (
              <>
                <RadialGauge value={presentRate} label="present today" color="#86c25a" />
                <p className="text-sm text-muted-foreground">{stats?.presentToday.value ?? 0} of {stats?.presentToday.total ?? 0} on site</p>
              </>
            )}
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Department Attendance" description="Who’s in today, by team" />
          <CardBody className="space-y-3.5">
            {!deptAtt && <Skeleton className="h-[200px] w-full" />}
            {deptAtt?.filter((d) => d.headcount > 0).slice(0, 7).map((d) => (
              <div key={d.departmentId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{d.department}</span>
                  <span className="tabular-nums text-muted-foreground">{d.presentToday}/{d.headcount} · <span className="font-semibold text-foreground">{d.presentPercent}%</span></span>
                </div>
                <Progress value={d.presentPercent} tone={d.presentPercent >= 80 ? 'success' : d.presentPercent >= 50 ? 'warning' : 'danger'} />
              </div>
            ))}
            {deptAtt && deptAtt.filter((d) => d.headcount > 0).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No department data yet.</p>}
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Attendance Trend" description="Last 14 days" action={<StatusBadge value="present" dot />} />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <AttendanceAreaChart data={stats!.attendanceTrend} />}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Task Status" description="Current distribution" />
          <CardBody>{loading ? <Skeleton className="h-[260px] w-full" /> : <DonutChart centerSub="tasks" data={stats!.taskStatus.map((t) => ({ label: t.status.replace('_', ' '), value: t.count }))} />}</CardBody>
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

        {/* Quick actions + pending approvals */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Quick Actions" />
            <CardBody className="grid grid-cols-2 gap-2.5">
              <QuickAction icon={<UserPlus />} label="Add Employee" onClick={() => navigate('/employees')} />
              <QuickAction icon={<CalendarPlus />} label="Log Leave" onClick={() => navigate('/leave')} />
              <QuickAction icon={<ListChecks />} label="New Task" onClick={() => navigate('/tasks')} />
              <QuickAction icon={<FileDown />} label="Run Report" onClick={() => navigate('/reports')} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Pending Approvals" action={<Button variant="ghost" size="sm" onClick={() => navigate('/leave')}>View all <ArrowRight className="h-3.5 w-3.5" /></Button>} />
            <CardBody className="space-y-2.5">
              {(pending?.data ?? []).slice(0, 4).map((l) => (
                <div key={l.id} className="flex items-center gap-3">
                  <Avatar name={l.employeeName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{l.employeeName}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.leaveType} · {l.days}d · {formatDate(l.startDate)}</p>
                  </div>
                  <Clock className="h-4 w-4 text-warning" />
                </div>
              ))}
              {pending && pending.data.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">All caught up 🎉</p>}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Activity + upcoming deadlines */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Activity" description="Across the platform" />
          <CardBody className="space-y-1">
            {!activity && <Skeleton className="h-40 w-full" />}
            {activity?.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-md px-1 py-2">
                <Avatar name={a.actorName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground"><span className="font-medium">{a.actorName}</span> <span className="text-muted-foreground">{a.verb}</span> {a.target}</p>
                  <p className="text-xs text-muted-foreground/70">{relativeTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Upcoming Deadlines" description="Next 7 days" />
          <CardBody>
            {DEADLINES.length === 0 ? (
              <EmptyState title="No upcoming deadlines" />
            ) : (
              <div className="space-y-1">
                {DEADLINES.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-md px-1 py-2">
                    <span className="flex h-9 w-9 flex-col items-center justify-center rounded-md bg-surface-2 text-center">
                      <span className="text-[10px] font-medium uppercase text-muted-foreground">{d.month}</span>
                      <span className="-mt-0.5 text-sm font-semibold text-foreground">{d.day}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{d.meta}</p>
                    </div>
                    <StatusBadge value={d.status} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2/40 px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-ring">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </button>
  );
}

const DEADLINES = [
  { month: 'Jul', day: '10', title: 'Monthly payroll run', meta: 'Finance · 640 employees', status: 'in_progress' },
  { month: 'Jul', day: '12', title: 'Q3 performance cycle opens', meta: 'HR · all departments', status: 'todo' },
  { month: 'Jul', day: '14', title: 'Visa renewals — 3 employees', meta: 'Compliance', status: 'blocked' },
  { month: 'Jul', day: '15', title: 'Board headcount report', meta: 'Analytics', status: 'todo' },
];
