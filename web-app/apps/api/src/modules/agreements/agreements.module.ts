import { Module } from '@nestjs/common';
import { AgreementsController, PublicSigningController } from './agreements.controller';
import { AgreementsService } from './agreements.service';

@Module({
  controllers: [AgreementsController, PublicSigningController],
  providers: [AgreementsService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
