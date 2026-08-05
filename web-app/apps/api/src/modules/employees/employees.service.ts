import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { CustomFieldValidatorService } from '../custom-fields/custom-field-validator.service';
import { ScopeService } from '../access/scope.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginated } from '../../common/dto/pagination.dto';
import { generatePassword } from '../../common/utils/password.util';
import { canSeePay } from '../../common/utils/pay-visibility.util';
import { CreateEmployeeDto, QueryEmployeesDto, UpdateEmployeeDto } from './dto/employee.dto';

const SORTABLE: Record<string, string> = {
  fullName: 'firstName', firstName: 'firstName', lastName: 'lastName',
  employeeCode: 'employeeCode', status: 'status', dateOfJoining: 'dateOfJoining', createdAt: 'createdAt',
};

/** Result of pre-transaction account preparation (validated + hashed). */
export interface PreparedAccount {
  plan: { email: string; roleId: string; passwordHash: string | null; status: UserStatus } | null;
  generatedPassword: string | null;
}

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customFields: CustomFieldValidatorService,
    private readonly scope: ScopeService,
  ) {}

  /** Role-scoped list: admins/HR see all; a department head sees only their
   *  department(s); an employee sees only themselves. */
  async list(user: AuthUser, q: QueryEmployeesDto) {
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    const where: Prisma.EmployeeWhereInput = {
      // A department head manages their team — they don't list themselves as one
      // of their own reports (admins/HR/self scopes are unaffected).
      ...this.scope.employeeWhere(dataScope, { excludeSelf: true }),
      organizationId: orgId,
      deletedAt: null,
      ...(q.status ? { status: q.status } : {}),
      ...(q.departmentId ? { departmentId: q.departmentId } : {}),
      ...(q.designationId ? { designationId: q.designationId } : {}),
      ...(q.employmentType ? { employmentType: q.employmentType } : {}),
      ...(q.cfKey && q.cfValue ? { customFields: { path: [q.cfKey], equals: q.cfValue } } : {}),
      ...(q.search
        ? {
            OR: [
              { firstName: { contains: q.search, mode: 'insensitive' } },
              { lastName: { contains: q.search, mode: 'insensitive' } },
              { workEmail: { contains: q.search, mode: 'insensitive' } },
              { employeeCode: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const sortCol = SORTABLE[q.sort ?? ''] ?? 'createdAt';
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        include: this.include(),
        orderBy: { [sortCol]: q.order },
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.employee.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serialize(r, canSeePay(user))), total, q.page, q.limit);
  }

  async get(orgId: string, id: string, showPay = true) {
    const emp = await this.prisma.employee.findFirst({ where: { id, organizationId: orgId, deletedAt: null }, include: this.include() });
    if (!emp) throw new NotFoundException('Employee not found');
    return this.serialize(emp, showPay);
  }

  /** Creates an employee and, in the same transaction, a linked login User.
   *  Every employee gets an account from day one (they'll use the mobile app). */
  async create(orgId: string, actorId: string, dto: CreateEmployeeDto, showPay = true) {
    const { customFields, plan, generatedPassword } = await this.prepareCreate(orgId, dto);
    const emp = await this.prisma.$transaction((tx) => this.insertEmployeeTx(tx, orgId, actorId, dto, customFields, plan));
    // The generated password is returned once so HR can hand it over; never stored in plaintext.
    return { ...this.serialize(emp, showPay), generatedPassword };
  }

  /** All pre-transaction work (custom-field validation + account prep). Lets
   *  another service create an employee inside its own transaction. */
  async prepareCreate(
    orgId: string,
    dto: CreateEmployeeDto,
    opts: { skipRequiredCustomFields?: boolean } = {},
  ): Promise<{ customFields: unknown } & PreparedAccount> {
    const customFields = await this.customFields.validate(orgId, 'employee', dto.customFields, { skipRequired: opts.skipRequiredCustomFields });
    const account = await this.prepareAccount(orgId, dto);
    return { customFields, ...account };
  }

  /** Pre-transaction work: validate the login account and hash the password
   *  (expensive) before opening a transaction. Reused by DepartmentsService so a
   *  department + its head can be created atomically. */
  async prepareAccount(orgId: string, dto: CreateEmployeeDto): Promise<PreparedAccount> {
    if (dto.createAccount === false) return { plan: null, generatedPassword: null };

    const email = dto.workEmail?.toLowerCase();
    if (!email) throw new BadRequestException('Work email is required to create the login account');

    const existing = await this.prisma.user.findFirst({ where: { organizationId: orgId, email, deletedAt: null } });
    if (existing) throw new ConflictException('A user with this work email already exists');

    const roleId = await this.resolveAccountRole(orgId, dto.accountRoleId);
    const generatedPassword = (dto.accountPasswordStrategy ?? 'generate') === 'generate' ? generatePassword() : null;
    return {
      plan: {
        email,
        roleId,
        passwordHash: generatedPassword ? await argon2.hash(generatedPassword) : null,
        status: generatedPassword ? UserStatus.active : UserStatus.invited,
      },
      generatedPassword,
    };
  }

  /** Inserts the user + employee + employment history inside a caller-provided
   *  transaction. Auto-defaults the manager to the department's head when none is
   *  given (the head themselves get no manager, since the dept has no head yet). */
  async insertEmployeeTx(
    tx: Prisma.TransactionClient,
    orgId: string,
    actorId: string,
    dto: CreateEmployeeDto,
    customFields: unknown,
    plan: PreparedAccount['plan'],
  ) {
    let linkedUserId: string | undefined;
    if (plan) {
      const user = await tx.user.create({
        data: {
          organizationId: orgId,
          email: plan.email,
          fullName: `${dto.firstName} ${dto.lastName}`.trim(),
          passwordHash: plan.passwordHash,
          status: plan.status,
          passwordChangedAt: plan.passwordHash ? new Date() : null,
          roles: { create: [{ roleId: plan.roleId }] },
        },
      });
      linkedUserId = user.id;
    }

    let managerId = dto.managerId;
    if (!managerId && dto.departmentId) {
      const dept = await tx.department.findUnique({ where: { id: dto.departmentId }, select: { headEmployeeId: true } });
      if (dept?.headEmployeeId) managerId = dept.headEmployeeId;
    }

    // Joining a department that serves a client whose premises are registered
    // as a work site → the hire works there; inherit it unless a site was
    // chosen explicitly (same defaulting pattern as the manager above).
    let locationId = dto.locationId;
    if (!locationId && dto.departmentId) {
      const servingClient = await tx.client.findFirst({
        where: { organizationId: orgId, departmentId: dto.departmentId, deletedAt: null },
        select: { id: true },
      });
      if (servingClient) {
        const site = await tx.location.findFirst({
          where: { organizationId: orgId, clientId: servingClient.id, deletedAt: null, isActive: true },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        });
        if (site) locationId = site.id;
      }
    }

    // New hires inherit the org's default pay model unless one is set explicitly.
    let compensationType = dto.compensationType;
    if (!compensationType) {
      const org = await tx.organization.findUnique({ where: { id: orgId }, select: { defaultCompensationType: true } });
      compensationType = org?.defaultCompensationType ?? 'hourly';
    }

    const employeeCode = dto.employeeCode ?? (await this.nextCode(tx, orgId));
    const created = await tx.employee.create({
      data: {
        organizationId: orgId,
        createdById: actorId,
        userId: linkedUserId,
        employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        workEmail: dto.workEmail?.toLowerCase(),
        personalEmail: dto.personalEmail?.toLowerCase(),
        phone: dto.phone,
        gender: dto.gender,
        photoFileId: dto.photoFileId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        locationId,
        managerId,
        employmentType: dto.employmentType,
        status: dto.status,
        dateOfJoining: dto.dateOfJoining ? new Date(dto.dateOfJoining) : undefined,
        compensationType,
        basicSalary: dto.basicSalary,
        payPerHour: dto.payPerHour,
        customFields: customFields as Prisma.InputJsonValue,
      },
      include: this.include(),
    });

    await tx.employmentHistory.create({
      data: { employeeId: created.id, eventType: 'joined', effectiveDate: created.dateOfJoining ?? new Date(), createdById: actorId },
    });
    return created;
  }

  /** Validates a chosen account role, or falls back to the org's "Employee" role. */
  private async resolveAccountRole(orgId: string, roleId?: string): Promise<string> {
    if (roleId) {
      const role = await this.prisma.role.findFirst({ where: { id: roleId, organizationId: orgId, deletedAt: null } });
      if (!role) throw new BadRequestException('Selected account role is invalid');
      return role.id;
    }
    const fallback = await this.prisma.role.findFirst({ where: { organizationId: orgId, slug: 'employee', deletedAt: null } });
    if (!fallback) throw new BadRequestException('No default "Employee" role found. Pick a role for the account.');
    return fallback.id;
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateEmployeeDto, showPay = true) {
    const existing = await this.prisma.employee.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Employee not found');

    let customFields: Prisma.InputJsonValue | undefined;
    if (dto.customFields !== undefined) {
      const merged = { ...(existing.customFields as Record<string, unknown>), ...dto.customFields };
      // Editing an existing employee must not be blocked by a required custom
      // field that was never filled (e.g. adding blood_group later). Type/format
      // rules still apply — only the "required" gate is relaxed on update.
      customFields = (await this.customFields.validate(orgId, 'employee', merged, {
        entityId: id,
        skipRequired: true,
        // Values already on the record are grandfathered when a definition
        // changed under them — see CustomFieldValidatorService.validate.
        previous: (existing.customFields as Record<string, unknown>) ?? {},
      })) as Prisma.InputJsonValue;
    }

    // Work email IS the login email (the form says "fills from work email").
    // Changing one without the other silently splits the two: HR searches
    // Users by the new address and finds nothing, while the employee can only
    // sign in with the old one. Keep the linked account in step.
    const newEmail = dto.workEmail?.toLowerCase();
    if (newEmail && existing.userId && newEmail !== existing.workEmail?.toLowerCase()) {
      const clash = await this.prisma.user.findFirst({
        where: { organizationId: orgId, email: newEmail, deletedAt: null, id: { not: existing.userId } },
        select: { id: true },
      });
      if (clash) throw new ConflictException('Another user already signs in with this work email');
      await this.prisma.user.update({ where: { id: existing.userId }, data: { email: newEmail } });
    }

    const emp = await this.prisma.employee.update({
      where: { id },
      data: {
        updatedById: userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        workEmail: dto.workEmail?.toLowerCase(),
        personalEmail: dto.personalEmail?.toLowerCase(),
        phone: dto.phone,
        gender: dto.gender,
        photoFileId: dto.photoFileId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        locationId: dto.locationId,
        managerId: dto.managerId,
        employmentType: dto.employmentType,
        status: dto.status,
        dateOfJoining: dto.dateOfJoining ? new Date(dto.dateOfJoining) : undefined,
        compensationType: dto.compensationType,
        basicSalary: dto.basicSalary,
        payPerHour: dto.payPerHour,
        ...(customFields !== undefined ? { customFields } : {}),
      },
      include: this.include(),
    });

    // Moved into a department that serves a client (with a registered site)
    // and left without a work site? Inherit the client site — same rule as at
    // creation, so "the whole serving team works at the client" stays true.
    if (emp.departmentId && !emp.locationId) {
      const servingClient = await this.prisma.client.findFirst({
        where: { organizationId: orgId, departmentId: emp.departmentId, deletedAt: null },
        select: { id: true },
      });
      const site = servingClient
        ? await this.prisma.location.findFirst({
            where: { organizationId: orgId, clientId: servingClient.id, deletedAt: null, isActive: true },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
          })
        : null;
      if (site) {
        const synced = await this.prisma.employee.update({ where: { id }, data: { locationId: site.id }, include: this.include() });
        return this.serialize(synced, showPay);
      }
    }
    return this.serialize(emp, showPay);
  }

  /** Soft-deletes the employee and, if they have a linked login, disables that
   *  account too: status → disabled (login is refused) and every live refresh
   *  token is revoked so any active web/mobile session is cut off immediately. */
  async remove(orgId: string, userId: string, id: string) {
    const emp = await this.prisma.employee.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!emp) throw new NotFoundException('Employee not found');
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.employee.update({ where: { id }, data: { deletedAt: now, updatedById: userId } });
      if (emp.userId) {
        await tx.user.update({ where: { id: emp.userId }, data: { status: UserStatus.disabled } });
        await tx.refreshToken.updateMany({ where: { userId: emp.userId, revokedAt: null }, data: { revokedAt: now } });
      }
    });
    return { success: true };
  }

  async restore(orgId: string, id: string) {
    const emp = await this.prisma.employee.findFirst({ where: { id, organizationId: orgId, deletedAt: { not: null } } });
    if (!emp) throw new NotFoundException('Deleted employee not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.employee.update({ where: { id }, data: { deletedAt: null } });
      // Re-enable the login that delete disabled (they must sign in again).
      if (emp.userId) await tx.user.update({ where: { id: emp.userId }, data: { status: UserStatus.active } });
    });
    return { success: true };
  }

  async history(orgId: string, id: string) {
    await this.get(orgId, id);
    return this.prisma.employmentHistory.findMany({ where: { employeeId: id }, orderBy: { effectiveDate: 'desc' } });
  }

  /** Bulk import with per-row validation; never aborts the batch on a bad row. */
  async bulkImport(orgId: string, userId: string, rows: CreateEmployeeDto[]) {
    const results = { created: 0, failed: 0, errors: [] as { row: number; message: string }[] };
    for (let i = 0; i < rows.length; i++) {
      try {
        await this.create(orgId, userId, rows[i]);
        results.created++;
      } catch (e) {
        results.failed++;
        results.errors.push({ row: i + 1, message: (e as Error).message });
      }
    }
    return results;
  }

  // --- helpers ---

  private include() {
    return {
      department: { select: { name: true } },
      designation: { select: { title: true } },
      location: { select: { name: true } },
      manager: { select: { firstName: true, lastName: true } },
      user: { select: { id: true, email: true, status: true, roles: { select: { role: { select: { name: true } } } } } },
    };
  }

  private async nextCode(client: Prisma.TransactionClient, orgId: string): Promise<string> {
    const count = await client.employee.count({ where: { organizationId: orgId } });
    return `EMP-${1001 + count}`;
  }

  private serialize(e: any, showPay = true) {
    return {
      id: e.id,
      employeeCode: e.employeeCode,
      firstName: e.firstName,
      lastName: e.lastName,
      fullName: `${e.firstName} ${e.lastName}`,
      workEmail: e.workEmail,
      personalEmail: e.personalEmail,
      phone: e.phone,
      gender: e.gender,
      departmentId: e.departmentId,
      departmentName: e.department?.name ?? null,
      designationId: e.designationId,
      designationName: e.designation?.title ?? null,
      photoFileId: e.photoFileId ?? null,
      locationId: e.locationId ?? null,
      locationName: e.location?.name ?? null,
      managerId: e.managerId,
      managerName: e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : null,
      employmentType: e.employmentType,
      status: e.status,
      dateOfJoining: e.dateOfJoining,
      compensationType: e.compensationType,
      // Pay amounts only for payroll:read holders — the keys are omitted, not
      // nulled, so "no salary set" and "not allowed to see it" stay distinct.
      ...(showPay
        ? {
            basicSalary: e.basicSalary != null ? Number(e.basicSalary) : null,
            payPerHour: e.payPerHour != null ? Number(e.payPerHour) : null,
          }
        : {}),
      customFields: e.customFields ?? {},
      // linked login account (every employee has one from day one)
      userId: e.userId ?? null,
      accountEmail: e.user?.email ?? null,
      accountStatus: e.user?.status ?? null,
      accountRoles: e.user?.roles?.map((ur: any) => ur.role.name) ?? [],
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}
