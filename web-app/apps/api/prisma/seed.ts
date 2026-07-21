/* Seeds the org, permission catalog, 5 system roles, and a super-admin user.
 * Idempotent: safe to run repeatedly. Run with `npm run db:seed`. */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const RESOURCES = [
  'employees', 'departments', 'designations', 'roles', 'permissions', 'users',
  'tasks', 'attendance', 'leave', 'performance', 'reports', 'analytics',
  'audit', 'settings', 'notifications', 'custom_fields', 'organizations', 'files',
  'shifts', 'biometric', 'face',
];
const ACTIONS = ['read', 'create', 'update', 'delete'];
// Special (non-CRUD) permissions.
const EXTRA_PERMISSIONS = [
  { key: 'attendance:track', resource: 'attendance', action: 'track', description: 'View employee live location & route' },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const orgName = process.env.SEED_ORG_NAME ?? 'Acme Bank Ltd';
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@acmebank.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: slugify(orgName) },
    update: {},
    create: { name: orgName, legalName: orgName, slug: slugify(orgName), timezone: 'Asia/Karachi', currency: 'PKR' },
  });

  // 2. Permission catalog
  const permKeys: string[] = [];
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const key = `${resource}:${action}`;
      permKeys.push(key);
      await prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, resource, action, description: `${action} ${resource.replace('_', ' ')}` },
      });
    }
  }
  for (const p of EXTRA_PERMISSIONS) {
    permKeys.push(p.key);
    await prisma.permission.upsert({ where: { key: p.key }, update: {}, create: p });
  }
  const allPerms = await prisma.permission.findMany();
  const permByKey = new Map(allPerms.map((p) => [p.key, p.id]));

  // 3. System roles + their permission sets and platform access.
  //    Platform access is an auth-time gate, independent of permissions.
  const roleDefs: { name: string; description: string; keys: string[]; web: boolean; mobile: boolean }[] = [
    { name: 'Super Admin', description: 'Full platform control', keys: permKeys, web: true, mobile: false },
    { name: 'HR Manager', description: 'Full HR operations', keys: permKeys.filter((k) => !k.startsWith('settings:') && !k.startsWith('roles:') && !k.startsWith('permissions:')), web: true, mobile: true },
    { name: 'Department Head', description: 'Leads a department: team visibility, approvals and task assignment', keys: ['employees:read', 'attendance:read', 'attendance:track', 'leave:read', 'leave:update', 'tasks:read', 'tasks:create', 'tasks:update', 'performance:read', 'reports:read', 'analytics:read', 'files:read', 'files:create', 'files:delete'], web: true, mobile: true },
    { name: 'Finance Officer', description: 'Payroll and financial reports', keys: ['employees:read', 'reports:read', 'reports:create', 'attendance:read', 'analytics:read'], web: true, mobile: false },
    // files:* is safe to grant broadly because FilesService.assertOwnerAccess
    // narrows unprivileged users to their own tasks, their own employee record
    // and their own reports — the permission alone is not org-wide access.
    { name: 'Employee', description: 'Self-service access', keys: ['attendance:read', 'leave:read', 'leave:create', 'tasks:read', 'tasks:update', 'files:read', 'files:create'], web: false, mobile: true },
  ];

  let superAdminRoleId = '';
  for (const def of roleDefs) {
    const role = await prisma.role.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: slugify(def.name) } },
      update: { description: def.description, canAccessWeb: def.web, canAccessMobile: def.mobile },
      create: { organizationId: org.id, name: def.name, slug: slugify(def.name), description: def.description, isSystem: true, canAccessWeb: def.web, canAccessMobile: def.mobile },
    });
    if (def.name === 'Super Admin') superAdminRoleId = role.id;

    // reset + set permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: def.keys.map((k) => ({ roleId: role.id, permissionId: permByKey.get(k)! })).filter((r) => r.permissionId),
      skipDuplicates: true,
    });
  }

  // 4. Super-admin user
  const passwordHash = await argon2.hash(adminPassword);
  const admin = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: adminEmail } },
    update: {},
    create: {
      organizationId: org.id,
      email: adminEmail,
      passwordHash,
      fullName: 'Platform Administrator',
      status: 'active',
      isSuperAdmin: true,
      emailVerifiedAt: new Date(),
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRoleId } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRoleId },
  });

  // 5. Default attendance policy, a standard shift, and leave types
  const existingPolicy = await prisma.attendancePolicy.findFirst({ where: { organizationId: org.id, isDefault: true } });
  if (!existingPolicy) {
    await prisma.attendancePolicy.create({
      data: {
        organizationId: org.id, name: 'Standard Policy', isDefault: true,
        graceMinutes: 15, lateAfterMinutes: 15, halfDayMinutes: 240, fullDayMinutes: 480,
        overtimeAfterMinutes: 540, enforceGeofence: true, allowRemote: true,
        allowedMethods: ['web', 'mobile_gps', 'mobile_face', 'qr', 'biometric', 'manual'],
        weeklyOffDays: [0, 6], trackingIntervalSec: 120,
      },
    });
  }
  const existingShift = await prisma.shift.findFirst({ where: { organizationId: org.id } });
  if (!existingShift) {
    await prisma.shift.create({
      data: { organizationId: org.id, name: 'General (9–5)', type: 'fixed', startTime: '09:00', endTime: '17:00', graceMinutes: 15, breakMinutes: 60, workMinutes: 480 },
    });
  }
  // Exactly two types, matching the agreed policy:
  //   Annual — ALLOTTED. accrualPerYear is the allowance the super admin sets;
  //            requests beyond the remaining balance are refused by the API.
  //   Sick   — ADDITIONAL. No accrual, so it never draws down the annual
  //            allowance and has no ceiling. Still needs approval.
  // Do not add further types here: a type with no accrual is uncapped, and an
  // unintended one would hand employees unlimited paid leave.
  const leaveTypes = [
    { name: 'Annual', code: 'ANNUAL', accrualPerYear: 20, carryForwardMax: 5 },
    { name: 'Sick', code: 'SICK' },
  ];
  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { organizationId_code: { organizationId: org.id, code: lt.code } },
      update: {},
      create: { organizationId: org.id, ...lt },
    });
  }

  console.log(`✔ Seeded org "${org.name}", ${permKeys.length} permissions, ${roleDefs.length} roles.`);
  console.log(`✔ Default attendance policy, shift, and ${leaveTypes.length} leave types.`);
  console.log(`✔ Super admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
