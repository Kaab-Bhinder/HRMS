import PDFDocument from 'pdfkit';
import { Prisma, SignerStatus } from '@prisma/client';

type AgreementWithSigners = Prisma.AgreementGetPayload<{ include: { signers: true } }>;

/**
 * Renders the agreement and stamps each captured signature beneath it, followed
 * by an audit block. The signature block is what makes this a record rather
 * than a printout: name, timestamp, IP and the body hash the person accepted.
 */
export function renderAgreementPdf(agreement: AgreementWithSigners): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).font('Helvetica-Bold').text(agreement.title);
    doc.moveDown(0.4);
    doc.fontSize(9).font('Helvetica').fillColor('#666')
      .text(`Raised by ${agreement.createdByName} on ${fmt(agreement.createdAt)}`);
    doc.fillColor('#000').moveDown(1);

    doc.fontSize(11).font('Helvetica').text(agreement.body, { align: 'left', lineGap: 2 });

    const signed = agreement.signers
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);

    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica-Bold').text('Signatures');
    doc.moveDown(0.6);

    for (const s of signed) {
      // Each block is ~150pt; start a page rather than splitting a signature
      // across the fold, which would look forged.
      if (doc.y > doc.page.height - 200) doc.addPage();

      const top = doc.y;
      if (s.status === SignerStatus.signed && s.signaturePng) {
        try {
          doc.image(s.signaturePng, doc.page.margins.left, top, { fit: [180, 60] });
        } catch {
          // A corrupt image must not cost the whole document.
          doc.fontSize(9).fillColor('#a00').text('[signature image could not be rendered]');
          doc.fillColor('#000');
        }
        doc.y = top + 64;
      } else {
        doc.fontSize(10).fillColor('#999')
          .text(s.status === SignerStatus.declined ? '[declined]' : '[not yet signed]');
        doc.fillColor('#000');
      }

      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + 180, doc.y)
        .strokeColor('#999').stroke().strokeColor('#000');
      doc.moveDown(0.3);

      doc.fontSize(10).font('Helvetica-Bold').text(s.name);
      doc.fontSize(8).font('Helvetica').fillColor('#666');
      if (s.status === SignerStatus.signed) {
        doc.text(`Signed ${fmt(s.signedAt)}${s.signedIp ? ` · IP ${s.signedIp}` : ''}`);
      } else if (s.status === SignerStatus.declined) {
        doc.text(`Declined ${fmt(s.declinedAt)}${s.declineReason ? ` — ${s.declineReason}` : ''}`);
      } else {
        doc.text('Awaiting signature');
      }
      doc.fillColor('#000').moveDown(1.2);
    }

    doc.moveDown(0.5);
    doc.fontSize(7).fillColor('#888')
      .text(`Document integrity hash (SHA-256): ${agreement.bodyHash}`, { align: 'left' });
    doc.text('This hash covers the agreement text above. Any change to the text produces a different hash.');

    doc.end();
  });
}

const fmt = (d: Date | null | undefined) =>
  d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—';
