import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoRecipientKind, NotificationChannel as Channel, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginated } from '../../common/dto/pagination.dto';
import { CreateMemoDto, DirectoryQueryDto, QueryMemosDto } from './dto/memo.dto';

/**
 * Memos travel sideways: any employee to any other employee, in any department.
 * Two rules make it auditable rather than a private chat —
 *   1. every memo is copied to the organisation's super admins, and
 *   2. that copy cannot be removed by the sender.
 */
@Injectable()
export class MemosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // --- Recipient picker -----------------------------------------------------

  /**
   * Powers the two-step picker. With no department it returns the department
   * list (600 people is not a dropdown); with one it returns that department's
   * staff. A search term cuts across departments so a name can be found without
   * knowing where the person sits.
   */
  async directory(user: AuthUser, q: DirectoryQueryDto) {
    const search = q.search?.trim();

    if (!q.departmentId && !search) {
      const [departments, counts] = await Promise.all([
        this.prisma.department.findMany({
          where: { organizationId: user.organizationId, deletedAt: null },
          select: { id: true, name: true, parentId: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.employee.groupBy({
          by: ['departmentId'],
          where: this.addressableWhere(user),
          _count: { _all: true },
        }),
      ]);
      const size = new Map(counts.map((c) => [c.departmentId, c._count._all]));
      return {
        mode: 'departments' as const,
        departments: departments.map((d) => ({ ...d, memberCount: size.get(d.id) ?? 0 })),
      };
    }

    const people = await this.prisma.employee.findMany({
      where: {
        ...this.addressableWhere(user),
        ...(q.departmentId ? { departmentId: q.departmentId } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { workEmail: { contains: search, mode: 'insensitive' } },
                { employeeCode: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true, employeeCode: true, firstName: true, lastName: true, workEmail: true,
        department: { select: { id: true, name: true } },
        designation: { select: { title: true } },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: 200,
    });

    return {
      mode: 'people' as const,
      people: people.map((p) => ({
        id: p.id,
        employeeCode: p.employeeCode,
        name: `${p.firstName} ${p.lastName}`,
        workEmail: p.workEmail ?? '',
        departmentId: p.department?.id ?? null,
        department: p.department?.name ?? '',
        designation: p.designation?.title ?? '',
      })),
    };
  }

  /** Only people who can actually receive a memo: active, and with a login. */
  private addressableWhere(user: AuthUser): Prisma.EmployeeWhereInput {
    return {
      organizationId: user.organizationId,
      deletedAt: null,
      userId: { not: null },
      user: { is: { deletedAt: null, status: { not: 'suspended' } } },
    };
  }

  // --- Sending --------------------------------------------------------------

  async create(user: AuthUser, dto: CreateMemoDto) {
    const sender = await this.prisma.employee.findFirst({
      where: { organizationId: user.organizationId, userId: user.id, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, department: { select: { id: true, name: true } } },
    });

    const chosen = await this.prisma.employee.findMany({
      where: { ...this.addressableWhere(user), id: { in: dto.recipientEmployeeIds } },
      select: {
        id: true, userId: true, firstName: true, lastName: true,
        department: { select: { name: true } },
      },
    });
    if (!chosen.length) {
      throw new BadRequestException('None of the selected people can receive a memo. They may have no login account.');
    }

    // Management sees everything that crosses departments — that is the point of
    // routing this through the system instead of a private chat.
    const oversight = await this.prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        isSuperAdmin: true,
        deletedAt: null,
        status: { not: 'suspended' },
      },
      select: { id: true, fullName: true },
    });

    const rows = new Map<string, Prisma.MemoRecipientCreateManyMemoInput>();
    for (const admin of oversight) {
      rows.set(admin.id, {
        organizationId: user.organizationId,
        userId: admin.id,
        name: admin.fullName ?? 'Administrator',
        kind: MemoRecipientKind.oversight,
      });
    }
    for (const p of chosen) {
      if (!p.userId) continue;
      // A direct recipient who also happens to be an admin is listed once, as a
      // direct recipient — set() after the oversight pass overwrites it.
      rows.set(p.userId, {
        organizationId: user.organizationId,
        userId: p.userId,
        employeeId: p.id,
        name: `${p.firstName} ${p.lastName}`,
        departmentName: p.department?.name ?? null,
        kind: MemoRecipientKind.to,
      });
    }
    // Nobody needs a copy of their own memo sitting in their inbox.
    rows.delete(user.id);

    const memo = await this.prisma.memo.create({
      data: {
        organizationId: user.organizationId,
        subject: dto.subject.trim(),
        body: dto.body,
        attachments: (dto.attachments ?? []) as unknown as Prisma.InputJsonValue,
        senderUserId: user.id,
        senderEmpId: sender?.id ?? null,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : user.fullName,
        senderDeptId: sender?.department?.id ?? null,
        senderDeptName: sender?.department?.name ?? null,
        recipients: { createMany: { data: [...rows.values()] } },
      },
      include: { recipients: true },
    });

    await this.fanOut(memo.id, user, memo.subject, memo.senderName, [...rows.values()]);
    return this.serialize(memo, user.id);
  }

  /**
   * Delivery is best-effort per recipient: one failed notification must not roll
   * back a memo that is already stored, nor stop the other recipients hearing
   * about it.
   */
  private async fanOut(
    memoId: string,
    user: AuthUser,
    subject: string,
    senderName: string,
    recipients: Prisma.MemoRecipientCreateManyMemoInput[],
  ) {
    await Promise.all(
      recipients.map((r) =>
        this.notifications
          .notify(
            user.organizationId,
            r.userId,
            { subject, senderName },
            {
              eventKey: 'memo.received',
              category: 'memo',
              channels: [Channel.in_app],
              title: r.kind === MemoRecipientKind.oversight ? `Copy: ${subject}` : subject,
              body:
                r.kind === MemoRecipientKind.oversight
                  ? `${senderName} sent a memo. You receive a copy of all internal memos.`
                  : `${senderName} sent you a memo.`,
              data: { memoId, kind: r.kind },
            },
          )
          .catch(() => undefined),
      ),
    );
  }

  // --- Reading --------------------------------------------------------------

  async list(user: AuthUser, q: QueryMemosDto) {
    const box = q.box ?? 'inbox';
    const search = q.search?.trim();
    const searchWhere: Prisma.MemoWhereInput = search
      ? { OR: [{ subject: { contains: search, mode: 'insensitive' } }, { body: { contains: search, mode: 'insensitive' } }] }
      : {};

    const where: Prisma.MemoWhereInput =
      box === 'sent'
        ? { organizationId: user.organizationId, deletedAt: null, senderUserId: user.id, ...searchWhere }
        : {
            organizationId: user.organizationId,
            deletedAt: null,
            recipients: {
              some: { userId: user.id, ...(q.unreadOnly === 'true' ? { readAt: null } : {}) },
            },
            ...searchWhere,
          };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.memo.findMany({
        where,
        include: { recipients: true },
        orderBy: { createdAt: 'desc' },
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.memo.count({ where }),
    ]);
    return paginated(rows.map((m) => this.serialize(m, user.id)), total, q.page, q.limit);
  }

  /** Badge count for the sidebar. */
  async unreadCount(user: AuthUser) {
    const count = await this.prisma.memoRecipient.count({
      where: { organizationId: user.organizationId, userId: user.id, readAt: null, memo: { deletedAt: null } },
    });
    return { count };
  }

  async get(user: AuthUser, id: string) {
    const memo = await this.prisma.memo.findFirst({
      where: { id, organizationId: user.organizationId, deletedAt: null },
      include: { recipients: true },
    });
    if (!memo) throw new NotFoundException('Memo not found');
    const mine = memo.senderUserId === user.id || memo.recipients.some((r) => r.userId === user.id);
    // Super admins hold an oversight row on every memo, so this only rejects
    // people the memo genuinely never reached.
    if (!mine) throw new NotFoundException('Memo not found');
    return this.serialize(memo, user.id);
  }

  async markRead(user: AuthUser, id: string) {
    const updated = await this.prisma.memoRecipient.updateMany({
      where: { memoId: id, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true, changed: updated.count };
  }

  private serialize(
    memo: Prisma.MemoGetPayload<{ include: { recipients: true } }>,
    viewerUserId: string,
  ) {
    const mine = memo.recipients.find((r) => r.userId === viewerUserId);
    return {
      id: memo.id,
      subject: memo.subject,
      body: memo.body,
      attachments: memo.attachments,
      senderName: memo.senderName,
      senderDepartment: memo.senderDeptName ?? '',
      isMine: memo.senderUserId === viewerUserId,
      createdAt: memo.createdAt,
      readAt: mine?.readAt ?? null,
      // What the viewer is to this memo: a named recipient, a supervisory copy,
      // or its author. The UI labels the row differently for each.
      myRole: memo.senderUserId === viewerUserId ? 'sender' : (mine?.kind ?? null),
      recipients: memo.recipients
        .filter((r) => r.kind === MemoRecipientKind.to)
        .map((r) => ({ name: r.name, department: r.departmentName ?? '', readAt: r.readAt })),
      oversightCount: memo.recipients.filter((r) => r.kind === MemoRecipientKind.oversight).length,
    };
  }
}
