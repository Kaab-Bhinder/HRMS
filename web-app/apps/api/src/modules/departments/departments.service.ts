import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EmployeesService } from '../employees/employees.service';
import { CreateEmployeeDto } from '../employees/dto/employee.dto';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employees: EmployeesService,
  ) {}

  async list(orgId: string, search?: string) {
    const rows = await this.prisma.department.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : {}),
      },
      orderBy: { name: 'asc' },
      include: { parent: { select: { name: true } }, head: { select: { firstName: true, lastName: true } }, _count: { select: { members: true } } },
    });
    return rows.map((d) => this.serialize(d));
  }

  /** Nested hierarchy (top-level departments with their children). */
  async tree(orgId: string) {
    const all = await this.prisma.department.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    });
    const byId = new Map(all.map((d) => [d.id, { id: d.id, name: d.name, code: d.code, memberCount: d._count.members, children: [] as any[] }]));
    const roots: any[] = [];
    for (const d of all) {
      const node = byId.get(d.id)!;
      if (d.parentId && byId.has(d.parentId)) byId.get(d.parentId)!.children.push(node);
      else roots.push(node);
    }
    return roots;
  }

  async get(orgId: string, id: string) {
    const d = await this.prisma.department.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: { parent: { select: { name: true } }, head: { select: { firstName: true, lastName: true } }, _count: { select: { members: true } } },
    });
    if (!d) throw new NotFoundException('Department not found');
    return this.serialize(d);
  }

  /** Creates a department together with its (compulsory) head, atomically.
   *  The head is either an existing employee or a new one created inline; either
   *  way they're placed in the department, made its head, and granted the
   *  "Department Head" role. No department can exist without a head. */
  async create(orgId: string, actorId: string, dto: CreateDepartmentDto) {
    await this.assertParent(orgId, dto.parentId);

    const head = dto.head;
    if (!head || (!head.employeeId && !head.newEmployee)) {
      throw new BadRequestException('A department must have a head. Assign an existing employee or create a new one.');
    }
    if (head.employeeId && head.newEmployee) {
      throw new BadRequestException('Provide either an existing employee or a new one as head, not both.');
    }

    const headRoleId = await this.deptHeadRoleId(orgId);

    // Pre-transaction prep (validation + password hash) for a brand-new head.
    let newHeadDto: CreateEmployeeDto | null = null;
    let prepared: Awaited<ReturnType<EmployeesService['prepareCreate']>> | null = null;
    if (head.newEmployee) {
      newHeadDto = { ...head.newEmployee, accountRoleId: headRoleId };
      // Bootstrap head: don't force required custom fields now — they can be
      // completed later on the employee's profile.
      prepared = await this.employees.prepareCreate(orgId, newHeadDto, { skipRequiredCustomFields: true });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const dept = await tx.department.create({
        data: {
          organizationId: orgId,
          createdById: actorId,
          name: dto.name,
          code: dto.code,
          description: dto.description,
          parentId: dto.parentId,
          costCenter: dto.costCenter,
          isActive: dto.isActive,
        },
      });

      let headEmployeeId: string;
      let generatedPassword: string | null = null;

      if (head.employeeId) {
        const emp = await tx.employee.findFirst({ where: { id: head.employeeId, organizationId: orgId, deletedAt: null } });
        if (!emp) throw new BadRequestException('Selected head employee not found');
        // A head belongs to their department and reports to no one.
        await tx.employee.update({ where: { id: emp.id }, data: { departmentId: dept.id, managerId: null } });
        if (emp.userId) await this.grantRole(tx, emp.userId, headRoleId);
        headEmployeeId = emp.id;
      } else {
        const headEmp = await this.employees.insertEmployeeTx(
          tx, orgId, actorId,
          { ...newHeadDto!, departmentId: dept.id, managerId: undefined },
          prepared!.customFields, prepared!.plan,
        );
        headEmployeeId = headEmp.id;
        generatedPassword = prepared!.generatedPassword;
      }

      const withHead = await tx.department.update({
        where: { id: dept.id },
        data: { headEmployeeId },
        include: { parent: { select: { name: true } }, head: { select: { firstName: true, lastName: true } }, _count: { select: { members: true } } },
      });
      return { dept: withHead, generatedPassword };
    });

    return { ...this.serialize(result.dept), generatedPassword: result.generatedPassword };
  }

  async update(orgId: string, actorId: string, id: string, dto: UpdateDepartmentDto) {
    await this.ensure(orgId, id);
    if (dto.parentId === id) throw new BadRequestException('A department cannot be its own parent');
    await this.assertParent(orgId, dto.parentId);

    // Reassigning the head: move them into the dept and grant the Department Head role.
    if (dto.headEmployeeId) {
      const headRoleId = await this.deptHeadRoleId(orgId);
      const emp = await this.prisma.employee.findFirst({ where: { id: dto.headEmployeeId, organizationId: orgId, deletedAt: null } });
      if (!emp) throw new BadRequestException('Selected head employee not found');
      await this.prisma.$transaction(async (tx) => {
        await tx.employee.update({ where: { id: emp.id }, data: { departmentId: id } });
        if (emp.userId) await this.grantRole(tx, emp.userId, headRoleId);
      });
    }

    await this.prisma.department.update({
      where: { id },
      data: {
        updatedById: actorId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        parentId: dto.parentId,
        headEmployeeId: dto.headEmployeeId,
        costCenter: dto.costCenter,
        isActive: dto.isActive,
      },
    });
    return this.get(orgId, id);
  }

  private async deptHeadRoleId(orgId: string): Promise<string> {
    const role = await this.prisma.role.findFirst({ where: { organizationId: orgId, slug: 'department-head', deletedAt: null } });
    if (!role) throw new BadRequestException('The "Department Head" role is missing. Re-run the database seed.');
    return role.id;
  }

  private async grantRole(tx: Prisma.TransactionClient, userId: string, roleId: string) {
    await tx.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  }

  async remove(orgId: string, id: string) {
    await this.ensure(orgId, id);
    const childCount = await this.prisma.department.count({ where: { parentId: id, deletedAt: null } });
    if (childCount) throw new BadRequestException('Reassign or remove sub-departments first');
    await this.prisma.department.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private async assertParent(orgId: string, parentId?: string) {
    if (!parentId) return;
    const parent = await this.prisma.department.findFirst({ where: { id: parentId, organizationId: orgId, deletedAt: null } });
    if (!parent) throw new BadRequestException('Parent department not found');
  }

  private async ensure(orgId: string, id: string) {
    const d = await this.prisma.department.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!d) throw new NotFoundException('Department not found');
    return d;
  }

  private serialize(d: any) {
    return {
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description,
      parentId: d.parentId,
      parentName: d.parent?.name ?? null,
      headEmployeeId: d.headEmployeeId,
      headName: d.head ? `${d.head.firstName} ${d.head.lastName}` : null,
      costCenter: d.costCenter,
      memberCount: d._count?.members ?? 0,
      isActive: d.isActive,
      createdAt: d.createdAt,
    };
  }
}
