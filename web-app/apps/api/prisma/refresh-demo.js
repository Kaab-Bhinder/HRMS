/*
 * Refresh live demo data for TODAY — run right before showing the client.
 * Seeds today's attendance (present/late/wfh/leave mix) and fresh "checked-in"
 * tracking sessions scattered around the office, so the dashboard map, Present
 * Rate and Department Attendance are all populated with current data.
 *
 * Note: the auto-checkout job will still close everyone after office hours (by
 * design). Re-run this any time you want the live views populated again.
 *   node prisma/refresh-demo.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const rnd = (n) => Math.floor(Math.random() * n);

(async () => {
  const org = await prisma.organization.findFirst();
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const now = new Date();

  const active = await prisma.employee.findMany({ where: { organizationId: org.id, deletedAt: null, status: 'active' }, select: { id: true } });

  // 1) Today's attendance (persists all day; drives Present Rate + Dept Attendance)
  await prisma.attendanceDay.deleteMany({ where: { organizationId: org.id, workDate: today } });
  const days = active.map((e) => {
    const r = Math.random();
    let status, worked = 0, late = 0;
    if (r < 0.86) { status = 'present'; worked = 430 + rnd(50); }
    else if (r < 0.94) { status = 'late'; worked = 400 + rnd(50); late = 8 + rnd(35); }
    else if (r < 0.97) { status = 'wfh'; worked = 430 + rnd(40); }
    else { status = 'on_leave'; }
    return {
      organizationId: org.id, employeeId: e.id, workDate: today, status,
      workedMinutes: worked, lateMinutes: late, breakMinutes: worked ? 45 : 0,
      firstInAt: worked ? new Date(today.getTime() + (9 * 60 + rnd(20)) * 60000) : null,
      lastOutAt: null, // still on the clock
    };
  });
  await prisma.attendanceDay.createMany({ data: days });

  // 2) Fresh live "checked-in" sessions around the office (drives the map)
  const office = await prisma.location.findFirst({ where: { organizationId: org.id, deletedAt: null, latitude: { not: null } }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
  let sessions = 0;
  if (office) {
    const oLat = Number(office.latitude), oLng = Number(office.longitude);
    await prisma.attendanceSession.updateMany({ where: { organizationId: org.id, status: 'active' }, data: { status: 'ended', endedAt: now } });
    // only "present/late/wfh" employees are on site; ~90% of them near the office
    const present = days.filter((d) => d.status !== 'on_leave');
    const rows = [];
    for (const d of present) {
      if (Math.random() > 0.9) continue;
      const spread = Math.random() < 0.9 ? 0.0011 : 0.0022;
      rows.push({
        organizationId: org.id, employeeId: d.employeeId, status: 'active',
        startedAt: new Date(now.getTime() - rnd(4) * 3600000 - rnd(60) * 60000),
        startLat: oLat + (Math.random() - 0.5) * 2 * spread,
        startLng: oLng + (Math.random() - 0.5) * 2 * spread,
        workDate: today,
      });
    }
    for (const r of rows) await prisma.attendanceSession.create({ data: r });
    sessions = rows.length;
  }

  const present = days.filter((d) => ['present', 'late', 'wfh'].includes(d.status)).length;
  console.log(`Refreshed → today: ${present}/${active.length} present, ${sessions} on the live map (${today.toISOString().slice(0, 10)})`);
  await prisma.$disconnect();
})();
