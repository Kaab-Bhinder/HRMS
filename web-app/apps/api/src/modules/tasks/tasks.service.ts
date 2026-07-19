import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ScopeService } from '../access/scope.service';
import { paginated } from '../../common/dto/pagination.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  AssignTaskDto, CreateCommentDto, CreateTaskDto, QueryTasksDto, UpdateTaskDto, UpdateTaskStatusDto,
} from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  async list(user: AuthUser, q: QueryTasksDto) {
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    const where: Prisma.TaskWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      // Role scope (admin/HR: all · head: dept + team tasks · employee: assigned to them).
      AND: [this.scope.taskWhere(dataScope)],
      ...(q.status ? { status: q.status } : {}),
      ...(q.priority ? { priority: q.priority } : {}),
      ...(q.departmentId ? { departmentId: q.departmentId } : {}),
      ...(q.assigneeId ? { assignments: { some: { employeeId: q.assigneeId } } } : {}),
      ...(q.search ? { title: { contains: q.search, mode: 'insensitive' } } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: this.include(),
        orderBy: { createdAt: q.order },
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.task.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serialize(r)), total, q.page, q.limit);
  }

  async get(orgId: string, id: string) {
    const task = await this.findOrThrow(orgId, id);
    return this.serialize(task);
  }

  async create(orgId: string, userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        title: dto.title,
        description: dto.description,
        departmentId: dto.departmentId,
        parentTaskId: dto.parentTaskId,
        status: dto.status,
        priority: dto.priority,
        progress: dto.progress,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        actualHours: dto.actualHours,
        customFields: (dto.customFields ?? {}) as Prisma.InputJsonValue,
      },
      include: this.include(),
    });
    return this.serialize(task);
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.findOrThrow(orgId, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        updatedById: userId,
        title: dto.title,
        description: dto.description,
        departmentId: dto.departmentId,
        parentTaskId: dto.parentTaskId,
        status: dto.status,
        priority: dto.priority,
        progress: dto.progress,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        actualHours: dto.actualHours,
        ...(dto.customFields !== undefined ? { customFields: dto.customFields as Prisma.InputJsonValue } : {}),
        // Keep completedAt/progress in sync with status on any edit path.
        ...this.completionFields(existing.status, dto.status, dto.progress),
      },
      include: this.include(),
    });

    if (dto.status !== undefined && dto.status !== existing.status) {
      await this.logStatusChange(id, userId, existing.status, dto.status);
    }
    return this.serialize(task);
  }

  async remove(orgId: string, userId: string, id: string) {
    await this.findOrThrow(orgId, id);
    await this.prisma.task.update({ where: { id }, data: { deletedAt: new Date(), updatedById: userId } });
    return { success: true };
  }

  // --- assignments ---

  async assign(orgId: string, userId: string, id: string, dto: AssignTaskDto) {
    await this.findOrThrow(orgId, id);
    const role = dto.role ?? 'assignee';
    const assignment = await this.prisma.taskAssignment.upsert({
      where: { taskId_employeeId_role: { taskId: id, employeeId: dto.employeeId, role } },
      create: { taskId: id, employeeId: dto.employeeId, role, assignedById: userId },
      update: { assignedById: userId },
    });
    return assignment;
  }

  async unassign(orgId: string, id: string, employeeId: string) {
    await this.findOrThrow(orgId, id);
    await this.prisma.taskAssignment.deleteMany({ where: { taskId: id, employeeId } });
    return { success: true };
  }

  // --- comments ---

  async listComments(orgId: string, id: string) {
    await this.findOrThrow(orgId, id);
    return this.prisma.taskComment.findMany({
      where: { taskId: id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(orgId: string, userId: string, id: string, dto: CreateCommentDto) {
    await this.findOrThrow(orgId, id);
    const employee = await this.prisma.employee.findFirst({ where: { userId, organizationId: orgId } });
    return this.prisma.taskComment.create({
      data: { taskId: id, authorEmployeeId: employee?.id, body: dto.body },
    });
  }

  // --- activity ---

  async listActivity(orgId: string, id: string) {
    await this.findOrThrow(orgId, id);
    return this.prisma.taskActivity.findMany({ where: { taskId: id }, orderBy: { createdAt: 'desc' } });
  }

  // --- board & stats ---

  async board(user: AuthUser) {
    const dataScope = await this.scope.resolve(user);
    const rows = await this.prisma.task.findMany({
      where: { organizationId: user.organizationId, deletedAt: null, AND: [this.scope.taskWhere(dataScope)] },
      include: this.include(),
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.serialize(r));
  }

  async stats(user: AuthUser) {
    const dataScope = await this.scope.resolve(user);
    const grouped = await this.prisma.task.groupBy({
      by: ['status'],
      where: { organizationId: user.organizationId, deletedAt: null, AND: [this.scope.taskWhere(dataScope)] },
      _count: { _all: true },
    });
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const g of grouped) {
      byStatus[g.status] = g._count._all;
      total += g._count._all;
    }
    return { byStatus, total };
  }

  // --- assignee mark-complete (mobile) ---

  async updateStatus(orgId: string, user: AuthUser, id: string, dto: UpdateTaskStatusDto) {
    const existing = await this.findOrThrow(orgId, id);

    const canManage = user.isSuperAdmin || user.permissions.includes('tasks:update');
    if (!canManage) {
      const employee = await this.prisma.employee.findFirst({ where: { userId: user.id, organizationId: orgId } });
      const isAssignee = employee
        ? (await this.prisma.taskAssignment.count({ where: { taskId: id, employeeId: employee.id } })) > 0
        : false;
      if (!isAssignee) throw new ForbiddenException('Not allowed to update this task');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        status: dto.status,
        updatedById: user.id,
        ...(dto.progress !== undefined ? { progress: dto.progress } : {}),
        ...this.completionFields(existing.status, dto.status, dto.progress),
      },
      include: this.include(),
    });

    if (dto.status !== existing.status) {
      await this.logStatusChange(id, user.id, existing.status, dto.status);
    }
    return this.serialize(task);
  }

  // --- helpers ---

  private async findOrThrow(orgId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: this.include(),
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  /** Keeps completedAt/progress consistent with status on any update path:
   *  entering "done" stamps completedAt + progress 100; leaving "done" clears
   *  completedAt so the task no longer counts as completed. */
  private completionFields(oldStatus: string, newStatus: string | undefined, progress?: number) {
    if (newStatus === undefined || newStatus === oldStatus) return {};
    if (newStatus === 'done') return { completedAt: new Date(), progress: progress ?? 100 };
    if (oldStatus === 'done') return { completedAt: null };
    return {};
  }

  private async logStatusChange(taskId: string, userId: string, oldValue: string, newValue: string) {
    await this.prisma.taskActivity.create({
      data: {
        taskId,
        actorUserId: userId,
        field: 'status',
        oldValue: oldValue as Prisma.InputJsonValue,
        newValue: newValue as Prisma.InputJsonValue,
      },
    });
  }

  private include() {
    return {
      department: { select: { name: true } },
      assignments: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } },
    };
  }

  private serialize(t: any) {
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? null,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      departmentName: t.department?.name ?? null,
      assignees: (t.assignments ?? []).map((a: any) => ({
        id: a.employee.id,
        name: `${a.employee.firstName} ${a.employee.lastName}`,
      })),
      dueDate: t.dueDate,
      completedAt: t.completedAt ?? null,
      createdAt: t.createdAt,
    };
  }
}
