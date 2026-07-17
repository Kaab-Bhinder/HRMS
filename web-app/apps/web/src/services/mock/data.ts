/**
 * Central in-memory mock dataset. Deterministic (seeded) so the UI is stable
 * across reloads. When the real API lands, delete this file and point the
 * services in ../ at HTTP calls — nothing else changes.
 */
import type {
  Employee, Department, Designation, Role, Permission, CustomFieldDefinition,
  AttendanceRecord, LeaveRequest, Task, PerformanceReview, Goal, AppNotification,
  AuditLog, ActivityItem, CurrentUser, DashboardStats,
} from '../../lib/types';

// --- seeded RNG for reproducibility ---
let seed = 20260709;
function rng() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const int = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();

const FIRST = ['Ayesha', 'Bilal', 'Sara', 'Hamza', 'Fatima', 'Usman', 'Zara', 'Ahmed', 'Noor', 'Ali', 'Hina', 'Omar', 'Maria', 'Saad', 'Amna', 'Yusuf', 'Iqra', 'Danish', 'Mehak', 'Faizan', 'Rida', 'Talha', 'Sana', 'Kashif'];
const LAST = ['Khan', 'Malik', 'Sheikh', 'Butt', 'Raza', 'Farooq', 'Hussain', 'Iqbal', 'Javed', 'Nawaz', 'Qureshi', 'Siddiqui', 'Aslam', 'Bhatti', 'Chaudhry'];

export const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Engineering', code: 'ENG', memberCount: 0, costCenter: 'CC-100', isActive: true, createdAt: iso(400), headName: 'Usman Khan', headEmployeeId: '' },
  { id: 'd2', name: 'Human Resources', code: 'HR', memberCount: 0, costCenter: 'CC-200', isActive: true, createdAt: iso(400), headName: 'Ayesha Malik' },
  { id: 'd3', name: 'Finance', code: 'FIN', memberCount: 0, costCenter: 'CC-300', isActive: true, createdAt: iso(400), headName: 'Ahmed Raza' },
  { id: 'd4', name: 'Operations', code: 'OPS', memberCount: 0, costCenter: 'CC-400', isActive: true, createdAt: iso(380) },
  { id: 'd5', name: 'Sales', code: 'SAL', memberCount: 0, costCenter: 'CC-500', isActive: true, createdAt: iso(360) },
  { id: 'd6', name: 'Customer Support', code: 'CS', memberCount: 0, parentId: 'd4', parentName: 'Operations', isActive: true, createdAt: iso(300) },
  { id: 'd7', name: 'Marketing', code: 'MKT', memberCount: 0, costCenter: 'CC-600', isActive: true, createdAt: iso(280) },
  { id: 'd8', name: 'IT & Security', code: 'IT', memberCount: 0, parentId: 'd1', parentName: 'Engineering', isActive: true, createdAt: iso(250) },
];

export const DESIGNATIONS: Designation[] = [
  { id: 'g1', title: 'Software Engineer', level: 3, employeeCount: 0 },
  { id: 'g2', title: 'Senior Engineer', level: 4, employeeCount: 0 },
  { id: 'g3', title: 'Team Lead', level: 5, employeeCount: 0 },
  { id: 'g4', title: 'HR Executive', level: 3, employeeCount: 0 },
  { id: 'g5', title: 'Accountant', level: 3, employeeCount: 0 },
  { id: 'g6', title: 'Operations Manager', level: 5, employeeCount: 0 },
  { id: 'g7', title: 'Sales Associate', level: 2, employeeCount: 0 },
  { id: 'g8', title: 'Support Agent', level: 2, employeeCount: 0 },
];

const STATUSES: Employee['status'][] = ['active', 'active', 'active', 'active', 'probation', 'on_leave', 'suspended'];
const EMP_TYPES: Employee['employmentType'][] = ['full_time', 'full_time', 'full_time', 'contract', 'part_time', 'intern'];
const BLOOD = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-'];
const SHIRTS = ['S', 'M', 'L', 'XL', 'XXL'];

export const EMPLOYEES: Employee[] = Array.from({ length: 64 }).map((_, i) => {
  const first = pick(FIRST);
  const last = pick(LAST);
  const dept = pick(DEPARTMENTS);
  const desig = pick(DESIGNATIONS);
  const status = pick(STATUSES);
  return {
    id: `e${i + 1}`,
    employeeCode: `EMP-${String(1001 + i)}`,
    firstName: first,
    lastName: last,
    fullName: `${first} ${last}`,
    workEmail: `${first.toLowerCase()}.${last.toLowerCase()}@acmebank.com`,
    phone: `+92 3${int(0, 4)}${int(0, 9)}-${int(1000000, 9999999)}`,
    gender: rng() > 0.5 ? 'male' : 'female',
    departmentId: dept.id,
    departmentName: dept.name,
    designationId: desig.id,
    designationName: desig.title,
    locationName: pick(['HQ Karachi', 'Lahore Office', 'Islamabad Office']),
    managerName: `${pick(FIRST)} ${pick(LAST)}`,
    employmentType: pick(EMP_TYPES),
    status,
    dateOfJoining: iso(int(30, 1500)),
    customFields: {
      blood_group: pick(BLOOD),
      uniform_size: pick(SHIRTS),
      passport_number: rng() > 0.4 ? `AB${int(1000000, 9999999)}` : '',
      linkedin: rng() > 0.5 ? `linkedin.com/in/${first.toLowerCase()}${last.toLowerCase()}` : '',
    },
    createdAt: iso(int(30, 1500)),
    updatedAt: iso(int(0, 30)),
  };
});

// backfill department member counts + designation counts
DEPARTMENTS.forEach((d) => (d.memberCount = EMPLOYEES.filter((e) => e.departmentId === d.id).length));
DESIGNATIONS.forEach((g) => (g.employeeCount = EMPLOYEES.filter((e) => e.designationId === g.id).length));

export const PERMISSIONS: Permission[] = [
  'employees', 'departments', 'roles', 'tasks', 'attendance', 'leave', 'performance', 'reports', 'audit', 'settings', 'notifications', 'custom_fields',
].flatMap((resource) =>
  ['read', 'create', 'update', 'delete'].map((action) => ({
    id: `p_${resource}_${action}`,
    key: `${resource}:${action}`,
    resource,
    action,
    description: `${action[0].toUpperCase() + action.slice(1)} ${resource.replace('_', ' ')}`,
  })),
);

export const ROLES: Role[] = [
  { id: 'r1', name: 'Super Admin', slug: 'super-admin', description: 'Full platform control', isSystem: true, canAccessWeb: true, canAccessMobile: false, userCount: 2, permissions: PERMISSIONS.map((p) => p.key) },
  { id: 'r2', name: 'HR Manager', slug: 'hr-manager', description: 'Full HR operations', isSystem: true, canAccessWeb: true, canAccessMobile: true, userCount: 5, permissions: PERMISSIONS.filter((p) => !['settings', 'roles'].includes(p.resource)).map((p) => p.key) },
  { id: 'r3', name: 'Department Manager', slug: 'dept-manager', description: 'Team-level visibility & approvals', isSystem: true, canAccessWeb: true, canAccessMobile: true, userCount: 12, permissions: PERMISSIONS.filter((p) => ['employees:read', 'attendance:read', 'leave:read', 'leave:update', 'tasks:read', 'tasks:create', 'tasks:update', 'performance:read', 'reports:read'].includes(p.key)).map((p) => p.key) },
  { id: 'r4', name: 'Finance Officer', slug: 'finance-officer', description: 'Payroll & financial reports', isSystem: true, canAccessWeb: true, canAccessMobile: false, userCount: 4, permissions: PERMISSIONS.filter((p) => ['employees:read', 'reports:read', 'reports:create', 'attendance:read'].includes(p.key)).map((p) => p.key) },
  { id: 'r5', name: 'Employee', slug: 'employee', description: 'Self-service access', isSystem: true, canAccessWeb: false, canAccessMobile: true, userCount: 41, permissions: ['attendance:read', 'leave:read', 'leave:create', 'tasks:read'] },
];

export const CUSTOM_FIELDS: CustomFieldDefinition[] = [
  { id: 'cf1', entity: 'employee', fieldKey: 'blood_group', label: 'Blood Group', dataType: 'select', isRequired: false, isUnique: false, options: BLOOD.map((b) => ({ value: b, label: b })), displayOrder: 1, isVisible: true, isSearchable: false, isFilterable: true, isEncrypted: false, isSystem: true, helpText: 'For emergency medical records' },
  { id: 'cf2', entity: 'employee', fieldKey: 'uniform_size', label: 'Uniform Size', dataType: 'select', isRequired: false, isUnique: false, options: SHIRTS.map((s) => ({ value: s, label: s })), displayOrder: 2, isVisible: true, isSearchable: false, isFilterable: true, isEncrypted: false, isSystem: false },
  { id: 'cf3', entity: 'employee', fieldKey: 'passport_number', label: 'Passport Number', dataType: 'text', isRequired: false, isUnique: true, maxLength: 20, displayOrder: 3, isVisible: true, isSearchable: true, isFilterable: false, isEncrypted: true, isSystem: false, placeholder: 'AB1234567' },
  { id: 'cf4', entity: 'employee', fieldKey: 'linkedin', label: 'LinkedIn', dataType: 'url', isRequired: false, isUnique: false, displayOrder: 4, isVisible: true, isSearchable: false, isFilterable: false, isEncrypted: false, isSystem: false, placeholder: 'linkedin.com/in/…' },
  { id: 'cf5', entity: 'employee', fieldKey: 'visa_expiry', label: 'Visa Expiry', dataType: 'date', isRequired: false, isUnique: false, displayOrder: 5, isVisible: true, isSearchable: false, isFilterable: true, isEncrypted: false, isSystem: false, helpText: 'Triggers expiry alerts' },
];

const ATT_STATUS: AttendanceRecord['status'][] = ['present', 'present', 'present', 'present', 'late', 'wfh', 'on_leave', 'absent'];
export const ATTENDANCE: AttendanceRecord[] = EMPLOYEES.slice(0, 40).map((e, i) => {
  const status = pick(ATT_STATUS);
  const checkIn = status === 'absent' || status === 'on_leave' ? undefined : iso(0);
  return {
    id: `a${i + 1}`,
    employeeId: e.id,
    employeeName: e.fullName,
    employeeCode: e.employeeCode,
    departmentName: e.departmentName,
    workDate: iso(0).slice(0, 10),
    checkInAt: checkIn ? new Date(new Date().setHours(9, int(0, 45), 0, 0)).toISOString() : undefined,
    checkOutAt: checkIn ? new Date(new Date().setHours(17, int(0, 55), 0, 0)).toISOString() : undefined,
    checkInMethod: pick(['face', 'mobile', 'kiosk', 'qr']),
    status,
    workedMinutes: checkIn ? int(420, 540) : 0,
    overtimeMinutes: rng() > 0.8 ? int(30, 120) : 0,
    isFlagged: rng() > 0.9,
    faceMatchScore: checkIn ? int(88, 99) + rng() : undefined,
  };
});

const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Unpaid'];
const LEAVE_STATUS: LeaveRequest['status'][] = ['pending', 'pending', 'approved', 'approved', 'rejected', 'cancelled'];
export const LEAVE_REQUESTS: LeaveRequest[] = EMPLOYEES.slice(0, 28).map((e, i) => {
  const start = int(1, 40);
  const days = int(1, 5);
  return {
    id: `l${i + 1}`,
    employeeId: e.id,
    employeeName: e.fullName,
    departmentName: e.departmentName,
    leaveType: pick(LEAVE_TYPES),
    startDate: iso(start).slice(0, 10),
    endDate: iso(start - days).slice(0, 10),
    days,
    reason: pick(['Family event', 'Medical appointment', 'Personal work', 'Vacation', 'Not feeling well']),
    status: pick(LEAVE_STATUS),
    appliedAt: iso(start + int(1, 5)),
  };
});

const TASK_STATUS: Task['status'][] = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done'];
const TASK_PRIO: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];
const TASK_TITLES = ['Onboard new hires batch', 'Process monthly payroll', 'Review Q3 attendance anomalies', 'Update leave policy doc', 'Prepare board headcount report', 'Audit access permissions', 'Migrate employee documents', 'Configure shift roster', 'Reconcile travel expenses', 'Draft performance cycle', 'Resolve support backlog', 'Renew software licenses', 'Conduct exit interviews', 'Update org chart', 'Verify KYC documents'];
export const TASKS: Task[] = Array.from({ length: 34 }).map((_, i) => {
  const assignCount = int(1, 3);
  return {
    id: `t${i + 1}`,
    title: TASK_TITLES[i % TASK_TITLES.length],
    description: 'Coordinate with the relevant department and complete all sub-items before the due date.',
    status: pick(TASK_STATUS),
    priority: pick(TASK_PRIO),
    progress: int(0, 100),
    departmentName: pick(DEPARTMENTS).name,
    assignees: Array.from({ length: assignCount }).map(() => {
      const e = pick(EMPLOYEES);
      return { id: e.id, name: e.fullName };
    }),
    dueDate: iso(-int(-10, 20)).slice(0, 10),
    createdAt: iso(int(1, 40)),
  };
});

export const REVIEWS: PerformanceReview[] = EMPLOYEES.slice(0, 30).map((e, i) => ({
  id: `pr${i + 1}`,
  employeeId: e.id,
  employeeName: e.fullName,
  departmentName: e.departmentName,
  cycle: 'H1 2026',
  reviewerName: `${pick(FIRST)} ${pick(LAST)}`,
  status: pick(['draft', 'in_progress', 'submitted', 'acknowledged', 'closed']),
  overallScore: rng() > 0.3 ? +(3 + rng() * 2).toFixed(1) : undefined,
  updatedAt: iso(int(0, 20)),
}));

export const GOALS: Goal[] = Array.from({ length: 12 }).map((_, i) => {
  const target = int(50, 100);
  return {
    id: `goal${i + 1}`,
    title: pick(['Reduce time-to-hire', 'Improve attendance rate', 'Increase eNPS', 'Cut payroll errors', 'Boost training hours', 'Lower attrition']),
    ownerName: `${pick(FIRST)} ${pick(LAST)}`,
    metric: pick(['%', 'days', 'score', 'hours']),
    target,
    current: int(10, target),
    status: pick(['not_started', 'on_track', 'at_risk', 'off_track', 'completed']),
    dueDate: iso(-int(10, 90)).slice(0, 10),
  };
});

export const NOTIFICATIONS: AppNotification[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `n${i + 1}`,
  title: pick(['Leave request pending', 'Payslip generated', 'Attendance flagged', 'New task assigned', 'Document expiring soon', 'Review submitted']),
  body: pick(['Requires your approval before end of day.', 'A new item needs your attention.', 'Automated system notification.', 'Action may be required.']),
  channel: pick(['in_app', 'email', 'push', 'whatsapp']),
  category: pick(['leave', 'attendance', 'task', 'system', 'payroll']),
  read: rng() > 0.6,
  createdAt: iso(0 + i * 0.1 + rng()),
  link: '#',
}));

export const AUDIT_LOGS: AuditLog[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `au${i + 1}`,
  actorName: `${pick(FIRST)} ${pick(LAST)}`,
  action: pick(['create', 'update', 'delete', 'login', 'export', 'approve', 'reject']),
  entityType: pick(['Employee', 'Leave Request', 'Task', 'Role', 'Department', 'Attendance']),
  entityLabel: pick(['EMP-1042', 'Annual leave #L-88', 'Payroll run', 'HR Manager role', 'Engineering']),
  ipAddress: `10.0.${int(0, 8)}.${int(2, 250)}`,
  createdAt: iso(rng() * 14),
}));

export const ACTIVITY: ActivityItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `ac${i + 1}`,
  actorName: `${pick(FIRST)} ${pick(LAST)}`,
  verb: pick(['approved leave for', 'added employee', 'completed task', 'flagged attendance for', 'updated role']),
  target: pick(['Sara Khan', 'the Engineering team', 'Payroll run', 'Ali Raza', 'Finance dept']),
  createdAt: iso(rng() * 3),
  category: pick(['employee', 'leave', 'task', 'attendance', 'system']),
}));

export const CURRENT_USER: CurrentUser = {
  id: 'u1',
  fullName: 'Ayesha Malik',
  email: 'ayesha.malik@acmebank.com',
  roleName: 'Super Admin',
  permissions: PERMISSIONS.map((p) => p.key),
};

const last14 = Array.from({ length: 14 }).map((_, i) => {
  const total = 64;
  const present = int(44, 58);
  const late = int(2, 8);
  return { date: iso(13 - i).slice(5, 10), present, absent: total - present - late, late };
});

export const DASHBOARD: DashboardStats = {
  headcount: { value: EMPLOYEES.length, delta: 4.2 },
  presentToday: { value: 52, total: EMPLOYEES.length },
  onLeave: { value: EMPLOYEES.filter((e) => e.status === 'on_leave').length, delta: -1.1 },
  openTasks: { value: TASKS.filter((t) => t.status !== 'done').length, delta: 6.5 },
  attritionRate: { value: 4.8, delta: -0.6 },
  pendingApprovals: LEAVE_REQUESTS.filter((l) => l.status === 'pending').length,
  attendanceTrend: last14,
  departmentHeadcount: DEPARTMENTS.map((d) => ({ department: d.code, count: d.memberCount })),
  taskStatus: TASK_STATUS.map((s) => ({ status: s, count: TASKS.filter((t) => t.status === s).length })),
  productivity: Array.from({ length: 8 }).map((_, i) => ({ week: `W${i + 1}`, assigned: int(20, 40), completed: int(12, 32) })),
  genderSplit: [
    { label: 'Male', value: EMPLOYEES.filter((e) => e.gender === 'male').length },
    { label: 'Female', value: EMPLOYEES.filter((e) => e.gender === 'female').length },
  ],
};
