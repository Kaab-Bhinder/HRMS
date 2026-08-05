import { Injectable } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { EmployeesService } from '../employees/employees.service';
import { AttendanceService } from '../attendance/attendance.service';
import { DepartmentsService } from '../departments/departments.service';
import { LeaveService } from '../leave/leave.service';
import { ToolSpec } from './llm/llm-provider.interface';
import { HELP_TOPICS, helpTopicList } from './assistant-knowledge';

/** A tool bound to one caller: the model supplies args, never the identity. */
export interface BoundTool {
  spec: ToolSpec;
  run(args: Record<string, unknown>): Promise<unknown>;
}

/**
 * The assistant's entire capability surface.
 *
 * Every tool delegates to a service method that already takes an AuthUser and
 * applies role scoping — so a department head asking "how many people are
 * there" gets their team, and pay fields stay masked without `payroll:read`.
 * The model never sees a query language and never names the caller: identity is
 * bound here, server-side, and cannot be argued out of the model.
 *
 * This is the reason the assistant is safe to expose. Do NOT add a tool that
 * takes raw SQL, a Prisma filter, or an organizationId from the model.
 */
@Injectable()
export class AssistantToolsService {
  constructor(
    private readonly employees: EmployeesService,
    private readonly attendance: AttendanceService,
    private readonly departments: DepartmentsService,
    private readonly leave: LeaveService,
  ) {}

  forUser(user: AuthUser): BoundTool[] {
    const tools: BoundTool[] = [
      {
        spec: {
          name: 'count_employees',
          description:
            'Count employees the current user is allowed to see, optionally filtered by department or employment status. Use for "how many people…" questions.',
          parameters: {
            type: 'object',
            properties: {
              departmentId: { type: 'string', description: 'Optional department id from list_departments.' },
              status: {
                type: 'string',
                enum: ['probation', 'active', 'on_leave', 'suspended', 'resigned', 'terminated'],
                description: 'Optional employment status filter.',
              },
            },
            additionalProperties: false,
          },
        },
        run: async (a) => {
          const res = await this.employees.list(user, {
            page: 1, limit: 1, skip: 0, order: 'desc',
            departmentId: a.departmentId as string | undefined,
            status: a.status as never,
          } as never);
          return { total: res.meta.total };
        },
      },
      {
        spec: {
          name: 'search_employees',
          description:
            'Find employees by name, work email, or employee code. Returns up to 10 matches with their department, designation, and status. Salary is included only if the current user is allowed to see pay.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Name, email, or employee code fragment.' },
              departmentId: { type: 'string', description: 'Optional department id to narrow the search.' },
            },
            required: ['query'],
            additionalProperties: false,
          },
        },
        run: async (a) => {
          const res = await this.employees.list(user, {
            page: 1, limit: 10, skip: 0, order: 'desc',
            search: String(a.query ?? ''),
            departmentId: a.departmentId as string | undefined,
          } as never);
          return {
            total: res.meta.total,
            showing: res.data.length,
            employees: res.data.map((e: Record<string, unknown>) => ({
              fullName: e.fullName, employeeCode: e.employeeCode, workEmail: e.workEmail,
              department: e.departmentName, designation: e.designationName, status: e.status,
              basicSalary: e.basicSalary ?? undefined, payPerHour: e.payPerHour ?? undefined,
            })),
          };
        },
      },
      {
        spec: {
          name: 'list_departments',
          description: 'List departments with their ids, head, and member count. Call this first when a question names a department, to resolve it to an id.',
          parameters: { type: 'object', properties: {}, additionalProperties: false },
        },
        run: async () => {
          const rows = await this.departments.list(user.organizationId);
          return rows.map((d: Record<string, unknown>) => ({
            id: d.id, name: d.name, head: d.headName ?? null, memberCount: d.memberCount,
          }));
        },
      },
      {
        spec: {
          name: 'attendance_today',
          description:
            'Attendance totals for a single day (defaults to today): how many are present, absent, late, on leave, and how many entries are flagged for review.',
          parameters: {
            type: 'object',
            properties: { date: { type: 'string', description: 'Optional date, YYYY-MM-DD. Defaults to today.' } },
            additionalProperties: false,
          },
        },
        run: (a) => this.attendance.summary(user, a.date as string | undefined),
      },
      {
        spec: {
          name: 'attendance_trend',
          description: 'Daily present/absent/late counts over the last N days, optionally for one department. Use for trend or "past week/month" questions.',
          parameters: {
            type: 'object',
            properties: {
              days: { type: 'integer', minimum: 1, maximum: 90, description: 'How many days back. Default 14.' },
              departmentId: { type: 'string', description: 'Optional department id from list_departments.' },
            },
            additionalProperties: false,
          },
        },
        run: (a) => this.attendance.trend(user, Number(a.days ?? 14), a.departmentId as string | undefined),
      },
      {
        spec: {
          name: 'explain_feature',
          description:
            `Explain how a part of this HR system works — how to do something, or what a concept means. Prefer this over guessing. Available topics: ${helpTopicList()}.`,
          parameters: {
            type: 'object',
            properties: { topic: { type: 'string', description: 'One of the listed topic keys.' } },
            required: ['topic'],
            additionalProperties: false,
          },
        },
        run: async (a) => {
          const key = String(a.topic ?? '').toLowerCase().trim();
          return HELP_TOPICS[key]
            ? { topic: key, explanation: HELP_TOPICS[key] }
            : { error: `No such topic. Available: ${helpTopicList()}` };
        },
      },
    ];

    // Own leave balance — identity-scoped, so it needs no extra permission.
    tools.push({
      spec: {
        name: 'my_leave_balance',
        description: "The signed-in user's own leave balances by leave type (entitled, taken, remaining).",
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
      run: async () => {
        try {
          return await this.leave.balancesFor(user, 'me');
        } catch {
          return { error: 'No employee record is linked to your account.' };
        }
      },
    });

    return tools;
  }
}
