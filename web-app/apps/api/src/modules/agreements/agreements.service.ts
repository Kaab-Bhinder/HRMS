import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { AgreementStatus, NotificationChannel as Channel, Prisma, SignerStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginated } from '../../common/dto/pagination.dto';
import { appUrl } from '../../common/utils/app-url.util';
import { renderAgreementPdf } from './agreement-pdf';
import {
  CreateAgreementDto, CreateTemplateDto, QueryAgreementsDto, SignDto, UpdateTemplateDto,
} from './dto/agreement.dto';

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** Signing links are valid for 14 days unless the agreement itself expires sooner. */
const LINK_TTL_DAYS = 14;

/** A signature is a few kB of line art; anything larger is not a signature. */
const MAX_SIGNATURE_BYTES = 512 * 1024;

@Injectable()
export class AgreementsService {
  private readonly log = new Logger(AgreementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // --- Templates ------------------------------------------------------------

  listTemplates(orgId: string) {
    return this.prisma.agreementTemplate.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  createTemplate(orgId: string, userId: string, dto: CreateTemplateDto) {
    return this.prisma.agreementTemplate.create({
      data: { organizationId: orgId, name: dto.name, body: dto.body, createdById: userId },
    });
  }

  async updateTemplate(orgId: string, id: string, dto: UpdateTemplateDto) {
    await this.templateOrFail(orgId, id);
    return this.prisma.agreementTemplate.update({
      where: { id },
      data: { name: dto.name, body: dto.body, isActive: dto.isActive },
    });
  }

  async removeTemplate(orgId: string, id: string) {
    await this.templateOrFail(orgId, id);
    await this.prisma.agreementTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private async templateOrFail(orgId: string, id: string) {
    const t = await this.prisma.agreementTemplate.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  // --- Agreements -----------------------------------------------------------

  async create(user: AuthUser, dto: CreateAgreementDto) {
    let body = dto.body ?? '';
    let templateId: string | null = null;

    if (dto.templateId) {
      const t = await this.templateOrFail(user.organizationId, dto.templateId);
      templateId = t.id;
      body = t.body;
    }
    if (!body.trim()) throw new BadRequestException('An agreement needs a body, or a template to take one from');

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true },
    });

    // Substituted once, now — the stored body is what everyone signs.
    body = body
      .replace(/\{\{\s*company\s*\}\}/gi, org?.name ?? '')
      .replace(/\{\{\s*date\s*\}\}/gi, new Date().toISOString().slice(0, 10))
      .replace(/\{\{\s*title\s*\}\}/gi, dto.title);

    const agreement = await this.prisma.agreement.create({
      data: {
        organizationId: user.organizationId,
        templateId,
        title: dto.title,
        body,
        bodyHash: sha256(body),
        createdByUserId: user.id,
        createdByName: user.fullName,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        signers: {
          create: await Promise.all(
            dto.signers.map(async (s, i) => {
              const resolved = await this.resolveSigner(user.organizationId, s);
              return {
                organizationId: user.organizationId,
                name: resolved.name,
                phone: resolved.phone,
                email: resolved.email,
                employeeId: resolved.employeeId,
                orderIndex: i,
                // Replaced with a live token when the agreement is sent; a draft
                // must not be signable, so this placeholder can never match.
                tokenHash: `unsent:${randomBytes(16).toString('hex')}`,
                expiresAt: this.linkExpiry(dto.expiresAt),
              };
            }),
          ),
        },
      },
      include: { signers: true },
    });
    return this.serialize(agreement);
  }

  /** A signer is either an employee (details taken from their record) or typed in by hand. */
  private async resolveSigner(orgId: string, s: { employeeId?: string; name?: string; phone?: string; email?: string }) {
    if (s.employeeId) {
      const e = await this.prisma.employee.findFirst({
        where: { id: s.employeeId, organizationId: orgId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, phone: true, workEmail: true },
      });
      if (!e) throw new BadRequestException('One of the selected employees no longer exists');
      return {
        employeeId: e.id,
        name: `${e.firstName} ${e.lastName}`,
        phone: s.phone ?? e.phone ?? null,
        email: s.email ?? e.workEmail ?? null,
      };
    }
    if (!s.name?.trim()) throw new BadRequestException('Every signer needs a name');
    return { employeeId: null, name: s.name.trim(), phone: s.phone ?? null, email: s.email ?? null };
  }

  private linkExpiry(agreementExpiry?: string): Date {
    const ttl = new Date(Date.now() + LINK_TTL_DAYS * 24 * 60 * 60 * 1000);
    if (!agreementExpiry) return ttl;
    const hard = new Date(agreementExpiry);
    return hard < ttl ? hard : ttl;
  }

  /**
   * Issues a fresh signing link per signer and messages them on WhatsApp.
   * Re-sending is deliberately allowed and rotates the tokens: a link forwarded
   * to the wrong person stops working the moment the agreement is re-sent.
   */
  async send(user: AuthUser, id: string) {
    const agreement = await this.getOrFail(user.organizationId, id);
    if (agreement.status === AgreementStatus.completed) {
      throw new BadRequestException('This agreement is already fully signed');
    }
    if (!agreement.signers.length) throw new BadRequestException('Add at least one signer first');

    const base = appUrl();
    const results: { signer: string; delivered: boolean; link: string }[] = [];

    for (const signer of agreement.signers) {
      if (signer.status === SignerStatus.signed) continue;

      const token = randomBytes(32).toString('base64url');
      await this.prisma.agreementSigner.update({
        where: { id: signer.id },
        data: {
          tokenHash: sha256(token),
          expiresAt: this.linkExpiry(agreement.expiresAt?.toISOString()),
          status: SignerStatus.pending,
          notifiedAt: new Date(),
        },
      });

      const link = `${base}/sign/${token}`;
      let delivered = false;

      if (signer.phone) {
        const res = await this.notifications
          .notify(user.organizationId, user.id, {}, {
            eventKey: 'agreement.sign_request',
            category: 'agreement',
            channels: [Channel.whatsapp],
            // Addressed to the signer, who may not be a system user at all —
            // hence the explicit phone rather than a recipient lookup.
            phone: signer.phone,
            title: `Signature requested: ${agreement.title}`,
            body: `${agreement.createdByName} has asked you to sign "${agreement.title}". Open ${link} to read and sign it.`,
            template: {
              name: process.env.WHATSAPP_TEMPLATE_AGREEMENT ?? 'agreement_signature_request',
              params: [signer.name, agreement.title, link],
            },
          })
          .catch((e) => { this.log.warn(`WhatsApp to ${signer.name} failed: ${(e as Error).message}`); return null; });
        delivered = !!res?.delivered?.length;
      }

      results.push({ signer: signer.name, delivered, link });
    }

    await this.prisma.agreement.update({
      where: { id },
      data: { status: AgreementStatus.sent, sentAt: new Date() },
    });

    // Links are returned so an administrator can pass one on by hand when a
    // signer has no WhatsApp — without that this is unusable offline.
    return { sent: results.length, recipients: results };
  }

  async list(user: AuthUser, q: QueryAgreementsDto) {
    const where: Prisma.AgreementWhereInput = {
      organizationId: user.organizationId,
      deletedAt: null,
      ...(q.status ? { status: q.status as AgreementStatus } : {}),
      ...(q.search ? { title: { contains: q.search, mode: 'insensitive' } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.agreement.findMany({
        where, include: { signers: true }, orderBy: { createdAt: 'desc' }, skip: q.skip, take: q.limit,
      }),
      this.prisma.agreement.count({ where }),
    ]);
    return paginated(rows.map((a) => this.serialize(a)), total, q.page, q.limit);
  }

  async get(user: AuthUser, id: string) {
    return this.serialize(await this.getOrFail(user.organizationId, id));
  }

  private async getOrFail(orgId: string, id: string) {
    const a = await this.prisma.agreement.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: { signers: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!a) throw new NotFoundException('Agreement not found');
    return a;
  }

  /** The finished document, with every captured signature stamped in. */
  async document(user: AuthUser, id: string) {
    const a = await this.getOrFail(user.organizationId, id);
    return { filename: `${slug(a.title)}.pdf`, body: await renderAgreementPdf(a) };
  }

  // --- Signing from inside the app -----------------------------------------

  /**
   * Agreements waiting on the signed-in employee. The mobile app signs through
   * an authenticated session rather than a mailed token: the person is already
   * proven, so making them fetch a link would be worse security theatre.
   */
  async mine(user: AuthUser) {
    const me = await this.prisma.employee.findFirst({
      where: { organizationId: user.organizationId, userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me) return [];

    const rows = await this.prisma.agreement.findMany({
      where: {
        organizationId: user.organizationId,
        deletedAt: null,
        status: { notIn: [AgreementStatus.draft, AgreementStatus.cancelled] },
        signers: { some: { employeeId: me.id } },
      },
      include: { signers: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return rows.map((a) => {
      const mineRow = a.signers.find((s) => s.employeeId === me.id)!;
      return {
        ...this.serialize(a),
        myStatus: mineRow.status,
        mySignedAt: mineRow.signedAt,
        canSign: mineRow.status !== SignerStatus.signed && mineRow.status !== SignerStatus.declined
          && mineRow.expiresAt > new Date(),
      };
    });
  }

  async signAsMe(user: AuthUser, agreementId: string, dto: SignDto, ip?: string, userAgent?: string) {
    const me = await this.prisma.employee.findFirst({
      where: { organizationId: user.organizationId, userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me) throw new ForbiddenException('Only an employee record can sign');

    const signer = await this.prisma.agreementSigner.findFirst({
      where: { agreementId, employeeId: me.id, organizationId: user.organizationId },
      include: { agreement: true },
    });
    if (!signer) throw new NotFoundException('You are not a signer on this agreement');
    if (signer.status === SignerStatus.signed) throw new BadRequestException('You have already signed this agreement');
    if (signer.expiresAt < new Date()) throw new ForbiddenException('This agreement can no longer be signed');
    if (signer.agreement.status === AgreementStatus.draft) {
      throw new BadRequestException('This agreement has not been sent out yet');
    }

    await this.prisma.agreementSigner.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.signed,
        signedAt: new Date(),
        signaturePng: decodePng(dto.signaturePng),
        signedIp: ip?.slice(0, 60),
        signedUserAgent: userAgent?.slice(0, 300),
      },
    });
    await this.refreshStatus(agreementId);
    return { success: true };
  }

  // --- Public signing -------------------------------------------------------

  /** Resolves a signing token, or explains precisely why it will not open. */
  private async bySignToken(token: string) {
    const signer = await this.prisma.agreementSigner.findUnique({
      where: { tokenHash: sha256(token) },
      include: { agreement: { include: { signers: { orderBy: { orderIndex: 'asc' } } } } },
    });
    if (!signer || signer.agreement.deletedAt) throw new NotFoundException('This signing link is not valid');
    if (signer.expiresAt < new Date()) throw new ForbiddenException('This signing link has expired');
    if (signer.agreement.status === AgreementStatus.cancelled) {
      throw new ForbiddenException('This agreement has been withdrawn');
    }
    return signer;
  }

  /** What the signer sees when they open the link. Records the first view. */
  async viewForSigning(token: string) {
    const signer = await this.bySignToken(token);
    // Reassigned from the update, not left as the value read a moment ago —
    // otherwise the response still says "pending" on the very request that
    // marked it viewed.
    let current = signer.status;
    let viewedAt = signer.viewedAt;
    if (current === SignerStatus.pending) {
      const updated = await this.prisma.agreementSigner.update({
        where: { id: signer.id },
        data: { status: SignerStatus.viewed, viewedAt: new Date() },
        select: { status: true, viewedAt: true },
      });
      current = updated.status;
      viewedAt = updated.viewedAt;
    }
    return {
      agreementTitle: signer.agreement.title,
      body: signer.agreement.body,
      signerName: signer.name,
      status: current,
      viewedAt,
      signedAt: signer.signedAt,
      alreadySigned: current === SignerStatus.signed,
      expiresAt: signer.expiresAt,
      otherSigners: signer.agreement.signers
        .filter((s) => s.id !== signer.id)
        .map((s) => ({ name: s.name, status: s.status })),
    };
  }

  async sign(token: string, dto: SignDto, ip?: string, userAgent?: string) {
    const signer = await this.bySignToken(token);
    if (signer.status === SignerStatus.signed) throw new BadRequestException('You have already signed this agreement');
    if (signer.status === SignerStatus.declined) throw new BadRequestException('You have declined this agreement');

    const png = decodePng(dto.signaturePng);

    await this.prisma.agreementSigner.update({
      where: { id: signer.id },
      data: {
        status: SignerStatus.signed,
        signedAt: new Date(),
        signaturePng: png,
        // Who, from where, and on what — the minimum an auditor asks for.
        signedIp: ip?.slice(0, 60),
        signedUserAgent: userAgent?.slice(0, 300),
      },
    });

    await this.refreshStatus(signer.agreementId);
    return { success: true, agreementTitle: signer.agreement.title };
  }

  async decline(token: string, reason?: string) {
    const signer = await this.bySignToken(token);
    if (signer.status === SignerStatus.signed) throw new BadRequestException('You have already signed this agreement');
    await this.prisma.agreementSigner.update({
      where: { id: signer.id },
      data: { status: SignerStatus.declined, declinedAt: new Date(), declineReason: reason?.slice(0, 500) },
    });
    await this.refreshStatus(signer.agreementId);
    return { success: true };
  }

  /** One declined signer stops the whole agreement; all signed completes it. */
  private async refreshStatus(agreementId: string) {
    const signers = await this.prisma.agreementSigner.findMany({
      where: { agreementId },
      select: { status: true },
    });
    const declined = signers.some((s) => s.status === SignerStatus.declined);
    const allSigned = signers.length > 0 && signers.every((s) => s.status === SignerStatus.signed);
    const anySigned = signers.some((s) => s.status === SignerStatus.signed);

    const status = declined
      ? AgreementStatus.declined
      : allSigned
        ? AgreementStatus.completed
        : anySigned
          ? AgreementStatus.partially_signed
          : AgreementStatus.sent;

    await this.prisma.agreement.update({
      where: { id: agreementId },
      data: { status, completedAt: allSigned ? new Date() : null },
    });
  }

  private serialize(a: Prisma.AgreementGetPayload<{ include: { signers: true } }>) {
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      status: a.status,
      bodyHash: a.bodyHash,
      createdByName: a.createdByName,
      createdAt: a.createdAt,
      sentAt: a.sentAt,
      completedAt: a.completedAt,
      expiresAt: a.expiresAt,
      signers: a.signers
        .slice()
        .sort((x, y) => x.orderIndex - y.orderIndex)
        .map((s) => ({
          id: s.id, name: s.name, phone: s.phone, email: s.email,
          status: s.status, signedAt: s.signedAt, viewedAt: s.viewedAt,
          declineReason: s.declineReason,
          hasSignature: s.signaturePng != null,
        })),
      signedCount: a.signers.filter((s) => s.status === SignerStatus.signed).length,
      totalSigners: a.signers.length,
    };
  }
}

/**
 * Accepts the transparent PNG produced by the capture screen. The background is
 * removed on the device so the signer can see the cleaned result before
 * committing to it; the server's job is to refuse anything that is not actually
 * a small PNG.
 */
function decodePng(dataUrl: string): Buffer {
  const match = /^data:image\/png;base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) throw new BadRequestException('Signature must be a PNG data URL');
  const buf = Buffer.from(match[1], 'base64');
  if (buf.length > MAX_SIGNATURE_BYTES) throw new BadRequestException('Signature image is too large');
  // PNG magic number — a renamed JPEG would break the PDF writer downstream.
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) {
    throw new BadRequestException('Signature must be a valid PNG');
  }
  return buf;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'agreement';
