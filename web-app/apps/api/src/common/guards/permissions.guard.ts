import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

/** Enforces @RequirePermissions(...). Super admins bypass. Runs after JwtAuthGuard. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.isSuperAdmin || user.permissions.includes('*')) return true;

    const ok = required.every((p) => user.permissions.includes(p));
    if (!ok) throw new ForbiddenException(`Missing permission: ${required.join(', ')}`);
    return true;
  }
}
