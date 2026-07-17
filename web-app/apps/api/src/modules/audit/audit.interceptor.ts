import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditAction } from '@prisma/client';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const METHOD_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.create,
  PUT: AuditAction.update,
  PATCH: AuditAction.update,
  DELETE: AuditAction.delete,
};

/**
 * Global audit interceptor. On every successful mutating request it records who
 * (actor + name), what (action + entity + id), where from (IP, device/user-agent,
 * request id) and the resulting payload (afterData). Services can add precise
 * before/after via AuditService.log() where field-level diffs matter.
 * Read requests are skipped (no state change).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const action = METHOD_ACTION[req.method];
    if (!action) return next.handle(); // GET / HEAD — nothing to audit

    const user = req.user as AuthUser | undefined;
    const entityType = deriveEntity(req.path);

    return next.handle().pipe(
      tap((payload) => {
        const data = (payload as { data?: unknown })?.data ?? payload;
        const entityId =
          (data as { id?: string })?.id ??
          (req.params?.id as string | undefined) ??
          undefined;

        this.audit.log({
          organizationId: user?.organizationId,
          actorUserId: user?.id,
          actorName: user?.fullName,
          action: refineAction(action, req.path),
          entityType,
          entityId: entityId ? String(entityId) : undefined,
          afterData: sanitize(data),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          requestId: (req.headers['x-request-id'] as string) ?? (req as unknown as { id?: string }).id,
        });
      }),
    );
  }
}

/** First path segment after the version prefix → entity type. */
function deriveEntity(path: string): string {
  const parts = path.split('/').filter(Boolean); // ['api','v1','employees','<id>']
  return parts[2] ?? 'unknown';
}

function refineAction(base: AuditAction, path: string): AuditAction {
  if (path.endsWith('/approve')) return AuditAction.approve;
  if (path.endsWith('/reject')) return AuditAction.reject;
  if (path.endsWith('/restore')) return AuditAction.restore;
  if (path.includes('/assign')) return AuditAction.assign;
  if (path.endsWith('/login')) return AuditAction.login;
  if (path.endsWith('/logout')) return AuditAction.logout;
  return base;
}

/** Never persist secrets/large blobs in the audit trail. */
function sanitize(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const REDACT = new Set(['password', 'passwordHash', 'accessToken', 'refreshToken', 'token', 'credentials', 'mfaSecret', 'embedding']);
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (REDACT.has(k)) clone[k] = '[redacted]';
    else if (typeof v === 'string' && v.length > 500) clone[k] = v.slice(0, 500) + '…';
    else clone[k] = v;
  }
  return clone;
}
