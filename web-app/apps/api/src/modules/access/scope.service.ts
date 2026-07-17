import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/** What slice of org data the caller may see. Drives every role-based view. */
export type DataScope =
  | { kind: 'org' } // super admin / HR — everything
  | { kind: 'team'; employeeId: string; departmentIds: string[] } // department head — their team
  | { kind: 'self'; employeeId: string }; // employee — only themselves

/** Client-facing descriptor so web/mobile can render the right view per role. */
export interface ViewContext {
  view: 'admin' | 'hr' | 'dept_head' | 'employee';
  employeeId: string | null;
  headsDepartments: { id: string; name: string }[];
}

@Injectable()
export class ScopeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolve the caller's data scope from their role + position in the org. */
  async resolve(user: AuthUser): Promise<DataScope> {
    // Org-wide: super admins and HR see the whole organization.
    if (user.isSuperAdmin || user.roles.includes('hr-manager')) return { kind: 'org' };

    const emp = await this.prisma.employee.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    // A privileged, non-employee account (rare) falls back to org scope.
    if (!emp) return { kind: 'org' };

    // Department head: sees their department(s).
    const headed = await this.prisma.department.findMany({
      where: { headEmployeeId: emp.id, deletedAt: null },
      select: { id: true },
    });
    if (headed.length) return { kind: 'team', employeeId: emp.id, departmentIds: headed.map((d) => d.id) };

    // Otherwise a regular employee sees only themselves.
    return { kind: 'self', employeeId: emp.id };
  }

  /** A Prisma `where` fragment that limits an employee query to the scope.
   *  `excludeSelf` drops the caller's own record — used for a department head's
   *  roster, where the head manages the team and shouldn't list themselves. */
  employeeWhere(scope: DataScope, opts: { excludeSelf?: boolean } = {}): Prisma.EmployeeWhereInput {
    switch (scope.kind) {
      case 'org':
        return {};
      case 'team':
        return {
          departmentId: { in: scope.departmentIds },
          ...(opts.excludeSelf ? { id: { not: scope.employeeId } } : {}),
        };
      case 'self':
        return { id: scope.employeeId };
    }
  }

  /** Scope fragment for any table owned by an employee (leave, attendance…):
   *  filters on `employeeId` / the employee's department. Combine via `AND`. */
  byEmployee(scope: DataScope): { employeeId?: string; employee?: { departmentId: { in: string[] } } } {
    switch (scope.kind) {
      case 'org':
        return {};
      case 'team':
        return { employee: { departmentId: { in: scope.departmentIds } } };
      case 'self':
        return { employeeId: scope.employeeId };
    }
  }

  /** Scope fragment for tasks: a head sees tasks in their department(s) or
   *  assigned to their team; an employee sees tasks assigned to them. */
  taskWhere(scope: DataScope): Prisma.TaskWhereInput {
    switch (scope.kind) {
      case 'org':
        return {};
      case 'team':
        return {
          OR: [
            { departmentId: { in: scope.departmentIds } },
            { assignments: { some: { employee: { departmentId: { in: scope.departmentIds } } } } },
          ],
        };
      case 'self':
        return { assignments: { some: { employeeId: scope.employeeId } } };
    }
  }

  /** Client view descriptor for `GET /me/scope`. */
  async view(user: AuthUser): Promise<ViewContext> {
    const scope = await this.resolve(user);

    let employeeId: string | null = scope.kind === 'org' ? null : scope.employeeId;
    if (scope.kind === 'org') {
      const emp = await this.prisma.employee.findFirst({ where: { userId: user.id, deletedAt: null }, select: { id: true } });
      employeeId = emp?.id ?? null;
    }

    const headsDepartments = scope.kind === 'team'
      ? await this.prisma.department.findMany({ where: { id: { in: scope.departmentIds } }, select: { id: true, name: true } })
      : [];

    const view: ViewContext['view'] = user.isSuperAdmin
      ? 'admin'
      : user.roles.includes('hr-manager')
        ? 'hr'
        : scope.kind === 'team'
          ? 'dept_head'
          : 'employee';

    return { view, employeeId, headsDepartments };
  }
}
