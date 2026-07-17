import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { paginated } from '../../common/dto/pagination.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

const SORTABLE: Record<string, string> = {
  fullName: 'fullName', email: 'email', status: 'status', lastLoginAt: 'lastLoginAt', createdAt: 'createdAt',
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string, q: QueryUsersDto) {
    const where: Prisma.UserWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(q.status ? { status: q.status as UserStatus } : {}),
      ...(q.roleId ? { roles: { some: { roleId: q.roleId } } } : {}),
      ...(q.search
        ? { OR: [
            { fullName: { contains: q.search, mode: 'insensitive' } },
            { email: { contains: q.search, mode: 'insensitive' } },
          ] }
        : {}),
    };

    const sortCol = SORTABLE[q.sort ?? ''] ?? 'createdAt';
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, include: this.include(), orderBy: { [sortCol]: q.order }, skip: q.skip, take: q.limit }),
      this.prisma.user.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serialize(r)), total, q.page, q.limit);
  }

  async get(orgId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId: orgId, deletedAt: null }, include: this.include() });
    if (!user) throw new NotFoundException('User not found');
    return this.serialize(user);
  }

  async create(orgId: string, dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    await this.assertEmailFree(orgId, email);
    await this.assertRolesInOrg(orgId, dto.roleIds ?? []);

    const passwordHash = dto.password ? await argon2.hash(dto.password) : null;
    // A user with no password can't sign in yet — force "invited" until one is set.
    const status = (dto.status as UserStatus | undefined) ?? (passwordHash ? UserStatus.active : UserStatus.invited);

    const user = await this.prisma.user.create({
      data: {
        organizationId: orgId,
        email,
        fullName: dto.fullName,
        passwordHash,
        status: passwordHash ? status : UserStatus.invited,
        passwordChangedAt: passwordHash ? new Date() : null,
        roles: { create: (dto.roleIds ?? []).map((roleId) => ({ roleId })) },
      },
      include: this.include(),
    });
    return this.serialize(user);
  }

  async update(orgId: string, actingUserId: string, id: string, dto: UpdateUserDto) {
    const user = await this.ensure(orgId, id);

    if (dto.status && id === actingUserId && dto.status !== UserStatus.active) {
      throw new BadRequestException('You cannot change your own account status');
    }
    if (dto.status && dto.status !== UserStatus.active && !user.passwordHash) {
      // no-op guard: allow suspend/disable regardless; only block "active" without a password
    }
    if (dto.status === UserStatus.active && !user.passwordHash) {
      throw new BadRequestException('Set a password before activating this user');
    }

    if (dto.roleIds !== undefined) await this.assertRolesInOrg(orgId, dto.roleIds);

    await this.prisma.$transaction(async (tx) => {
      const data: Prisma.UserUpdateInput = {};
      if (dto.fullName !== undefined) data.fullName = dto.fullName;
      if (dto.status !== undefined) data.status = dto.status as UserStatus;
      if (Object.keys(data).length) await tx.user.update({ where: { id }, data });

      if (dto.roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length) {
          await tx.userRole.createMany({ data: dto.roleIds.map((roleId) => ({ userId: id, roleId })), skipDuplicates: true });
        }
      }
    });

    return this.get(orgId, id);
  }

  async resetPassword(orgId: string, id: string, password: string) {
    const user = await this.ensure(orgId, id);
    const passwordHash = await argon2.hash(password);
    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
        // an invited user becomes active the moment they get a password
        status: user.status === UserStatus.invited ? UserStatus.active : user.status,
      },
    });
    // Revoke every existing session so a password change forces re-login everywhere.
    await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true };
  }

  async remove(orgId: string, actingUserId: string, id: string) {
    const user = await this.ensure(orgId, id);
    if (id === actingUserId) throw new BadRequestException('You cannot delete your own account');
    if (user.isSuperAdmin) {
      const others = await this.prisma.user.count({
        where: { organizationId: orgId, isSuperAdmin: true, deletedAt: null, id: { not: id } },
      });
      if (others === 0) throw new ForbiddenException('Cannot delete the last super admin');
    }
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
      // Tombstone the email so the (org, email) unique slot is freed for re-use
      // (e.g. re-hiring someone with the same work email). Original is in the audit log.
      this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: UserStatus.disabled, email: `${user.email}::deleted::${id}` },
      }),
    ]);
    return { success: true };
  }

  // --- helpers ---

  private include() {
    return { roles: { include: { role: { select: { id: true, name: true, slug: true } } } } };
  }

  private async ensure(orgId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async assertEmailFree(orgId: string, email: string) {
    const existing = await this.prisma.user.findFirst({ where: { organizationId: orgId, email, deletedAt: null } });
    if (existing) throw new ConflictException('A user with this email already exists');
  }

  private async assertRolesInOrg(orgId: string, roleIds: string[]) {
    if (!roleIds.length) return;
    const count = await this.prisma.role.count({ where: { id: { in: roleIds }, organizationId: orgId, deletedAt: null } });
    if (count !== new Set(roleIds).size) throw new BadRequestException('One or more roles are invalid');
  }

  private serialize(u: any) {
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl ?? null,
      status: u.status,
      isSuperAdmin: u.isSuperAdmin,
      roles: (u.roles ?? []).map((ur: any) => ({ id: ur.role.id, name: ur.role.name, slug: ur.role.slug })),
      lastLoginAt: u.lastLoginAt ?? null,
      createdAt: u.createdAt,
    };
  }
}
