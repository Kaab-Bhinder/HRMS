import { Injectable } from '@nestjs/common';
import { ExportFormat } from './dto/report.dto';

export interface ReportColumn {
  key: string;
  label: string;
}

/**
 * Pluggable renderer for a tabular dataset. New output formats (real xlsx/pdf)
 * drop in as additional implementations without touching any caller.
 */
export interface ExportFormatter {
  format: ExportFormat;
  contentType: string;
  extension: string;
  render(columns: ReportColumn[], rows: Record<string, any>[]): Buffer | string;
}

/** RFC 4180 CSV: quote fields containing comma/quote/newline, double embedded quotes. */
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (value instanceof Date) s = value.toISOString();
  else if (typeof value === 'object') s = JSON.stringify(value);
  else s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(columns: ReportColumn[], rows: Record<string, any>[]): string {
  const header = columns.map((c) => csvEscape(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(',')).join('\r\n');
  return body ? `${header}\r\n${body}` : header;
}

export class CsvFormatter implements ExportFormatter {
  format: ExportFormat = 'csv';
  contentType = 'text/csv; charset=utf-8';
  extension = 'csv';
  render(columns: ReportColumn[], rows: Record<string, any>[]): Buffer {
    return Buffer.from(toCsv(columns, rows), 'utf-8');
  }
}

/**
 * Stub: emits CSV bytes today so the export route works end to end.
 * // TODO: real xlsx — swap in a workbook writer (e.g. exceljs) behind this same interface.
 */
export class XlsxFormatter implements ExportFormatter {
  format: ExportFormat = 'xlsx';
  contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  extension = 'xlsx';
  render(columns: ReportColumn[], rows: Record<string, any>[]): Buffer {
    return Buffer.from(toCsv(columns, rows), 'utf-8');
  }
}

/**
 * Stub: emits CSV bytes today so the export route works end to end.
 * // TODO: real pdf — swap in a document writer (e.g. pdfkit) behind this same interface.
 */
export class PdfFormatter implements ExportFormatter {
  format: ExportFormat = 'pdf';
  contentType = 'application/pdf';
  extension = 'pdf';
  render(columns: ReportColumn[], rows: Record<string, any>[]): Buffer {
    return Buffer.from(toCsv(columns, rows), 'utf-8');
  }
}

@Injectable()
export class ReportExportService {
  private readonly formatters: Record<ExportFormat, ExportFormatter> = {
    csv: new CsvFormatter(),
    xlsx: new XlsxFormatter(),
    pdf: new PdfFormatter(),
  };

  /** Returns the formatter for a format, falling back to CSV for anything unknown. */
  getFormatter(format: string): ExportFormatter {
    return this.formatters[format as ExportFormat] ?? this.formatters.csv;
  }
}
