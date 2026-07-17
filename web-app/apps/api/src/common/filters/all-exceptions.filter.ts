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
