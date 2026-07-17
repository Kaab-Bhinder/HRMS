import { useMemo, useState } from 'react';
import {
  Plus, Play, Download, MoreHorizontal, Pencil, Trash2, Clock,
  CalendarCheck, Wallet, CalendarOff, Users, Target, FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Label } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Switch';
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/feedback/States';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { relativeTime, pluralize } from '../../lib/format';

type ReportModule = 'Attendance' | 'Payroll' | 'Leave' | 'Employees' | 'Performance';
type ReportFormat = 'PDF' | 'Excel' | 'CSV';

interface ReportDef {
  id: string;
  title: string;
  description: string;
  module: ReportModule;
}

interface ScheduledReport {
  id: string;
  name: string;
  module: ReportModule;
  schedule: string;
  recipients: number;
  format: ReportFormat;
  lastRun: string;
}

const MODULES: ReportModule[] = ['Attendance', 'Payroll', 'Leave', 'Employees', 'Performance'];
const FORMATS: ReportFormat[] = ['PDF', 'Excel', 'CSV'];

const MODULE_META: Record<
  ReportModule,
  { icon: typeof FileText; tone: 'primary' | 'success' | 'warning' | 'info' | 'accent'; iconClass: string }
> = {
  Attendance: { icon: CalendarCheck, tone: 'primary', iconClass: 'bg-primary/10 text-primary' },
  Payroll: { icon: Wallet, tone: 'success', iconClass: 'bg-success/12 text-success' },
  Leave: { icon: CalendarOff, tone: 'warning', iconClass: 'bg-warning/15 text-warning' },
  Employees: { icon: Users, tone: 'info', iconClass: 'bg-info/12 text-info' },
  Performance: { icon: Target, tone: 'accent', iconClass: 'bg-accent/15 text-accent' },
};

const FORMAT_TONE: Record<ReportFormat, 'danger' | 'success' | 'info'> = {
  PDF: 'danger',
  Excel: 'success',
  CSV: 'info',
};

const REPORT_CATALOG: ReportDef[] = [
  { id: 'att-daily', title: 'Daily Attendance Register', description: 'Check-in/out times, late marks and flagged records for a given day.', module: 'Attendance' },
  { id: 'att-monthly', title: 'Monthly Attendance Summary', description: 'Per-employee present, absent and overtime totals across the month.', module: 'Attendance' },
  { id: 'att-biometric', title: 'Biometric Exceptions', description: 'Low face-match scores and manual overrides requiring review.', module: 'Attendance' },
  { id: 'pay-register', title: 'Payroll Register (PKR)', description: 'Gross, deductions and net pay by employee for the pay cycle.', module: 'Payroll' },
  { id: 'pay-tax', title: 'Tax Withholding Statement', description: 'FBR-aligned income tax deductions and YTD contributions.', module: 'Payroll' },
  { id: 'pay-bank', title: 'Bank Disbursement File', description: 'Account-wise salary transfer schedule for treasury upload.', module: 'Payroll' },
  { id: 'lv-balance', title: 'Leave Balance Sheet', description: 'Accrued, availed and carried-forward balances by leave type.', module: 'Leave' },
  { id: 'lv-liability', title: 'Leave Liability Report', description: 'Encashment exposure of outstanding leave across departments.', module: 'Leave' },
  { id: 'emp-directory', title: 'Employee Directory', description: 'Master roster with department, designation and contact details.', module: 'Employees' },
  { id: 'emp-headcount', title: 'Headcount Movement', description: 'Joiners, leavers and net change by department and grade.', module: 'Employees' },
  { id: 'emp-diversity', title: 'Diversity & Inclusion', description: 'Gender split, tenure bands and location distribution.', module: 'Employees' },
  { id: 'perf-cycle', title: 'Appraisal Cycle Status', description: 'Review completion and average scores by reviewer.', module: 'Performance' },
  { id: 'perf-goals', title: 'Goal Attainment', description: 'On-track vs at-risk objectives across the organization.', module: 'Performance' },
];

const SCHEDULED: ScheduledReport[] = [
  { id: 's1', name: 'Weekly Attendance Digest', module: 'Attendance', schedule: 'Every Monday 9:00', recipients: 6, format: 'PDF', lastRun: '2026-07-06T09:00:00Z' },
  { id: 's2', name: 'Monthly Payroll Register', module: 'Payroll', schedule: '1st of month 07:00', recipients: 3, format: 'Excel', lastRun: '2026-07-01T07:00:00Z' },
  { id: 's3', name: 'Leave Liability Snapshot', module: 'Leave', schedule: 'Every Friday 17:00', recipients: 4, format: 'Excel', lastRun: '2026-07-04T17:00:00Z' },
  { id: 's4', name: 'Board Headcount Report', module: 'Employees', schedule: '15th of month 08:00', recipients: 8, format: 'PDF', lastRun: '2026-06-15T08:00:00Z' },
  { id: 's5', name: 'Quarterly Appraisal Rollup', module: 'Performance', schedule: 'Every quarter 10:00', recipients: 5, format: 'CSV', lastRun: '2026-04-01T10:00:00Z' },
];

const COLUMN_OPTIONS = ['Employee', 'Department', 'Designation', 'Date', 'Status', 'Amount', 'Manager'];
const SCHEDULE_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

export default function ReportsPage() {
  const toast = useToast();
  const canCreate = usePermission('reports:create');

  const [tab, setTab] = useState('catalog');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return REPORT_CATALOG;
    return REPORT_CATALOG.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.module.toLowerCase().includes(q),
    );
  }, [debounced]);

  const grouped = useMemo(
    () => MODULES.map((m) => ({ module: m, reports: filtered.filter((r) => r.module === m) })).filter((g) => g.reports.length > 0),
    [filtered],
  );

  const runReport = (name: string) => toast.success('Report generating', `${name} is being generated. You’ll be notified when it’s ready.`);
  const downloadReport = (name: string) => toast.success('Download started', `Preparing the latest export of ${name}.`);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Generate, schedule and download HR and payroll reports."
        actions={canCreate && <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Report</Button>}
      />

      <Tabs
        tabs={[
          { value: 'catalog', label: 'Catalog', count: REPORT_CATALOG.length },
          { value: 'scheduled', label: 'Scheduled', count: SCHEDULED.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'catalog' && (
        <div className="space-y-5">
          <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Search reports…" onClear={() => setSearch('')} />

          {grouped.length === 0 ? (
            <Card>
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No reports found"
                description="No reports match your search. Try a different keyword or create a new report."
                action={canCreate ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Report</Button> : undefined}
              />
            </Card>
          ) : (
            grouped.map((g) => {
              const Icon = MODULE_META[g.module].icon;
              return (
                <section key={g.module} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md ${MODULE_META[g.module].iconClass} [&>svg]:h-3.5 [&>svg]:w-3.5`}>
                      <Icon />
                    </span>
                    <h2 className="text-sm font-semibold text-foreground">{g.module}</h2>
                    <span className="text-xs text-muted-foreground">{pluralize(g.reports.length, 'report')}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {g.reports.map((r) => (
                      <Card key={r.id} className="flex flex-col p-5">
                        <div className="flex items-start gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${MODULE_META[r.module].iconClass} [&>svg]:h-5 [&>svg]:w-5`}>
                            <Icon />
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-foreground">{r.title}</h3>
                            <Badge tone={MODULE_META[r.module].tone} className="mt-1">{r.module}</Badge>
                          </div>
                        </div>
                        <p className="mt-3 flex-1 text-sm text-muted-foreground">{r.description}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button size="sm" className="flex-1" onClick={() => runReport(r.title)}><Play className="h-3.5 w-3.5" /> Run</Button>
                          <Button variant="outline" size="sm" onClick={() => downloadReport(r.title)}><Download className="h-3.5 w-3.5" /> Download</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      )}

      {tab === 'scheduled' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Report</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3 text-right">Recipients</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3">Last Run</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SCHEDULED.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-5 py-3.5 font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3.5"><Badge tone={MODULE_META[s.module].tone}>{s.module}</Badge></td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {s.schedule}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">{s.recipients}</td>
                    <td className="px-5 py-3.5"><Badge tone={FORMAT_TONE[s.format]}>{s.format}</Badge></td>
                    <td className="px-5 py-3.5 text-muted-foreground">{relativeTime(s.lastRun)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
                        <DropdownItem icon={<Play />} onClick={() => runReport(s.name)}>Run now</DropdownItem>
                        <DropdownItem icon={<Pencil />} onClick={() => toast.success('Edit schedule', `Opening editor for ${s.name}.`)}>Edit</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem icon={<Trash2 />} danger onClick={() => toast.success('Schedule deleted', `${s.name} will no longer run automatically.`)}>Delete</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <NewReportModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function NewReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [module, setModule] = useState<ReportModule>('Attendance');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [schedule, setSchedule] = useState('None');
  const [columns, setColumns] = useState<string[]>(['Employee', 'Department', 'Date']);

  const toggleColumn = (c: string) =>
    setColumns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const reset = () => {
    setName('');
    setModule('Attendance');
    setFormat('PDF');
    setSchedule('None');
    setColumns(['Employee', 'Department', 'Date']);
  };

  const save = () => {
    toast.success('Report created', `${name.trim() || 'Untitled report'} was saved${schedule !== 'None' ? ` and scheduled ${schedule.toLowerCase()}` : ''}.`);
    reset();
    onClose();
  };

  const close = () => { reset(); onClose(); };

  return (
    <Modal
      open={open}
      onClose={close}
      title="New Report"
      description="Configure a custom report and optionally schedule it."
      footer={
        <>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={save} disabled={!name.trim()}>Save report</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="report-name" required>Report name</Label>
          <Input id="report-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Attendance Summary" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="report-module">Module</Label>
            <Select id="report-module" value={module} onChange={(e) => setModule(e.target.value as ReportModule)}>
              {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="report-format">Format</Label>
            <Select id="report-format" value={format} onChange={(e) => setFormat(e.target.value as ReportFormat)}>
              {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label>Columns</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COLUMN_OPTIONS.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2/40 px-2.5 py-2 text-sm text-foreground">
                <Checkbox checked={columns.includes(c)} onChange={() => toggleColumn(c)} />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="report-schedule">Schedule</Label>
          <Select id="report-schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)}>
            {SCHEDULE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {schedule === 'None' ? 'This report will run on demand only.' : `Recipients will receive this report ${schedule.toLowerCase()}.`}
          </p>
        </div>
      </div>
    </Modal>
  );
}
