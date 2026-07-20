/**
 * The single timezone list for the whole dashboard.
 *
 * `Organization.timezone` is the one source of truth on the server — the
 * attendance recompute, auto-checkout and slip services all read it, and both
 * the Organization page and Attendance Settings write to it. Every timezone
 * picker in the UI must therefore offer the same options, or which screen you
 * used would decide whether a zone was available.
 *
 * Indonesia first: the deployment is an Indonesian bank, and every list in the
 * app previously omitted Asia/Jakarta entirely.
 */
export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONES: TimezoneOption[] = [
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
 * Ensures a stored zone is always selectable, even if it predates this list or
 * was set directly on the API — otherwise the picker would silently show a
 * different zone than the one actually in force.
 */
export function timezoneOptions(current?: string | null): TimezoneOption[] {
  if (!current || TIMEZONES.some((t) => t.value === current)) return TIMEZONES;
  return [{ value: current, label: `${current} (current)` }, ...TIMEZONES];
}
