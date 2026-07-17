import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Object storage with two interchangeable drivers behind one interface:
 *  - "local"  → bytes on disk (default; zero-config for dev).
 *  - "s3"     → any S3-compatible store (AWS S3, Cloudflare R2, MinIO) via env.
 *
 * The driver is chosen from env at boot; callers never change. Configure S3 by
 * setting S3_BUCKET (+ keys); otherwise it stays on local disk.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger('Storage');
  private readonly root = process.env.FILE_STORAGE_DIR
    ? resolve(process.env.FILE_STORAGE_DIR)
    : resolve(process.cwd(), 'storage', 'uploads');

  private readonly driver: 'local' | 's3';
  private readonly bucket = process.env.S3_BUCKET ?? '';
  private readonly s3?: S3Client;

  constructor() {
    const useS3 = (process.env.STORAGE_DRIVER ?? (this.bucket ? 's3' : 'local')) === 's3';
    if (useS3 && this.bucket) {
      this.driver = 's3';
      this.s3 = new S3Client({
        region: process.env.S3_REGION || 'us-east-1',
        // Custom endpoint for R2 / MinIO; omit for real AWS.
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: process.env.S3_ACCESS_KEY_ID
          ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '' }
          : undefined, // fall back to the AWS default credential chain (IAM role)
      });
      this.logger.log(`Using S3 storage (bucket "${this.bucket}"${process.env.S3_ENDPOINT ? `, endpoint ${process.env.S3_ENDPOINT}` : ''}).`);
    } else {
      this.driver = 'local';
      this.logger.log(`Using local-disk storage (${this.root}).`);
    }
  }

  buildKey(orgId: string, ownerType: string, ownerId: string, fileName: string): string {
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${orgId}/${ownerType}/${ownerId}/${randomUUID()}-${safe}`;
  }

  /** Persist bytes at the key. */
  async save(storageKey: string, bytes: Buffer, contentType?: string): Promise<void> {
    if (this.driver === 's3') {
      await this.s3!.send(new PutObjectCommand({ Bucket: this.bucket, Key: storageKey, Body: bytes, ContentType: contentType }));
      return;
    }
    const full = join(this.root, storageKey);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, bytes);
  }

  /** Read the bytes back. */
  async read(storageKey: string): Promise<Buffer> {
    if (this.driver === 's3') {
      const res = await this.s3!.send(new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }));
      const arr = await res.Body!.transformToByteArray();
      return Buffer.from(arr);
    }
    return readFile(join(this.root, storageKey));
  }

  /** Delete an object (best-effort). Local driver keeps the file for audit. */
  async remove(storageKey: string): Promise<void> {
    if (this.driver === 's3') {
      await this.s3!.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }));
    }
  }

  /** Presigned upload URL (direct-to-S3). Local driver returns a stub. */
  async presignUpload(storageKey: string, mimeType: string): Promise<{ uploadUrl: string; storageKey: string }> {
    if (this.driver === 's3') {
      const url = await getSignedUrl(this.s3!, new PutObjectCommand({ Bucket: this.bucket, Key: storageKey, ContentType: mimeType }), { expiresIn: 900 });
      return { uploadUrl: url, storageKey };
    }
    return { uploadUrl: `https://storage.local/upload/${encodeURIComponent(storageKey)}`, storageKey };
  }

  /** Presigned download URL. Local driver returns a stub. */
  async presignDownload(storageKey: string): Promise<string> {
    if (this.driver === 's3') {
      return getSignedUrl(this.s3!, new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }), { expiresIn: 900 });
    }
    return `https://storage.local/download/${encodeURIComponent(storageKey)}`;
  }
}
