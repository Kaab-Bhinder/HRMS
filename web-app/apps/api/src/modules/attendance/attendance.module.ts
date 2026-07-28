import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceConfigController } from './attendance-config.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceSettingsService } from './attendance-settings.service';
import { AttendanceAutoCheckoutService } from './attendance-autocheckout.service';
import { TrackingService } from './tracking.service';
import { AttendanceRecomputeService } from './attendance-recompute.service';
import { FaceModule } from '../face/face.module';
import { ManualAttendanceProvider, QrAttendanceProvider, WebAttendanceProvider } from './providers/simple.providers';
import { GpsAttendanceProvider } from './providers/gps.provider';
import { FaceAttendanceProvider } from './providers/face.provider';
import { SiteResolverService } from './providers/site-resolver.service';
import {
  ATTENDANCE_PROVIDER_REGISTRY, AttendanceProvider, ProviderRegistry,
} from './providers/attendance-provider.interface';

@Module({
  imports: [FaceModule, FilesModule],
  controllers: [AttendanceController, AttendanceConfigController],
  providers: [
    AttendanceService,
    AttendanceSettingsService,
    AttendanceAutoCheckoutService,
    TrackingService,
    AttendanceRecomputeService,
    SiteResolverService,
    ManualAttendanceProvider,
    WebAttendanceProvider,
    QrAttendanceProvider,
    GpsAttendanceProvider,
    FaceAttendanceProvider,
    // Registry: method → provider. Add a new method by adding its class here
    // and to the inject list — the core service never changes.
    {
      provide: ATTENDANCE_PROVIDER_REGISTRY,
      useFactory: (...providers: AttendanceProvider[]): ProviderRegistry => {
        const map: ProviderRegistry = new Map();
        for (const p of providers) map.set(p.method, p);
        return map;
      },
      inject: [ManualAttendanceProvider, WebAttendanceProvider, QrAttendanceProvider, GpsAttendanceProvider, FaceAttendanceProvider],
    },
  ],
  exports: [AttendanceService, AttendanceRecomputeService],
})
export class AttendanceModule {}
