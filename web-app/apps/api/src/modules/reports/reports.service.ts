import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { REPORT_DEFINITIONS } from './report-definitions.service';
import { PrismaService } from '../../database/prisma.service';
import { paginated } from '../../common/dto/pagination.dto';
import { ReportColumn, ReportExportService } from './report-export.service';
import {
  CreateSavedReportDto,
  QuerySavedReportsDto,
  ReportModule,
  RunReportQueryDto,
  UpdateSavedReportDto,
} from './dto/report.dto';

const EXPORT_ROW_CAP = 5000;

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exporter: ReportExportService,
  ) {}

  // --- Saved reports CRUD (org-scoped, soft-delete) ---

  async list(orgId: string, q: QuerySavedReportsDto) {
    const where: Prisma.SavedReportWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(q.module ? { module: q.module } : {}),
      ...(q.search ? { name: { contains: q.search, mode: 'insensitive' } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.savedReport.findMany({
        where,
        orderBy: { createdAt: q.order },
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.savedReport.count({ where }),
    ]);
    return paginated(rows, total, q.page, q.limit);
  }

  async create(orgId: string, userId: string, dto: CreateSavedReportDto) {
    return this.prisma.savedReport.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        name: dto.name,
        module: dto.module,
        definition: dto.definition as Prisma.InputJsonValue,
        scheduleCron: dto.scheduleCron,
        ...(dto.recipients !== undefined ? { recipients: dto.recipients as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateSavedReportDto) {
    await this.getOrFail(orgId, id);
    return this.prisma.savedReport.update({
      where: { id },
      data: {
        name: dto.name,
        module: dto.module,
        scheduleCron: dto.scheduleCron,
        ...(dto.definition !== undefined ? { definition: dto.definition as Prisma.InputJsonValue } : {}),
        ...(dto.recipients !== undefined ? { recipients: dto.recipients as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.getOrFail(orgId, id);
    await this.prisma.savedReport.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private async getOrFail(orgId: string, id: string) {
    const report = await this.prisma.savedReport.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  // --- Report execution / export ---

  /** Builds a dataset for a module, applies filters, and renders it via the chosen formatter. */
  async run(orgId: string, q: RunReportQueryDto): Promise<{ filename: string; contentType: string; body: Buffer | string }> {
    // A catalogue report has its own query and columns; only an unkeyed request
    // falls back to the generic per-module dump.
    const def = q.report ? REPORT_DEFINITIONS.find((d) => d.key === q.report) : undefined;
    if (q.report && !def) throw new BadRequestException(`Unknown report "${q.report}"`);

    const { columns, rows } = def
      ? await def.build({
          orgId, prisma: this.prisma,
          date: q.date, from: q.from, to: q.to,
          departmentId: q.departmentId, status: q.status,
        })
      : await this.buildDataset(orgId, q.module, q);

    const formatter = this.exporter.getFormatter(q.format);
    const body = formatter.render(columns, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    const slug = def ? def.key : `${q.module}-report`;
    return { filename: `${slug}-${stamp}.${formatter.extension}`, contentType: formatter.contentType, body };
  }

  /** The catalogue the UI renders — titles, descriptions, and which
   *  parameters each report actually needs. */
  listCatalog() {
    return REPORT_DEFINITIONS.map((d) => ({
      key: d.key, title: d.title, description: d.description, module: d.module, params: d.params,
    }));
  }

  private async buildDataset(
    orgId: string,
    module: ReportModule,
    q: RunReportQueryDto,
  ): Promise<{ columns: ReportColumn[]; rows: Record<string, any>[] }> {
    switch (module) {
      case 'attendance':
        return this.attendanceDataset(orgId, q);
      case 'leave':
        return this.leaveDataset(orgId, q);
      case 'employees':
      default:
        return this.employeesDataset(orgId, q);
    }
  }

  private async employeesDataset(orgId: string, q: RunReportQueryDto) {
    const where: Prisma.EmployeeWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(q.status ? { status: q.status as any } : {}),
      ...(q.departmentId ? { departmentId: q.departmentId } : {}),
      ...(q.from || q.to
        ? { dateOfJoining: { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) } }
        : {}),
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
    const records = await this.prisma.employee.findMany({
      where,
      include: { department: { select: { name: true } }, designation: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: EXPORT_ROW_CAP,
    });
    const columns: ReportColumn[] = [
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'fullName', label: 'Name' },
      { key: 'workEmail', label: 'Work Email' },
      { key: 'department', label: 'Department' },
      { key: 'designation', label: 'Designation' },
      { key: 'employmentType', label: 'Employment Type' },
      { key: 'status', label: 'Status' },
      { key: 'dateOfJoining', label: 'Date of Joining' },
    ];
    const rows = records.map((e) => ({
      employeeCode: e.employeeCode,
      fullName: `${e.firstName} ${e.lastName}`,
      workEmail: e.workEmail ?? '',
      department: e.department?.name ?? '',
      designation: e.designation?.title ?? '',
      employmentType: e.employmentType,
      status: e.status,
      dateOfJoining: e.dateOfJoining ? e.dateOfJoining.toISOString().slice(0, 10) : '',
    }));
    return { columns, rows };
  }

  private async attendanceDataset(orgId: string, q: RunReportQueryDto) {
    const where: Prisma.AttendanceDayWhereInput = {
      organizationId: orgId,
      ...(q.status ? { status: q.status as any } : {}),
      ...(q.employeeId ? { employeeId: q.employeeId } : {}),
      ...(q.departmentId ? { employee: { departmentId: q.departmentId } } : {}),
      ...(q.from || q.to
        ? { workDate: { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) } }
        : {}),
    };
    const records = await this.prisma.attendanceDay.findMany({
      where,
      include: { employee: { select: { employeeCode: true, firstName: true, lastName: true } } },
      orderBy: { workDate: 'desc' },
      take: EXPORT_ROW_CAP,
    });
    const columns: ReportColumn[] = [
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'employeeName', label: 'Employee' },
      { key: 'workDate', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'workedMinutes', label: 'Worked Minutes' },
      { key: 'lateMinutes', label: 'Late Minutes' },
      { key: 'overtimeMinutes', label: 'Overtime Minutes' },
    ];
    const rows = records.map((a) => ({
      employeeCode: a.employee?.employeeCode ?? '',
      employeeName: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : '',
      workDate: a.workDate.toISOString().slice(0, 10),
      status: a.status,
      workedMinutes: a.workedMinutes,
      lateMinutes: a.lateMinutes,
      overtimeMinutes: a.overtimeMinutes,
    }));
    return { columns, rows };
  }

  private async leaveDataset(orgId: string, q: RunReportQueryDto) {
    const where: Prisma.LeaveRequestWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(q.status ? { status: q.status as any } : {}),
      ...(q.employeeId ? { employeeId: q.employeeId } : {}),
      ...(q.leaveTypeId ? { leaveTypeId: q.leaveTypeId } : {}),
      ...(q.departmentId ? { employee: { departmentId: q.departmentId } } : {}),
      ...(q.from || q.to
        ? { startDate: { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) } }
        : {}),
    };
    const records = await this.prisma.leaveRequest.findMany({
      where,
      include: {
        employee: { select: { employeeCode: true, firstName: true, lastName: true } },
        leaveType: { select: { name: true } },
      },
      orderBy: { startDate: 'desc' },
      take: EXPORT_ROW_CAP,
    });
    const columns: ReportColumn[] = [
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'employeeName', label: 'Employee' },
      { key: 'leaveType', label: 'Leave Type' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'days', label: 'Days' },
      { key: 'status', label: 'Status' },
    ];
    const rows = records.map((l) => ({
      employeeCode: l.employee?.employeeCode ?? '',
      employeeName: l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : '',
      leaveType: l.leaveType?.name ?? '',
      startDate: l.startDate.toISOString().slice(0, 10),
      endDate: l.endDate.toISOString().slice(0, 10),
      days: l.days.toString(),
      status: l.status,
    }));
    return { columns, rows };
  }
}
