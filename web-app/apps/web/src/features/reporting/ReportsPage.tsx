import { useEffect, useMemo, useState } from 'react';
import { Plus, FileText, Paperclip, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea, Label } from '../../components/ui/Input';
import { useQuery } from '../../hooks/useQuery';
import { reportingService, filesService, accessService } from '../../services';
import { useToast } from '../../store/toast';
import { formatDate } from '../../lib/format';
import type { WorkReport, FileAttachment } from '../../lib/types';

const VIEW_LABEL: Record<string, string> = { admin: 'Super Admin', hr: 'HR', dept_head: 'Dept Head', employee: 'Employee' };
const PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export default function ReportsPage() {
  const toast = useToast();
  const { data: scope } = useQuery(() => accessService.scope(), []);
  const isReviewer = scope?.view === 'admin' || scope?.view === 'hr';

  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all', periodType: 'all', mine: 'all' });
  const [page, setPage] = useState(1);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selected, setSelected] = useState<WorkReport | null>(null);

  const params = useMemo(() => ({ page, limit: 10, filters }), [page, filters]);
  const { data, loading, error, refetch } = useQuery(() => reportingService.list(params), [params]);

  const setFilter = (k: string, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };

  function periodText(r: WorkReport) {
    return r.periodLabel || `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`;
  }

  const columns: Column<WorkReport>[] = [
    {
      key: 'title', header: 'Report', sortable: false,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{r.title}</p>
          <p className="truncate text-xs text-muted-foreground">{r.summary}</p>
        </div>
      ),
    },
    {
      key: 'submitterName', header: 'From',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="text-foreground">{r.submitterName}</span>
          <Badge tone="neutral">{VIEW_LABEL[r.submitterView] ?? r.submitterView}</Badge>
        </div>
      ),
    },
    { key: 'departmentName', header: 'Department', render: (r) => <span className="text-muted-foreground">{r.departmentName ?? '—'}</span> },
    { key: 'period', header: 'Period', render: (r) => <span className="text-muted-foreground">{periodText(r)}</span> },
    { key: 'submittedAt', header: 'Submitted', align: 'right', render: (r) => <span className="text-muted-foreground">{formatDate(r.submittedAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description={isReviewer ? 'Reports submitted by your department heads and HR.' : 'Submit your periodic reports and track their review.'}
        actions={<Button size="sm" onClick={() => setSubmitOpen(true)}><Plus className="h-4 w-4" /> Submit report</Button>}
      />

      <FilterBar
        search=""
        onSearch={() => {}}
        hideSearch
        filters={[
          { key: 'status', placeholder: 'All statuses', value: filters.status, options: [
            { value: 'submitted', label: 'Submitted' }, { value: 'reviewed', label: 'Reviewed' }, { value: 'acknowledged', label: 'Acknowledged' },
          ] },
          { key: 'periodType', placeholder: 'All periods', value: filters.periodType, options: PERIODS },
          ...(isReviewer ? [{ key: 'mine', placeholder: 'Everyone', value: filters.mine, options: [{ value: 'true', label: 'Only mine' }] }] : []),
        ]}
        onFilterChange={setFilter}
        onClear={() => { setFilters({ status: 'all', periodType: 'all', mine: 'all' }); setPage(1); }}
      />

      <DataTable
        columns={columns}
        rows={data?.data}
        loading={loading}
        error={error}
        onRetry={refetch}
        rowKey={(r) => r.id}
        onRowClick={(r) => setSelected(r)}
        empty={{ title: 'No reports yet', description: isReviewer ? 'Reports from your team will appear here.' : 'Submit your first report to get started.', action: <Button size="sm" onClick={() => setSubmitOpen(true)}><Plus className="h-4 w-4" /> Submit report</Button> }}
        pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
      />

      <SubmitReportModal open={submitOpen} onClose={() => setSubmitOpen(false)} onSaved={refetch} />
      <ReportDetailModal report={selected} isReviewer={isReviewer} onClose={() => setSelected(null)} onReviewed={() => { setSelected(null); refetch(); }} />
    </div>
  );
}

function SubmitReportModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', periodType: 'monthly', periodStart: '', periodEnd: '', periodLabel: '', summary: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    setForm({ title: '', periodType: 'monthly', periodStart: start.toISOString().slice(0, 10), periodEnd: end.toISOString().slice(0, 10), periodLabel: label, summary: '' });
    setFiles([]);
    setErrors({});
  }, [open]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.summary.trim()) errs.summary = 'Write a short summary';
    if (!form.periodStart || !form.periodEnd) errs.period = 'Set the reporting period';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const report = await reportingService.create(form);
      for (const file of files) {
        await filesService.upload('report', report.id, file);
      }
      toast.success('Report submitted', files.length ? `${form.title} sent with ${files.length} attachment(s).` : `${form.title} was submitted.`);
      onSaved();
      onClose();
    } catch (e) {
      toast.error('Could not submit report', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Submit report"
      description="Reports go to your reviewers (HR & Super Admin)."
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={saving}>Submit report</Button></>}
    >
      <div className="space-y-4">
        <div>
          <Label required>Title</Label>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} invalid={!!errors.title} placeholder="e.g. July operations summary" />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title}</p>}
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div>
            <Label>Period</Label>
            <Select value={form.periodType} onChange={(e) => set('periodType', e.target.value)}>
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </div>
          <div>
            <Label required>From</Label>
            <Input type="date" value={form.periodStart} onChange={(e) => set('periodStart', e.target.value)} invalid={!!errors.period} />
          </div>
          <div>
            <Label required>To</Label>
            <Input type="date" value={form.periodEnd} onChange={(e) => set('periodEnd', e.target.value)} invalid={!!errors.period} />
          </div>
        </div>
        {errors.period && <p className="-mt-2 text-xs text-danger">{errors.period}</p>}
        <div>
          <Label>Period label <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input value={form.periodLabel} onChange={(e) => set('periodLabel', e.target.value)} placeholder="e.g. July 2026 / Week of Jul 7" />
        </div>
        <div>
          <Label required>Summary</Label>
          <Textarea value={form.summary} onChange={(e) => set('summary', e.target.value)} rows={5} placeholder="What happened this period — highlights, blockers, numbers…" />
          {errors.summary && <p className="mt-1 text-xs text-danger">{errors.summary}</p>}
        </div>
        <div>
          <Label>Attachments <span className="font-normal text-muted-foreground">(optional — PDF, Word, Excel, images)</span></Label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-3 text-sm text-muted-foreground hover:bg-surface-2/50">
            <Paperclip className="h-4 w-4" />
            <span>Choose files…</span>
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          </label>
          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((f, i) => <p key={i} className="truncate text-xs text-muted-foreground">• {f.name} ({(f.size / 1024).toFixed(0)} KB)</p>)}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ReportDetailModal({ report, isReviewer, onClose, onReviewed }: { report: WorkReport | null; isReviewer: boolean; onClose: () => void; onReviewed: () => void }) {
  const toast = useToast();
  const [attachments, setAttachments] = useState<FileAttachment[] | null>(null);
  const [note, setNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    setAttachments(null);
    setNote('');
    if (report) filesService.listByOwner('report', report.id).then(setAttachments).catch(() => setAttachments([]));
  }, [report]);

  if (!report) return null;

  const review = async (status: 'reviewed' | 'acknowledged') => {
    setReviewing(true);
    try {
      await reportingService.review(report.id, status, note.trim() || undefined);
      toast.success(status === 'reviewed' ? 'Marked reviewed' : 'Acknowledged', `${report.title} updated.`);
      onReviewed();
    } catch (e) {
      toast.error('Could not update', (e as Error).message);
    } finally {
      setReviewing(false);
    }
  };

  const canReview = isReviewer && report.status === 'submitted';

  return (
    <Modal
      open={!!report}
      onClose={onClose}
      size="lg"
      title={report.title}
      description={`${VIEW_LABEL[report.submitterView] ?? report.submitterView} · ${report.submitterName}${report.departmentName ? ` · ${report.departmentName}` : ''}`}
      footer={
        canReview ? (
          <>
            <Button variant="outline" onClick={() => review('acknowledged')} loading={reviewing}>Acknowledge</Button>
            <Button onClick={() => review('reviewed')} loading={reviewing}><CheckCircle2 className="h-4 w-4" /> Mark reviewed</Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={report.status} />
          <Badge tone="neutral">{report.periodLabel || `${formatDate(report.periodStart)} – ${formatDate(report.periodEnd)}`}</Badge>
          <span className="text-xs text-muted-foreground">Submitted {formatDate(report.submittedAt)}</span>
        </div>

        <div>
          <Label>Summary</Label>
          <p className="whitespace-pre-wrap rounded-lg border border-border bg-surface-2/30 p-3.5 text-sm text-foreground">{report.summary}</p>
        </div>

        <div>
          <Label>Attachments</Label>
          {attachments === null ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attachments.</p>
          ) : (
            <div className="space-y-1.5">
              {attachments.map((a) => (
                <button key={a.id} onClick={() => filesService.download(a)} className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-surface-2/50">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate text-foreground">{a.fileName}</span>
                  <span className="text-xs text-muted-foreground">{(a.sizeBytes / 1024).toFixed(0)} KB</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>

        {report.reviewedByName && (
          <div className="rounded-lg border border-success/30 bg-success/10 p-3.5">
            <p className="text-sm text-foreground"><span className="font-medium">{report.reviewedByName}</span> {report.status} this report{report.reviewedAt ? ` on ${formatDate(report.reviewedAt)}` : ''}.</p>
            {report.reviewNote && <p className="mt-1 text-sm text-muted-foreground">“{report.reviewNote}”</p>}
          </div>
        )}

        {canReview && (
          <div>
            <Label>Review note <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Feedback for the submitter…" />
          </div>
        )}
      </div>
    </Modal>
  );
}
