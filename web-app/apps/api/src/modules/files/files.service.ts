import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from './storage.service';
import { PresignDto, RegisterFileDto } from './dto/file.dto';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png', 'image/jpeg', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
const MAX_BYTES = 15 * 1024 * 1024;

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async presign(orgId: string, dto: PresignDto) {
    this.assertMime(dto.mimeType);
    const key = this.storage.buildKey(orgId, dto.ownerType, dto.ownerId, dto.fileName);
    return this.storage.presignUpload(key, dto.mimeType);
  }

  /** Registers metadata after the client uploads to the presigned URL. */
  async register(orgId: string, userId: string, dto: RegisterFileDto) {
    this.assertMime(dto.mimeType);
    if (dto.sizeBytes > MAX_BYTES) throw new BadRequestException('File exceeds the 15 MB limit');

    return this.prisma.fileObject.create({
      data: {
        organizationId: orgId,
        ownerType: dto.ownerType,
        ownerId: dto.ownerId,
        category: dto.category,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        sizeBytes: BigInt(dto.sizeBytes),
        storageKey: dto.storageKey,
        checksumSha256: dto.checksumSha256,
        uploadedById: userId,
        isScanned: false, // an async AV scan flips this later
      },
    });
  }

  /** Direct multipart upload: validates, stores bytes on disk, records metadata. */
  async upload(
    orgId: string,
    userId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer } | undefined,
    ownerType: string,
    ownerId: string,
    category?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    this.assertMime(file.mimetype);
    if (file.size > MAX_BYTES) throw new BadRequestException('File exceeds the 15 MB limit');

    const storageKey = this.storage.buildKey(orgId, ownerType, ownerId, file.originalname);
    await this.storage.save(storageKey, file.buffer, file.mimetype);
    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    const created = await this.prisma.fileObject.create({
      data: {
        organizationId: orgId,
        ownerType,
        ownerId,
        category,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        storageKey,
        checksumSha256: checksum,
        uploadedById: userId,
        isScanned: true, // local dev: no async AV; treat as scanned/clean
        scanResult: 'clean',
      },
    });
    return this.serialize(created);
  }

  /** Returns the file record + its bytes for streaming a download. */
  async download(orgId: string, id: string) {
    const f = await this.prisma.fileObject.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!f) throw new NotFoundException('File not found');
    const bytes = await this.storage.read(f.storageKey);
    return { file: f, bytes };
  }

  async listByOwner(orgId: string, ownerType: string, ownerId: string) {
    const rows = await this.prisma.fileObject.findMany({
      where: { organizationId: orgId, ownerType, ownerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((f) => this.serialize(f));
  }

  async get(orgId: string, id: string) {
    const f = await this.prisma.fileObject.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!f) throw new NotFoundException('File not found');
    return { ...this.serialize(f), downloadUrl: await this.storage.presignDownload(f.storageKey) };
  }

  async remove(orgId: string, id: string) {
    const f = await this.prisma.fileObject.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!f) throw new NotFoundException('File not found');
    await this.prisma.fileObject.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private assertMime(mime: string) {
    if (!ALLOWED_MIME.has(mime)) throw new BadRequestException(`Unsupported file type: ${mime}`);
  }

  private serialize(f: any) {
    return {
      id: f.id,
      ownerType: f.ownerType,
      ownerId: f.ownerId,
      category: f.category,
      fileName: f.fileName,
      mimeType: f.mimeType,
      sizeBytes: Number(f.sizeBytes),
      isScanned: f.isScanned,
      scanResult: f.scanResult,
      url: `/files/${f.id}/download`,
      createdAt: f.createdAt,
    };
  }
}
