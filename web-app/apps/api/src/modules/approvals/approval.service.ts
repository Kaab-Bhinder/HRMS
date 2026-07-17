import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface ApproverRef {
  userId?: string;
  employeeId?: string;
}

/**
 * Generic multi-level approval engine. Any request type (leave, attendance
 * regularization, travel, …) creates a chain of steps and is driven through
 * them here — one engine, many consumers.
 */
@Injectable()
export class ApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  /** Creates an ordered approval chain for a subject. */
  async start(orgId: string, subjectType: string, subjectId: string, chain: ApproverRef[]) {
    if (!chain.length) return [];
    await this.prisma.approvalStep.deleteMany({ where: { subjectType, subjectId } });
    await this.prisma.approvalStep.createMany({
      data: chain.map((a, i) => ({
        organizationId: orgId,
        subjectType,
        subjectId,
        stepOrder: i,
        approverUserId: a.userId,
        approverEmployeeId: a.employeeId,
        status: ApprovalStatus.pending,
      })),
    });
    return this.state(subjectType, subjectId);
  }

  state(subjectType: string, subjectId: string) {
    return this.prisma.approvalStep.findMany({ where: { subjectType, subjectId }, orderBy: { stepOrder: 'asc' } });
  }

  /**
   * Acts on the current pending step. Returns the resulting overall decision:
   * 'approved' once all steps pass, 'rejected' if any step rejects, else 'pending'.
   */
  async act(subjectType: string, subjectId: string, stepId: string, decision: 'approved' | 'rejected', comment?: string): Promise<ApprovalStatus> {
    const steps = await this.state(subjectType, subjectId);
    const step = steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException('Approval step not found');
    if (step.status !== 'pending') throw new BadRequestException('This step has already been actioned');

    const firstPending = steps.find((s) => s.status === 'pending');
    if (firstPending && firstPending.id !== step.id) {
      throw new BadRequestException('Earlier approval steps are still pending');
    }

    await this.prisma.approvalStep.update({
      where: { id: stepId },
      data: { status: decision, comment, actedAt: new Date() },
    });

    if (decision === 'rejected') return ApprovalStatus.rejected;
    const remaining = steps.filter((s) => s.id !== stepId).some((s) => s.status === 'pending');
    return remaining ? ApprovalStatus.pending : ApprovalStatus.approved;
  }

  /** Pending approvals assigned to a given approver (for their inbox). */
  pendingFor(userId: string) {
    return this.prisma.approvalStep.findMany({
      where: { approverUserId: userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
