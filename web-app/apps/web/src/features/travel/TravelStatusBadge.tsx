import { Badge } from '../../components/ui/Badge';
import type { TravelStatus } from '../../lib/types';

const META: Record<TravelStatus, { label: string; tone: 'neutral' | 'info' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  submitted: { label: 'Awaiting approval', tone: 'warning' },
  approved: { label: 'Approved', tone: 'info' },
  rejected: { label: 'Rejected', tone: 'danger' },
  advance_paid: { label: 'Advance paid', tone: 'primary' },
  realization_submitted: { label: 'Report submitted', tone: 'warning' },
  verified: { label: 'Awaiting settlement', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export function TravelStatusBadge({ status }: { status: TravelStatus }) {
  const m = META[status] ?? { label: status, tone: 'neutral' as const };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
