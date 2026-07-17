import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CustomFieldEntity, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomFieldDto, UpdateCustomFieldDto } from './dto/custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  list(orgId: string, entity: CustomFieldEntity) {
    return this.prisma.customFieldDefinition.findMany({
      where: { organizationId: orgId, entity, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async create(orgId: string, dto: CreateCustomFieldDto) {
    const exists = await this.prisma.customFieldDefinition.findFirst({
      where: { organizationId: orgId, entity: dto.entity, fieldKey: dto.fieldKey, deletedAt: null },
    });
    if (exists) throw new ConflictException(`A field with key "${dto.fieldKey}" already exists for ${dto.entity}`);

    return this.prisma.customFieldDefinition.create({
      data: { organizationId: orgId, ...this.toData(dto) } as Prisma.CustomFieldDefinitionUncheckedCreateInput,
    });
  }

  async update(orgId: string, id: string, dto: UpdateCustomFieldDto) {
    const def = await this.ensure(orgId, id);
    if (def.isSystem && dto.fieldKey && dto.fieldKey !== def.fieldKey) {
      throw new BadRequestException('Cannot change the key of a system field');
    }
    return this.prisma.customFieldDefinition.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(orgId: string, id: string) {
    const def = await this.ensure(orgId, id);
    if (def.isSystem) throw new BadRequestException('System fields cannot be deleted');
    await this.prisma.customFieldDefinition.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  /** Persists a new display order for a set of field ids. */
  async reorder(orgId: string, orderedIds: string[]) {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.customFieldDefinition.updateMany({
          where: { id, organizationId: orgId },
          data: { displayOrder: index },
        }),
      ),
    );
    return { success: true };
  }

  private toData(dto: UpdateCustomFieldDto) {
    return {
      entity: dto.entity,
      fieldKey: dto.fieldKey,
      label: dto.label,
      dataType: dto.dataType,
      helpText: dto.helpText,
      placeholder: dto.placeholder,
      isRequired: dto.isRequired,
      isUnique: dto.isUnique,
      isVisible: dto.isVisible,
      isSearchable: dto.isSearchable,
      isFilterable: dto.isFilterable,
      isEncrypted: dto.isEncrypted,
      minValue: dto.minValue,
      maxValue: dto.maxValue,
      minLength: dto.minLength,
      maxLength: dto.maxLength,
      regexPattern: dto.regexPattern,
      displayOrder: dto.displayOrder,
      options: dto.options as unknown as Prisma.InputJsonValue,
    };
  }

  private async ensure(orgId: string, id: string) {
    const def = await this.prisma.customFieldDefinition.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!def) throw new NotFoundException('Custom field not found');
    return def;
  }
}
