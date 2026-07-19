/*
 * Demo data seed — makes the dashboard/analytics charts look alive.
 * Adds departments, ~48 employees, 30 days of attendance, tasks across all
 * statuses over 8 weeks, and leave requests. Real (non-SEED) employees are kept;
 * prior SEED-* demo data + all attendance/tasks/leave are cleared first so it's
 * safe to re-run.  Run:  node prisma/seed-demo.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const chance = (p) => Math.random() < p;

const FIRST = ['Budi', 'Siti', 'Agus', 'Dewi', 'Rizki', 'Putri', 'Andi', 'Ayu', 'Eko', 'Rina', 'Dian', 'Fajar', 'Indah', 'Yusuf', 'Nadia', 'Bayu', 'Sri', 'Hendra', 'Maya', 'Aditya', 'Lestari', 'Wawan', 'Fitri', 'Rama', 'Citra', 'Iqbal', 'Wulan', 'Teguh', 'Anisa', 'Reza', 'Melati', 'Surya', 'Ratna', 'Ilham', 'Kartika', 'Danang', 'Sari', 'Bagus', 'Intan', 'Arif'];
const LAST = ['Santoso', 'Wijaya', 'Pratama', 'Kusuma', 'Hidayat', 'Nugroho', 'Saputra', 'Wibowo', 'Halim', 'Setiawan', 'Permana', 'Utomo', 'Gunawan', 'Suryadi', 'Maulana', 'Firmansyah', 'Anggraini', 'Puspita', 'Rahayu', 'Hartono'];
const DESIGS = ['Teller', 'Customer Service Officer', 'Relationship Manager', 'Branch Manager', 'Credit Analyst', 'Operations Officer', 'Compliance Officer', 'IT Support Specialist', 'Software Engineer', 'HR Officer', 'Accountant', 'Marketing Executive', 'Loan Officer', 'Treasury Analyst', 'Risk Analyst'];
const DEPTS = [
  { name: 'Retail Banking', code: 'RB' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Operations', code: 'OPS' },
  { name: 'Customer Service', code: 'CS' },
  { name: 'Marketing', code: 'MKT' },
];
const TASK_TITLES = ['Reconcile daily ledger', 'Process loan applications', 'Update KYC documents', 'Prepare monthly report', 'Review compliance checklist', 'Onboard new hires', 'Audit branch cash', 'Resolve customer tickets', 'Deploy internet banking patch', 'Run payroll cycle', 'Quarterly risk assessment', 'Renew vendor contracts', 'Migrate core banking data', 'Train tellers on new POS', 'Close month-end books'];
const TASK_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function utcDay(offsetDays) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No organization');
  const orgId = org.id;

  // 1) Departments (keep existing, add the rest)
  for (const d of DEPTS) {
    const exists = await prisma.department.findFirst({ where: { organizationId: orgId, name: d.name, deletedAt: null } });
    if (!exists) await prisma.department.create({ data: { organizationId: orgId, name: d.name, code: d.code, isActive: true } });
  }
  const departments = await prisma.department.findMany({ where: { organizationId: orgId, deletedAt: null } });

  // 2) Designations
  for (const t of DESIGS) {
    const exists = await prisma.designation.findFirst({ where: { organizationId: orgId, title: t } });
    if (!exists) await prisma.designation.create({ data: { organizationId: orgId, title: t } });
  }
  const designations = await prisma.designation.findMany({ where: { organizationId: orgId, deletedAt: null } });

  // 3) Clear prior demo data (SEED employees + all attendance/tasks/leave)
  const oldSeed = await prisma.employee.findMany({ where: { organizationId: orgId, employeeCode: { startsWith: 'SEED-' } }, select: { id: true } });
  const oldIds = oldSeed.map((e) => e.id);
  await prisma.attendanceDay.deleteMany({ where: { organizationId: orgId } });
  await prisma.taskAssignment.deleteMany({ where: { task: { organizationId: orgId } } });
  await prisma.task.deleteMany({ where: { organizationId: orgId } });
  await prisma.leaveRequest.deleteMany({ where: { organizationId: orgId } });
  if (oldIds.length) await prisma.employee.deleteMany({ where: { id: { in: oldIds } } });

  // 4) Employees (~48), Indonesian names, spread across depts/genders/status
  const N = 48;
  const startCode = 9001;
  const seeded = [];
  for (let i = 0; i < N; i++) {
    const gender = chance(0.52) ? 'male' : 'female';
    const first = pick(FIRST);
    const last = pick(LAST);
    const dept = pick(departments);
    const desig = pick(designations);
    // status: mostly active, a few resigned (attrition), a couple on leave
    let status = 'active';
    if (i < 3) status = 'resigned';
    else if (i < 5) status = 'on_leave';
    const joinOffset = -(180 + rnd(600)); // joined 6mo–2.5yr ago
    const emp = await prisma.employee.create({
      data: {
        organizationId: orgId,
        employeeCode: `SEED-${startCode + i}`,
        firstName: first,
        lastName: last,
        workEmail: `${first.toLowerCase()}.${last.toLowerCase()}${i}@acmebank.co.id`,
        gender,
        departmentId: dept.id,
        designationId: desig.id,
        employmentType: 'full_time',
        status,
        dateOfJoining: utcDay(joinOffset),
        payPerHour: 250 + rnd(26) * 50, // 250–1500
        customFields: { blood_group: pick(['A+', 'B+', 'O+', 'AB+']) },
      },
    });
    seeded.push(emp);
  }

  // 4b) Every department must have a head (the app enforces this; the seed
  //     writes directly to the DB so we honor the rule explicitly here).
  const headRole = await prisma.role.findFirst({ where: { organizationId: orgId, slug: 'department-head', deletedAt: null } });
  for (const d of departments) {
    const dept = await prisma.department.findUnique({ where: { id: d.id }, select: { headEmployeeId: true } });
    if (dept.headEmployeeId) continue;
    const head = await prisma.employee.findFirst({ where: { organizationId: orgId, departmentId: d.id, deletedAt: null, status: { in: ['active', 'probation'] } }, orderBy: { createdAt: 'asc' } });
    if (!head) continue;
    await prisma.department.update({ where: { id: d.id }, data: { headEmployeeId: head.id } });
    await prisma.employee.update({ where: { id: head.id }, data: { managerId: null } });
    await prisma.employee.updateMany({ where: { organizationId: orgId, departmentId: d.id, deletedAt: null, id: { not: head.id } }, data: { managerId: head.id } });
    if (head.userId && headRole) await prisma.userRole.upsert({ where: { userId_roleId: { userId: head.userId, roleId: headRole.id } }, update: {}, create: { userId: head.userId, roleId: headRole.id } });
  }

  // Include real employees in attendance too
  const realActive = await prisma.employee.findMany({ where: { organizationId: orgId, deletedAt: null, employeeCode: { not: { startsWith: 'SEED-' } } } });
  const activeEmployees = [...seeded.filter((e) => e.status === 'active' || e.status === 'on_leave'), ...realActive];

  // 5) Attendance — last 30 days, skip weekends. Today has mostly-present.
  const attendanceRows = [];
  for (let off = -29; off <= 0; off++) {
    const day = utcDay(off);
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue; // weekend
    for (const e of activeEmployees) {
      const r = Math.random();
      let status, worked = 0, late = 0, flagged = false;
      if (e.status === 'on_leave' && off >= -3) { status = 'on_leave'; }
      else if (r < 0.8) { status = 'present'; worked = 440 + rnd(45); }
      else if (r < 0.9) { status = 'late'; worked = 400 + rnd(60); late = 8 + rnd(40); flagged = late > 30; }
      else if (r < 0.945) { status = 'wfh'; worked = 430 + rnd(50); }
      else if (r < 0.98) { status = 'absent'; }
      else { status = 'on_leave'; }
      attendanceRows.push({
        organizationId: orgId, employeeId: e.id, workDate: day, status,
        workedMinutes: worked, lateMinutes: late, breakMinutes: worked ? 45 : 0,
        firstInAt: worked ? new Date(day.getTime() + (9 * 60 + rnd(20)) * 60000) : null,
        lastOutAt: worked ? new Date(day.getTime() + (17 * 60 + rnd(30)) * 60000) : null,
        isFlagged: flagged, flagReason: flagged ? `Late ${late}m` : null,
      });
    }
  }
  // bulk insert in chunks
  for (let i = 0; i < attendanceRows.length; i += 500) {
    await prisma.attendanceDay.createMany({ data: attendanceRows.slice(i, i + 500) });
  }

  // 6) Tasks — spread over 8 weeks, all statuses, some done with completedAt
  for (let i = 0; i < 46; i++) {
    const status = pick(TASK_STATUSES);
    const createdOff = -(rnd(56)); // last 8 weeks
    const created = utcDay(createdOff);
    const done = status === 'done';
    const dept = pick(departments);
    await prisma.task.create({
      data: {
        organizationId: orgId,
        title: pick(TASK_TITLES),
        departmentId: dept.id,
        status,
        priority: pick(PRIORITIES),
        progress: done ? 100 : rnd(90),
        startDate: created,
        dueDate: utcDay(createdOff + 3 + rnd(10)),
        completedAt: done ? utcDay(createdOff + 1 + rnd(6)) : null,
        estimatedHours: 4 + rnd(20),
        createdAt: created,
      },
    });
  }

  // 7) Leave requests — pending (for approvals) + approved history
  const annual = await prisma.leaveType.findFirst({ where: { organizationId: orgId, code: 'ANNUAL' } });
  if (annual) {
    const pool = seeded.filter((e) => e.status !== 'resigned');
    for (let i = 0; i < 16; i++) {
      const e = pick(pool);
      const startOff = i < 6 ? 3 + rnd(20) : -(10 + rnd(40)); // first 6 upcoming/pending, rest past
      const len = 1 + rnd(4);
      await prisma.leaveRequest.create({
        data: {
          organizationId: orgId, employeeId: e.id, leaveTypeId: annual.id,
          startDate: utcDay(startOff), endDate: utcDay(startOff + len - 1), days: len,
          reason: pick(['Family event', 'Medical', 'Vacation', 'Personal', 'Wedding']),
          status: i < 6 ? 'pending' : 'approved',
          decidedAt: i < 6 ? null : new Date(),
        },
      });
    }
  }

  const counts = {
    employees: await prisma.employee.count({ where: { organizationId: orgId, deletedAt: null } }),
    attendance: await prisma.attendanceDay.count({ where: { organizationId: orgId } }),
    tasks: await prisma.task.count({ where: { organizationId: orgId } }),
    leave: await prisma.leaveRequest.count({ where: { organizationId: orgId } }),
    departments: await prisma.department.count({ where: { organizationId: orgId, deletedAt: null } }),
  };
  console.log('Demo seed complete:', JSON.stringify(counts));
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
