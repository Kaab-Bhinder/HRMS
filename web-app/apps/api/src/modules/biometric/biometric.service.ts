import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceMethod, PunchType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AttendanceRecomputeService } from '../attendance/attendance-recompute.service';
import { AdapterRegistry, BIOMETRIC_ADAPTER_REGISTRY, RawDeviceLog } from './adapters/biometric-adapter.interface';
import { CreateDeviceDto, MapUserDto, UpdateDeviceDto } from './dto/device.dto';

@Injectable()
export class BiometricService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recompute: AttendanceRecomputeService,
    @Inject(BIOMETRIC_ADAPTER_REGISTRY) private readonly adapters: AdapterRegistry,
  ) {}

  // --- device CRUD ---
  listDevices(orgId: string) {
    return this.prisma.biometricDevice.findMany({ where: { organizationId: orgId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
  createDevice(orgId: string, dto: CreateDeviceDto) {
    return this.prisma.biometricDevice.create({ data: { organizationId: orgId, ...dto } as any });
  }
  async updateDevice(orgId: string, id: string, dto: UpdateDeviceDto) {
    await this.ensure(orgId, id);
    return this.prisma.biometricDevice.update({ where: { id }, data: dto as any });
  }
  async removeDevice(orgId: string, id: string) {
    await this.ensure(orgId, id);
    await this.prisma.biometricDevice.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async testConnection(orgId: string, id: string) {
    const device = await this.ensure(orgId, id);
    const adapter = this.resolveAdapter(device.vendor);
    const ok = await adapter.testConnection(device);
    await this.prisma.biometricDevice.update({ where: { id }, data: { status: ok ? 'online' : 'offline' } });
    return { vendor: device.vendor, adapter: adapter.vendor, connected: ok };
  }

  // --- user mapping (device user id → employee) ---
  listMappings(orgId: string, deviceId: string) {
    return this.prisma.deviceUserMapping.findMany({ where: { device: { organizationId: orgId }, deviceId } });
  }
  async mapUser(orgId: string, deviceId: string, dto: MapUserDto) {
    await this.ensure(orgId, deviceId);
    return this.prisma.deviceUserMapping.upsert({
      where: { deviceId_deviceUserId: { deviceId, deviceUserId: dto.deviceUserId } },
      update: { employeeId: dto.employeeId },
      create: { deviceId, deviceUserId: dto.deviceUserId, employeeId: dto.employeeId },
    });
  }

  syncLogs(orgId: string, deviceId: string) {
    return this.prisma.biometricSyncLog.findMany({ where: { device: { organizationId: orgId }, deviceId }, orderBy: { startedAt: 'desc' }, take: 20 });
  }

  /** Pull logs from a device and import them as attendance punches. */
  async sync(orgId: string, deviceId: string) {
    const device = await this.ensure(orgId, deviceId);
    const adapter = this.resolveAdapter(device.vendor);
    const log = await this.prisma.biometricSyncLog.create({ data: { deviceId, status: 'running' } });

    try {
      const logs = await adapter.fetchLogs(device, device.lastSyncAt);
      const imported = await this.importLogs(orgId, deviceId, logs);
      await this.prisma.$transaction([
        this.prisma.biometricSyncLog.update({ where: { id: log.id }, data: { status: 'success', finishedAt: new Date(), recordsPulled: logs.length, recordsImported: imported } }),
        this.prisma.biometricDevice.update({ where: { id: deviceId }, data: { lastSyncAt: new Date(), status: 'online' } }),
      ]);
      return { pulled: logs.length, imported };
    } catch (e) {
      await this.prisma.biometricSyncLog.update({ where: { id: log.id }, data: { status: 'failed', finishedAt: new Date(), error: (e as Error).message } });
      throw e;
    }
  }

  /** Ingest push-mode logs (devices that POST to us) — same import pipeline. */
  async ingest(orgId: string, deviceId: string, logs: RawDeviceLog[]) {
    await this.ensure(orgId, deviceId);
    const imported = await this.importLogs(orgId, deviceId, logs);
    return { received: logs.length, imported };
  }

  // --- shared import: map users → punches → recompute affected days ---
  private async importLogs(orgId: string, deviceId: string, logs: RawDeviceLog[]): Promise<number> {
    if (!logs.length) return 0;
    const mappings = await this.prisma.deviceUserMapping.findMany({ where: { deviceId } });
    const byDeviceUser = new Map(mappings.map((m) => [m.deviceUserId, m.employeeId]));

    const rows = logs
      .filter((l) => byDeviceUser.has(l.deviceUserId))
      .map((l) => ({
        organizationId: orgId,
        employeeId: byDeviceUser.get(l.deviceUserId)!,
        type: l.direction === 'out' ? PunchType.check_out : PunchType.check_in,
        method: AttendanceMethod.biometric,
        occurredAt: new Date(l.timestamp),
        deviceId,
        deviceLogId: `${l.deviceUserId}:${l.timestamp}`,
        rawPayload: l.raw as any,
      }));

    if (!rows.length) return 0;
    const result = await this.prisma.attendancePunch.createMany({ data: rows, skipDuplicates: true });

    // recompute each affected (employee, day)
    const affected = new Map<string, { employeeId: string; date: Date }>();
    for (const r of rows) {
      const d = new Date(r.occurredAt);
      d.setUTCHours(0, 0, 0, 0);
      affected.set(`${r.employeeId}:${d.toISOString()}`, { employeeId: r.employeeId, date: d });
    }
    for (const { employeeId, date } of affected.values()) {
      await this.recompute.recompute(orgId, employeeId, date);
    }
    return result.count;
  }

  private resolveAdapter(vendor: string) {
    return this.adapters.get(vendor.toLowerCase()) ?? this.adapters.get('generic')!;
  }

  private async ensure(orgId: string, id: string) {
    const device = await this.prisma.biometricDevice.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }
}
