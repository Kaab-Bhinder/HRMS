import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { ClientsModule } from '../clients/clients.module';

@Module({ imports: [ClientsModule], controllers: [OrganizationsController], providers: [OrganizationsService] })
export class OrganizationsModule {}
