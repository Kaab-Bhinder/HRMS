import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
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
  /** May be async — a real workbook or PDF is written as a stream. */
  render(columns: ReportColumn[], rows: Record<string, any>[]): Buffer | string | Promise<Buffer>;
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

/** A real .xlsx workbook: bold frozen header, sized columns, filters. */
export class XlsxFormatter implements ExportFormatter {
  format: ExportFormat = 'xlsx';
  contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  extension = 'xlsx';

  async render(columns: ReportColumn[], rows: Record<string, any>[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.created = new Date();
    const ws = wb.addWorksheet('Report', { views: [{ state: 'frozen', ySplit: 1 }] });

    ws.columns = columns.map((c) => ({
      header: c.label,
      key: c.key,
      // Wide enough for the header, capped so one long note can't stretch the
      // sheet off screen.
      width: Math.min(Math.max(c.label.length + 4, 12), 40),
    }));
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).alignment = { vertical: 'middle' };

    for (const r of rows) {
      ws.addRow(Object.fromEntries(columns.map((c) => [c.key, r[c.key] ?? ''])));
    }
    // Numbers arrive as numbers, so Excel can total them without re-typing.
    if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}

/**
 * A real PDF table. Landscape, because HR reports are wide — portrait would
 * squeeze eleven columns into unreadable slivers.
 */
export class PdfFormatter implements ExportFormatter {
  format: ExportFormat = 'pdf';
  contentType = 'application/pdf';
  extension = 'pdf';

  render(columns: ReportColumn[], rows: Record<string, any>[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const left = doc.page.margins.left;
      const usable = doc.page.width - left - doc.page.margins.right;
      const colWidth = usable / Math.max(columns.length, 1);
      const rowHeight = 16;

      const header = (): number => {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#111');
        let x = left;
        for (const c of columns) {
          doc.text(String(c.label).toUpperCase(), x + 2, doc.y, { width: colWidth - 4, ellipsis: true });
          x += colWidth;
        }
        const y = doc.y + 11;
        doc.moveTo(left, y).lineTo(left + usable, y).strokeColor('#999').lineWidth(0.5).stroke();
        return y + 4;
      };

      doc.font('Helvetica-Bold').fontSize(12).text(`Report — ${new Date().toISOString().slice(0, 10)}`, left, doc.y);
      doc.moveDown(0.6);
      let y = header();

      doc.font('Helvetica').fontSize(7).fillColor('#222');
      for (const r of rows) {
        // New page when we run out of room — and repeat the header there, so
        // page 4 of a register is still readable on its own.
        if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          doc.y = doc.page.margins.top;
          y = header();
          doc.font('Helvetica').fontSize(7).fillColor('#222');
        }
        let x = left;
        for (const c of columns) {
          doc.text(String(r[c.key] ?? ''), x + 2, y, { width: colWidth - 4, height: rowHeight, ellipsis: true });
          x += colWidth;
        }
        y += rowHeight;
      }

      if (!rows.length) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#666')
          .text('No data matched the selected filters.', left, y + 6);
      }
      doc.end();
    });
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
