import { Global, Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';

@Global()
@Module({
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalsModule {}
