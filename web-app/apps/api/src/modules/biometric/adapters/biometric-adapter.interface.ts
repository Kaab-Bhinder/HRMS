import { BiometricDevice } from '@prisma/client';

/** A single raw attendance event pulled from a device. */
export interface RawDeviceLog {
  deviceUserId: string;
  timestamp: string; // ISO
  direction?: 'in' | 'out';
  raw?: unknown;
}

/**
 * Vendor-agnostic device adapter. One implementation per vendor (ZKTeco, eSSL,
 * Suprema, …) — talks to the device over its API/SDK/push/file. The core sync
 * service depends only on this interface, never on a vendor SDK.
 */
export interface BiometricAdapter {
  readonly vendor: string; // registry key (matches device.vendor, case-insensitive)
  testConnection(device: BiometricDevice): Promise<boolean>;
  fetchLogs(device: BiometricDevice, since?: Date | null): Promise<RawDeviceLog[]>;
}

export const BIOMETRIC_ADAPTER_REGISTRY = Symbol('BIOMETRIC_ADAPTER_REGISTRY');
export type AdapterRegistry = Map<string, BiometricAdapter>;
