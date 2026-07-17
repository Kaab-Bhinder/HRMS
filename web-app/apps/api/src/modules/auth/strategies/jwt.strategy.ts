import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  org: string;
  email: string;
  name: string;
  sa: boolean;
  roles: string[];
  perms: string[];
  platform: string; // the app this session was opened from
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload?.sub) throw new UnauthorizedException();
    return {
      id: payload.sub,
      organizationId: payload.org,
      email: payload.email,
      fullName: payload.name,
      isSuperAdmin: payload.sa,
      roles: payload.roles ?? [],
      permissions: payload.perms ?? [],
      platform: payload.platform,
    };
  }
}
