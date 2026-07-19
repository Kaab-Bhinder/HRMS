import { Body, Controller, Get, Param, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { AttendanceAutoCheckoutService } from './attendance-autocheckout.service';
import { TrackingService } from './tracking.service';
import { ManualEntryDto, PingDto, PunchDto, QueryAttendanceDto, RegularizationDto } from './dto/attendance.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const MAX_SELFIE = 8 * 1024 * 1024;

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendance: AttendanceService,
    private readonly tracking: TrackingService,
    private readonly autoCheckout: AttendanceAutoCheckoutService,
  ) {}

  // ---- capture ----
  @Post('punch')
  @ApiOperation({ summary: 'Punch attendance via any method (manual/web/gps/face/qr)' })
  punch(@CurrentUser() user: AuthUser, @Body() dto: PunchDto) {
    return this.attendance.punch(user, dto);
  }

  @Post('manual')
  @RequirePermissions('attendance:create')
  @ApiOperation({ summary: 'Admin manual attendance entry' })
  manual(@CurrentUser() user: AuthUser, @Body() dto: ManualEntryDto) {
    return this.attendance.manualEntry(user, dto);
  }

  @Post('auto-checkout/run')
  @RequirePermissions('attendance:update')
  @ApiOperation({ summary: 'Force the auto-checkout sweep now (also runs automatically after office close)' })
  runAutoCheckout() {
    return this.autoCheckout.sweep();
  }

  // ---- live location tracking ----
  @Post('tracking/ping')
  @ApiOperation({ summary: 'Stream batched location pings for your active session' })
  async ping(@CurrentUser() user: AuthUser, @Body() dto: PingDto) {
    const employeeId = await this.attendance.resolveEmployeeId(user.id);
    return this.tracking.ping(employeeId, dto.sessionId, dto.points);
  }

  @Get('me/today')
  @ApiOperation({ summary: 'Your own attendance status for today (self-service)' })
  myToday(@CurrentUser() user: AuthUser) {
    return this.attendance.myToday(user.id);
  }

  // ---- biometric selfie (MVP: capture & store; automated match comes later) ----
  @Post('selfie')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a check-in selfie; returns a storageKey to pass as faceImageKey when punching' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SELFIE } }))
  uploadSelfie(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    return this.attendance.saveSelfie(user, file);
  }

  @Get('captures/:id/image')
  @ApiOperation({ summary: 'View a stored check-in selfie (scoped: self / team / org)' })
  async captureImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { bytes, mime } = await this.attendance.captureImage(user, id);
    res.set({ 'Content-Type': mime, 'Cache-Control': 'private, max-age=3600' });
    return new StreamableFile(bytes);
  }

  @Get('tracking/active')
  @ApiOperation({ summary: 'Your current active tracking session (if any)' })
  async activeSession(@CurrentUser() user: AuthUser) {
    const employeeId = await this.attendance.resolveEmployeeId(user.id);
    return this.tracking.getActive(employeeId);
  }

  @Get('live')
  @RequirePermissions('attendance:track')
  @ApiOperation({ summary: 'Live map: active sessions with latest positions (scoped)' })
  live(@CurrentUser() user: AuthUser) {
    return this.attendance.live(user);
  }

  @Get('map')
  @RequirePermissions('attendance:track')
  @ApiOperation({ summary: 'Office coordinates + checked-in employees for the dashboard map (scoped)' })
  map(@CurrentUser() user: AuthUser) {
    return this.attendance.mapData(user);
  }

  @Get('sessions/:id/route')
  @RequirePermissions('attendance:track')
  @ApiOperation({ summary: 'Full ordered route for a session (playback, admin)' })
  route(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.tracking.route(orgId, id);
  }

  // ---- monitoring ----
  @Get()
  @RequirePermissions('attendance:read')
  list(@CurrentUser() user: AuthUser, @Query() q: QueryAttendanceDto) {
    return this.attendance.listDays(user, q);
  }

  @Get('summary')
  @RequirePermissions('attendance:read')
  summary(@CurrentUser() user: AuthUser, @Query('date') date?: string) {
    return this.attendance.summary(user, date);
  }

  @Post('days/:id/resolve-flag')
  @RequirePermissions('attendance:update')
  @ApiOperation({ summary: 'HR review: clear a flagged attendance day with an optional note' })
  resolveFlag(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body('note') note?: string) {
    return this.attendance.resolveFlag(user, id, note);
  }

  @Get('slip')
  @ApiOperation({ summary: 'Detailed per-employee attendance slip for a date range (self/team/org scoped)' })
  slip(
    @CurrentUser() user: AuthUser,
    @Query('employeeId') employeeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.attendance.slip(user, employeeId, from, to);
  }

  // ---- regularization ----
  @Post('regularizations')
  @ApiOperation({ summary: 'Request a missed-punch correction (routes to approval engine)' })
  regularize(@CurrentUser() user: AuthUser, @Body() dto: RegularizationDto) {
    return this.attendance.requestRegularization(user, dto);
  }

  @Get('regularizations')
  @RequirePermissions('attendance:read')
  listRegularizations(@CurrentUser('organizationId') orgId: string, @Query('status') status?: string) {
    return this.attendance.listRegularizations(orgId, status);
  }

  @Post('regularizations/:id/approve')
  @RequirePermissions('attendance:update')
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body('comment') comment?: string) {
    return this.attendance.actRegularization(user.organizationId, id, 'approved', user.id, comment);
  }

  @Post('regularizations/:id/reject')
  @RequirePermissions('attendance:update')
  reject(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body('comment') comment?: string) {
    return this.attendance.actRegularization(user.organizationId, id, 'rejected', user.id, comment);
  }
}
