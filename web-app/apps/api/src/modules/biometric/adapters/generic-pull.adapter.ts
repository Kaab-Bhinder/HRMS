import { Injectable } from '@nestjs/common';
import { BiometricDevice } from '@prisma/client';
import { BiometricAdapter, RawDeviceLog } from './biometric-adapter.interface';

/**
 * Fallback adapter used when no vendor-specific adapter is registered. It defines
 * the contract and returns no logs (safe no-op). Real adapters — ZKTecoAdapter,
 * EsslAdapter, SupremaAdapter — implement BiometricAdapter and register under
 * their vendor key; the sync pipeline stays identical.
 */
@Injectable()
export class GenericPullAdapter implements BiometricAdapter {
  readonly vendor = 'generic';

  async testConnection(_device: BiometricDevice): Promise<boolean> {
    return true;
  }

  async fetchLogs(_device: BiometricDevice, _since?: Date | null): Promise<RawDeviceLog[]> {
    // Vendor adapters return real terminal logs here.
    return [];
  }
}
