import { useState } from 'react';
import { Plus, Trash2, GitBranch } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, Skeleton } from '../../components/feedback/States';
import { useQuery } from '../../hooks/useQuery';
import { travelRulesService, type TravelRule } from '../../services';
import { useToast } from '../../store/toast';

const STEP_LABEL: Record<string, string> = {
  supervisor: 'Supervisor',
  department_head: 'Department Head',
  finance: 'Finance',
};
const ALL_STEPS = ['supervisor', 'department_head', 'finance'] as const;

/**
 * The level-based approval matrix. Ranges must not overlap — the server
 * rejects that — so a request can never match two contradictory chains.
 * With no rules at all the engine falls back to supervisor → head → finance,
 * which is why this screen is optional rather than blocking.
 */
export function TravelRulesPanel() {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const { data: rules, loading } = useQuery(() => travelRulesService.list(), [version]);
  const [adding, setAdding] = useState(false);
  const refresh = () => setVersion((v) => v + 1);

  const remove = async (r: TravelRule) => {
    try {
      await travelRulesService.remove(r.id);
      toast.success('Rule removed', `${r.name} no longer applies.`);
      refresh();
    } catch (e) {
      toast.error('Could not remove', (e as Error).message);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Travel approval rules</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Who signs off, by position level. Without any rule, requests go Supervisor → Department Head → Finance.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add rule</Button>
      </div>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : !rules?.length && !adding ? (
        <EmptyState
          icon={<GitBranch className="h-6 w-6" />}
          title="Using the default chain"
          description="Add a rule only when some position levels should skip or add an approver."
        />
      ) : (
        <div className="space-y-2">
          {(rules ?? []).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">Designation level {r.minLevel}–{r.maxLevel}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {r.steps.map((s, i) => (
                  <span key={s} className="flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground">→</span>}
                    <Badge tone="info">{STEP_LABEL[s] ?? s}</Badge>
                  </span>
                ))}
              </div>
              <Button size="icon" variant="ghost" aria-label="Remove rule" onClick={() => void remove(r)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {adding && <RuleForm onClose={() => setAdding(false)} onSaved={() => { setAdding(false); refresh(); }} />}
    </Card>
  );
}

function RuleForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [minLevel, setMinLevel] = useState('0');
  const [maxLevel, setMaxLevel] = useState('5');
  const [steps, setSteps] = useState<string[]>(['supervisor', 'department_head', 'finance']);
  const [saving, setSaving] = useState(false);

  const toggle = (s: string) =>
    setSteps((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...ALL_STEPS].filter((x) => cur.includes(x) || x === s)));

  const save = async () => {
    if (!name.trim()) { toast.error('Name required'); return; }
    if (!steps.length) { toast.error('Pick at least one approver'); return; }
    setSaving(true);
    try {
      await travelRulesService.create({
        name: name.trim(), minLevel: Number(minLevel), maxLevel: Number(maxLevel), steps: steps as TravelRule['steps'],
      });
      toast.success('Rule added');
      onSaved();
    } catch (e) {
      toast.error('Could not save', (e as Error).message);
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-3 rounded-lg border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div><Label>Rule name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Senior staff" /></div>
        <div><Label>From level</Label><Input type="number" min={0} value={minLevel} onChange={(e) => setMinLevel(e.target.value)} /></div>
        <div><Label>To level</Label><Input type="number" min={0} value={maxLevel} onChange={(e) => setMaxLevel(e.target.value)} /></div>
      </div>
      <div className="mt-3">
        <Label>Approvers, in order</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {ALL_STEPS.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs transition',
                steps.includes(s) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
              ].join(' ')}>
              {STEP_LABEL[s]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Order is fixed: Supervisor, then Department Head, then Finance. Deselect any that should be skipped.
        </p>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button size="sm" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Add rule'}</Button>
      </div>
    </div>
  );
}
