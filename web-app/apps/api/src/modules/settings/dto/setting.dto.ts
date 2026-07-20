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
  // Password/session/access policy. No UI yet — the Settings → Security tab was
  // removed because nothing enforced it; the section stays so a future
  // implementation has somewhere to store policy.
  'security',
  // Display density and similar workspace-wide presentation defaults.
  'appearance',
] as const;

export type SettingSection = (typeof SETTING_SECTIONS)[number];

export class UpdateSettingDto {
  @ApiProperty({ type: 'object', additionalProperties: true }) @IsObject() value!: Record<string, unknown>;
}
