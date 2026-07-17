import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SETTING_SECTIONS, SettingSection } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(orgId: string) {
    const rows = await this.prisma.setting.findMany({ where: { organizationId: orgId } });
    const result: Record<string, unknown> = {};
    for (const section of SETTING_SECTIONS) result[section] = {};
    for (const row of rows) result[row.key] = row.value;
    return result;
  }

  async getSection(orgId: string, section: string) {
    const key = this.ensureSection(section);
    const row = await this.prisma.setting.findUnique({
      where: { organizationId_key: { organizationId: orgId, key } },
    });
    return (row?.value ?? {}) as Record<string, unknown>;
  }

  async putSection(orgId: string, section: string, value: Record<string, unknown>, userId: string) {
    const key = this.ensureSection(section);
    return this.upsert(orgId, key, value, userId);
  }

  async patchSection(orgId: string, section: string, patch: Record<string, unknown>, userId: string) {
    const key = this.ensureSection(section);
    const current = await this.getSection(orgId, key);
    return this.upsert(orgId, key, { ...current, ...patch }, userId);
  }

  private async upsert(orgId: string, key: string, value: Record<string, unknown>, userId: string) {
    const jsonValue = value as Prisma.InputJsonValue;
    const row = await this.prisma.setting.upsert({
      where: { organizationId_key: { organizationId: orgId, key } },
      create: { organizationId: orgId, key, value: jsonValue, updatedById: userId },
      update: { value: jsonValue, updatedById: userId },
    });
    return row.value as Record<string, unknown>;
  }

  private ensureSection(section: string): SettingSection {
    if (!SETTING_SECTIONS.includes(section as SettingSection)) {
      throw new BadRequestException(`Unknown settings section: ${section}`);
    }
    return section as SettingSection;
  }
}
