/**
 * The single timezone list for the whole dashboard.
 *
 * `Organization.timezone` is one column on the server — the attendance
 * recompute, auto-checkout and slip services all read it, and both the
 * Organization page and Attendance Settings write it. Two pickers offering
 * different options for the same field is how a zone becomes selectable on one
 * screen and missing on another, so every picker sources from here.
 *
 * Structure is common-zones-first, then the complete IANA set from the
 * runtime: the handful anyone here realistically needs are reachable without
 * scrolling, and nothing is unavailable.
 */
export interface TimezoneOption {
  value: string;
  label: string;
}

export interface TimezoneGroup {
  label: string;
  options: TimezoneOption[];
}

/** Indonesia first — the deployment is an Indonesian bank. */
export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta — WIB (UTC+7)' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar — WITA (UTC+8)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura — WIT (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala Lumpur (UTC+8)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (UTC+5)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (UTC+3)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
  { value: 'America/New_York', label: 'America/New York (UTC−5/−4)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (UTC−8/−7)' },
  { value: 'UTC', label: 'UTC' },
];

/** Default for a new organization or office. */
export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

/**
 * Every IANA zone the runtime knows. `supportedValuesOf` is unavailable on
 * older engines, so the common list stands in rather than the picker emptying.
 */
function allZones(): string[] {
  try {
    const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf?.('timeZone');
    if (all?.length) return all;
  } catch {
    /* fall through */
  }
  return COMMON_TIMEZONES.map((t) => t.value);
}

/**
 * Options grouped for a native `<select>`: common zones, then everything else.
 *
 * [current] is included even when it is not a known zone, so a value set
 * directly on the API or predating this list still displays instead of the
 * picker silently showing a different zone than the one in force.
 */
export function timezoneGroups(current?: string | null): TimezoneGroup[] {
  const commonValues = new Set(COMMON_TIMEZONES.map((t) => t.value));
  const rest = allZones()
    .filter((z) => !commonValues.has(z))
    .map((z) => ({ value: z, label: z.replace(/_/g, ' ') }));

  const groups: TimezoneGroup[] = [
    { label: 'Common', options: COMMON_TIMEZONES },
    { label: 'All timezones', options: rest },
  ];

  if (current && !commonValues.has(current) && !rest.some((r) => r.value === current)) {
    groups.unshift({ label: 'Current', options: [{ value: current, label: `${current} (current)` }] });
  }
  return groups;
}

/** Flat form, for callers that cannot render option groups. */
export function timezoneOptions(current?: string | null): TimezoneOption[] {
  return timezoneGroups(current).flatMap((g) => g.options);
}
