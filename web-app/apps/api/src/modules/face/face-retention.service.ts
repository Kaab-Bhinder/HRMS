import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../files/storage.service';

const SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours
const BATCH = 200;

/**
 * Biometric data hygiene (PDP/GDPR posture): check-in selfies are evidence,
 * not archives. After the retention window the IMAGE is deleted from storage
 * while the capture row (score, liveness, match verdict, timestamps) is kept
 * forever — the audit trail survives, the biometric itself doesn't.
 *
 * Enrollment photos are untouched here; they live until HR re-enrolls or the
 * employee is offboarded. Window: FACE_CAPTURE_RETENTION_DAYS (default 90).
 */
@Injectable()
export class FaceRetentionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('FaceRetention');
  private timer?: NodeJS.Timeout;
  private readonly days = Math.max(7, Number(process.env.FACE_CAPTURE_RETENTION_DAYS ?? 90));

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.sweep(), SWEEP_INTERVAL_MS);
    // One pass shortly after boot so a long-sleeping instance still catches up.
    setTimeout(() => void this.sweep(), 60_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async sweep() {
    const cutoff = new Date(Date.now() - this.days * 24 * 60 * 60 * 1000);
    const stale = await this.prisma.faceCapture.findMany({
      where: { capturedAt: { lt: cutoff }, imageStorageKey: { not: '' } },
      select: { id: true, imageStorageKey: true },
      take: BATCH,
    });
    if (!stale.length) return;

    let purged = 0;
    for (const cap of stale) {
      try {
        await this.storage.remove(cap.imageStorageKey);
      } catch {
        // Missing object is fine — the goal is that it's gone.
      }
      await this.prisma.faceCapture.update({ where: { id: cap.id }, data: { imageStorageKey: '' } });
      purged += 1;
    }
    this.logger.log(`Purged ${purged} face capture image(s) older than ${this.days} days (metadata kept).`);
  }
}
