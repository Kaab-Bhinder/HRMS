import { cn, hashIndex, initials } from '../../lib/utils';

const PALETTE = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  'bg-violet-500/15 text-violet-600 dark:text-violet-300',
  'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  'bg-rose-500/15 text-rose-600 dark:text-rose-300',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
  'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
];

const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

export function Avatar({ name, src, size = 'md', className }: { name: string; src?: string; size?: keyof typeof SIZES; className?: string }) {
  const color = PALETTE[hashIndex(name, PALETTE.length)];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase ring-1 ring-black/5 dark:ring-white/5', SIZES[size], !src && color, className)}>
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : initials(name)}
    </span>
  );
}

export function AvatarGroup({ people, max = 3, size = 'sm' }: { people: { name: string; avatarUrl?: string }[]; max?: number; size?: keyof typeof SIZES }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} src={p.avatarUrl} size={size} className="ring-2 ring-surface" />
      ))}
      {rest > 0 && (
        <span className={cn('inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-surface', SIZES[size])}>+{rest}</span>
      )}
    </div>
  );
}
