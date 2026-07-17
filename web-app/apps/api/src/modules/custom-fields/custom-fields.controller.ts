import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomFieldEntity } from '@prisma/client';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto, ReorderDto, UpdateCustomFieldDto } from './dto/custom-field.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Custom Fields')
@ApiBearerAuth()
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly service: CustomFieldsService) {}

  @Get()
  @RequirePermissions('custom_fields:read')
  @ApiQuery({ name: 'entity', enum: CustomFieldEntity, required: false })
  list(@CurrentUser('organizationId') orgId: string, @Query('entity') entity: CustomFieldEntity = 'employee') {
    return this.service.list(orgId, entity);
  }

  @Post()
  @RequirePermissions('custom_fields:create')
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateCustomFieldDto) {
    return this.service.create(orgId, dto);
  }

  @Patch('reorder')
  @RequirePermissions('custom_fields:update')
  reorder(@CurrentUser('organizationId') orgId: string, @Body() dto: ReorderDto) {
    return this.service.reorder(orgId, dto.orderedIds);
  }

  @Patch(':id')
  @RequirePermissions('custom_fields:update')
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateCustomFieldDto) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('custom_fields:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
