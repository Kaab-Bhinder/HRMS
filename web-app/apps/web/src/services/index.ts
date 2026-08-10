/**
 * Service layer — wired to the live NestJS API. Each function calls the backend
 * and returns the exact shape the pages expect, so the UI is unchanged.
 * `rolesService` stays on mock data (no roles-management backend yet).
 */
import { api, qs, downloadFile } from './client';
import type {
  ID,ListParams, Paginated, Employee, Department, Designation, Role, Permission, UserAccount, SessionInfo,
  CustomFieldDefinition, AttendanceRecord, LeaveRequest, Task, PerformanceReview, Goal,
  AppNotification, AuditLog, ActivityItem, CurrentUser, DashboardStats, WorkReport, FileAttachment, TravelRequest, TravelStats,
} from '../lib/types';

// pick only defined keys (so we never send disallowed/undefined fields to DTOs)
function pick<T extends Record<string, any>>(obj: T, keys: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k];
  return out;
}

const EMP_FIELDS = ['firstName', 'lastName', 'employeeCode', 'workEmail', 'personalEmail', 'phone', 'gender', 'photoFileId', 'departmentId', 'designationId', 'locationId', 'managerId', 'employmentType', 'status', 'dateOfJoining', 'compensationType', 'basicSalary', 'payPerHour', 'customFields'];
// account fields are only meaningful on create (a linked login is provisioned then)
const EMP_CREATE_FIELDS = [...EMP_FIELDS, 'createAccount', 'accountRoleId', 'accountPasswordStrategy'];
const DEPT_FIELDS = ['name', 'code', 'description', 'parentId', 'headEmployeeId', 'costCenter', 'isActive'];
const CF_FIELDS = ['entity', 'fieldKey', 'label', 'dataType', 'helpText', 'placeholder', 'isRequired', 'isUnique', 'isVisible', 'isSearchable', 'isFilterable', 'isEncrypted', 'minValue', 'maxValue', 'minLength', 'maxLength', 'regexPattern', 'displayOrder', 'options'];

export const authService = {
  me: () => api.get<CurrentUser>('/auth/me'),
  /** Change your own password. The current one is required — holding a valid
   *  access token alone must not be enough to take an account over. */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ success: boolean; otherSessionsSignedOut: number }>(
      '/auth/change-password',
      { currentPassword, newPassword },
    ),
};

export interface MeScope {
  view: 'admin' | 'hr' | 'dept_head' | 'employee';
  employeeId: string | null;
  headsDepartments: { id: string; name: string }[];
}
export const accessService = {
  scope: () => api.get<MeScope>('/me/scope'),
};

// --- Attendance settings / slips / live / payroll ---
type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

/** What an out-of-site check-in costs. One setting, three levels. */
export type OffSitePolicy = 'allowed' | 'flag' | 'absent';

export interface AttendanceSettings {
  timezone: string;
  officeHours: { startTime: string; endTime: string; graceMinutes: number; breakMinutes: number };
  policy: { lateAfterMinutes: number; halfDayMinutes: number; offSiteCheckIn: OffSitePolicy; checkInScope: 'any_site' | 'assigned_only'; absentOnFaceMismatch: boolean; weeklyOffDays: number[]; trackingIntervalSec: number };
  office: { id: string; name: string; address: string | null; latitude: number | null; longitude: number | null; radiusMeters: number };
  leave: { annualLeaveDays: number };
}
export type AttendanceSettingsInput = AttendanceSettings;

export interface AttendanceSlipDay {
  id: string;
  workDate: string; status: string; firstInAt: string | null; lastOutAt: string | null;
  workedMinutes: number; lateMinutes: number; breakMinutes: number; overtimeMinutes: number;
  isFlagged: boolean; flagReason: string | null; selfieCaptureId: string | null;
}
/** A work site with its effective attendance settings — inherited or custom. */
export interface SiteSettings {
  locationId: string;
  name: string;
  address: string | null;
  clientName: string | null;
  isActive: boolean;
  hasGeofence: boolean;
  radiusMeters: number | null;
  hasOverride: boolean;
  effective: {
    officeHours: { startTime: string; endTime: string; graceMinutes: number; breakMinutes: number };
    policy: { lateAfterMinutes: number; halfDayMinutes: number; offSiteCheckIn: OffSitePolicy; absentOnFaceMismatch: boolean; weeklyOffDays: number[] };
  };
}

/** One row per employee: their month's attendance scorecard. */
export interface AttendanceEmployeeSummaryRow {
  employeeId: string; employeeName: string; employeeCode: string;
  departmentName: string | null; siteName: string | null;
  presentDays: number; lateDays: number; absentDays: number; onLeaveDays: number;
  flaggedDays: number; workedHours: number; lateMinutes: number;
}
export interface AttendanceSlip {
  employee: { id: string; name: string; employeeCode: string; departmentName: string | null; designationName: string | null; payPerHour: number | null };
  from: string; to: string;
  totals: { workedMinutes: number; lateMinutes: number; breakMinutes: number; overtimeMinutes: number; present: number; late: number; absent: number; onLeave: number; flagged: number; workedHours: number };
  days: AttendanceSlipDay[];
}

export interface LiveSession {
  sessionId: string; employeeId: string; employeeName: string; employeeCode: string;
  startedAt: string; lastPingAt: string | null;
  last: { lat: number; lng: number; at: string; battery: number | null } | null;
}

export type CompensationType = 'monthly' | 'hourly';
export interface PayrollRow {
  employeeId: string; employeeName: string; employeeCode: string; departmentName: string | null;
  compensationType: CompensationType;
  payPerHour: number | null; payableHours: number; workedHours: number; lateMinutes: number;
  daysPresent: number; daysAbsent: number; daysFlagged: number; earnedPay: number; potentialPay: number;
  // monthly
  basicSalary: number | null; unpaidLeaveDays: number;
  // unified across both types
  grossPay: number; deductions: number; netPay: number; progressPct: number;
  finalized: boolean; finalizedAt: string | null;
}
export interface PayrollRegister {
  year: number; month: number; currency: string; officeHoursPerDay: number; workingDaysTotal: number; rows: PayrollRow[];
}
export interface FinalizeResult { year: number; month: number; finalized: number; alreadyFinalized: number; total: number }
export interface PayslipDay {
  workDate: string; status: string; workedMinutes: number; payableMinutes: number; lateMinutes: number; isFlagged: boolean; pay: number;
}
export interface Payslip extends PayrollRow {
  year: number; month: number; currency: string; officeHoursPerDay: number; workingDaysTotal: number; designationName: string | null; days: PayslipDay[];
}

export const sessionsService = {
  // self-service (current user)
  list: () => api.get<SessionInfo[]>('/auth/sessions'),
  revoke: (id: string) => api.del<{ success: boolean }>(`/auth/sessions/${id}`),
  revokeOthers: () => api.del<{ success: boolean; revoked: number }>('/auth/sessions/others'),
  // admin (any user in the org)
  listForUser: (userId: string) => api.get<SessionInfo[]>(`/users/${userId}/sessions`),
  revokeAllForUser: (userId: string) => api.del<{ success: boolean; revoked: number }>(`/users/${userId}/sessions`),
};

export type CreatedEmployee = Employee & { generatedPassword?: string | null };
export const employeesService = {
  list: (p?: ListParams) => api.get<Paginated<Employee>>(`/employees${qs(p)}`),
  get: (id: string) => api.get<Employee>(`/employees/${id}`),
  create: (payload: Record<string, unknown>) => api.post<CreatedEmployee>('/employees', pick(payload, EMP_CREATE_FIELDS)),
  update: (id: string, payload: Partial<Employee>) => api.patch<Employee>(`/employees/${id}`, pick(payload, EMP_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/employees/${id}`),
};

// creation carries a compulsory `head` (existing employee id or an inline new employee)
const DEPT_CREATE_FIELDS = ['name', 'code', 'description', 'parentId', 'costCenter', 'isActive', 'head'];
export type CreatedDepartment = Department & { generatedPassword?: string | null };
export const departmentsService = {
  // backend returns the flat, fully-serialized list; the page builds the tree client-side
  tree: () => api.get<Department[]>('/departments'),
  list: (p?: ListParams) => api.get<Department[]>('/departments').then((rows) => ({ data: rows, meta: { page: 1, limit: rows.length, total: rows.length, totalPages: 1 } })),
  create: (payload: Record<string, unknown>) => api.post<CreatedDepartment>('/departments', pick(payload, DEPT_CREATE_FIELDS)),
  update: (id: string, payload: Partial<Department>) => api.patch<Department>(`/departments/${id}`, pick(payload, DEPT_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/departments/${id}`),
};

const DESIG_FIELDS = ['title', 'level', 'description'];
export const designationsService = {
  list: () => api.get<Designation[]>('/designations'),
  create: (payload: Partial<Designation>) => api.post<Designation>('/designations', pick(payload, DESIG_FIELDS)),
  update: (id: string, payload: Partial<Designation>) => api.patch<Designation>(`/designations/${id}`, pick(payload, DESIG_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/designations/${id}`),
};

export const customFieldsService = {
  list: (entity = 'employee') => api.get<CustomFieldDefinition[]>(`/custom-fields?entity=${entity}`),
  create: (payload: Partial<CustomFieldDefinition>) => api.post<CustomFieldDefinition>('/custom-fields', pick(payload, CF_FIELDS)),
  update: (id: string, payload: Partial<CustomFieldDefinition>) => api.patch<CustomFieldDefinition>(`/custom-fields/${id}`, pick(payload, CF_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/custom-fields/${id}`),
};

export const attendanceService = {
  list: (p?: ListParams) =>
    api.get<Paginated<any>>(`/attendance${qs(p)}`).then((res) => ({
      ...res,
      data: res.data.map((r): AttendanceRecord => ({
        id: r.id, employeeId: r.employeeId, employeeName: r.employeeName, employeeCode: r.employeeCode,
        departmentName: r.departmentName, siteName: r.siteName ?? null, workDate: r.workDate,
        checkInAt: r.firstInAt, checkOutAt: r.lastOutAt, checkInMethod: r.primaryMethod,
        status: r.status, workedMinutes: r.workedMinutes, overtimeMinutes: r.overtimeMinutes,
        isFlagged: r.isFlagged, flagReason: r.flagReason ?? null, faceMatchScore: undefined,
      })),
    })),
  summary: () =>
    api.get<Record<string, number>>('/attendance/summary').then((s) => ({
      present: s.present ?? 0, late: s.late ?? 0, absent: s.absent ?? 0,
      wfh: s.wfh ?? 0, onLeave: s.on_leave ?? 0, flagged: s.flagged ?? 0,
    })),
  settings: () => api.get<AttendanceSettings>('/attendance/settings'),
  /**
   * Saves attendance settings.
   *
   * The GET returns fields the PUT does not accept — notably `office.id`, and
   * the read-only totals the API derives. The API validates with
   * `forbidNonWhitelisted`, so posting the fetched object back verbatim fails
   * the WHOLE request with "office.property id should not exist", blocking every
   * field on the page including the timezone. So the payload is rebuilt here
   * from the fields the API actually accepts, rather than echoing what we were
   * given.
   */
  updateSettings: (dto: DeepPartial<AttendanceSettingsInput>) =>
    api.put<AttendanceSettings>('/attendance/settings', {
      ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      ...(dto.officeHours
        ? { officeHours: pick(dto.officeHours, ['startTime', 'endTime', 'graceMinutes', 'breakMinutes']) }
        : {}),
      ...(dto.policy
        ? {
            policy: pick(dto.policy, [
              'lateAfterMinutes', 'halfDayMinutes', 'enforceGeofence',
              'offSiteCheckIn', 'checkInScope', 'absentOnFaceMismatch',
              'weeklyOffDays', 'trackingIntervalSec',
            ]),
          }
        : {}),
      ...(dto.office
        ? { office: pick(dto.office, ['name', 'address', 'latitude', 'longitude', 'radiusMeters']) }
        : {}),
      ...(dto.leave ? { leave: pick(dto.leave, ['annualLeaveDays']) } : {}),
    }),
  slip: (employeeId: string, from: string, to: string) =>
    api.get<AttendanceSlip>(`/attendance/slip?employeeId=${employeeId}&from=${from}&to=${to}`),
  siteSettings: () => api.get<SiteSettings[]>('/attendance/settings/sites'),
  upsertSiteSettings: (locationId: string, payload: { officeHours?: Partial<SiteSettings['effective']['officeHours']>; policy?: Partial<SiteSettings['effective']['policy']> }) =>
    api.put<SiteSettings[]>(`/attendance/settings/sites/${locationId}`, payload),
  removeSiteSettings: (locationId: string) => api.del<SiteSettings[]>(`/attendance/settings/sites/${locationId}`),
  trend: (p: { days: number; departmentId?: string }) => {
    const qp = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();
    return api.get<{ date: string; present: number; absent: number; late: number }[]>(`/attendance/trend?${qp}`);
  },
  employeeSummary: (p: { year: number; month: number; departmentId?: string; search?: string }) => {
    const qp = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();
    return api.get<{ year: number; month: number; rows: AttendanceEmployeeSummaryRow[] }>(`/attendance/employee-summary?${qp}`);
  },
  live: () => api.get<LiveSession[]>('/attendance/live'),
  map: () => api.get<OfficeMap>('/attendance/map'),
  resolveFlag: (dayId: string, note?: string) => api.post<{ success: boolean }>(`/attendance/days/${dayId}/resolve-flag`, { note }),
};

export interface MapEmployee { id: string; name: string; employeeCode: string; departmentName: string | null; lat: number; lng: number; since: string }
export interface MapSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  isDefault: boolean;
  /** Set when this site is a client's premises rather than an own branch. */
  clientName?: string | null;
}
export interface OfficeMap {
  /** Every mapped work site — branches and client premises. */
  sites: MapSite[];
  /** The default site. Kept for older callers; prefer `sites`. */
  office: MapSite | null;
  count: number;
  employees: MapEmployee[];
}

export const payrollService = {
  register: (year: number, month: number) => api.get<PayrollRegister>(`/payroll/register?year=${year}&month=${month}`),
  payslip: (employeeId: string, year: number, month: number) =>
    api.get<Payslip>(`/payroll/payslip?employeeId=${employeeId}&year=${year}&month=${month}`),
  finalize: (year: number, month: number) => api.post<FinalizeResult>('/payroll/finalize', { year, month }),
};

/** Report Builder export. Backend supports these dataset modules; the catalog's
 *  Payroll/Performance cards don't have a data source yet. */
export const REPORT_BACKEND_MODULES: Record<string, string> = {
  Attendance: 'attendance',
  Employees: 'employees',
  Leave: 'leave',
};
export interface SavedReport {
  id: string;
  name: string;
  module: string;
  definition: Record<string, unknown>;
  scheduleCron?: string | null;
  recipients?: string[] | null;
  createdAt: string;
}

const SAVED_REPORT_FIELDS = ['name', 'module', 'definition', 'scheduleCron', 'recipients'];

export interface AssistantAnswer {
  reply: string;
  /** Which vendor answered — surfaced so a failover is visible, not silent. */
  provider: string;
  /** Tool names the assistant actually ran to answer. */
  toolsUsed: string[];
}
export const accountService = {
  /** HR sends or resends an invitation; `email` targets a personal address. */
  invite: (userId: string, email?: string) =>
    api.post<{ sentTo: string; expiresInHours: number; link: string }>('/auth/invite', { userId, email }),
  /** Public — names the account a link belongs to before asking for a password. */
  inspectInvite: (token: string) =>
    api.get<{ email: string; fullName: string; purpose: string }>(`/auth/invite/${token}`),
  setPassword: (token: string, password: string) =>
    api.post<{ success: boolean }>('/auth/set-password', { token, password }),
};

export const workEmailService = {
  /** A free work address built from a name, plus the domain it used. */
  suggest: (firstName: string, lastName: string) =>
    api.get<{ email: string | null; domain: string | null; available: boolean }>(
      `/employees/suggest-email?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`,
    ),
  check: (email: string, employeeId?: string) =>
    api.get<{ available: boolean }>(
      `/employees/check-email?email=${encodeURIComponent(email)}${employeeId ? `&employeeId=${employeeId}` : ''}`,
    ),
};

export const travelService = {
  list: (p?: ListParams & { status?: string; employeeId?: string }) =>
    api.get<Paginated<TravelRequest>>(`/travel${qs(p as ListParams)}`),
  get: (id: string) => api.get<TravelRequest>(`/travel/${id}`),
  stats: () => api.get<TravelStats>('/travel/stats'),

  create: (payload: Record<string, unknown>) => api.post<TravelRequest>('/travel', payload),
  submit: (id: string) => api.post<TravelRequest>(`/travel/${id}/submit`, {}),
  cancel: (id: string) => api.post<TravelRequest>(`/travel/${id}/cancel`, {}),

  approve: (id: string, stepId: string, comment?: string) =>
    api.post<TravelRequest>(`/travel/${id}/approve`, { stepId, comment }),
  reject: (id: string, stepId: string, comment?: string) =>
    api.post<TravelRequest>(`/travel/${id}/reject`, { stepId, comment }),

  setAdvance: (id: string, payload: Record<string, unknown>) =>
    api.patch<TravelRequest>(`/travel/${id}/advance`, payload),
  payAdvance: (id: string, payload: Record<string, unknown>) =>
    api.post<TravelRequest>(`/travel/${id}/advance/pay`, payload),

  submitRealization: (id: string, payload: Record<string, unknown>) =>
    api.post<TravelRequest>(`/travel/${id}/realization`, payload),
  addEvidence: (id: string, fileId: string, caption?: string) =>
    api.post<TravelRequest>(`/travel/${id}/evidence`, { fileId, caption }),
  removeEvidence: (id: string, evidenceId: string) =>
    api.del<TravelRequest>(`/travel/${id}/evidence/${evidenceId}`),

  verify: (id: string, payload: Record<string, unknown>) =>
    api.post<TravelRequest>(`/travel/${id}/verify`, payload),
  settle: (id: string, payload: Record<string, unknown>) =>
    api.post<TravelRequest>(`/travel/${id}/settle`, payload),
};

export interface TravelRule {
  id: ID;
  name: string;
  minLevel: number;
  maxLevel: number;
  steps: ('supervisor' | 'department_head' | 'finance')[];
  isActive: boolean;
}

export const travelRulesService = {
  list: () => api.get<TravelRule[]>('/travel/rules'),
  create: (payload: Partial<TravelRule>) => api.post<TravelRule>('/travel/rules', payload),
  update: (id: string, payload: Partial<TravelRule>) => api.patch<TravelRule>(`/travel/rules/${id}`, payload),
  remove: (id: string) => api.del<{ success: boolean }>(`/travel/rules/${id}`),
  preview: (employeeId: string) =>
    api.get<{ steps: { name: string; role: string }[] }>(`/travel/rules/preview/${employeeId}`),
};

export const assistantService = {
  /** Whether any provider is configured — the widget hides itself if not. */
  status: () => api.get<{ available: boolean }>('/assistant/status'),
  ask: (question: string, history: { role: 'user' | 'assistant'; content: string }[]) =>
    api.post<AssistantAnswer>('/assistant/chat', { question, history }),
};

export type ReportParam = 'date' | 'month' | 'range' | 'department' | 'status';
export interface CatalogReport {
  key: string;
  title: string;
  description: string;
  module: string;
  params: ReportParam[];
}

export const reportsService = {
  /** Saved report definitions. Note: no scheduler runs these yet — a stored
   *  scheduleCron is a preference, not an active job. */
  listSaved: (p?: ListParams) => api.get<Paginated<SavedReport>>(`/reports${qs(p)}`),
  createSaved: (payload: Partial<SavedReport>) =>
    api.post<SavedReport>('/reports', pick(payload, SAVED_REPORT_FIELDS)),
  updateSaved: (id: string, payload: Partial<SavedReport>) =>
    api.patch<SavedReport>(`/reports/${id}`, pick(payload, SAVED_REPORT_FIELDS)),
  removeSaved: (id: string) => api.del<{ success: boolean }>(`/reports/${id}`),

  /** The server's report catalogue — titles, modules, and the parameters each
   *  report needs. The page renders this instead of a hardcoded list. */
  catalog: () => api.get<CatalogReport[]>('/reports/catalog'),

  /** Runs one catalogue report with its parameters and downloads the file. */
  run: (reportKey: string, format: string, params: Record<string, string> = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
    const qp = new URLSearchParams({ module: 'employees', report: reportKey, format, ...clean }).toString();
    return downloadFile(`/reports/export?${qp}`, `${reportKey}.${format}`);
  },
};

export interface Holiday { id: string; name: string; date: string; isOptional: boolean }
export const holidaysService = {
  list: () => api.get<Holiday[]>('/holidays'),
  create: (payload: { name: string; date: string; isOptional?: boolean }) => api.post<Holiday>('/holidays', payload),
  remove: (id: string) => api.del<unknown>(`/holidays/${id}`),
};

export interface LeaveType { id: string; name: string; accrualPerYear?: number | null; }
export const leaveService = {
  types: () => api.get<LeaveType[]>('/leave/types'),
  list: (p?: ListParams) =>
    api.get<Paginated<any>>(`/leave/requests${qs(p)}`).then((res) => ({
      ...res,
      data: res.data.map((r): LeaveRequest => ({ ...r, days: Number(r.days) })),
    })),
  act: (id: string, action: 'approve' | 'reject') => api.post<unknown>(`/leave/requests/${id}/${action}`, {}),
};

const TASK_FIELDS = ['title', 'description', 'departmentId', 'priority', 'status', 'dueDate', 'startDate', 'estimatedHours'];
export const tasksService = {
  list: (p?: ListParams) => api.get<Paginated<Task>>(`/tasks${qs(p)}`),
  board: () => api.get<Task[]>('/tasks/board'),
  create: (payload: Record<string, unknown>) => api.post<Task>('/tasks', pick(payload, TASK_FIELDS)),
  assign: (id: string, employeeId: string) => api.post<unknown>(`/tasks/${id}/assign`, { employeeId }),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  comments: (id: string) => api.get<TaskComment[]>(`/tasks/${id}/comments`),
  addComment: (id: string, body: string) => api.post<TaskComment>(`/tasks/${id}/comments`, { body }),
  updateStatus: (id: string, status: string, progress?: number) =>
    api.patch<Task>(`/tasks/${id}/status`, { status, ...(progress != null ? { progress } : {}) }),
  /** An assignee reporting back. markComplete moves the task to in_review —
   *  the head confirms completion, the assignee does not close their own task. */
  submit: (id: string, note: string, markComplete: boolean) =>
    api.post<{ taskId: string; status: string; attachments: number }>(`/tasks/${id}/submit`, { note, markComplete }),
};

export interface TaskComment {
  id: string;
  taskId: string;
  authorEmployeeId?: string | null;
  authorName?: string | null;
  body: string;
  createdAt: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
export const performanceService = {
  reviews: (p?: ListParams) => api.get<Paginated<PerformanceReview>>(`/performance/reviews${qs(p)}`),
  goals: () => api.get<Goal[]>('/performance/goals'),
  cycles: () => api.get<ReviewCycle[]>('/performance/cycles'),
  createCycle: (payload: { name: string; startDate: string; endDate: string; isActive?: boolean }) =>
    api.post<ReviewCycle>('/performance/cycles', payload),
  createReview: (payload: { employeeId: string; cycleId?: string; overallScore: number; summary?: string; status?: string }) =>
    api.post<PerformanceReview>('/performance/reviews', payload),
  updateReview: (id: string, payload: { overallScore?: number; summary?: string; status?: string }) =>
    api.patch<PerformanceReview>(`/performance/reviews/${id}`, payload),
  getReview: (id: string) => api.get<PerformanceReview>(`/performance/reviews/${id}`),
};

export const notificationsService = {
  list: () => api.get<{ data: AppNotification[] }>('/notifications?limit=30').then((r) => (r as any).data as AppNotification[]),
  markRead: (id: string) => api.patch<{ success: boolean }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ success: boolean }>('/notifications/read-all'),
};

export const auditService = {
  list: (p?: ListParams) => api.get<Paginated<AuditLog>>(`/audit/logs${qs(p)}`),
};

const REPORT_FIELDS = ['title', 'periodType', 'periodStart', 'periodEnd', 'periodLabel', 'summary'];
export const reportingService = {
  list: (p?: ListParams) => api.get<Paginated<WorkReport>>(`/reporting${qs(p)}`),
  get: (id: string) => api.get<WorkReport>(`/reporting/${id}`),
  create: (payload: Record<string, unknown>) => api.post<WorkReport>('/reporting', pick(payload, REPORT_FIELDS)),
  review: (id: string, status: 'reviewed' | 'acknowledged', note?: string) => api.post<WorkReport>(`/reporting/${id}/review`, { status, note }),
};

export const filesService = {
  listByOwner: (ownerType: string, ownerId: string) => api.get<FileAttachment[]>(`/files?ownerType=${ownerType}&ownerId=${ownerId}`),
  upload: (ownerType: string, ownerId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('ownerType', ownerType);
    form.append('ownerId', ownerId);
    return api.upload<FileAttachment>('/files/upload', form);
  },
  download: (att: FileAttachment) => downloadFile(`/files/${att.id}/download`, att.fileName),
};

const ACTIVITY_CATEGORY: Record<string, ActivityItem['category']> = {
  employees: 'employee', leave: 'leave', tasks: 'task', attendance: 'attendance',
};
export interface DeptAttendance { departmentId: string; department: string; headcount: number; presentToday: number; presentPercent: number }
export const analyticsService = {
  overview: () => api.get<DashboardStats>('/analytics/overview'),
  departments: () => api.get<DeptAttendance[]>('/analytics/departments'),
  activity: () =>
    api.get<Paginated<any>>('/audit/logs?limit=8').then((res) =>
      res.data.map((r): ActivityItem => ({
        id: r.id, actorName: r.actorName, verb: `${r.action}d`, target: r.entityType,
        createdAt: r.createdAt, category: ACTIVITY_CATEGORY[r.entityType] ?? 'system',
      })),
    ),
};

const USER_CREATE_FIELDS = ['email', 'fullName', 'roleIds', 'password', 'status'];
const USER_UPDATE_FIELDS = ['fullName', 'roleIds', 'status'];
export const usersService = {
  list: (p?: ListParams) => api.get<Paginated<UserAccount>>(`/users${qs(p)}`),
  get: (id: string) => api.get<UserAccount>(`/users/${id}`),
  create: (payload: Record<string, unknown>) => api.post<UserAccount>('/users', pick(payload, USER_CREATE_FIELDS)),
  update: (id: string, payload: Record<string, unknown>) => api.patch<UserAccount>(`/users/${id}`, pick(payload, USER_UPDATE_FIELDS)),
  resetPassword: (id: string, password: string) => api.post<{ success: boolean }>(`/users/${id}/reset-password`, { password }),
  remove: (id: string) => api.del<{ success: boolean }>(`/users/${id}`),
};

const ROLE_FIELDS = ['name', 'description', 'permissions', 'canAccessWeb', 'canAccessMobile'];
export const rolesService = {
  list: () => api.get<Role[]>('/roles'),
  permissions: () => api.get<Permission[]>('/permissions'),
  create: (payload: Partial<Role>) => api.post<Role>('/roles', pick(payload, ROLE_FIELDS)),
  update: (id: string, payload: Partial<Role>) => api.patch<Role>(`/roles/${id}`, pick(payload, ROLE_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/roles/${id}`),
};

/**
 * Organization profile and office locations.
 *
 * `registrationNo` and `fiscalYearStart` have no column on the organization
 * table, so they live under `settings` — a JSON blob the API stores verbatim.
 * Callers pass them as flat fields and this service folds them in, so the form
 * doesn't have to know where each value ends up.
 */
// --- Clients (companies served by a department; records only, no logins) ---
export type ClientStatus = 'prospect' | 'active' | 'inactive';
export interface Client {
  id: string;
  name: string;
  code: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: ClientStatus;
  notes: string | null;
  departmentId: string | null;
  departmentName: string | null;
  headName: string | null;
  teamSize: number;
  /** The client's premises registered as geofenced work sites. */
  sites: { id: string; name: string; address: string | null; isActive: boolean }[];
  createdAt: string;
}
export interface ClientPerformance {
  client: Client;
  team: {
    departmentId: string;
    departmentName: string | null;
    headName: string | null;
    memberCount: number;
    members: { id: string; name: string; employeeCode: string; designation: string | null; status: string }[];
    attendance: { presentDays: number; lateDays: number; absentDays: number; onLeaveDays: number; recordedDays: number; presentRate: number | null; checkedInNow: number };
    tasks: { open: number; inProgress: number; blocked: number; done: number; overdue: number };
    recentReports: { id: string; title: string; periodLabel: string | null; status: string; submittedAt: string; submitterName: string }[];
  } | null;
}

const CLIENT_FIELDS = ['name', 'code', 'contactPerson', 'contactEmail', 'contactPhone', 'status', 'notes', 'departmentId'];

export const clientsService = {
  list: () => api.get<Client[]>('/clients'),
  performance: (id: string) => api.get<ClientPerformance>(`/clients/${id}/performance`),
  create: (payload: Partial<Client>) => api.post<Client>('/clients', pick(payload, CLIENT_FIELDS)),
  update: (id: string, payload: Partial<Client>) => api.patch<Client>(`/clients/${id}`, pick(payload, CLIENT_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/clients/${id}`),
};

// --- Assets (company property registry + issue/return audit trail) ---
export type AssetStatus = 'available' | 'assigned' | 'in_repair' | 'lost' | 'retired';
export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  vendor: string | null;
  warrantyUntil: string | null;
  status: AssetStatus;
  condition: string | null;
  notes: string | null;
  customFields: Record<string, unknown>;
  assignedToId: string | null;
  assignedToName: string | null;
  assignedToCode: string | null;
  createdAt: string;
}
export interface AssetHistoryEntry {
  id: string;
  employeeName: string;
  employeeCode: string;
  assignedAt: string;
  returnedAt: string | null;
  conditionOut: string | null;
  conditionIn: string | null;
  notes: string | null;
}

const ASSET_FIELDS = ['name', 'assetTag', 'category', 'serialNumber', 'purchaseDate', 'purchaseCost', 'vendor', 'warrantyUntil', 'status', 'condition', 'notes', 'customFields'];

export const assetsService = {
  list: (p?: { status?: string; category?: string; employeeId?: string; search?: string }) => {
    const qp = new URLSearchParams(Object.entries(p ?? {}).filter(([, v]) => v) as [string, string][]).toString();
    return api.get<Asset[]>(`/assets${qp ? `?${qp}` : ''}`);
  },
  mine: () => api.get<Asset[]>('/assets/mine'),
  history: (id: string) => api.get<AssetHistoryEntry[]>(`/assets/${id}/history`),
  create: (payload: Partial<Asset>) => api.post<Asset>('/assets', pick(payload, ASSET_FIELDS)),
  update: (id: string, payload: Partial<Asset>) => api.patch<Asset>(`/assets/${id}`, pick(payload, ASSET_FIELDS)),
  assign: (id: string, payload: { employeeId: string; condition?: string; notes?: string }) => api.post<Asset>(`/assets/${id}/assign`, payload),
  return: (id: string, payload: { condition?: string; nextStatus?: string; notes?: string }) => api.post<Asset>(`/assets/${id}/return`, payload),
  remove: (id: string) => api.del<{ success: boolean }>(`/assets/${id}`),
};

export interface OrganizationProfile {
  id: string;
  name: string;
  legalName?: string | null;
  timezone?: string | null;
  locale?: string | null;
  currency?: string | null;
  defaultCompensationType?: CompensationType;
  logoUrl?: string | null;
  settings?: Record<string, unknown> | null;
}

const ORG_COLUMN_FIELDS = ['name', 'legalName', 'timezone', 'locale', 'currency', 'defaultCompensationType', 'logoUrl'];
const ORG_SETTING_FIELDS = ['registrationNo', 'fiscalYearStart', 'setupCompleted'];

export const organizationService = {
  current: () => api.get<OrganizationProfile>('/organizations/current'),
  locations: () => api.get<OfficeLocationDto[]>('/organizations/locations'),

  /**
   * Merges into the existing settings rather than replacing them: the API
   * overwrites the whole JSON blob, so sending only our two keys would discard
   * anything else stored there.
   */
  update: (payload: Record<string, any>, existingSettings?: Record<string, unknown> | null) => {
    const settings = { ...(existingSettings ?? {}), ...pick(payload, ORG_SETTING_FIELDS) };
    return api.patch<OrganizationProfile>('/organizations/current', {
      ...pick(payload, ORG_COLUMN_FIELDS),
      settings,
    });
  },
};

export interface OfficeLocationDto {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
  timezone?: string | null;
  isActive?: boolean;
  /** Set when this site is a client's premises; null = the org's own branch. */
  clientId?: string | null;
  clientName?: string | null;
}

const LOCATION_FIELDS = ['name', 'address', 'latitude', 'longitude', 'radiusMeters', 'timezone', 'isActive', 'clientId'];
export const locationsService = {
  list: () => api.get<OfficeLocationDto[]>('/organizations/locations'),
  create: (payload: Partial<OfficeLocationDto>) =>
    api.post<OfficeLocationDto>('/organizations/locations', pick(payload, LOCATION_FIELDS)),
  update: (id: string, payload: Partial<OfficeLocationDto>) =>
    api.patch<OfficeLocationDto>(`/organizations/locations/${id}`, pick(payload, LOCATION_FIELDS)),
  remove: (id: string) => api.del<{ success: boolean }>(`/organizations/locations/${id}`),
};

/**
 * Workspace settings. Each section is one JSON blob keyed by name on the
 * server (SETTING_SECTIONS in the API), so the shapes below are conventions
 * this client and the API agree on rather than columns.
 *
 * Only sections whose behaviour is actually implemented are exposed here.
 * A stored flag that nothing reads is worse than an absent one — it reports a
 * policy is in force when it is not.
 */
export type SettingSection = 'general' | 'notifications' | 'appearance';

export interface GeneralSettings {
  appName?: string;
  language?: string;
  dateFormat?: string;
  firstDay?: string;
}

export interface NotificationSettings {
  [channelOrEvent: string]: boolean | string | undefined;
}

export interface AppearanceSettings {
  density?: 'comfortable' | 'compact';
}

export const settingsService = {
  section: <T = Record<string, unknown>>(section: SettingSection) =>
    api.get<T>(`/settings/${section}`),
  /** PATCH merges server-side, so partial saves never clear sibling keys. */
  save: <T = Record<string, unknown>>(section: SettingSection, value: Record<string, unknown>) =>
    api.patch<T>(`/settings/${section}`, { value }),
};

export interface NotificationChannelStatus {
  channel: string;
  /** False for channels with no provider wired — they accept a send and drop it. */
  ready: boolean;
}

export interface NotificationPreference {
  eventKey: string;
  channel: string;
  isEnabled: boolean;
}

export const notificationPrefsService = {
  channels: () => api.get<NotificationChannelStatus[]>('/notifications/channels'),
  list: () => api.get<NotificationPreference[]>('/notifications/preferences'),
  set: (eventKey: string, channel: string, isEnabled: boolean) =>
    api.patch<NotificationPreference>('/notifications/preferences', { eventKey, channel, isEnabled }),
};
