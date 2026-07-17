import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
  platform?: string; // 'web' | 'mobile' — the app this session was opened from
}

/** Injects the authenticated user (populated by JwtStrategy) into a handler. */
export const CurrentUser = createParamDecorator((data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user as AuthUser;
  return data ? user?.[data] : user;
});
