/**
 * Timezone-aware date helpers. The attendance engine interprets shift times and
 * work-day boundaries in the organization's timezone (e.g. Asia/Karachi) rather
 * than UTC. Uses the built-in Intl database — no dependency. DST-correct except
 * within the ~1h transition window, which is acceptable for attendance.
 */

/** Offset (ms) of `timeZone` from UTC at `instant`: local − utc. */
export function tzOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(instant);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  let hour = Number(m.hour);
  if (hour === 24) hour = 0; // some engines emit 24 for midnight
  const wallAsUtc = Date.UTC(Number(m.year), Number(m.month) - 1, Number(m.day), hour, Number(m.minute), Number(m.second));
  return wallAsUtc - instant.getTime();
}

/** Local calendar date (in `timeZone`) of `instant` as {year, month(0-11), day}. */
export function localDateParts(instant: Date, timeZone: string): { year: number; month: number; day: number } {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  const get = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return { year: get('year'), month: get('month') - 1, day: get('day') };
}

/** UTC instant for a local wall-clock time (y, mo(0-11), d + "HH:mm") in `timeZone`. */
export function zonedWallToUtc(year: number, month: number, day: number, hhmm: string, timeZone: string): Date {
  const [h, mm] = hhmm.split(':').map(Number);
  const naive = new Date(Date.UTC(year, month, day, h, mm, 0, 0));
  const offset = tzOffsetMs(naive, timeZone);
  return new Date(naive.getTime() - offset);
}

/** The @db.Date key (UTC-midnight of the local calendar date) for an instant. */
export function workDateKey(instant: Date, timeZone: string): Date {
  const { year, month, day } = localDateParts(instant, timeZone);
  return new Date(Date.UTC(year, month, day));
}

/** Local day-of-week (0=Sun … 6=Sat) of `instant` in `timeZone`. */
export function localDow(instant: Date, timeZone: string): number {
  const s = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(instant);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(s);
}

/** Whether an IANA timezone id is valid on this runtime. */
export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
