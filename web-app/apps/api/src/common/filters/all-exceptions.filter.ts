import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/** Uniform error envelope: { success:false, error:{ code, message, details }, requestId }. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Something went wrong';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        message = (Array.isArray(b.message) ? (b.message as string[]).join('; ') : (b.message as string)) ?? message;
        details = Array.isArray(b.message) ? b.message : undefined;
        code = (b.error as string)?.toUpperCase().replace(/\s+/g, '_') ?? httpCode(status);
      }
      code = httpCode(status);
    } else if (isPrismaKnownError(exception)) {
      // Database constraints are real, expected outcomes — a duplicate e-mail
      // is user error, not a server fault. Without this they surfaced as a 500
      // with raw Prisma internals ("Invalid `prisma.employee.create()`
      // invocation…"), which tells the user nothing they can act on.
      const mapped = mapPrismaError(exception);
      status = mapped.status;
      code = mapped.code;
      message = mapped.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(`${req.method} ${req.url} → ${status}`, (exception as Error)?.stack);
    }

    const requestId = (req.headers['x-request-id'] as string) ?? undefined;
    res.status(status).json({ success: false, error: { code, message, details }, requestId, path: req.url });
  }
}

function httpCode(status: number): string {
  const map: Record<number, string> = {
    400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND',
    409: 'CONFLICT', 422: 'UNPROCESSABLE_ENTITY', 429: 'RATE_LIMITED', 500: 'INTERNAL_ERROR',
  };
  return map[status] ?? 'ERROR';
}

/** Prisma errors carry a `code` like P2002 and a `meta` describing the fields. */
interface PrismaKnownError { code: string; meta?: { target?: unknown; field_name?: unknown; modelName?: unknown } }

function isPrismaKnownError(e: unknown): e is PrismaKnownError {
  return !!e && typeof e === 'object' && typeof (e as { code?: unknown }).code === 'string'
    && /^P\d{4}$/.test((e as { code: string }).code);
}

/** Turns the field list Prisma reports into something a person recognises. */
function fieldLabel(target: unknown): string | null {
  const parts = Array.isArray(target) ? target.map(String) : typeof target === 'string' ? [target] : [];
  // The tenant column is an implementation detail; nobody typed it.
  const meaningful = parts.filter((f) => f !== 'organization_id' && f !== 'organizationId');
  if (!meaningful.length) return null;
  const pretty: Record<string, string> = {
    work_email: 'work email', workEmail: 'work email',
    email: 'email address',
    employee_code: 'employee code', employeeCode: 'employee code',
    code: 'code', name: 'name', title: 'title', slug: 'slug',
    token_hash: 'token', reference: 'reference',
  };
  return meaningful.map((f) => pretty[f] ?? f.replace(/_/g, ' ')).join(' and ');
}

function mapPrismaError(e: PrismaKnownError): { status: number; code: string; message: string } {
  switch (e.code) {
    case 'P2002': {
      const field = fieldLabel(e.meta?.target);
      return {
        status: HttpStatus.CONFLICT,
        code: 'DUPLICATE',
        message: field
          ? `That ${field} is already in use. Please choose another.`
          : 'That value is already in use. Please choose another.',
      };
    }
    case 'P2003':
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'INVALID_REFERENCE',
        message: 'A referenced record does not exist. Refresh the page and try again.',
      };
    case 'P2025':
      return { status: HttpStatus.NOT_FOUND, code: 'NOT_FOUND', message: 'That record no longer exists.' };
    case 'P2014':
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'IN_USE',
        message: 'This record is still linked to others and cannot be changed that way.',
      };
    default:
      return { status: HttpStatus.BAD_REQUEST, code: 'DATABASE_ERROR', message: 'The request could not be completed.' };
  }
}
