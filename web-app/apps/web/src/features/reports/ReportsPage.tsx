import { useMemo, useState } from 'react';
import {
  Plus, Play, Download, MoreHorizontal, Pencil, Trash2, Clock,
  CalendarCheck, Wallet, CalendarOff, Users, Target, FileText, Laptop,
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
import { reportsService, departmentsService, type SavedReport, type CatalogReport } from '../../services';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../store/toast';
import { useI18n } from '../../store/i18n';
import { usePermission } from '../../store/auth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { relativeTime, pluralize } from '../../lib/format';

type ReportModule = 'Attendance' | 'Payroll' | 'Leave' | 'Employees' | 'Performance' | 'Assets';
type ReportFormat = 'PDF' | 'Excel' | 'CSV';

interface ScheduledReport {
  id: string;
  name: string;
  module: ReportModule;
  schedule: string;
  recipients: number;
  format: ReportFormat;
  lastRun: string;
}

const MODULES: ReportModule[] = ['Attendance', 'Payroll', 'Leave', 'Employees', 'Performance', 'Assets'];
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
  Assets: { icon: Laptop, tone: 'info', iconClass: 'bg-info/12 text-info' },
};

const FORMAT_TONE: Record<ReportFormat, 'danger' | 'success' | 'info'> = {
  PDF: 'danger',
  Excel: 'success',
  CSV: 'info',
};


const COLUMN_OPTIONS = ['Employee', 'Department', 'Designation', 'Date', 'Status', 'Amount', 'Manager'];
const SCHEDULE_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

export default function ReportsPage() {
  const toast = useToast();
  const { t } = useI18n();
  const canCreate = usePermission('reports:create');

  const [tab, setTab] = useState('catalog');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const [createOpen, setCreateOpen] = useState(false);
  const { data: savedData, loading: savedLoading, refetch: refetchSaved } =
    useQuery(() => reportsService.listSaved({ limit: 100 }), []);
  const saved = savedData?.data ?? [];

  // The catalogue is the server's — every entry is a report that really runs.
  const { data: catalog, loading: catalogLoading } = useQuery(() => reportsService.catalog(), []);
  const [runTarget, setRunTarget] = useState<CatalogReport | null>(null);

  const deleteSaved = async (r: SavedReport) => {
    try {
      await reportsService.removeSaved(r.id);
      refetchSaved();
      toast.success('Report deleted', `${r.name} was removed.`);
    } catch (e) {
      toast.error('Could not delete', (e as Error).message);
    }
  };

  const filtered = useMemo(() => {
    const all = catalog ?? [];
    const q = debounced.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.module.toLowerCase().includes(q),
    );
  }, [debounced, catalog]);

  const grouped = useMemo(
    () => MODULES.map((m) => ({ module: m, reports: filtered.filter((r) => r.module === m) })).filter((g) => g.reports.length > 0),
    [filtered],
  );

  /** Runs one catalogue report with the parameters chosen in the dialog. */
  const runNow = async (report: CatalogReport, format: string, params: Record<string, string>) => {
    try {
      toast.success('Generating report', `Preparing ${report.title}…`);
      await reportsService.run(report.key, format, params);
      setRunTarget(null);
    } catch (e) {
      toast.error('Export failed', (e as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Generate, schedule and download HR and payroll reports."
        actions={canCreate && <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Report</Button>}
      />

      <Tabs
        tabs={[
          { value: 'catalog', label: 'Catalog', count: catalog?.length ?? 0 },
          { value: 'scheduled', label: 'Saved', count: saved.length },
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
                title={catalogLoading ? 'Loading reports…' : 'No reports found'}
                description="No reports match your search. Try a different keyword or create a new report."
                action={canCreate ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New Report</Button> : undefined}
              />
            </Card>
          ) : (
            grouped.map((g) => {
              const Icon = MODULE_META[g.module as ReportModule].icon;
              return (
                <section key={g.module} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md ${MODULE_META[g.module as ReportModule].iconClass} [&>svg]:h-3.5 [&>svg]:w-3.5`}>
                      <Icon />
                    </span>
                    <h2 className="text-sm font-semibold text-foreground">{g.module}</h2>
                    <span className="text-xs text-muted-foreground">{`${g.reports.length} ${t('reports')}`}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {g.reports.map((r) => (
                      <Card key={r.key} className="flex flex-col p-5">
                        <div className="flex items-start gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${MODULE_META[r.module as ReportModule].iconClass} [&>svg]:h-5 [&>svg]:w-5`}>
                            <Icon />
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-foreground">{r.title}</h3>
                            <Badge tone={MODULE_META[r.module as ReportModule].tone} className="mt-1">{r.module}</Badge>
                          </div>
                        </div>
                        <p className="mt-3 flex-1 text-sm text-muted-foreground">{r.description}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button size="sm" className="flex-1" onClick={() => setRunTarget(r)}><Play className="h-3.5 w-3.5" /> Run report</Button>
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

      {runTarget && (
        <RunReportModal
          report={runTarget}
          onClose={() => setRunTarget(null)}
          onRun={(format, params) => runNow(runTarget, format, params)}
        />
      )}

      {tab === 'scheduled' && (
        <Card className="overflow-hidden">
          {/* Saved definitions persist, but nothing executes them on a timer
              yet — say so rather than implying reports are being delivered. */}
          <div className="flex items-start gap-2 border-b border-border bg-warning/5 px-5 py-3 text-xs text-muted-foreground">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <p>
              Saved reports are stored definitions you can run on demand.
              Automatic scheduled delivery isn’t active yet — use <strong>Run now</strong>.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Report</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {savedLoading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
                ) : saved.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No saved reports yet. Use “New report” to create one.
                  </td></tr>
                ) : saved.map((s2: SavedReport) => (
                  <tr key={s2.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-5 py-3.5 font-medium text-foreground">{s2.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone="neutral">{s2.module}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {s2.scheduleCron || 'On demand'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{relativeTime(s2.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
                        <DropdownItem
                          icon={<Play />}
                          onClick={() => {
                            // A saved definition names a module; run its first
                            // catalogue report so the parameters still apply.
                            const target = (catalog ?? []).find((c) => c.module.toLowerCase() === s2.module.toLowerCase());
                            if (target) setRunTarget(target);
                            else toast.error('Cannot run', `No report is available for ${s2.module}.`);
                          }}
                        >Run now</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem icon={<Trash2 />} danger onClick={() => deleteSaved(s2)}>Delete</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <NewReportModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={refetchSaved} />
    </div>
  );
}

/** Maps the UI's schedule labels to cron. Stored for when a scheduler exists;
 *  nothing runs them today, which the Saved tab states plainly. */
const SCHEDULE_CRON: Record<string, string | undefined> = {
  None: undefined,
  Daily: '0 9 * * *',
  Weekly: '0 9 * * 1',
  Monthly: '0 9 1 * *',
};

function capitalize(v: string): string {
  return v ? v[0].toUpperCase() + v.slice(1) : v;
}

function NewReportModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
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

  const [saving, setSaving] = useState(false);

  const save = async () => {

    setSaving(true);
    try {
      await reportsService.createSaved({
        name: name.trim(),
        module: module.toLowerCase(),
        definition: { columns, format },
        scheduleCron: SCHEDULE_CRON[schedule],
      });
      onSaved();
      toast.success(
        'Report saved',
        schedule === 'None'
          ? `${name.trim()} is available under Saved.`
          : `${name.trim()} was saved. Automatic ${schedule.toLowerCase()} delivery isn’t active yet — run it from Saved.`,
      );
      reset();
      onClose();
    } catch (e) {
      toast.error('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
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
          <Button onClick={save} disabled={!name.trim()} loading={saving}>Save report</Button>
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

/**
 * Collects exactly the parameters a report declares before running it.
 * Previously every report downloaded the whole table with no period at all —
 * a "Daily Attendance Register" that ignored the date.
 */
function RunReportModal({
  report, onClose, onRun,
}: {
  report: CatalogReport;
  onClose: () => void;
  onRun: (format: string, params: Record<string, string>) => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + '01';
  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  const [format, setFormat] = useState('csv');
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const needs = (p: string) => report.params.includes(p as never);

  const submit = async () => {
    setBusy(true);
    const params: Record<string, string> = {};
    if (needs('date')) params.date = date;
    if (needs('range') || needs('month')) { params.from = from; params.to = to; }
    if (needs('department') && departmentId) params.departmentId = departmentId;
    if (needs('status') && status) params.status = status;
    try { await onRun(format, params); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} title={report.title} description={report.description} size="md">
      <div className="space-y-4">
        {needs('date') && (
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}
        {(needs('range') || needs('month')) && (
          <div className="grid grid-cols-2 gap-3">
            <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        )}
        {needs('department') && (
          <div>
            <Label>Department</Label>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All departments</option>
              {(depts ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
        )}
        {needs('status') && (
          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any status</option>
              {['pending', 'approved', 'rejected', 'cancelled'].map((v) => <option key={v} value={v}>{v}</option>)}
            </Select>
          </div>
        )}
        {report.params.length === 0 && (
          <p className="text-sm text-muted-foreground">This report takes no parameters — it covers everything you can see.</p>
        )}
        <div>
          <Label>Format</Label>
          <Select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="pdf">PDF</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            <Download className="h-4 w-4" /> {busy ? 'Generating…' : 'Generate & download'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
