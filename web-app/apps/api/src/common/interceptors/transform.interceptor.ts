import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Wraps successful responses as { success:true, data, meta? }. Passes through
 *  already-shaped paginated payloads ({ data, meta }) and raw file streams. */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((payload) => {
        // Binary/stream responses (file downloads) must not be JSON-wrapped.
        if (payload instanceof StreamableFile) return payload;
        if (payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload) {
          return { success: true, ...payload };
        }
        return { success: true, data: payload ?? null };
      }),
    );
  }
}
