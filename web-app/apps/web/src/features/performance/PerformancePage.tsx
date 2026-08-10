import { useEffect, useMemo, useState } from 'react';
import {
  Play, Plus, ClipboardCheck, Star, Target, AlertTriangle, MoreHorizontal, Eye, CalendarClock,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { Card, CardBody } from '../../components/ui/Card';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/charts/StatCard';
import { Tabs } from '../../components/ui/Tabs';
import { Progress } from '../../components/ui/Misc';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Label } from '../../components/ui/Input';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { EmptyState, Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { performanceService, employeesService } from '../../services';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDate, relativeTime } from '../../lib/format';
import type { PerformanceReview, Goal } from '../../lib/types';
import { useEmployeeOptions } from '../../hooks/useEmployeeOptions';

const REVIEW_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'closed', label: 'Closed' },
];

const SCORE_TONE = (score: number): 'success' | 'primary' | 'warning' | 'danger' =>
  score >= 4 ? 'success' : score >= 3 ? 'primary' : score >= 2 ? 'warning' : 'danger';

const GOAL_ORDER: Record<Goal['status'], number> = {
  at_risk: 0, off_track: 1, on_track: 2, not_started: 3, completed: 4,
};
const GOAL_PROGRESS_TONE: Record<Goal['status'], 'success' | 'primary' | 'warning' | 'danger'> = {
  completed: 'success', on_track: 'primary', not_started: 'primary', at_risk: 'warning', off_track: 'danger',
};

export default function PerformancePage() {
  const canManage = usePermission('performance:create');
  const [tab, setTab] = useState<'reviews' | 'goals'>('reviews');
  const [cycleOpen, setCycleOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [viewReview, setViewReview] = useState<PerformanceReview | null>(null);

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all' });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'updatedAt', order: 'desc' });

  const reviewParams = useMemo(
    () => ({ page, limit: 10, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data, loading, error, refetch } = useQuery(() => performanceService.reviews(reviewParams), [reviewParams]);
  const { data: goals, loading: goalsLoading, error: goalsError, refetch: refetchGoals } = useQuery(() => performanceService.goals(), []);

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const setFilter = (key: string, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const clear = () => { setSearch(''); setFilters({ status: 'all' }); setPage(1); };

  const activeReviews = data?.data.filter((r) => r.status === 'in_progress' || r.status === 'submitted').length ?? 0;
  const scored = data?.data.filter((r) => r.overallScore != null) ?? [];
  const avgScore = scored.length ? (scored.reduce((s, r) => s + (r.overallScore ?? 0), 0) / scored.length) : 0;
  const onTrack = goals?.filter((g) => g.status === 'on_track' || g.status === 'completed').length ?? 0;
  const atRisk = goals?.filter((g) => g.status === 'at_risk' || g.status === 'off_track').length ?? 0;

  const sortedGoals = useMemo(
    () => (goals ? [...goals].sort((a, b) => GOAL_ORDER[a.status] - GOAL_ORDER[b.status]) : undefined),
    [goals],
  );

  const columns: Column<PerformanceReview>[] = [
    {
      key: 'employeeName', header: 'Employee', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} src={r.avatarUrl} size="sm" />
          <span className="truncate font-medium text-foreground">{r.employeeName}</span>
        </div>
      ),
    },
    { key: 'departmentName', header: 'Department', sortable: true, render: (r) => <span className="text-foreground">{r.departmentName}</span> },
    { key: 'cycle', header: 'Cycle', render: (r) => <span className="text-muted-foreground">{r.cycle}</span> },
    {
      key: 'reviewerName', header: 'Reviewer',
      render: (r) => (r.reviewerName ? (
        <div className="flex items-center gap-2">
          <Avatar name={r.reviewerName} size="xs" />
          <span className="truncate text-foreground">{r.reviewerName}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      )),
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge value={r.status} /> },
    {
      key: 'overallScore', header: 'Score', sortable: true,
      render: (r) => r.overallScore == null
        ? <span className="text-muted-foreground">—</span>
        : (
          <div className="w-28">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{r.overallScore.toFixed(1)} / 5</span>
            </div>
            <Progress value={(r.overallScore / 5) * 100} tone={SCORE_TONE(r.overallScore)} />
          </div>
        ),
    },
    { key: 'updatedAt', header: 'Updated', sortable: true, align: 'right', render: (r) => <span className="text-muted-foreground">{relativeTime(r.updatedAt)}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
          <DropdownItem icon={<Eye />} onClick={() => setViewReview(r)}>View review</DropdownItem>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Performance"
        description="Track review cycles, appraisal scores and goal progress across teams."
        actions={canManage && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCycleOpen(true)}><Play className="h-4 w-4" /> Start Review Cycle</Button>
            <Button size="sm" onClick={() => setReviewOpen(true)}><Plus className="h-4 w-4" /> New Review</Button>
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard loading={loading} label="Active Reviews" value={activeReviews} icon={<ClipboardCheck />} accent="primary" />
        <StatCard loading={loading} label="Avg Score" value={avgScore ? `${avgScore.toFixed(1)} / 5` : '—'} icon={<Star />} accent="success" hint="Submitted reviews" />
        <StatCard loading={goalsLoading} label="Goals On Track" value={onTrack} icon={<Target />} accent="info" />
        <StatCard loading={goalsLoading} label="At Risk" value={atRisk} icon={<AlertTriangle />} accent="danger" />
      </div>

      <Tabs
        tabs={[
          { value: 'reviews', label: 'Reviews', count: data?.meta.total },
          { value: 'goals', label: 'Goals', count: goals?.length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as 'reviews' | 'goals')}
      />

      {tab === 'reviews' ? (
        <div className="space-y-5">
          <FilterBar
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search employee or reviewer…"
            filters={[{ key: 'status', placeholder: 'All statuses', value: filters.status, options: REVIEW_STATUS_OPTIONS }]}
            onFilterChange={setFilter}
            onClear={clear}
          />
          <DataTable
            columns={columns}
            rows={data?.data}
            loading={loading}
            error={error}
            onRetry={refetch}
            rowKey={(r) => r.id}
            sort={sort}
            onSortChange={onSort}
            empty={{ title: 'No reviews found', description: 'No performance reviews match your current filters.' }}
            pagination={data ? { page, totalPages: data.meta.totalPages, total: data.meta.total, limit: data.meta.limit, onPage: setPage } : undefined}
          />
        </div>
      ) : (
        <GoalsGrid goals={sortedGoals} loading={goalsLoading} error={goalsError} onRetry={refetchGoals} />
      )}

      <StartCycleModal open={cycleOpen} onClose={() => setCycleOpen(false)} onCreated={() => { setCycleOpen(false); refetch(); }} />
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} onSaved={() => { setReviewOpen(false); refetch(); }} />
      <ViewReviewModal review={viewReview} onClose={() => setViewReview(null)} onSaved={() => { setViewReview(null); refetch(); }} />
    </div>
  );
}

function GoalsGrid({ goals, loading, error, onRetry }: { goals?: Goal[]; loading?: boolean; error?: string; onRetry?: () => void }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-lg" />)}
      </div>
    );
  }
  if (error) {
    return (
      <Card>
        <CardBody>
          <EmptyState title="Could not load goals" description={error} action={<Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>} />
        </CardBody>
      </Card>
    );
  }
  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardBody><EmptyState icon={<Target />} title="No goals yet" description="Objectives created for this cycle will appear here." /></CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {goals.map((g) => {
        const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
        return (
          <Card key={g.id} className="flex flex-col">
            <CardBody className="flex flex-1 flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 font-medium leading-snug text-foreground">{g.title}</h3>
                <StatusBadge value={g.status} />
              </div>

              <div className="flex items-center gap-2">
                <Avatar name={g.ownerName} size="xs" />
                <span className="truncate text-sm text-muted-foreground">{g.ownerName}</span>
              </div>

              <div className="mt-auto space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    {g.current} <span className="text-muted-foreground">/ {g.target} {g.metric}</span>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
                </div>
                <Progress value={pct} tone={GOAL_PROGRESS_TONE[g.status]} />
              </div>

              <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Due {formatDate(g.dueDate)}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function StartCycleModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !startDate || !endDate) {
      toast.error('Missing fields', 'Give the cycle a name and a date range.');
      return;
    }
    if (endDate < startDate) {
      toast.error('Invalid range', 'End date must be on or after the start date.');
      return;
    }
    setSaving(true);
    try {
      await performanceService.createCycle({ name: name.trim(), startDate, endDate, isActive: true });
      toast.success('Review cycle started', `${name.trim()} is now open.`);
      onCreated();
      setName(''); setStartDate(''); setEndDate('');
    } catch (e) {
      toast.error('Could not start cycle', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start review cycle"
      description="Open an appraisal window. Reviewers then score their team within these dates."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>Start cycle</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="cycle-name" required>Cycle name</Label>
          <Input id="cycle-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. H2 2026 Appraisal" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cycle-start" required>Start date</Label>
            <Input id="cycle-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cycle-end" required>End date</Label>
            <Input id="cycle-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Rate an employee for the active cycle. Employee list is role-scoped by the
 *  API (a head sees only their team). The active cycle is auto-attached, so the
 *  reviewer never picks a cycle — they just score. */
function ReviewModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { data: cycles } = useQuery(() => performanceService.cycles(), []);
  const { employees } = useEmployeeOptions();
  const [employeeId, setEmployeeId] = useState('');
  const [score, setScore] = useState(4);
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  const activeCycle = (cycles ?? []).find((c) => c.isActive) ?? (cycles ?? [])[0];

  const save = async () => {
    if (!employeeId) { toast.error('Pick an employee', 'Choose who you are reviewing.'); return; }
    if (!activeCycle) { toast.error('No active cycle', 'Start a review cycle first.'); return; }
    setSaving(true);
    try {
      await performanceService.createReview({
        employeeId, cycleId: activeCycle.id, overallScore: score,
        summary: summary.trim() || undefined, status: 'submitted',
      });
      toast.success('Review submitted', 'The score has been recorded.');
      onSaved();
      setEmployeeId(''); setScore(4); setSummary('');
    } catch (e) {
      toast.error('Could not submit review', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New review"
      description={activeCycle ? `Scoring for “${activeCycle.name}”.` : 'Start a review cycle first.'}
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} loading={saving} disabled={!activeCycle}>Submit review</Button>
      </>}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="rev-emp" required>Employee</Label>
          <select
            id="rev-emp"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground focus-ring"
          >
            <option value="">Select an employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}{e.departmentName ? ` — ${e.departmentName}` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="rev-score" required>Score (1–5)</Label>
          <div className="flex items-center gap-3">
            <input
              id="rev-score" type="range" min={1} max={5} step={0.5}
              value={score} onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-10 text-right text-lg font-semibold tabular-nums text-foreground">{score.toFixed(1)}</span>
          </div>
        </div>
        <div>
          <Label htmlFor="rev-summary">Summary</Label>
          <Textarea id="rev-summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)}
            placeholder="Strengths, areas to develop, notable outcomes this cycle…" />
        </div>
      </div>
    </Modal>
  );
}

/** Read the score and summary for one review; edit if permitted. */
function ViewReviewModal({ review, onClose, onSaved }: { review: PerformanceReview | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const canManage = usePermission('performance:update');
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (review) { setScore(Number(review.overallScore ?? 0)); setSummary(review.summary ?? ''); }
  }, [review]);

  if (!review) return null;

  const save = async () => {
    setSaving(true);
    try {
      await performanceService.updateReview(review.id, { overallScore: score, summary: summary.trim() || undefined });
      toast.success('Review updated', `${review.employeeName}'s score saved.`);
      onSaved();
    } catch (e) {
      toast.error('Could not update', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!review}
      onClose={onClose}
      title={`Review — ${review.employeeName}`}
      description={review.cycle ? `Cycle: ${review.cycle}` : undefined}
      footer={<>
        <Button variant="outline" onClick={onClose}>Close</Button>
        {canManage && <Button onClick={save} loading={saving}>Save changes</Button>}
      </>}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="vr-score">Score (1–5)</Label>
          <div className="flex items-center gap-3">
            <input id="vr-score" type="range" min={1} max={5} step={0.5} value={score}
              disabled={!canManage} onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1 accent-primary disabled:opacity-60" />
            <span className="w-10 text-right text-lg font-semibold tabular-nums text-foreground">{score.toFixed(1)}</span>
          </div>
        </div>
        <div>
          <Label htmlFor="vr-summary">Summary</Label>
          <Textarea id="vr-summary" rows={4} value={summary} disabled={!canManage}
            onChange={(e) => setSummary(e.target.value)} placeholder="No summary recorded." />
        </div>
      </div>
    </Modal>
  );
}
