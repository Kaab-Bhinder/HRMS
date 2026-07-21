import { useMemo, useState } from 'react';
import {
  Plus, MoreHorizontal, Eye, ListChecks, Loader2, Ban, CheckCircle2, Paperclip, AlarmClock,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { AvatarGroup } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/StatusBadge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { TaskDetailModal } from './TaskDetailModal';
import { Tabs } from '../../components/ui/Tabs';
import { Progress } from '../../components/ui/Misc';
import { Input, Textarea, Select, Label } from '../../components/ui/Input';
import { StatCard } from '../../components/charts/StatCard';
import { Skeleton, EmptyState, ErrorState } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { tasksService, departmentsService, employeesService, filesService } from '../../services';
import { useToast } from '../../store/toast';
import { usePermission } from '../../store/auth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDate } from '../../lib/format';
import type { Task, TaskStatus, TaskPriority, Employee } from '../../lib/types';

/** How much time is left until a due date, as a labelled, tone-coloured chip. */
function timeLeft(dueDate?: string, status?: TaskStatus): { label: string; tone: 'neutral' | 'warning' | 'danger' | 'success' } | null {
  if (!dueDate) return null;
  if (status === 'done') return { label: 'Completed', tone: 'success' };
  const due = new Date(dueDate).getTime();
  const diff = due - Date.now();
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const human = days >= 1 ? `${days}d ${hours}h` : `${hours}h`;
  if (diff < 0) return { label: `Overdue ${human}`, tone: 'danger' };
  if (diff < 2 * 86_400_000) return { label: `${human} left`, tone: 'warning' };
  return { label: `${human} left`, tone: 'neutral' };
}

function TimeLeft({ dueDate, status }: { dueDate?: string; status?: TaskStatus }) {
  const t = timeLeft(dueDate, status);
  if (!t) return <span className="text-xs text-muted-foreground">No due date</span>;
  return <Badge tone={t.tone === 'neutral' ? 'neutral' : t.tone}><AlarmClock className="h-3 w-3" /> {t.label}</Badge>;
}

const COLUMNS: { status: TaskStatus; label: string; dot: string }[] = [
  { status: 'backlog', label: 'Backlog', dot: 'bg-muted-foreground/50' },
  { status: 'todo', label: 'To Do', dot: 'bg-info' },
  { status: 'in_progress', label: 'In Progress', dot: 'bg-primary' },
  { status: 'in_review', label: 'In Review', dot: 'bg-accent' },
  { status: 'blocked', label: 'Blocked', dot: 'bg-danger' },
  { status: 'done', label: 'Done', dot: 'bg-success' },
];

const STATUS_OPTIONS = COLUMNS.map((c) => ({ value: c.status, label: c.label }));
const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
];

function progressTone(status: TaskStatus): 'primary' | 'success' | 'warning' | 'danger' {
  if (status === 'done') return 'success';
  if (status === 'blocked') return 'danger';
  if (status === 'in_review') return 'warning';
  return 'primary';
}

export default function TasksPage() {
  const canCreate = usePermission('tasks:create');

  const [tab, setTab] = useState<'board' | 'list'>('board');
  const [formOpen, setFormOpen] = useState(false);

  // Board data — full set used for stats + kanban
  const [detail, setDetail] = useState<Task | null>(null);
  const { data: board, loading: boardLoading, error: boardError, refetch: refetchBoard } = useQuery(() => tasksService.board(), []);

  // List data — paginated + filtered
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({ status: 'all', priority: 'all' });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: 'dueDate', order: 'asc' });

  const params = useMemo(
    () => ({ page, limit: 10, search: debounced, sort: sort.key, order: sort.order, filters }),
    [page, debounced, sort, filters],
  );
  const { data: list, loading: listLoading, error: listError, refetch: refetchList } = useQuery(() => tasksService.list(params), [params]);

  const onSort = (key: string) => setSort((s) => ({ key, order: s.key === key && s.order === 'asc' ? 'desc' : 'asc' }));
  const setFilter = (key: string, value: string) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };
  const clear = () => { setSearch(''); setFilters({ status: 'all', priority: 'all' }); setPage(1); };

  const stats = useMemo(() => {
    const rows = board ?? [];
    return {
      total: rows.length,
      inProgress: rows.filter((t) => t.status === 'in_progress').length,
      blocked: rows.filter((t) => t.status === 'blocked').length,
      done: rows.filter((t) => t.status === 'done').length,
    };
  }, [board]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { backlog: [], todo: [], in_progress: [], in_review: [], blocked: [], done: [] };
    for (const t of board ?? []) map[t.status]?.push(t);
    return map;
  }, [board]);

  const columns: Column<Task>[] = [
    {
      key: 'title', header: 'Task', sortable: true,
      render: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{t.title}</p>
          <p className="truncate text-xs text-muted-foreground">{t.description}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (t) => <StatusBadge value={t.status} /> },
    { key: 'priority', header: 'Priority', sortable: true, render: (t) => <StatusBadge value={t.priority} dot={false} /> },
    {
      key: 'assignees', header: 'Assignees',
      render: (t) => (t.assignees.length ? <AvatarGroup people={t.assignees} size="xs" /> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: 'progress', header: 'Progress',
      render: (t) => (
        <div className="flex min-w-[7rem] items-center gap-2">
          <Progress value={t.progress} tone={progressTone(t.status)} className="w-20" />
          <span className="text-xs tabular-nums text-muted-foreground">{t.progress}%</span>
        </div>
      ),
    },
    { key: 'departmentName', header: 'Department', render: (t) => <span className="text-muted-foreground">{t.departmentName}</span> },
    {
      key: 'dueDate', header: 'Time left', sortable: true, align: 'right',
      render: (t) => (
        <div className="flex flex-col items-end gap-0.5">
          <TimeLeft dueDate={t.dueDate} status={t.status} />
          {t.dueDate && <span className="text-[11px] text-muted-foreground">{formatDate(t.dueDate)}</span>}
        </div>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: () => (
        <Dropdown trigger={<Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>}>
          <DropdownItem icon={<Eye />}>View task</DropdownItem>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tasks"
        description="Track HR operations, onboarding and compliance work across every department."
        actions={canCreate && <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New Task</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={boardLoading} label="Total Tasks" value={stats.total} icon={<ListChecks />} accent="primary" hint="Across all boards" />
        <StatCard loading={boardLoading} label="In Progress" value={stats.inProgress} icon={<Loader2 />} accent="info" />
        <StatCard loading={boardLoading} label="Blocked" value={stats.blocked} icon={<Ban />} accent="danger" hint="Needs attention" />
        <StatCard loading={boardLoading} label="Completed" value={stats.done} icon={<CheckCircle2 />} accent="success" />
      </div>

      <Tabs
        tabs={[
          { value: 'board', label: 'Board', count: stats.total },
          { value: 'list', label: 'List' },
        ]}
        value={tab}
        onChange={(v) => setTab(v as 'board' | 'list')}
      />

      {tab === 'board' ? (
        <BoardView loading={boardLoading} error={boardError} onRetry={refetchBoard} grouped={grouped} onOpen={setDetail} />
      ) : (
        <div className="space-y-4">
          <FilterBar
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search tasks, departments…"
            filters={[
              { key: 'status', placeholder: 'All statuses', value: filters.status, options: STATUS_OPTIONS },
              { key: 'priority', placeholder: 'All priorities', value: filters.priority, options: PRIORITY_OPTIONS },
            ]}
            onFilterChange={setFilter}
            onClear={clear}
          />
          <DataTable
            columns={columns}
            rows={list?.data}
            loading={listLoading}
            error={listError}
            onRetry={refetchList}
            rowKey={(t) => t.id}
            onRowClick={(t) => setDetail(t)}
            sort={sort}
            onSortChange={onSort}
            empty={{ title: 'No tasks found', description: 'Adjust your filters or create a new task to get started.', action: canCreate ? <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New Task</Button> : undefined }}
            pagination={list ? { page, totalPages: list.meta.totalPages, total: list.meta.total, limit: list.meta.limit, onPage: setPage } : undefined}
          />
        </div>
      )}

      <TaskDetailModal
        task={detail}
        onClose={() => setDetail(null)}
        onChanged={() => { refetchBoard(); refetchList(); }}
      />
      <NewTaskModal open={formOpen} onClose={() => setFormOpen(false)} onCreated={() => { refetchBoard(); refetchList(); }} />
    </div>
  );
}

function BoardView({
  loading, error, onRetry, grouped, onOpen,
}: {
  loading: boolean;
  error?: string;
  onRetry: () => void;
  grouped: Record<TaskStatus, Task[]>;
  onOpen: (task: Task) => void;
}) {
  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface shadow-card">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }
  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4 px-1">
        {COLUMNS.map((col) => {
          const items = grouped[col.status] ?? [];
          return (
            <section key={col.status} className="flex w-[280px] shrink-0 flex-col rounded-lg border border-border bg-surface-2/40">
              <header className="flex items-center justify-between px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                </div>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{loading ? '–' : items.length}</span>
              </header>
              <div className="flex flex-col gap-2.5 px-2.5 pb-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
                ) : items.length === 0 ? (
                  <EmptyState className="py-8" title="Nothing here" description="No tasks in this column." />
                ) : (
                  items.map((t) => <TaskCard key={t.id} task={t} onOpen={() => onOpen(t)} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  return (
    <article
      onClick={onOpen}
      className="cursor-pointer rounded-lg border border-border bg-surface p-3 shadow-card transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
        <StatusBadge value={task.priority} dot={false} />
      </div>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums">{task.progress}%</span>
        </div>
        <Progress value={task.progress} tone={progressTone(task.status)} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        {task.assignees.length ? <AvatarGroup people={task.assignees} size="xs" /> : <span className="text-xs text-muted-foreground">Unassigned</span>}
        <TimeLeft dueDate={task.dueDate} status={task.status} />
      </div>
    </article>
  );
}

function NewTaskModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const { data: depts } = useQuery(() => departmentsService.tree(), []);
  // Team-scoped: a department head only sees their own team as assignees.
  const { data: empPage } = useQuery(() => employeesService.list({ page: 1, limit: 100 }), []);
  const team: Employee[] = empPage?.data ?? [];

  const empty = { title: '', description: '', departmentId: '', priority: 'medium' as TaskPriority, status: 'todo' as TaskStatus, startDate: '', dueDate: '', estimatedHours: '' };
  const [form, setForm] = useState(empty);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleAssignee = (id: string) => setAssignees((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const close = () => { setForm(empty); setAssignees([]); setFiles([]); onClose(); };

  const submit = async () => {
    if (!form.title.trim()) { toast.error('Title required', 'Give the task a short, clear title.'); return; }
    setSaving(true);
    try {
      const task = await tasksService.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        departmentId: form.departmentId || undefined,
        priority: form.priority,
        status: form.status,
        startDate: form.startDate || undefined,
        dueDate: form.dueDate || undefined,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      });
      for (const id of assignees) await tasksService.assign(task.id, id);
      for (const file of files) await filesService.upload('task', task.id, file);
      toast.success('Task created', `“${form.title.trim()}” assigned to ${assignees.length || 'no one'}${files.length ? ` · ${files.length} file(s)` : ''}.`);
      onCreated();
      close();
    } catch (e) {
      toast.error('Could not create task', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title="New Task"
      description="Assign work to your team, set a due date, and attach files."
      footer={
        <>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Create Task</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="task-title" required>Title</Label>
          <Input id="task-title" placeholder="e.g. Finalize Q3 onboarding checklist" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="task-desc">Description</Label>
          <Textarea id="task-desc" placeholder="Add context, acceptance criteria or links…" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="task-dept">Department</Label>
            <Select id="task-dept" value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
              <option value="">Select department</option>
              {(depts ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="task-priority">Priority</Label>
            <Select id="task-priority" value={form.priority} onChange={(e) => set('priority', e.target.value as TaskPriority)}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="task-start">Start date</Label>
            <Input id="task-start" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="task-due">Due date</Label>
            <Input id="task-due" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="task-est">Estimated hours</Label>
            <Input id="task-est" type="number" min={0} step="0.5" placeholder="e.g. 8" value={form.estimatedHours} onChange={(e) => set('estimatedHours', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="task-status">Status</Label>
            <Select id="task-status" value={form.status} onChange={(e) => set('status', e.target.value as TaskStatus)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label>Assign to <span className="font-normal text-muted-foreground">({assignees.length} selected)</span></Label>
          {team.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members available to assign.</p>
          ) : (
            <div className="grid max-h-44 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-2">
              {team.map((e) => (
                <label key={e.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/40">
                  <input type="checkbox" checked={assignees.includes(e.id)} onChange={() => toggleAssignee(e.id)} className="h-4 w-4 rounded border-border accent-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{e.fullName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{e.employeeCode} · {e.departmentName}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Attachments <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-3 text-sm text-muted-foreground hover:bg-surface-2/50">
            <Paperclip className="h-4 w-4" /> <span>Choose files…</span>
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          </label>
          {files.length > 0 && <div className="mt-2 space-y-1">{files.map((f, i) => <p key={i} className="truncate text-xs text-muted-foreground">• {f.name}</p>)}</div>}
        </div>
      </div>
    </Modal>
  );
}
