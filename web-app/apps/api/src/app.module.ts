import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DesignationsModule } from './modules/designations/designations.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AssetsModule } from './modules/assets/assets.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UsersModule } from './modules/users/users.module';
import { AccessModule } from './modules/access/access.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { FilesModule } from './modules/files/files.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { FaceModule } from './modules/face/face.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { TravelModule } from './modules/travel/travel.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { BiometricModule } from './modules/biometric/biometric.module';
import { LeaveModule } from './modules/leave/leave.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => (req.headers['x-request-id'] as string) ?? randomUUID(),
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
        autoLogging: true,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => [{ ttl: c.get<number>('throttle.ttl')! * 1000, limit: c.get<number>('throttle.limit')! }],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    OrganizationsModule,
    DepartmentsModule,
    DesignationsModule,
    ClientsModule,
    AssistantModule,
    TravelModule,
    AssetsModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    AccessModule,
    CustomFieldsModule,
    EmployeesModule,
    FilesModule,
    ApprovalsModule,
    FaceModule,
    AttendanceModule,
    BiometricModule,
    LeaveModule,
    TasksModule,
    NotificationsModule,
    AuditModule,
    PerformanceModule,
    ReportsModule,
    ReportingModule,
    PayrollModule,
    AnalyticsModule,
    SettingsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
