import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarOff, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useQuery } from '../../hooks/useQuery';
import { holidaysService, type Holiday } from '../../services';
import { useToast } from '../../store/toast';
import { cn } from '../../lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Month calendar for marking public holidays. Weekly-off days are shaded
 *  (already non-working); click any working day to add/remove a holiday. Holidays
 *  are excluded from expected working days, so pay is never docked for them. */
export function HolidayCalendar({ weeklyOffDays }: { weeklyOffDays: number[] }) {
  const toast = useToast();
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const { data: holidays, refetch } = useQuery(() => holidaysService.list(), []);
  const [adding, setAdding] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<Holiday | null>(null);

  // Map YYYY-MM-DD → holiday for quick lookup.
  const byDate = useMemo(() => {
    const m = new Map<string, Holiday>();
    for (const h of holidays ?? []) m.set(h.date.slice(0, 10), h);
    return m;
  }, [holidays]);

  const firstDow = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const shift = (by: number) => setView((v) => {
    const d = new Date(Date.UTC(v.y, v.m + by, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });

  const monthHolidayCount = (holidays ?? []).filter((h) => h.date.slice(0, 7) === `${view.y}-${String(view.m + 1).padStart(2, '0')}`).length;

  const save = async () => {
    if (!adding) return;
    setBusy(true);
    try {
      await holidaysService.create({ name: name.trim() || 'Holiday', date: adding });
      toast.success('Holiday added', `${name.trim() || 'Holiday'} on ${adding}.`);
      setAdding(null); setName('');
      refetch();
    } catch (e) {
      toast.error('Could not add holiday', (e as Error).message);
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    try {
      await holidaysService.remove(removing.id);
      toast.success('Holiday removed', removing.name);
      setRemoving(null);
      refetch();
    } catch (e) {
      toast.error('Could not remove holiday', (e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader
        title={<span className="flex items-center gap-2"><CalendarOff className="h-4 w-4 text-primary" /> Holidays</span>}
        description="Mark public holidays — they’re excluded from working days, so pay is never docked."
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-[9.5rem] text-center text-sm font-medium text-foreground">{MONTHS[view.m]} {view.y}</span>
            <Button variant="ghost" size="icon" onClick={() => shift(1)} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />
      <CardBody>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={cn('pb-1 text-center text-xs font-medium', weeklyOffDays.includes(i) ? 'text-muted-foreground/60' : 'text-muted-foreground')}>{w}</div>
          ))}
          {cells.map((day, i) => {
            if (day == null) return <div key={`b${i}`} />;
            const key = ymd(view.y, view.m, day);
            const dow = new Date(Date.UTC(view.y, view.m, day)).getUTCDay();
            const isOff = weeklyOffDays.includes(dow);
            const holiday = byDate.get(key);
            const isToday = key === ymd(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <button
                key={key}
                type="button"
                disabled={isOff}
                onClick={() => (holiday ? setRemoving(holiday) : (setAdding(key), setName('')))}
                title={holiday?.name}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors',
                  isOff && 'cursor-default border-transparent bg-muted/40 text-muted-foreground/50',
                  !isOff && !holiday && 'border-border text-foreground hover:border-primary hover:bg-primary/5',
                  holiday && 'border-accent bg-accent/15 text-accent hover:bg-accent/25',
                  isToday && !holiday && 'ring-1 ring-primary',
                )}
              >
                <span className={cn('font-medium', isToday && 'text-primary')}>{day}</span>
                {holiday && <span className="pointer-events-none mt-0.5 w-full truncate px-1 text-center text-[9px] leading-tight">{holiday.name}</span>}
                {isOff && <span className="text-[9px] leading-none">off</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-accent bg-accent/15" /> Holiday</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-muted/60" /> Weekly off</span>
          <span className="ml-auto font-medium">{monthHolidayCount} holiday{monthHolidayCount === 1 ? '' : 's'} this month</span>
        </div>
      </CardBody>

      {/* Add holiday */}
      <Modal
        open={!!adding}
        onClose={() => setAdding(null)}
        title="Add holiday"
        size="sm"
        footer={<><Button variant="outline" onClick={() => setAdding(null)}>Cancel</Button><Button onClick={save} loading={busy}><Plus className="h-4 w-4" /> Add</Button></>}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Marking <span className="font-medium text-foreground">{adding}</span> as a holiday.</p>
          <div>
            <Label htmlFor="hname">Holiday name</Label>
            <Input id="hname" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Independence Day" onKeyDown={(e) => e.key === 'Enter' && save()} />
          </div>
        </div>
      </Modal>

      {/* Remove holiday */}
      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove holiday?"
        size="sm"
        footer={<><Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button><Button variant="danger" onClick={remove} loading={busy}>Remove</Button></>}
      >
        <p className="text-sm text-muted-foreground">Remove <span className="font-medium text-foreground">{removing?.name}</span> ({removing?.date.slice(0, 10)})? That day becomes a normal working day again.</p>
      </Modal>
    </Card>
  );
}
