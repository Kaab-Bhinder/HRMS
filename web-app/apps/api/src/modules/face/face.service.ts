import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  /**
   * Multi-pose enrollment: several frames of the SAME person (front, left,
   * right, up, smile — each pose verified on-device before upload) become
   * several active templates. This is what makes single-frame matching at
   * check-in robust, and the pose sequence itself is the liveness proof —
   * a photograph can't turn its head on command.
   */
  async enrollMany(orgId: string, employeeId: string, imageStorageKeys: string[]) {
    if (!imageStorageKeys.length) throw new BadRequestException('At least one enrollment frame is required');
    // One deactivation for the whole new set — the set replaces the old identity.
    await this.prisma.faceTemplate.updateMany({ where: { employeeId, isActive: true }, data: { isActive: false } });
    const created = [];
    for (const key of imageStorageKeys) {
      const result = await this.engine.enroll(key, employeeId);
      created.push(
        await this.prisma.faceTemplate.create({
          data: {
            organizationId: orgId,
            employeeId,
            provider: result.provider,
            externalTemplateId: result.externalTemplateId,
            imageStorageKey: key,
            embedding: result.embedding,
            quality: result.quality,
            isActive: true,
          },
          select: { id: true, quality: true, provider: true },
        }),
      );
    }
    return { enrolled: created.length, templates: created };
  }

  /**
   * First-login self-enrollment from the mobile app. Allowed ONLY while the
   * employee has no active templates — once enrolled, changing the reference
   * face is an HR action (face:create), otherwise a stolen login could
   * overwrite the identity with the thief's face.
   */
  async selfEnroll(orgId: string, userId: string, imageStorageKeys: string[]) {
    const emp = await this.prisma.employee.findFirst({
      where: { organizationId: orgId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!emp) throw new BadRequestException('No employee record is linked to your account');
    const existing = await this.prisma.faceTemplate.count({ where: { employeeId: emp.id, isActive: true } });
    if (existing > 0) {
      throw new ConflictException('Face ID is already set up. Ask HR to re-enroll you if your reference photos need updating.');
    }
    return this.enrollMany(orgId, emp.id, imageStorageKeys);
  }

  /** The signed-in employee's reference photo (first active template frame),
   *  so the app can show it beside a check-in selfie. Self-scoped by identity. */
  async myBasePhotoKey(orgId: string, userId: string): Promise<string> {
    const emp = await this.prisma.employee.findFirst({
      where: { organizationId: orgId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!emp) throw new NotFoundException('No employee record is linked to your account');
    const tpl = await this.prisma.faceTemplate.findFirst({
      where: { employeeId: emp.id, isActive: true, imageStorageKey: { not: null } },
      orderBy: { createdAt: 'asc' },
      select: { imageStorageKey: true },
    });
    if (!tpl?.imageStorageKey) throw new NotFoundException('No enrollment photo on file');
    return tpl.imageStorageKey;
  }

  /** Enrollment gate for the mobile app: is Face ID set up for this login? */
  async myStatus(orgId: string, userId: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { organizationId: orgId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!emp) return { enrolled: false, templates: 0 };
    const templates = await this.prisma.faceTemplate.count({ where: { employeeId: emp.id, isActive: true } });
    return { enrolled: templates > 0, templates };
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
