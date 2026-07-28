/*
 * Demo data seed — makes the dashboard/analytics charts look alive.
 * Adds departments, ~48 employees, 30 days of attendance, tasks across all
 * statuses over 8 weeks, and leave requests. Real (non-SEED) employees are kept;
 * prior SEED-* demo data + all attendance/tasks/leave are cleared first so it's
 * safe to re-run.  Run:  node prisma/seed-demo.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
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

  // 4c) Login accounts. Without these nobody but the super admin can sign in,
  //     so the mobile app is undemoable and the task-assignment step below
  //     (which filters on userId) silently assigns almost nothing.
  //
  //     Only a subset gets an account, mirroring reality: not every employee on
  //     the payroll has app access. Heads get the Department Head role, the
  //     rest get Employee — which is mobile-only, so these accounts cannot
  //     reach the web dashboard.
  const employeeRole = await prisma.role.findFirst({ where: { organizationId: orgId, slug: 'employee', deletedAt: null } });
  const DEMO_PASSWORD = process.env.DEMO_EMPLOYEE_PASSWORD ?? 'Test@12345';
  const demoHash = await argon2.hash(DEMO_PASSWORD);

  const headIds = new Set(
    (await prisma.department.findMany({ where: { organizationId: orgId, headEmployeeId: { not: null } }, select: { headEmployeeId: true } }))
      .map((d) => d.headEmployeeId),
  );
  // Every head, plus the first few members of each department.
  const loginCandidates = [
    ...seeded.filter((e) => headIds.has(e.id)),
    ...seeded.filter((e) => !headIds.has(e.id) && e.status === 'active').slice(0, 12),
  ];

  let loginsCreated = 0;
  for (const emp of loginCandidates) {
    if (emp.userId) continue;
    // Names are drawn at random and repeat, so the employee code — not the
    // name — is what keeps the address unique.
    const slug = `${emp.firstName}.${emp.lastName}`.toLowerCase().replace(/[^a-z.]/g, '');
    const email = `${slug}.${emp.employeeCode.replace('SEED-', '')}@demo.local`;
    const existing = await prisma.user.findFirst({ where: { organizationId: orgId, email } });
    if (existing) continue;
    const user = await prisma.user.create({
      data: {
        organizationId: orgId,
        email,
        passwordHash: demoHash,
        fullName: `${emp.firstName} ${emp.lastName}`,
        status: 'active',
        isSuperAdmin: false,
      },
    });
    const role = headIds.has(emp.id) ? headRole : employeeRole;
    if (role) await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    await prisma.employee.update({ where: { id: emp.id }, data: { userId: user.id } });
    emp.userId = user.id; // keep the in-memory copy in step with the DB
    loginsCreated++;
  }
  console.log(`Created ${loginsCreated} demo login accounts (password: ${DEMO_PASSWORD})`);

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
      const status = i < 6 ? 'pending' : 'approved';
      await prisma.leaveRequest.create({
        data: {
          organizationId: orgId, employeeId: e.id, leaveTypeId: annual.id,
          startDate: utcDay(startOff), endDate: utcDay(startOff + len - 1), days: len,
          reason: pick(['Family event', 'Medical', 'Vacation', 'Personal', 'Wedding']),
          status,
          decidedAt: i < 6 ? null : new Date(),
        },
      });

      // Keep the balance in step with the request. Writing requests straight to
      // the DB bypasses LeaveService, which is what normally moves days into
      // `taken`/`pending` — without this the Leave screen shows "6 of 6 days
      // left" directly above an approved 4-day request, which reads as a bug.
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: e.id, leaveTypeId: annual.id, year: new Date().getUTCFullYear(),
          },
        },
        create: {
          organizationId: orgId, employeeId: e.id, leaveTypeId: annual.id,
          year: new Date().getUTCFullYear(),
          taken: status === 'approved' ? len : 0,
          pending: status === 'pending' ? len : 0,
        },
        update: status === 'approved'
            ? { taken: { increment: len } }
            : { pending: { increment: len } },
      });
    }
  }

  // 8) Assign the open tasks to people. Without this every employee's "My
  //    tasks" list is empty, and login-capable accounts (the demo logins) get
  //    an extra few so their Tasks tab is never bare.
  const openTasks = await prisma.task.findMany({
    where: { organizationId: orgId, deletedAt: null, status: { notIn: ['done', 'cancelled'] } },
    select: { id: true, departmentId: true },
  });
  const assignable = await prisma.employee.findMany({
    where: { organizationId: orgId, deletedAt: null, status: { in: ['active', 'probation'] } },
    select: { id: true, departmentId: true, userId: true },
  });
  for (const t of openTasks) {
    const sameDept = assignable.filter((e) => e.departmentId === t.departmentId);
    const who = (sameDept.length ? sameDept : assignable)[rnd(sameDept.length || assignable.length)];
    if (who) {
      await prisma.taskAssignment.create({ data: { taskId: t.id, employeeId: who.id, role: 'assignee' } });
    }
  }
  let cursor = 0;
  for (const e of assignable.filter((x) => x.userId)) {
    for (let k = 0; k < 4 && openTasks.length; k++) {
      const t = openTasks[cursor++ % openTasks.length];
      const dup = await prisma.taskAssignment.findFirst({ where: { taskId: t.id, employeeId: e.id } });
      if (!dup) await prisma.taskAssignment.create({ data: { taskId: t.id, employeeId: e.id, role: 'assignee' } });
    }
  }

  // 9) Performance — a review cycle, reviews (reviewer = dept head) and goals,
  //    so the Performance tab is populated rather than showing empty states.
  await prisma.performanceReview.deleteMany({ where: { organizationId: orgId } });
  await prisma.goal.deleteMany({ where: { organizationId: orgId } });
  await prisma.reviewCycle.deleteMany({ where: { organizationId: orgId } });
  const cycle = await prisma.reviewCycle.create({
    data: { organizationId: orgId, name: 'H1 2026 Appraisal', isActive: true,
      startDate: new Date('2026-01-01'), endDate: new Date('2026-06-30') },
  });
  const reviewPool = await prisma.employee.findMany({
    where: { organizationId: orgId, deletedAt: null, status: { in: ['active', 'on_leave'] } },
    select: { id: true, department: { select: { headEmployeeId: true } } }, take: 40,
  });
  const RSTATUS = ['submitted', 'submitted', 'submitted', 'in_progress', 'acknowledged', 'closed'];
  const RSUMM = [
    'Consistently strong delivery; exceeded targets this cycle.',
    'Solid performer, reliable on core duties. Growth in ownership.',
    'Meets expectations. Focus area: stakeholder communication.',
    'High potential; take on more cross-team initiatives next cycle.',
  ];
  for (const e of reviewPool) {
    const status = pick(RSTATUS);
    const scored = status === 'submitted' || status === 'acknowledged' || status === 'closed';
    await prisma.performanceReview.create({
      data: { organizationId: orgId, cycleId: cycle.id, employeeId: e.id,
        reviewerId: e.department?.headEmployeeId ?? null, status,
        overallScore: scored ? Number((3 + Math.random() * 2).toFixed(2)) : null,
        summary: pick(RSUMM), submittedAt: scored ? new Date() : null },
    });
  }
  const GOALS = [
    ['Reduce customer onboarding time', 'days', 5, 3, 'on_track'],
    ['Increase branch deposit growth', '%', 12, 8, 'on_track'],
    ['Close quarterly compliance gaps', 'items', 10, 10, 'completed'],
    ['Improve CSAT score', 'score', 90, 82, 'at_risk'],
    ['Cut loan processing errors', '%', 2, 4, 'off_track'],
    ['Complete AML training rollout', '%', 100, 65, 'on_track'],
    ['Migrate legacy ledgers', 'systems', 3, 1, 'on_track'],
    ['Grow SME loan book', 'PKR M', 50, 31, 'on_track'],
  ];
  for (const [title, metric, target, current, status] of GOALS) {
    await prisma.goal.create({
      data: { organizationId: orgId, departmentId: pick(departments).id, title, metric,
        targetValue: target, currentValue: current, weight: 10 + rnd(20), status,
        dueDate: new Date('2026-09-30') },
    });
  }

  // --- Clients: companies served by a department (records only, no logins) ---
  const demoClients = [
    { name: 'PT Nusantara Retail', code: 'NUSA', contactPerson: 'Rina Wijaya', contactEmail: 'rina@nusantararetail.co.id', status: 'active' },
    { name: 'Bank Sejahtera Syariah', code: 'BSS', contactPerson: 'Ahmad Fauzi', contactEmail: 'a.fauzi@sejahtera.co.id', status: 'active' },
    { name: 'Garuda Logistics', code: 'GRDL', contactPerson: 'Dewi Lestari', contactEmail: 'dewi@garudalogistics.id', status: 'active' },
    { name: 'Mitra Sentosa Group', code: 'MSG', contactPerson: 'Budi Hartono', contactEmail: 'budi@mitrasentosa.id', status: 'prospect' },
  ];
  for (let i = 0; i < demoClients.length; i++) {
    const c = demoClients[i];
    const existing = await prisma.client.findFirst({ where: { organizationId: orgId, name: c.name, deletedAt: null } });
    if (existing) continue;
    await prisma.client.create({
      data: { organizationId: orgId, departmentId: departments[i % departments.length]?.id, ...c },
    });
  }

  // --- Assets: registry + a few live assignments ---
  const demoAssets = [
    { name: 'MacBook Pro 14"', category: 'Laptop', vendor: 'Apple', purchaseCost: 32000000, condition: 'good' },
    { name: 'ThinkPad T14', category: 'Laptop', vendor: 'Lenovo', purchaseCost: 18000000, condition: 'good' },
    { name: 'iPhone 15', category: 'Phone', vendor: 'Apple', purchaseCost: 15000000, condition: 'new' },
    { name: 'Dell U2723QE Monitor', category: 'Monitor', vendor: 'Dell', purchaseCost: 9000000, condition: 'good' },
    { name: 'Toyota Avanza (Pool Car)', category: 'Vehicle', vendor: 'Toyota', purchaseCost: 250000000, condition: 'fair' },
    { name: 'Microsoft 365 E3 Seat', category: 'Software License', vendor: 'Microsoft', purchaseCost: 6000000, condition: null },
  ];
  const existingAssets = await prisma.asset.count({ where: { organizationId: orgId } });
  if (existingAssets === 0) {
    const holders = await prisma.employee.findMany({ where: { organizationId: orgId, deletedAt: null }, take: 3, select: { id: true } });
    for (let i = 0; i < demoAssets.length; i++) {
      const a = demoAssets[i];
      const holder = i < 3 ? holders[i] : null; // first three are issued, rest in stock
      const asset = await prisma.asset.create({
        data: {
          organizationId: orgId,
          assetTag: `AST-${String(i + 1).padStart(4, '0')}`,
          status: holder ? 'assigned' : 'available',
          assignedToId: holder?.id,
          ...a,
        },
      });
      if (holder) {
        await prisma.assetAssignment.create({
          data: { organizationId: orgId, assetId: asset.id, employeeId: holder.id, conditionOut: a.condition ?? 'good' },
        });
      }
    }
  }

  const counts = {
    employees: await prisma.employee.count({ where: { organizationId: orgId, deletedAt: null } }),
    attendance: await prisma.attendanceDay.count({ where: { organizationId: orgId } }),
    tasks: await prisma.task.count({ where: { organizationId: orgId } }),
    leave: await prisma.leaveRequest.count({ where: { organizationId: orgId } }),
    departments: await prisma.department.count({ where: { organizationId: orgId, deletedAt: null } }),
    clients: await prisma.client.count({ where: { organizationId: orgId, deletedAt: null } }),
    assets: await prisma.asset.count({ where: { organizationId: orgId, deletedAt: null } }),
  };
  console.log('Demo seed complete:', JSON.stringify(counts));
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
