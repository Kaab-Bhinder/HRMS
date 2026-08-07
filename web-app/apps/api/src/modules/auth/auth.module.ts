import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthService } from './auth.service';
import { AccountSetupService } from './account-setup.service';
import { TokenService } from './token.service';
import { SessionsService } from './sessions.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [NotificationsModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AccountSetupService, AuthService, TokenService, SessionsService, JwtStrategy],
  exports: [AccountSetupService, AuthService, TokenService, SessionsService],
})
export class AuthModule {}
