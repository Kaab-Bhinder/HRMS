import { AttendanceMethod, PunchType } from '@prisma/client';

/** Method-specific payload sent by a client when punching. */
export interface PunchPayload {
  method: AttendanceMethod;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  locationId?: string;
  qrToken?: string;
  faceImageKey?: string; // S3 key of the uploaded selfie (mobile_face)
  deviceId?: string;
  isOffline?: boolean;
  clientCreatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface EffectivePolicy {
  enforceGeofence: boolean;
  allowRemote: boolean;
  allowedMethods: string[];
  trackingIntervalSec: number;
  /** any_site: nearest active work site wins · assigned_only: employees with an
   *  assigned site must be inside that one (unassigned fall back to nearest). */
  checkInScope: 'any_site' | 'assigned_only';
}

export interface CaptureContext {
  orgId: string;
  employeeId: string;
  type: PunchType;
  occurredAt: Date;
  payload: PunchPayload;
  policy: EffectivePolicy | null;
}

/** Normalized result every provider returns, regardless of capture method. */
export interface NormalizedPunch {
  type: PunchType;
  method: AttendanceMethod;
  occurredAt: Date;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  faceCaptureId?: string;
  deviceId?: string;
  isOffline?: boolean;
  clientCreatedAt?: Date;
  raw?: unknown;
}

/** Strategy interface — one implementation per capture method. */
export interface AttendanceProvider {
  readonly method: AttendanceMethod;
  capture(ctx: CaptureContext): Promise<NormalizedPunch>;
}

/** DI token for the method → provider registry (a Map). */
export const ATTENDANCE_PROVIDER_REGISTRY = Symbol('ATTENDANCE_PROVIDER_REGISTRY');
export type ProviderRegistry = Map<AttendanceMethod, AttendanceProvider>;
