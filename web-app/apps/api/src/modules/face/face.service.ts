import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FACE_RECOGNITION_PROVIDER, FaceRecognitionProvider } from './face-recognition.interface';

/** Manages face templates (enrollment) and captures (verification records). */
@Injectable()
export class FaceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FACE_RECOGNITION_PROVIDER) private readonly engine: FaceRecognitionProvider,
  ) {}

  async enroll(orgId: string, employeeId: string, imageStorageKey: string) {
    const result = await this.engine.enroll(imageStorageKey, employeeId);
    // deactivate prior templates for this employee
    await this.prisma.faceTemplate.updateMany({ where: { employeeId, isActive: true }, data: { isActive: false } });
    return this.prisma.faceTemplate.create({
      data: {
        organizationId: orgId,
        employeeId,
        provider: result.provider,
        externalTemplateId: result.externalTemplateId,
        embedding: result.embedding,
        quality: result.quality,
        isActive: true,
      },
    });
  }

  listTemplates(orgId: string, employeeId: string) {
    return this.prisma.faceTemplate.findMany({
      where: { organizationId: orgId, employeeId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, provider: true, quality: true, isActive: true, createdAt: true },
    });
  }

  /**
   * Verifies a selfie and persists a FaceCapture with confidence/liveness/metadata.
   * Called by the mobile_face attendance provider. Returns the capture id.
   */
  async captureAndVerify(orgId: string, employeeId: string, imageStorageKey: string, metadata?: Record<string, unknown>) {
    const v = await this.engine.verify(imageStorageKey, employeeId);
    const capture = await this.prisma.faceCapture.create({
      data: {
        organizationId: orgId,
        employeeId,
        imageStorageKey,
        confidenceScore: v.confidence,
        livenessScore: v.liveness,
        livenessPassed: v.livenessPassed,
        matched: v.matched,
        matchedTemplateId: v.matchedTemplateId,
        provider: v.provider,
        metadata: metadata as any,
        capturedAt: new Date(),
      },
    });
    return { capture, verify: v };
  }
}
