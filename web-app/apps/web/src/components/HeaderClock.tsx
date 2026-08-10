import { useEffect, useState } from 'react';
import { organizationService } from '../services';
import { useQuery } from '../hooks/useQuery';

/**
 * Live clock in the header, shown in the ORGANISATION's timezone rather than
 * the viewer's.
 *
 * That distinction is the whole point: attendance, shift cut-offs and payroll
 * cycles are all judged in the organisation's timezone, so an HR user working
 * from another country needs to see the time their decisions are measured
 * against — not the time on their own laptop.
 */
export function HeaderClock() {
  const { data: org } = useQuery(() => organizationService.current(), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Align the first tick to the next whole second so the display doesn't
    // visibly lag or skip a second on mount.
    let interval: ReturnType<typeof setInterval>;
    const align = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 1000);
    }, 1000 - (Date.now() % 1000));
    return () => { clearTimeout(align); if (interval) clearInterval(interval); };
  }, []);

  // An invalid or unset timezone must not crash the header — fall back to the
  // browser's own zone.
  const zone = safeZone(org?.timezone);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: zone,
  }).format(now);
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: zone,
  }).format(now);

  const label = shortZone(zone, now);
  const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const differs = zone !== viewerZone;

  return (
    <div
      className="mr-1 hidden select-none flex-col items-end leading-tight sm:flex"
      // Spelled out on hover, because "WIB" alone means little to a visitor.
      title={differs ? `${zone} — your device is on ${viewerZone}` : zone}
    >
      <span className="font-mono text-sm font-medium tabular-nums text-foreground">
        {time}
        <span className="ml-1 text-[10px] font-normal text-muted-foreground">{label}</span>
      </span>
      <span className="text-[11px] text-muted-foreground">{date}</span>
    </div>
  );
}

/** Intl throws on an unknown zone; a bad setting shouldn't break the header. */
function safeZone(zone?: string | null): string {
  if (!zone) return Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: zone }).format(new Date());
    return zone;
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

/** "WIB", "GMT+7" — whatever the platform gives for this zone. */
function shortZone(zone: string, at: Date): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  } catch {
    return '';
  }
}
