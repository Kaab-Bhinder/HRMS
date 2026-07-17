import { BadRequestException, Injectable } from '@nestjs/common';
import { AttendanceMethod } from '@prisma/client';
import { FaceService } from '../../face/face.service';
import { AttendanceProvider, CaptureContext, NormalizedPunch } from './attendance-provider.interface';

/**
 * Face-recognition check-in from the Flutter app. Captures the selfie, runs it
 * through the pluggable face engine (liveness + match), stores confidence and
 * image metadata, and attaches the capture to the punch. Optionally also carries
 * GPS so a single mobile punch can be both face- and location-verified.
 */
@Injectable()
export class FaceAttendanceProvider implements AttendanceProvider {
  readonly method = AttendanceMethod.mobile_face;

  constructor(private readonly face: FaceService) {}

  async capture(ctx: CaptureContext): Promise<NormalizedPunch> {
    const { faceImageKey, metadata } = ctx.payload;
    if (!faceImageKey) throw new BadRequestException('faceImageKey (uploaded selfie) is required');

    const { capture, verify } = await this.face.captureAndVerify(ctx.orgId, ctx.employeeId, faceImageKey, {
      ...metadata,
      lat: ctx.payload.latitude,
      lng: ctx.payload.longitude,
    });

    if (!verify.livenessPassed) throw new BadRequestException('Liveness check failed — please try again');
    if (!verify.matched) throw new BadRequestException('Face did not match the enrolled employee');

    return {
      type: ctx.type,
      method: this.method,
      occurredAt: ctx.occurredAt,
      locationId: ctx.payload.locationId,
      latitude: ctx.payload.latitude,
      longitude: ctx.payload.longitude,
      accuracyMeters: ctx.payload.accuracyMeters,
      faceCaptureId: capture.id,
      isOffline: ctx.payload.isOffline ?? false,
      clientCreatedAt: ctx.payload.clientCreatedAt ? new Date(ctx.payload.clientCreatedAt) : undefined,
      raw: ctx.payload.metadata,
    };
  }
}
