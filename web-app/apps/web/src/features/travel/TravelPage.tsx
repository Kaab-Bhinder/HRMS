import { useState } from 'react';
import { Plane, Plus, Wallet, Clock, Coins } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/charts/StatCard';
import { EmptyState, Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePermission } from '../../store/auth';
import { travelService } from '../../services';
import { formatNumber, formatDate } from '../../lib/format';
import type { TravelRequest } from '../../lib/types';
import { TravelStatusBadge } from './TravelStatusBadge';
import { TravelFormModal } from './TravelFormModal';
import { TravelDetailModal } from './TravelDetailModal';
import { TravelRulesPanel } from './TravelRulesPanel';

/** Business travel: request, approve, advance, report, settle. */
export default function TravelPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 250);
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const canConfigure = usePermission('organizations:update');

  const { data: stats } = useQuery(() => travelService.stats(), [version]);
  const { data, loading } = useQuery(
    () => travelService.list({ limit: 100, search: debounced || undefined, status: status || undefined }),
    [debounced, status, version],
  );
  const rows = data?.data ?? [];
  const refresh = () => setVersion((v) => v + 1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Business Travel"
        description="Request a trip, track approvals, and settle the accountability report."
        actions={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New request</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Trips" value={formatNumber(stats?.totalTrips ?? 0)} icon={<Plane />} accent="accent" />
        <StatCard label="Total Travel Cost" value={`IDR ${formatNumber(stats?.totalCost ?? 0)}`} icon={<Wallet />} accent="success" hint="Verified spend" />
        <StatCard label="Pending Approvals" value={formatNumber(stats?.pendingApprovals ?? 0)} icon={<Clock />} accent="warning" />
        <StatCard label="Pending Reimbursements" value={formatNumber(stats?.pendingReimbursements ?? 0)} icon={<Coins />} accent="info" hint="Verified, not yet settled" />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search destination, purpose…"
        onClear={() => { setSearch(''); setStatus(''); }}
        onFilterChange={(_k, v) => setStatus(v)}
        filters={[
          {
            key: 'status',
            placeholder: 'All statuses',
            value: status,
            options: [
              { value: '', label: 'All statuses' },
              { value: 'submitted', label: 'Awaiting approval' },
              { value: 'approved', label: 'Approved' },
              { value: 'advance_paid', label: 'Advance paid' },
              { value: 'realization_submitted', label: 'Report submitted' },
              { value: 'verified', label: 'Verified — awaiting settlement' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
            ],
          },
        ]}
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Plane className="h-6 w-6" />}
            title="No travel requests"
            description="Create a request to start the approval workflow."
            action={<Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New request</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Traveller</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3 text-right">Advance</th>
                  <th className="px-5 py-3 text-right">Settlement</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r: TravelRequest) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-surface-2/40" onClick={() => setOpenId(r.id)}>
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.reference}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-foreground">{r.employeeName}</div>
                      <div className="text-xs text-muted-foreground">{r.departmentName}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-foreground">{r.destinationCity}</div>
                      {r.clientName && <div className="text-xs text-muted-foreground">{r.clientName}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(r.startDate)} → {formatDate(r.endDate)}
                      <div className="text-xs">{r.durationDays} day{r.durationDays === 1 ? '' : 's'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-foreground">
                      {r.advanceTotal ? formatNumber(r.advanceTotal) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <SettlementCell amount={r.settlementAmount} />
                    </td>
                    <td className="px-5 py-3.5"><TravelStatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {canConfigure && <TravelRulesPanel />}

      {createOpen && (
        <TravelFormModal onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); refresh(); }} />
      )}
      {openId && (
        <TravelDetailModal id={openId} onClose={() => setOpenId(null)} onChanged={refresh} />
      )}
    </div>
  );
}

/** Sign carries meaning here, so it is spelled out rather than left as a number. */
function SettlementCell({ amount }: { amount?: number | null }) {
  if (amount == null) return <span className="text-muted-foreground">—</span>;
  if (amount === 0) return <span className="text-muted-foreground">Settled</span>;
  return amount > 0
    ? <span className="text-success">+{formatNumber(amount)}<span className="ml-1 text-xs text-muted-foreground">to pay</span></span>
    : <span className="text-warning">{formatNumber(amount)}<span className="ml-1 text-xs text-muted-foreground">to return</span></span>;
}
