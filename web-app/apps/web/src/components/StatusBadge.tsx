import { Badge } from './ui/Badge';
import { useI18n } from '../store/i18n';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const MAP: Record<string, { tone: Tone; label: string }> = {
  // employee
  active: { tone: 'success', label: 'Active' },
  probation: { tone: 'info', label: 'Probation' },
  on_leave: { tone: 'warning', label: 'On Leave' },
  suspended: { tone: 'danger', label: 'Suspended' },
  resigned: { tone: 'neutral', label: 'Resigned' },
  terminated: { tone: 'neutral', label: 'Terminated' },
  // user accounts
  invited: { tone: 'info', label: 'Invited' },
  disabled: { tone: 'neutral', label: 'Disabled' },
  // attendance
  present: { tone: 'success', label: 'Present' },
  absent: { tone: 'danger', label: 'Absent' },
  late: { tone: 'warning', label: 'Late' },
  half_day: { tone: 'warning', label: 'Half Day' },
  wfh: { tone: 'info', label: 'WFH' },
  holiday: { tone: 'neutral', label: 'Holiday' },
  // leave / approvals
  pending: { tone: 'warning', label: 'Pending' },
  approved: { tone: 'success', label: 'Approved' },
  rejected: { tone: 'danger', label: 'Rejected' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
  // task
  backlog: { tone: 'neutral', label: 'Backlog' },
  todo: { tone: 'neutral', label: 'To Do' },
  in_progress: { tone: 'info', label: 'In Progress' },
  in_review: { tone: 'accent', label: 'In Review' },
  blocked: { tone: 'danger', label: 'Blocked' },
  done: { tone: 'success', label: 'Done' },
  // priority
  low: { tone: 'neutral', label: 'Low' },
  medium: { tone: 'info', label: 'Medium' },
  high: { tone: 'warning', label: 'High' },
  urgent: { tone: 'danger', label: 'Urgent' },
  // performance / goals
  draft: { tone: 'neutral', label: 'Draft' },
  submitted: { tone: 'info', label: 'Submitted' },
  reviewed: { tone: 'success', label: 'Reviewed' },
  acknowledged: { tone: 'primary', label: 'Acknowledged' },
  closed: { tone: 'success', label: 'Closed' },
  not_started: { tone: 'neutral', label: 'Not Started' },
  on_track: { tone: 'success', label: 'On Track' },
  at_risk: { tone: 'warning', label: 'At Risk' },
  off_track: { tone: 'danger', label: 'Off Track' },
  completed: { tone: 'success', label: 'Completed' },
};

export function StatusBadge({ value, dot = true }: { value: string; dot?: boolean }) {
  const { t } = useI18n();
  const cfg = MAP[value] ?? { tone: 'neutral' as Tone, label: value.replace(/_/g, ' ') };
  return <Badge tone={cfg.tone} dot={dot}>{t(cfg.label)}</Badge>;
}
