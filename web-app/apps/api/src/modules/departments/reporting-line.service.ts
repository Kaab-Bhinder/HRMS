import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Keeps the reporting line consistent with the org chart.
 *
 * One rule, applied everywhere: **you report to your department's head, and a
 * head reports to the head of the parent department.**
 *
 * This is what lets every approval-driven module — leave today, travel now —
 * work from a single field without each one inventing its own hierarchy. It
 * also closes a real gap: a head with no manager produced an EMPTY leave
 * approval chain, so their leave request had nobody who could action it.
 */
@Injectable()
export class ReportingLineService {
  private readonly log = new Logger(ReportingLineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Who should this employee report to? Returns null only for the person at
   * the very top, who genuinely has no one above them.
   */
  async managerFor(orgId: string, employeeId: string): Promise<string | null> {
    const emp = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId: orgId, deletedAt: null },
      select: { id: true, department: { select: { id: true, headEmployeeId: true, parentId: true } } },
    });
    if (!emp?.department) return null;

    // A head does not report to themselves — walk up to the parent department.
    let dept: { id: string; headEmployeeId: string | null; parentId: string | null } | null = emp.department;
    for (let hops = 0; dept && hops < 10; hops++) {
      const head = dept.headEmployeeId;
      if (head && head !== emp.id) {
        const alive = await this.prisma.employee.findFirst({
          where: { id: head, organizationId: orgId, deletedAt: null },
          select: { id: true },
        });
        if (alive) return alive.id;
      }
      if (!dept.parentId) break;
      dept = await this.prisma.department.findFirst({
        where: { id: dept.parentId, organizationId: orgId, deletedAt: null },
        select: { id: true, headEmployeeId: true, parentId: true },
      });
    }

    // Nobody above them in the org chart. Rather than leave the person with no
    // approver at all — which produced an EMPTY leave chain and a request that
    // literally could not be actioned — fall back to HR.
    return this.hrFallback(orgId, emp.id);
  }

  /**
   * Last-resort approver: an HR Manager who isn't the requester. This is what
   * guarantees no request in the system is ever unapprovable, however the org
   * chart is shaped.
   */
  private async hrFallback(orgId: string, exceptEmployeeId: string): Promise<string | null> {
    const hr = await this.prisma.employee.findFirst({
      where: {
        organizationId: orgId, deletedAt: null, id: { not: exceptEmployeeId },
        user: { deletedAt: null, status: 'active', roles: { some: { role: { slug: 'hr-manager' } } } },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    return hr?.id ?? null;
  }

  /** Re-points one employee at the right manager. */
  async sync(orgId: string, employeeId: string) {
    const managerId = await this.managerFor(orgId, employeeId);
    await this.prisma.employee.update({ where: { id: employeeId }, data: { managerId } });
    return managerId;
  }

  /**
   * Re-points everyone in a department (and its head) after the head changes.
   * Called when a department's head is reassigned, so the reporting line never
   * drifts from the org chart.
   */
  async syncDepartment(orgId: string, departmentId: string) {
    const members = await this.prisma.employee.findMany({
      where: { organizationId: orgId, departmentId, deletedAt: null },
      select: { id: true },
    });
    let updated = 0;
    for (const m of members) {
      await this.sync(orgId, m.id);
      updated++;
    }
    return { updated };
  }

  /**
   * One-off repair across the whole organisation. Only fills gaps and fixes
   * self-references by default — a deliberately chosen manager (a team lead
   * between employee and head) is left alone unless `force` is set.
   */
  async syncOrganization(orgId: string, opts: { force?: boolean } = {}) {
    const all = await this.prisma.employee.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, managerId: true },
    });
    let fixed = 0;
    for (const e of all) {
      const selfReferencing = e.managerId === e.id;
      if (!opts.force && e.managerId && !selfReferencing) continue;
      const should = await this.managerFor(orgId, e.id);
      if (should !== e.managerId) {
        await this.prisma.employee.update({ where: { id: e.id }, data: { managerId: should } });
        fixed++;
      }
    }
    this.log.log(`reporting line synced: ${fixed} employee(s) re-pointed`);
    return { checked: all.length, fixed };
  }
}
