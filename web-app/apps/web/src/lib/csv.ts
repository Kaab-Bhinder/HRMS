/**
 * Client-side CSV export.
 *
 * Used where the server has no export endpoint but the data is already loaded
 * in the browser (audit logs, analytics). Exports exactly what the user is
 * looking at — the current filtered view — rather than silently widening to
 * everything.
 */

export interface CsvColumn<T> {
  /** Column heading in the output file. */
  header: string;
  /** Pulls the cell value out of a row. Return null/undefined for blank. */
  value: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Quotes a single field.
 *
 * Two separate concerns:
 *
 * 1. CSV syntax — a field containing a comma, quote or newline must be wrapped
 *    in quotes, with embedded quotes doubled.
 * 2. Formula injection — Excel and Sheets execute a cell beginning with
 *    = + - or @, so an audit-log entry containing `=HYPERLINK(...)` would run
 *    when the file is opened. Since much of this data is user-supplied (names,
 *    reasons, user agents), those cells are prefixed with a tab, which
 *    suppresses evaluation while displaying identically.
 */
function escapeCell(input: string | number | boolean | null | undefined): string {
  if (input === null || input === undefined) return '';
  let s = String(input);
  if (/^[=+\-@\t\r]/.test(s)) s = `\t${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Renders rows to a CSV string. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(','));
  // CRLF: Excel is the common consumer and is happiest with it.
  return [head, ...body].join('\r\n');
}

/** Triggers a browser download of `content` as `filename`. */
export function downloadCsv(filename: string, content: string): void {
  // The BOM makes Excel read the file as UTF-8; without it, non-ASCII names
  // (which this deployment is full of) render as mojibake.
  const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Convenience: build and download in one call. */
export function exportCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  downloadCsv(filename, toCsv(rows, columns));
}

/** `audit-logs-2026-07-21.csv` — dated so repeated exports don't overwrite. */
export function datedFilename(base: string, ext = 'csv'): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${base}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.${ext}`;
}
