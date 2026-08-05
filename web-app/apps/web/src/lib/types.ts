/** Domain types — mirror the API/DB contract so real endpoints drop in unchanged. */

export type ID = string;

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, string | undefined>;
}

export type EmployeeStatus = 'probation' | 'active' | 'on_leave' | 'suspended' | 'resigned' | 'terminated';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';

export interface Employee {
  id: ID;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  workEmail: string;
  phone: string;
  avatarUrl?: string;
  /** Profile photo: an uploaded file id, fetched through the authenticated API. */
  photoFileId?: ID | null;
  gender?: 'male' | 'female' | 'other';
  departmentId: ID;
  departmentName: string;
  designationId: ID;
  designationName: string;
  locationId?: ID | null;
  locationName: string;
  managerId?: ID;
  managerName?: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  dateOfJoining: string;
  compensationType?: 'monthly' | 'hourly';
  basicSalary?: number | null;
  payPerHour?: number | null;
  customFields: Record<string, unknown>;
  // linked login account (every employee has one from day one)
  userId?: ID | null;
  accountEmail?: string | null;
  accountStatus?: UserStatus | null;
  accountRoles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: ID;
  name: string;
  code: string;
  parentId?: ID;
  parentName?: string;
  headEmployeeId?: ID;
  headName?: string;
  memberCount: number;
  costCenter?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Designation {
  id: ID;
  title: string;
  level: number | null;
  description?: string | null;
  employeeCount: number;
}

export interface Permission {
  id: ID;
  key: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: ID;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  canAccessWeb: boolean;
  canAccessMobile: boolean;
  userCount: number;
  permissions: string[]; // permission keys
}

export type ReportPeriodType = 'weekly' | 'monthly' | 'quarterly';
export type ReportStatus = 'submitted' | 'reviewed' | 'acknowledged';
export interface FileAttachment {
  id: ID;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}
export interface WorkReport {
  id: ID;
  title: string;
  periodType: ReportPeriodType;
  periodStart: string;
  periodEnd: string;
  periodLabel?: string | null;
  summary: string;
  status: ReportStatus;
  departmentName?: string | null;
  submitterName: string;
  submitterView: string; // admin | hr | dept_head | employee
  submittedAt: string;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  signedInAt: string;
  lastActiveAt: string;
  expiresAt: string;
  current: boolean;
}

export type UserStatus = 'invited' | 'active' | 'suspended' | 'disabled';
export interface UserAccount {
  id: ID;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  status: UserStatus;
  isSuperAdmin: boolean;
  roles: { id: ID; name: string; slug: string }[];
  lastLoginAt: string | null;
  createdAt: string;
}

export type CustomFieldType =
  | 'text' | 'textarea' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime'
  | 'email' | 'phone' | 'url' | 'select' | 'multiselect' | 'file' | 'json';

export type CustomFieldEntity = 'employee' | 'department' | 'task' | 'asset' | 'document';

export interface CustomFieldOption {
  value: string;
  label: string;
}

export interface CustomFieldDefinition {
  id: ID;
  entity: CustomFieldEntity;
  fieldKey: string;
  label: string;
  dataType: CustomFieldType;
  helpText?: string;
  placeholder?: string;
  isRequired: boolean;
  isUnique: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  regexPattern?: string;
  options?: CustomFieldOption[];
  displayOrder: number;
  isVisible: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isEncrypted: boolean;
  isSystem: boolean;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'wfh' | 'holiday';

export interface AttendanceRecord {
  id: ID;
  employeeId: ID;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  avatarUrl?: string;
  /** Work site the day's first check-in resolved to — branch or client premises. */
  siteName?: string | null;
  workDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  checkInMethod?: string;
  status: AttendanceStatus;
  workedMinutes?: number;
  overtimeMinutes: number;
  isFlagged: boolean;
  flagReason?: string | null;
  faceMatchScore?: number;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: ID;
  employeeId: ID;
  employeeName: string;
  avatarUrl?: string;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: ID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  departmentName: string;
  assignees: { id: ID; name: string; avatarUrl?: string }[];
  dueDate?: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: ID;
  employeeId: ID;
  employeeName: string;
  avatarUrl?: string;
  departmentName: string;
  cycle: string;
  reviewerName: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'acknowledged' | 'closed';
  overallScore?: number;
  summary?: string | null;
  updatedAt: string;
}

export interface Goal {
  id: ID;
  title: string;
  ownerName: string;
  metric: string;
  target: number;
  current: number;
  status: 'not_started' | 'on_track' | 'at_risk' | 'off_track' | 'completed';
  dueDate: string;
}

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'whatsapp';

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  channel: NotificationChannel;
  category: 'leave' | 'attendance' | 'task' | 'system' | 'payroll';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: ID;
  actorName: string;
  actorAvatar?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'approve' | 'reject';
  entityType: string;
  entityLabel: string;
  ipAddress: string;
  createdAt: string;
}

export interface ActivityItem {
  id: ID;
  actorName: string;
  actorAvatar?: string;
  verb: string;
  target: string;
  createdAt: string;
  category: 'employee' | 'leave' | 'task' | 'attendance' | 'system';
}

export interface CurrentUser {
  id: ID;
  fullName: string;
  email: string;
  avatarUrl?: string;
  roleName: string;
  permissions: string[];
}

export interface DashboardStats {
  headcount: { value: number; delta: number };
  presentToday: { value: number; total: number };
  onLeave: { value: number; delta: number };
  openTasks: { value: number; delta: number };
  attritionRate: { value: number; delta: number };
  pendingApprovals: number;
  attendanceTrend: { date: string; present: number; absent: number; late: number }[];
  departmentHeadcount: { department: string; count: number }[];
  taskStatus: { status: string; count: number }[];
  productivity: { week: string; completed: number; assigned: number }[];
  genderSplit: { label: string; value: number }[];
}
