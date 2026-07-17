import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import { NAV_FLAT } from '../config/nav';
import { EMPLOYEES } from '../services/mock/data';
import { cn } from '../lib/utils';
import { Avatar } from '../components/ui/Avatar';
import { Kbd } from '../components/ui/Misc';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const pages = NAV_FLAT.filter((p) => !query || p.label.toLowerCase().includes(query)).map((p) => ({ type: 'page' as const, id: p.to, label: p.label, to: p.to, icon: p.icon }));
    const people = query
      ? EMPLOYEES.filter((e) => e.fullName.toLowerCase().includes(query) || e.employeeCode.toLowerCase().includes(query)).slice(0, 5).map((e) => ({ type: 'person' as const, id: e.id, label: e.fullName, sub: `${e.employeeCode} · ${e.departmentName}`, to: `/employees?highlight=${e.id}` }))
      : [];
    return [...pages, ...people];
  }, [q]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === 'Enter' && results[active]) { navigate(results[active].to); onClose(); }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, active, navigate, onClose]);

  useEffect(() => { if (open) setQ(''); }, [open]);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-pop animate-scale-in">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4.5 w-4.5 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages, employees…" className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <Kbd>Esc</Kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{q}”.</p>}
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.id}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => { navigate(r.to); onClose(); }}
              className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left', i === active ? 'bg-primary/10' : 'hover:bg-surface-2')}
            >
              {r.type === 'page' ? (
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-muted-foreground')}>
                  {'icon' in r && r.icon ? <r.icon className="h-4 w-4" /> : null}
                </span>
              ) : (
                <Avatar name={r.label} size="sm" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.label}</p>
                {'sub' in r && r.sub && <p className="truncate text-xs text-muted-foreground">{r.sub}</p>}
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.type}</span>
              {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
