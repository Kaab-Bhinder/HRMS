import { Module } from '@nestjs/common';
import { BiometricController } from './biometric.controller';
import { BiometricService } from './biometric.service';
import { AttendanceModule } from '../attendance/attendance.module';
import { GenericPullAdapter } from './adapters/generic-pull.adapter';
import { AdapterRegistry, BIOMETRIC_ADAPTER_REGISTRY, BiometricAdapter } from './adapters/biometric-adapter.interface';

@Module({
  imports: [AttendanceModule], // for AttendanceRecomputeService
  controllers: [BiometricController],
  providers: [
    BiometricService,
    GenericPullAdapter,
    // Register vendor adapters here (ZKTeco, eSSL, Suprema…) — keyed by vendor.
    {
      provide: BIOMETRIC_ADAPTER_REGISTRY,
      useFactory: (...adapters: BiometricAdapter[]): AdapterRegistry => {
        const map: AdapterRegistry = new Map();
        for (const a of adapters) map.set(a.vendor.toLowerCase(), a);
        return map;
      },
      inject: [GenericPullAdapter],
    },
  ],
})
export class BiometricModule {}
