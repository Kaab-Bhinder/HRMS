import { Global, Module } from '@nestjs/common';
import { ScopeService } from './scope.service';
import { AccessController } from './access.controller';

/** Global so any module can inject ScopeService to scope its data by role. */
@Global()
@Module({
  controllers: [AccessController],
  providers: [ScopeService],
  exports: [ScopeService],
})
export class AccessModule {}
