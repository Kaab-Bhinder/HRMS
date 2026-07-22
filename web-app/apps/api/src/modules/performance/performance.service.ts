import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { paginated } from '../../common/dto/pagination.dto';
import {
  CreateCycleDto, CreateGoalDto, CreateReviewDto, QueryGoalsDto, QueryReviewsDto,
  UpdateCycleDto, UpdateGoalDto, UpdateReviewDto,
} from './dto/performance.dto';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Cycles ---

  async listCycles(orgId: string) {
    return this.prisma.reviewCycle.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  }

  async createCycle(orgId: string, dto: CreateCycleDto) {
    return this.prisma.reviewCycle.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async updateCycle(orgId: string, id: string, dto: UpdateCycleDto) {
    const existing = await this.prisma.reviewCycle.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Review cycle not found');
    return this.prisma.reviewCycle.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isActive: dto.isActive,
      },
    });
  }

  // --- Reviews ---

  async listReviews(orgId: string, q: QueryReviewsDto) {
    const where: Prisma.PerformanceReviewWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(q.status ? { status: q.status } : {}),
      ...(q.cycleId ? { cycleId: q.cycleId } : {}),
      ...(q.employeeId ? { employeeId: q.employeeId } : {}),
      ...(q.search
        ? {
            employee: {
              OR: [
                { firstName: { contains: q.search, mode: 'insensitive' } },
                { lastName: { contains: q.search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.performanceReview.findMany({
        where,
        include: this.reviewInclude(),
        orderBy: { updatedAt: q.order },
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.performanceReview.count({ where }),
    ]);
    const reviewerNames = await this.resolveReviewerNames(rows);
    return paginated(rows.map((r) => this.serializeReview(r, reviewerNames)), total, q.page, q.limit);
  }

  async getReview(orgId: string, id: string) {
    const review = await this.prisma.performanceReview.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: this.reviewInclude(),
    });
    if (!review) throw new NotFoundException('Performance review not found');
    return this.serializeReview(review);
  }

  async createReview(orgId: string, dto: CreateReviewDto) {
    const review = await this.prisma.performanceReview.create({
      data: {
        organizationId: orgId,
        employeeId: dto.employeeId,
        cycleId: dto.cycleId,
        reviewerId: dto.reviewerId,
        status: dto.status,
        overallScore: dto.overallScore,
        summary: dto.summary,
        ...(dto.status === 'submitted' ? { submittedAt: new Date() } : {}),
      },
      include: this.reviewInclude(),
    });
    return this.serializeReview(review);
  }

  async updateReview(orgId: string, id: string, dto: UpdateReviewDto) {
    const existing = await this.prisma.performanceReview.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Performance review not found');

    const review = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        employeeId: dto.employeeId,
        cycleId: dto.cycleId,
        reviewerId: dto.reviewerId,
        status: dto.status,
        overallScore: dto.overallScore,
        summary: dto.summary,
        ...(dto.status === 'submitted' && existing.submittedAt === null ? { submittedAt: new Date() } : {}),
      },
      include: this.reviewInclude(),
    });
    return this.serializeReview(review);
  }

  async removeReview(orgId: string, id: string) {
    const existing = await this.prisma.performanceReview.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Performance review not found');
    await this.prisma.performanceReview.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  // --- Goals ---

  async listGoals(orgId: string, q: QueryGoalsDto) {
    const goals = await this.prisma.goal.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...(q.status ? { status: q.status } : {}),
        ...(q.employeeId ? { employeeId: q.employeeId } : {}),
      },
      include: this.goalInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return goals.map((g) => this.serializeGoal(g));
  }

  async createGoal(orgId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        organizationId: orgId,
        title: dto.title,
        employeeId: dto.employeeId,
        departmentId: dto.departmentId,
        metric: dto.metric,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue,
        weight: dto.weight,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: this.goalInclude(),
    });
    return this.serializeGoal(goal);
  }

  async updateGoal(orgId: string, id: string, dto: UpdateGoalDto) {
    const existing = await this.prisma.goal.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Goal not found');

    const goal = await this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        employeeId: dto.employeeId,
        departmentId: dto.departmentId,
        metric: dto.metric,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue,
        weight: dto.weight,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: this.goalInclude(),
    });
    return this.serializeGoal(goal);
  }

  async removeGoal(orgId: string, id: string) {
    const existing = await this.prisma.goal.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Goal not found');
    await this.prisma.goal.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  // --- helpers ---

  private reviewInclude() {
    return {
      cycle: { select: { name: true } },
      employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } },
    };
  }

  private goalInclude() {
    return {
      employee: { select: { firstName: true, lastName: true } },
    };
  }

  /** reviewerId is a bare column (no Prisma relation), so names are resolved
   *  in a batch and passed in rather than included on the row. */
  private async resolveReviewerNames(rows: any[]): Promise<Map<string, string>> {
    const ids = [...new Set(rows.map((r) => r.reviewerId).filter(Boolean))] as string[];
    if (!ids.length) return new Map();
    const emps = await this.prisma.employee.findMany({
      where: { id: { in: ids } },
      select: { id: true, firstName: true, lastName: true },
    });
    return new Map(emps.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));
  }

  private serializeReview(r: any, reviewerNames?: Map<string, string>) {
    return {
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : null,
      avatarUrl: null,
      departmentName: r.employee?.department?.name ?? null,
      cycle: r.cycle?.name ?? null,
      reviewerName: r.reviewerId ? (reviewerNames?.get(r.reviewerId) ?? null) : null,
      status: r.status,
      overallScore: r.overallScore !== null && r.overallScore !== undefined ? Number(r.overallScore) : null,
      updatedAt: r.updatedAt,
    };
  }

  private serializeGoal(g: any) {
    return {
      id: g.id,
      title: g.title,
      ownerName: g.employee ? `${g.employee.firstName} ${g.employee.lastName}` : '—',
      metric: g.metric,
      target: Number(g.targetValue || 0),
      current: Number(g.currentValue || 0),
      status: g.status,
      dueDate: g.dueDate,
    };
  }
}
