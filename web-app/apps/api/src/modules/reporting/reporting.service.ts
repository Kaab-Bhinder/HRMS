import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginated } from '../../common/dto/pagination.dto';
import { CreateReportDto, QueryReportsDto, ReviewReportDto } from './dto/report.dto';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Reviewers (super admin / HR) see every report; everyone else sees only
   *  their own submissions — reports flow up the chain. */
  private isReviewer(user: AuthUser): boolean {
    return user.isSuperAdmin || user.roles.includes('hr-manager');
  }

  private submitterView(user: AuthUser): string {
    if (user.isSuperAdmin) return 'admin';
    if (user.roles.includes('hr-manager')) return 'hr';
    if (user.roles.includes('department-head')) return 'dept_head';
    return 'employee';
  }

  async create(user: AuthUser, dto: CreateReportDto) {
    const emp = await this.prisma.employee.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true, departmentId: true, department: { select: { name: true } } },
    });

    const report = await this.prisma.report.create({
      data: {
        organizationId: user.organizationId,
        title: dto.title,
        periodType: dto.periodType,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        periodLabel: dto.periodLabel,
        summary: dto.summary,
        status: ReportStatus.submitted,
        departmentId: emp?.departmentId ?? null,
        departmentName: emp?.department?.name ?? null,
        submittedByUserId: user.id,
        submittedByEmpId: emp?.id ?? null,
        submitterName: user.fullName,
        submitterView: this.submitterView(user),
      },
    });
    return this.serialize(report);
  }

  async list(user: AuthUser, q: QueryReportsDto) {
    const where: Prisma.ReportWhereInput = {
      organizationId: user.organizationId,
      deletedAt: null,
      // Scope: reviewers see all; otherwise only own submissions.
      ...(this.isReviewer(user) && q.mine !== 'true' ? {} : { submittedByUserId: user.id }),
      ...(q.status ? { status: q.status } : {}),
      ...(q.periodType ? { periodType: q.periodType } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({ where, orderBy: { submittedAt: 'desc' }, skip: q.skip, take: q.limit }),
      this.prisma.report.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serialize(r)), total, q.page, q.limit);
  }

  async get(user: AuthUser, id: string) {
    const report = await this.ensureVisible(user, id);
    return this.serialize(report);
  }

  async review(user: AuthUser, id: string, dto: ReviewReportDto) {
    if (!this.isReviewer(user)) throw new ForbiddenException('Only HR and super admins can review reports');
    const existing = await this.ensure(user.organizationId, id);

    // Separation of duties: the reviewer check alone asks "are you a reviewer?",
    // never "are you the author?". A super admin (who is both) could otherwise
    // submit a report and sign it off themselves in two calls — the exact thing
    // an audit of this chain is meant to prevent.
    if (existing.submittedByUserId === user.id) {
      throw new ForbiddenException('You cannot review a report you submitted yourself');
    }
    const report = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status as ReportStatus,
        reviewedByUserId: user.id,
        reviewedByName: user.fullName,
        reviewedAt: new Date(),
        reviewNote: dto.note,
      },
    });
    return this.serialize(report);
  }

  // --- helpers ---

  private async ensure(orgId: string, id: string) {
    const report = await this.prisma.report.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  private async ensureVisible(user: AuthUser, id: string) {
    const report = await this.ensure(user.organizationId, id);
    if (!this.isReviewer(user) && report.submittedByUserId !== user.id) {
      throw new ForbiddenException('You can only view your own reports');
    }
    return report;
  }

  private serialize(r: any) {
    return {
      id: r.id,
      title: r.title,
      periodType: r.periodType,
      periodStart: r.periodStart,
      periodEnd: r.periodEnd,
      periodLabel: r.periodLabel,
      summary: r.summary,
      status: r.status,
      departmentName: r.departmentName,
      submitterName: r.submitterName,
      submitterView: r.submitterView,
      submittedAt: r.submittedAt,
      reviewedByName: r.reviewedByName,
      reviewedAt: r.reviewedAt,
      reviewNote: r.reviewNote,
      attachments: r.attachments ?? [],
    };
  }
}
