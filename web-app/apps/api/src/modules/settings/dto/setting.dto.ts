import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

/** Known settings sections; each is stored as one key/value row per organization. */
export const SETTING_SECTIONS = [
  'general',
  'attendance',
  'leave',
  'overtime',
  'schedules',
  'notifications',
  'branding',
  'business_hours',
  'integrations',
] as const;

export type SettingSection = (typeof SETTING_SECTIONS)[number];

export class UpdateSettingDto {
  @ApiProperty({ type: 'object', additionalProperties: true }) @IsObject() value!: Record<string, unknown>;
}
